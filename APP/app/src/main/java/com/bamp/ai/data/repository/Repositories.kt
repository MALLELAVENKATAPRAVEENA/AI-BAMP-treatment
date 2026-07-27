package com.bamp.ai.data.repository

import com.bamp.ai.data.model.*
import com.bamp.ai.data.remote.RetrofitClient
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.ListenerRegistration
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.File

class AuthRepository {
    private val api = RetrofitClient.apiService
    private val firestore = FirebaseFirestore.getInstance()

    suspend fun login(req: LoginRequest) = api.login(req)
    suspend fun register(req: RegisterRequest) = api.register(req)
    suspend fun googleLogin(req: GoogleLoginRequest) = api.googleLogin(req)
    suspend fun forgotPassword(email: String) = api.forgotPassword(ForgotPasswordRequest(email))
    suspend fun verifyOtp(email: String, otp: String) = api.verifyOtp(VerifyOtpRequest(email, otp))
    suspend fun resetPassword(req: ResetPasswordRequest) = api.resetPassword(req)

    fun syncUserToFirestore(user: User) {
        try {
            val userMap = mapOf(
                "uid" to user.uid,
                "email" to user.email.lowercase(),
                "fullName" to (user.name ?: ""),
                "name" to (user.name ?: ""),
                "role" to (user.role ?: "Orthodontist"),
                "hospitalName" to (user.hospitalName ?: ""),
                "mobileNumber" to (user.mobileNumber ?: ""),
                "updatedAt" to System.currentTimeMillis().toString()
            )
            firestore.collection("users").document(user.email.lowercase()).set(userMap)
            firestore.collection("users").document(user.uid).set(userMap)
        } catch (_: Exception) {}
    }
}

class PatientRepository {
    private val api = RetrofitClient.apiService
    private val firestore = FirebaseFirestore.getInstance()

    suspend fun getPatients() = api.getPatients()
    suspend fun addPatient(req: AddPatientRequest) = api.addPatient(req)
    suspend fun getPatientById(id: String) = api.getPatientById(id)
    suspend fun updatePatient(id: String, req: UpdatePatientRequest) = api.updatePatient(id, req)
    suspend fun deletePatient(id: String) = api.deletePatient(id)
    suspend fun getDashboardStats() = api.getDashboardStats()

    // Real-time Firestore flow so any patient created on Web immediately displays on Android
    fun getPatientsRealtimeFlow(): Flow<List<Patient>> = callbackFlow {
        var listenerRegistration: ListenerRegistration? = null
        try {
            listenerRegistration = firestore.collection("patients")
                .addSnapshotListener { snapshot, error ->
                    if (error != null) {
                        trySend(emptyList())
                        return@addSnapshotListener
                    }
                    if (snapshot != null) {
                        val patientsList = snapshot.documents.mapNotNull { doc ->
                            val id = doc.getString("patientId") ?: doc.id
                            val pName = doc.getString("patientName") ?: doc.getString("name") ?: "Patient Record"
                            val pAge = doc.getLong("age")?.toInt() ?: 10
                            val pGender = doc.getString("gender") ?: "Female"
                            val cvm = doc.getString("cvmStage") ?: "CVM 3"
                            val pStatus = doc.getString("status") ?: "Active"
                            val pDiagnosis = doc.getString("diagnosis") ?: "Class III Skeletal Malocclusion"
                            Patient(
                                id = id,
                                patientId = id,
                                name = pName,
                                age = pAge,
                                gender = pGender,
                                cvmStage = cvm,
                                status = pStatus,
                                diagnosis = pDiagnosis,
                                bampStartDate = doc.getString("bampStartDate") ?: ""
                            )
                        }
                        trySend(patientsList)
                    }
                }
        } catch (e: Exception) {
            trySend(emptyList())
        }
        awaitClose { listenerRegistration?.remove() }
    }

