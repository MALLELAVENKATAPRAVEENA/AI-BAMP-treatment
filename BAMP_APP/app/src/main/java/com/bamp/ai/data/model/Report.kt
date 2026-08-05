package com.bamp.ai.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Report(
    @DocumentId val id: String = "",
    val reportNumber: String = "",
    val patientId: String = "",
    val patientName: String = "",
    val doctorUid: String = "",
    val pdfUrl: String = "",
    val summary: String = "",
    val status: String = "Generated",
    @ServerTimestamp val createdAt: Date? = null
)
