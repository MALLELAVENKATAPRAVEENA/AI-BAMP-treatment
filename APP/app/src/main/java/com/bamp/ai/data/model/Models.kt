package com.bamp.ai.data.model

import com.google.gson.annotations.SerializedName

// Generic API Response Wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T?
)

// Auth Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val fullName: String,
    val email: String,
    val mobileNumber: String?,
    val hospitalName: String?,
    val role: String = "Orthodontist",
    val password: String,
    val confirmPassword: String
)

data class GoogleLoginRequest(
    val uid: String,
    val email: String,
    val displayName: String?,
    val photoURL: String?
)

data class ForgotPasswordRequest(
    val email: String
)

data class VerifyOtpRequest(
    val email: String,
    val otp: String
)

data class ResetPasswordRequest(
    val email: String,
    val otp: String,
    val newPassword: String
)

data class User(
    val uid: String,
    val email: String,
    @SerializedName("fullName", alternate = ["name"])
    val name: String?,
    val role: String?,
    val photoURL: String?,
    val hospitalName: String?
)

data class AuthResponseData(
    val token: String?,
    val user: User?
)

// Patient Models
data class Patient(
    val id: String?,
    val patientId: String?,
    val name: String,
    val age: Int,
    val gender: String,
    val contactNumber: String?,
    val status: String? = "Active",
    val createdAt: String?
)

data class AddPatientRequest(
    val name: String,
    val age: Int,
    val gender: String,
    val contactNumber: String?
)

// Dashboard Stats Model
data class DashboardStats(
    val totalPatients: Int,
    val totalPredictions: Int,
    val totalXRaysUploaded: Int,
    val recentPatients: List<Patient>?
)

// AI Models
data class DetectLandmarksRequest(
    val xrayId: String? = null,
    val imageBase64: String? = null
)

data class Landmark(
    val id: String,
    val name: String,
    val x: Float,
    val y: Float
)

data class PredictRequest(
    val patientId: String,
    val age: Int,
    val gender: String,
    val landmarks: List<Landmark>?
)

data class PredictResponse(
    val predictionId: String,
    val patientId: String,
    val bampFavorableScore: Float,
    val surgicalProbability: Float,
    val bampOutcomeClass: String,
    val shapDrivers: List<ShapDriver>?
)

data class ShapDriver(
    val feature: String,
    val importance: Float,
    val description: String
)

data class AIChatRequest(
    val message: String
)

data class AIChatResponse(
    val reply: String
)
