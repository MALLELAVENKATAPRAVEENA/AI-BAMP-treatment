package com.bamp.ai.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class User(
    @DocumentId val uid: String = "",
    val name: String = "",
    val email: String = "",
    val role: String = "Orthodontist", // Orthodontist, Researcher, Admin
    val specialization: String = "Orthodontics & Dentofacial Orthopedics",
    val clinicName: String = "",
    val phone: String = "",
    val photoUrl: String = "",
    val isVerified: Boolean = false,
    @ServerTimestamp val createdAt: Date? = null,
    @ServerTimestamp val updatedAt: Date? = null
)
