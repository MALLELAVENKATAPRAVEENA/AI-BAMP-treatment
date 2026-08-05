package com.bamp.ai.data.repository

import android.net.Uri
import com.bamp.ai.data.remote.FirebaseClient
import kotlinx.coroutines.tasks.await
import java.util.UUID

class StorageRepository {
    private val storage = FirebaseClient.storage.reference

    suspend fun uploadXRayImage(patientId: String, imageUri: Uri, mimeType: String?): String {
        val extension = when {
            mimeType?.contains("dicom") == true -> "dcm"
            mimeType?.contains("png") == true -> "png"
            mimeType?.contains("jpeg") == true || mimeType?.contains("jpg") == true -> "jpg"
            else -> "jpg"
        }

        val filename = "xray_${System.currentTimeMillis()}_${UUID.randomUUID().toString().take(6)}.$extension"
        val ref = storage.child("xrays/$patientId/$filename")
        
        ref.putFile(imageUri).await()
        val downloadUrl = ref.downloadUrl.await()
        return downloadUrl.toString()
    }

    suspend fun uploadReportPdf(reportNumber: String, pdfUri: Uri): String {
        val filename = "report_${reportNumber}_${System.currentTimeMillis()}.pdf"
        val ref = storage.child("reports/$filename")
        ref.putFile(pdfUri).await()
        return ref.downloadUrl.await().toString()
    }
}
