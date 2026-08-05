package com.bamp.ai.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Patient(
    @DocumentId val id: String = "",
    val patientId: String = "", // e.g. PAT-2026-001
    val name: String = "",
    val age: Int = 0,
    val gender: String = "Male",
    val status: String = "Active", // Active, In Treatment, Completed
    val malocclusionType: String = "Class III Malocclusion",
    val skeletalClass: String = "Class III",
    val contactNumber: String = "",
    val address: String = "",
    val notes: String = "",
    val doctorUid: String = "",
    val xrayUrl: String = "",
    val landmarkStatus: String = "Pending", // Pending, Completed
    val predictionStatus: String = "Pending", // Pending, Completed
    val latestPredictionScore: Double = 0.0,
    @ServerTimestamp val createdAt: Date? = null,
    @ServerTimestamp val updatedAt: Date? = null
)