    fun getDashboardStatsRealtimeFlow(): Flow<DashboardStats> = callbackFlow {
        var pListener: ListenerRegistration? = null
        var predListener: ListenerRegistration? = null
        var rListener: ListenerRegistration? = null
        var xListener: ListenerRegistration? = null

        var currentPatients: List<Patient> = emptyList()
        var totalPreds = 0
        var successful = 0
        var moderate = 0
        var high = 0
        var totalReports = 0
        var totalXRays = 0

        fun pushStats() {
            trySend(
                DashboardStats(
                    totalPatients = currentPatients.size,
                    totalPredictions = totalPreds,
                    successfulCases = successful,
                    moderateRiskCases = moderate,
                    highRiskCases = high,
                    totalXRaysUploaded = totalXRays,
                    totalReports = totalReports,
                    recentPatients = currentPatients
                )
            )
        }

        pListener = firestore.collection("patients").addSnapshotListener { snap, err ->
            if (err == null && snap != null) {
                currentPatients = snap.documents.mapNotNull { doc ->
                    val id = doc.getString("patientId") ?: doc.id
                    val pName = doc.getString("patientName") ?: doc.getString("name") ?: "Patient Record"
                    val pAge = doc.getLong("age")?.toInt() ?: 10
                    val pGender = doc.getString("gender") ?: "Female"
                    Patient(id = id, patientId = id, name = pName, age = pAge, gender = pGender, cvmStage = doc.getString("cvmStage") ?: "CVM 3", status = doc.getString("status") ?: "Active")
                }
                pushStats()
            }
        }

        predListener = firestore.collection("predictions").addSnapshotListener { snap, err ->
            if (err == null && snap != null) {
                totalPreds = snap.size()
                successful = 0
                moderate = 0
                high = 0
                snap.documents.forEach { doc ->
                    val score = doc.getDouble("bampFavorableScore")?.toFloat() ?: (doc.getDouble("successRate")?.toFloat() ?: 0.85f)
                    if (score > 0.85f) successful++
                    else if (score >= 0.70f) moderate++
                    else high++
                }
                pushStats()
            }
        }

        rListener = firestore.collection("reports").addSnapshotListener { snap, err ->
            if (err == null && snap != null) {
                totalReports = snap.size()
                pushStats()
            }
        }

        xListener = firestore.collection("xrays").addSnapshotListener { snap, err ->
            if (err == null && snap != null) {
                totalXRays = snap.size()
                pushStats()
            }
        }

        awaitClose {
            pListener?.remove()
            predListener?.remove()
            rListener?.remove()
            xListener?.remove()
        }
    }

    suspend fun savePatientToFirestore(req: AddPatientRequest): Boolean {
        return try {
            val pId = req.patientId.takeIf { !it.isNullOrEmpty() } ?: "PAT-${System.currentTimeMillis()}"
            val currentUserEmail = FirebaseAuth.getInstance().currentUser?.email ?: "Orthodontist"
            val map = mapOf(
                "patientId" to pId,
                "patientName" to req.name,
                "name" to req.name,
                "age" to req.age,
                "gender" to req.gender,
                "dateOfBirth" to (req.dateOfBirth ?: ""),
                "growthStatus" to (req.growthStatus ?: "Active Peak Growth"),
                "cvmStage" to (req.cvmStage ?: "CVM 3"),
                "skeletalAge" to (req.skeletalAge ?: "${req.age} yrs"),
                "chronologicalAge" to (req.chronologicalAge ?: "${req.age} yrs"),
                "clinicalNotes" to (req.clinicalNotes ?: ""),
                "status" to "Active",
                "diagnosis" to (req.diagnosis ?: "Class III Skeletal Malocclusion"),
                "bampStartDate" to (req.bampStartDate ?: ""),
                "createdAt" to System.currentTimeMillis().toString(),
                "createdBy" to currentUserEmail
            )
            firestore.collection("patients").document(pId).set(map)
            true
        } catch (e: Exception) {
            false
        }
    }

