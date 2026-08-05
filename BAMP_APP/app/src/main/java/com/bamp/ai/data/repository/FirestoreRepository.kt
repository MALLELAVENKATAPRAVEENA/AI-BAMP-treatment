package com.bamp.ai.data.repository

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

    // ================= 1. PATIENTS COLLECTION =================
    fun getPatientsFlow(): Flow<List<Patient>> = callbackFlow {
        val listener: ListenerRegistration = db.collection("patients")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                if (snapshot != null) {
                    val patients = snapshot.toObjects(Patient::class.java)
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
        val doc = db.collection("patients").document(id).get().await()
        return doc.toObject(Patient::class.java)
    }

    suspend fun updatePatient(patient: Patient) {
        db.collection("patients").document(patient.id).set(patient).await()
        logAudit("UPDATE_PATIENT", "Updated patient record: ${patient.name}")
    }

    suspend fun deletePatient(patientId: String) {
        db.collection("patients").document(patientId).delete().await()
        logAudit("DELETE_PATIENT", "Deleted patient record: $patientId")
    }

    // ================= 2. XRAY UPLOADS COLLECTION =================
    suspend fun saveXRayUploadMetadata(patientId: String, imageUrl: String, filename: String) {
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
    }

    // ================= 3. LANDMARKS COLLECTION =================
    suspend fun saveLandmarks(patientId: String, landmarkData: Map<String, Any>) {
        val ref = db.collection("landmarks").document(patientId)
        val record = mapOf(
            "patientId" to patientId,
            "landmarks" to landmarkData,
            "status" to "Completed",
            "updatedAt" to com.google.firebase.Timestamp.now()
        )
        ref.set(record).await()
        logAudit("SAVE_LANDMARKS", "Saved 16 cephalometric landmarks for patient $patientId")
    }

    // ================= 4. CEPHALOMETRIC ANALYSIS COLLECTION =================
    suspend fun saveCephalometricAnalysis(patientId: String, analysisData: Map<String, Any>) {
        val ref = db.collection("cephalometricAnalysis").document(patientId)
        val record = mapOf(
            "patientId" to patientId,
            "analysis" to analysisData,
            "status" to "Calculated",
            "updatedAt" to com.google.firebase.Timestamp.now()
        )
        ref.set(record).await()
        logAudit("SAVE_ANALYSIS", "Calculated Steiner & Wits analysis for patient $patientId")
    }

    // ================= 5. PREDICTIONS COLLECTION =================
    fun getPredictionsFlow(): Flow<List<Prediction>> = callbackFlow {
        val listener = db.collection("predictions")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null) {
                    trySend(snapshot.toObjects(Prediction::class.java))
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun savePrediction(prediction: Prediction): String {
        val ref = db.collection("predictions").document()
        val docId = if (prediction.id.isNotEmpty()) prediction.id else ref.id
        val newPred = prediction.copy(id = docId)
        db.collection("predictions").document(docId).set(newPred).await()
        
        // Update patient record status
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
        return docId
    }

    // ================= 6. REPORTS COLLECTION =================
    fun getReportsFlow(): Flow<List<Report>> = callbackFlow {
        val listener = db.collection("reports")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null) {
                    trySend(snapshot.toObjects(Report::class.java))
                }
            }
        awaitClose { listener.remove() }
    }

    suspend fun saveReport(report: Report): String {
        val ref = db.collection("reports").document()
        val docId = if (report.id.isNotEmpty()) report.id else ref.id
        val newReport = report.copy(id = docId)
        db.collection("reports").document(docId).set(newReport).await()
        logAudit("CREATE_REPORT", "Generated clinical PDF report: ${report.reportNumber}")
        return docId
    }

    // ================= 7. USERS COLLECTION =================
    suspend fun getUserProfile(uid: String): User? {
        val doc = db.collection("users").document(uid).get().await()
        return doc.toObject(User::class.java)
    }

    suspend fun saveUserProfile(user: User) {
        db.collection("users").document(user.uid).set(user).await()
        logAudit("UPDATE_PROFILE", "Updated user profile for ${user.email}")
    }

    // ================= NOTIFICATIONS =================
    fun getNotificationsFlow(userId: String): Flow<List<NotificationItem>> = callbackFlow {
        val listener = db.collection("notifications")
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) return@addSnapshotListener
                if (snapshot != null) {
                    val list = snapshot.toObjects(NotificationItem::class.java)
                        .filter { it.userId.isEmpty() || it.userId == userId }
                    trySend(list)
                }
            }
        awaitClose { listener.remove() }
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
