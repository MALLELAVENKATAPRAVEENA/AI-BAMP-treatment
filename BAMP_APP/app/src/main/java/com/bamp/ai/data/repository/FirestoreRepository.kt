package com.bamp.ai.data.repository

import android.util.Log
import com.bamp.ai.data.model.ChatMessage
import com.bamp.ai.data.model.NotificationItem
import com.bamp.ai.data.model.Patient
import com.bamp.ai.data.model.Prediction
import com.bamp.ai.data.model.Report
import com.bamp.ai.data.model.User
import com.bamp.ai.data.remote.FirebaseClient
import com.google.firebase.firestore.ListenerRegistration
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class FirestoreRepository {
    private val db = FirebaseClient.firestore
    private val TAG = "FirestoreRepository"

    // ================= 1. PATIENTS COLLECTION =================
    // ================= 1. PATIENTS COLLECTION =================
    fun getPatientsFlow(): Flow<List<Patient>> = callbackFlow {
        val listener: ListenerRegistration = db.collection("patients")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "getPatientsFlow snapshot note: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val patients = mutableListOf<Patient>()
                    for (doc in snapshot.documents) {
                        try {
                            val data = doc.data
                            if (data != null) {
                                val p = Patient(
                                    id = doc.id,
                                    patientId = data["patientId"]?.toString() ?: doc.id,
                                    name = data["name"]?.toString() ?: data["patientName"]?.toString() ?: "Patient",
                                    patientName = data["patientName"]?.toString() ?: data["name"]?.toString() ?: "Patient",
                                    age = (data["age"] as? Number)?.toDouble() ?: (data["age"]?.toString()?.toDoubleOrNull() ?: 11.0),
                                    gender = data["gender"]?.toString() ?: "Female",
                                    cvmStage = data["cvmStage"]?.toString() ?: "CVM 3",
                                    growthPotential = data["growthPotential"]?.toString() ?: "High",
                                    skeletalAge = data["skeletalAge"]?.toString() ?: "11.0 yrs",
                                    clinicalNotes = data["clinicalNotes"]?.toString() ?: data["chiefComplaint"]?.toString() ?: "",
                                    status = data["status"]?.toString() ?: "Active",
                                    malocclusionType = data["malocclusionType"]?.toString() ?: "Class III Malocclusion",
                                    skeletalClass = data["skeletalClass"]?.toString() ?: "Class III",
                                    contactNumber = data["contactNumber"]?.toString() ?: "",
                                    address = data["address"]?.toString() ?: "",
                                    notes = data["notes"]?.toString() ?: "",
                                    doctorUid = data["doctorUid"]?.toString() ?: "",
                                    xrayUrl = data["xrayUrl"]?.toString() ?: "",
                                    landmarkStatus = data["landmarkStatus"]?.toString() ?: "Pending",
                                    predictionStatus = data["predictionStatus"]?.toString() ?: "Pending",
                                    latestPredictionScore = (data["latestPredictionScore"] as? Number)?.toDouble() ?: 0.0
                                )
                                patients.add(p)
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Patient document parse note: ${e.message}")
                        }
                    }
                    trySend(patients)
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun addPatient(patient: Patient): String {
        val ref = db.collection("patients").document()
        val docId = if (patient.id.isNotEmpty()) patient.id else ref.id
        val newPatient = patient.copy(id = docId)
        db.collection("patients").document(docId).set(newPatient).await()
        logAudit("ADD_PATIENT", "Registered new patient: ${patient.name}")
        return docId
    }

    suspend fun getPatientById(id: String): Patient? {
        return try {
            val doc = db.collection("patients").document(id).get().await()
            val data = doc.data ?: return null
            Patient(
                id = doc.id,
                patientId = data["patientId"]?.toString() ?: doc.id,
                name = data["name"]?.toString() ?: data["patientName"]?.toString() ?: "Patient",
                patientName = data["patientName"]?.toString() ?: data["name"]?.toString() ?: "Patient",
                age = (data["age"] as? Number)?.toDouble() ?: (data["age"]?.toString()?.toDoubleOrNull() ?: 11.0),
                gender = data["gender"]?.toString() ?: "Female",
                cvmStage = data["cvmStage"]?.toString() ?: "CVM 3",
                growthPotential = data["growthPotential"]?.toString() ?: "High",
                skeletalAge = data["skeletalAge"]?.toString() ?: "11.0 yrs",
                clinicalNotes = data["clinicalNotes"]?.toString() ?: data["chiefComplaint"]?.toString() ?: "",
                status = data["status"]?.toString() ?: "Active",
                malocclusionType = data["malocclusionType"]?.toString() ?: "Class III Malocclusion"
            )
        } catch (e: Exception) {
            Log.w(TAG, "getPatientById error: ${e.message}")
            null
        }
    }

    suspend fun updatePatient(patient: Patient) {
        try {
            db.collection("patients").document(patient.id).set(patient).await()
            logAudit("UPDATE_PATIENT", "Updated patient record: ${patient.name}")
        } catch (e: Exception) {
            Log.w(TAG, "updatePatient error: ${e.message}")
        }
    }

    suspend fun deletePatient(patientId: String) {
        try {
            db.collection("patients").document(patientId).delete().await()
            logAudit("DELETE_PATIENT", "Deleted patient record: $patientId")
        } catch (e: Exception) {
            Log.w(TAG, "deletePatient error: ${e.message}")
        }
    }

    // ================= 2. XRAY UPLOADS COLLECTION =================
    suspend fun saveXRayUploadMetadata(patientId: String, imageUrl: String, filename: String) {
        try {
            val ref = db.collection("xrayUploads").document()
            val record = mapOf(
                "id" to ref.id,
                "patientId" to patientId,
                "imageUrl" to imageUrl,
                "filename" to filename,
                "uploadedBy" to (FirebaseClient.auth.currentUser?.email ?: "anonymous"),
                "timestamp" to com.google.firebase.Timestamp.now()
            )
            ref.set(record).await()
            logAudit("XRAY_UPLOAD", "Uploaded lateral cephalogram for patient $patientId")
        } catch (e: Exception) {
            Log.w(TAG, "saveXRayUploadMetadata error: ${e.message}")
        }
    }

    // ================= 3. LANDMARKS COLLECTION =================
    suspend fun saveLandmarks(patientId: String, landmarkData: Map<String, Any>) {
        try {
            val ref = db.collection("landmarks").document(patientId)
            val record = mapOf(
                "patientId" to patientId,
                "landmarks" to landmarkData,
                "status" to "Completed",
                "updatedAt" to com.google.firebase.Timestamp.now()
            )
            ref.set(record).await()
            logAudit("SAVE_LANDMARKS", "Saved 16 cephalometric landmarks for patient $patientId")
        } catch (e: Exception) {
            Log.w(TAG, "saveLandmarks error: ${e.message}")
        }
    }

    // ================= 4. CEPHALOMETRIC ANALYSIS COLLECTION =================
    suspend fun saveCephalometricAnalysis(patientId: String, analysisData: Map<String, Any>) {
        try {
            val ref = db.collection("cephalometricAnalysis").document(patientId)
            val record = mapOf(
                "patientId" to patientId,
                "analysis" to analysisData,
                "status" to "Calculated",
                "updatedAt" to com.google.firebase.Timestamp.now()
            )
            ref.set(record).await()
            logAudit("SAVE_ANALYSIS", "Calculated Steiner & Wits analysis for patient $patientId")
        } catch (e: Exception) {
            Log.w(TAG, "saveCephalometricAnalysis error: ${e.message}")
        }
    }

    // ================= 5. PREDICTIONS COLLECTION =================
    fun getPredictionsFlow(): Flow<List<Prediction>> = callbackFlow {
        val listener = db.collection("predictions")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "getPredictionsFlow snapshot note: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val predictions = mutableListOf<Prediction>()
                    for (doc in snapshot.documents) {
                        try {
                            val data = doc.data
                            if (data != null) {
                                val p = Prediction(
                                    id = doc.id,
                                    patientId = data["patientId"]?.toString() ?: "",
                                    patientName = data["patientName"]?.toString() ?: "",
                                    doctorUid = data["doctorUid"]?.toString() ?: "",
                                    successProbability = (data["successProbability"] as? Number)?.toDouble() ?: 88.5,
                                    boneDensityScore = (data["boneDensityScore"] as? Number)?.toDouble() ?: 0.0,
                                    relapseRiskPercent = (data["relapseRiskPercent"] as? Number)?.toDouble() ?: 0.0,
                                    softTissueProfileChange = data["softTissueProfileChange"]?.toString() ?: "Favorable",
                                    maxillaAdvancementMm = (data["maxillaAdvancementMm"] as? Number)?.toDouble() ?: (data["maxillaryProtractionMm"] as? Number)?.toDouble() ?: 3.5,
                                    mandibleRetractionMm = (data["mandibleRetractionMm"] as? Number)?.toDouble() ?: (data["mandibularControlMm"] as? Number)?.toDouble() ?: 1.2,
                                    treatmentDurationMonths = (data["treatmentDurationMonths"] as? Number)?.toInt() ?: 14,
                                    mesh3dAvailable = data["mesh3dAvailable"] as? Boolean ?: true
                                )
                                predictions.add(p)
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Prediction document parse note: ${e.message}")
                        }
                    }
                    trySend(predictions)
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun savePrediction(prediction: Prediction): String {
        val ref = db.collection("predictions").document()
        val docId = if (prediction.id.isNotEmpty()) prediction.id else ref.id
        val newPred = prediction.copy(id = docId)
        try {
            db.collection("predictions").document(docId).set(newPred).await()
            if (prediction.patientId.isNotEmpty()) {
                db.collection("patients").document(prediction.patientId)
                    .update(
                        mapOf(
                            "predictionStatus" to "Completed",
                            "latestPredictionScore" to prediction.successProbability
                        )
                    ).await()
            }
            logAudit("CREATE_PREDICTION", "Generated AI BAMP prediction for patient ${prediction.patientName}")
        } catch (e: Exception) {
            Log.w(TAG, "savePrediction error: ${e.message}")
        }
        return docId
    }

    // ================= 6. REPORTS COLLECTION =================
    fun getReportsFlow(): Flow<List<Report>> = callbackFlow {
        val listener = db.collection("reports")
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "getReportsFlow snapshot note: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val reports = mutableListOf<Report>()
                    for (doc in snapshot.documents) {
                        try {
                            val data = doc.data
                            if (data != null) {
                                val r = Report(
                                    id = doc.id,
                                    reportNumber = data["reportNumber"]?.toString() ?: doc.id,
                                    patientId = data["patientId"]?.toString() ?: "",
                                    patientName = data["patientName"]?.toString() ?: "",
                                    doctorUid = data["doctorUid"]?.toString() ?: "",
                                    pdfUrl = data["pdfUrl"]?.toString() ?: "",
                                    summary = data["summary"]?.toString() ?: "",
                                    status = data["status"]?.toString() ?: "Generated"
                                )
                                reports.add(r)
                            }
                        } catch (e: Exception) {
                            Log.w(TAG, "Report document parse note: ${e.message}")
                        }
                    }
                    trySend(reports)
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun saveReport(report: Report): String {
        val ref = db.collection("reports").document()
        val docId = if (report.id.isNotEmpty()) report.id else ref.id
        val newReport = report.copy(id = docId)
        try {
            db.collection("reports").document(docId).set(newReport).await()
            logAudit("CREATE_REPORT", "Generated clinical PDF report: ${report.reportNumber}")
        } catch (e: Exception) {
            Log.w(TAG, "saveReport error: ${e.message}")
        }
        return docId
    }

    // ================= 7. USERS COLLECTION =================
    suspend fun getUserProfile(uid: String): User? {
        return try {
            val doc = db.collection("users").document(uid).get().await()
            doc.toObject(User::class.java)
        } catch (e: Exception) {
            Log.w(TAG, "getUserProfile error: ${e.message}")
            null
        }
    }

    suspend fun saveUserProfile(user: User) {
        try {
            db.collection("users").document(user.uid).set(user).await()
            logAudit("UPDATE_PROFILE", "Updated user profile for ${user.email}")
        } catch (e: Exception) {
            Log.w(TAG, "saveUserProfile error: ${e.message}")
        }
    }

    // ================= NOTIFICATIONS =================
    fun getNotificationsFlow(userId: String): Flow<List<NotificationItem>> = callbackFlow {
        val listener = db.collection("notifications")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "getNotificationsFlow snapshot error: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val list = snapshot.toObjects(NotificationItem::class.java)
                        .filter { it.userId.isEmpty() || it.userId == userId }
                    trySend(list)
                }
            }
        awaitClose { listener.remove() }
    }

    // ================= CHAT MESSAGES =================
    fun getChatMessagesFlow(): Flow<List<ChatMessage>> = callbackFlow {
        val listener = db.collection("chat_messages")
            .orderBy("timestamp", Query.Direction.ASCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    Log.w(TAG, "getChatMessagesFlow error: ${error.message}")
                    trySend(emptyList())
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val msgs = snapshot.toObjects(ChatMessage::class.java)
                    trySend(msgs)
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun sendChatMessage(message: ChatMessage) {
        try {
            db.collection("chat_messages").document(message.id).set(message).await()
        } catch (e: Exception) {
            Log.w(TAG, "sendChatMessage error: ${e.message}")
        }
    }

    // ================= AUDIT LOGS =================
    private fun logAudit(action: String, description: String) {
        try {
            val user = FirebaseClient.auth.currentUser
            val audit = mapOf(
                "action" to action,
                "description" to description,
                "userId" to (user?.uid ?: "anonymous"),
                "userEmail" to (user?.email ?: "anonymous"),
                "platform" to "Android App",
                "timestamp" to com.google.firebase.Timestamp.now()
            )
            db.collection("audit_logs").add(audit)
        } catch (_: Exception) {}
    }
}