    suspend fun saveXRayMetadataToFirestore(
        patientId: String,
        patientName: String,
        imageUrl: String,
        imageName: String,
        fileSize: Long,
        validationStatus: String,
        confidenceScore: Float
    ): Boolean {
        return try {
            val docId = "XRAY-${System.currentTimeMillis()}"
            val map = mapOf(
                "xrayId" to docId,
                "patientId" to patientId,
                "patientName" to patientName,
                "imageUrl" to imageUrl,
                "imageName" to imageName,
                "uploadDate" to System.currentTimeMillis().toString(),
                "fileSize" to fileSize,
                "validationStatus" to validationStatus,
                "confidenceScore" to confidenceScore,
                "createdAt" to System.currentTimeMillis().toString()
            )
            firestore.collection("patient_xrays").document(docId).set(map)
            firestore.collection("xrays").document(docId).set(map)
            true
        } catch (e: Exception) {
            false
        }
    }
}

class AIRepository {
    private val api = RetrofitClient.apiService
    private val firestore = FirebaseFirestore.getInstance()

    fun saveXRayMetadataToFirestore(
        patientId: String,
        patientName: String,
        imageUrl: String,
        imageName: String,
        fileSize: Long,
        validationStatus: String,
        confidenceScore: Float
    ) {
        try {
            val docId = "XRAY-${System.currentTimeMillis()}"
            val map = mapOf(
                "xrayId" to docId,
                "patientId" to patientId,
                "patientName" to patientName,
                "imageUrl" to imageUrl,
                "imageName" to imageName,
                "uploadDate" to System.currentTimeMillis().toString(),
                "fileSize" to fileSize,
                "validationStatus" to validationStatus,
                "confidenceScore" to confidenceScore,
                "createdAt" to System.currentTimeMillis().toString()
            )
            firestore.collection("patient_xrays").document(docId).set(map)
            firestore.collection("xrays").document(docId).set(map)
        } catch (_: Exception) {}
    }

    suspend fun uploadXray(file: File, patientId: String): retrofit2.Response<ApiResponse<XRayUploadData>> {
        val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
        val body = MultipartBody.Part.createFormData("file", file.name, requestFile)
        val pIdBody = patientId.toRequestBody("text/plain".toMediaTypeOrNull())
        return api.uploadXray(body, pIdBody)
    }

    suspend fun detectLandmarks(xrayId: String?, imageBase64: String?) = 
        api.detectLandmarks(DetectLandmarksRequest(xrayId, imageBase64))

    suspend fun calculateMeasurements(patientId: String, landmarks: List<Landmark>) =
        api.calculateMeasurements(CalculateMeasurementsRequest(patientId, landmarks))

    suspend fun predictOutcome(req: PredictRequest): retrofit2.Response<ApiResponse<PredictResponse>> {
        val response = api.predictOutcome(req)
        if (response.isSuccessful && response.body()?.success == true) {
            response.body()?.data?.let { data ->
                savePredictionToFirestore(req.patientId, data)
            }
        }
        return response
    }

    private fun savePredictionToFirestore(patientId: String, data: PredictResponse) {
        try {
            val predMap = mapOf(
                "predictionId" to data.predictionId,
                "patientId" to patientId,
                "bampOutcomeClass" to data.bampOutcomeClass,
                "bampFavorableScore" to data.bampFavorableScore,
                "surgicalProbability" to data.surgicalProbability,
                "timestamp" to System.currentTimeMillis().toString()
            )
            firestore.collection("predictions").document(data.predictionId).set(predMap)
        } catch (_: Exception) {}
    }

    suspend fun askAIChat(message: String): retrofit2.Response<ApiResponse<AIChatResponse>> {
        val response = api.askAIChat(AIChatRequest(message))
        if (response.isSuccessful && response.body()?.success == true) {
            saveChatMessageToFirestore(message, response.body()?.data?.reply ?: "")
        }
        return response
    }

    private fun saveChatMessageToFirestore(userMessage: String, aiReply: String) {
        try {
            val chatMap = mapOf(
                "userMessage" to userMessage,
                "aiReply" to aiReply,
                "timestamp" to System.currentTimeMillis().toString()
            )
            firestore.collection("chats").add(chatMap)
        } catch (_: Exception) {}
    }

    fun getChatRealtimeFlow(): Flow<List<Pair<String, String>>> = callbackFlow {
        val listener = firestore.collection("chats")
            .addSnapshotListener { snap, err ->
                if (err == null && snap != null) {
                    val messages = snap.documents.mapNotNull { doc ->
                        val uMsg = doc.getString("userMessage")
                        val aReply = doc.getString("aiReply")
                        if (uMsg != null && aReply != null) {
                            Pair(uMsg, aReply)
                        } else null
                    }
                    trySend(messages)
                }
            }
        awaitClose { listener.remove() }
    }
}

class ReportRepository {
    private val api = RetrofitClient.apiService
    private val firestore = FirebaseFirestore.getInstance()

    suspend fun generateReport(patientId: String, predictionId: String?): retrofit2.Response<ApiResponse<ReportData>> {
        val response = api.generateReport(GenerateReportRequest(patientId, predictionId))
        if (response.isSuccessful && response.body()?.success == true) {
            response.body()?.data?.let { data ->
                saveReportToFirestore(patientId, data)
            }
        }
        return response
    }

    private fun saveReportToFirestore(patientId: String, data: ReportData) {
        try {
            val reportMap = mapOf(
                "reportId" to data.reportId,
                "patientId" to patientId,
                "patientName" to data.patientName,
                "pdfUrl" to (data.pdfUrl ?: ""),
                "generatedAt" to data.generatedAt
            )
            firestore.collection("reports").document(data.reportId).set(reportMap)
        } catch (_: Exception) {}
    }

    fun getReportsRealtimeFlow(): Flow<List<ReportData>> = callbackFlow {
        val listener = firestore.collection("reports")
            .addSnapshotListener { snap, err ->
                if (err == null && snap != null) {
                    val reports = snap.documents.mapNotNull { doc ->
                        val rId = doc.getString("reportId") ?: doc.id
                        val pName = doc.getString("patientName") ?: "Patient Report"
                        val pUrl = doc.getString("pdfUrl") ?: ""
                        val genAt = doc.getString("generatedAt") ?: "Just now"
                        ReportData(rId, pUrl, pName, genAt)
                    }
                    trySend(reports)
                }
            }
        awaitClose { listener.remove() }
    }
}

class UserRepository {
    private val api = RetrofitClient.apiService
    private val firestore = FirebaseFirestore.getInstance()

    suspend fun getUserProfile() = api.getUserProfile()
    suspend fun updateUserProfile(req: UserProfileUpdateRequest) = api.updateUserProfile(req)
    suspend fun getNotifications() = api.getNotifications()

    fun getUserProfileRealtimeFlow(email: String): Flow<User?> = callbackFlow {
        val normalized = email.lowercase()
        val listener = firestore.collection("users").document(normalized)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    trySend(null)
                    return@addSnapshotListener
                }
                if (snapshot != null && snapshot.exists()) {
                    val u = User(
                        uid = snapshot.getString("uid") ?: normalized,
                        email = snapshot.getString("email") ?: normalized,
                        name = snapshot.getString("fullName") ?: snapshot.getString("name") ?: "Dr. Orthodontist",
                        role = snapshot.getString("role") ?: "Orthodontist",
                        hospitalName = snapshot.getString("hospitalName") ?: "",
                        mobileNumber = snapshot.getString("mobileNumber") ?: ""
                    )
                    trySend(u)
                }
            }
        awaitClose { listener.remove() }
    }
}
