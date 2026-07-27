package com.bamp.ai.data.model

import com.google.gson.annotations.SerializedName

// Generic API Response Wrapper
data class ApiResponse<T>(
    val success: Boolean,
    val message: String?,
    val data: T?,
    val token: String?,
    val user: User?
)

// Auth Models
data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val fullName: String,
    val email: String,
    val mobileNumber: String? = null,
    val hospitalName: String? = null,
    val role: String = "Orthodontist",
    val password: String,
    val confirmPassword: String
)

data class GoogleLoginRequest(
    val uid: String,
    val email: String,
    val displayName: String? = null,
    val photoURL: String? = null
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
    val photoURL: String? = null,
    val hospitalName: String? = null,
    val mobileNumber: String? = null,
    val createdAt: String? = null
)

data class AuthResponseData(
    val token: String?,
    val user: User?
)

// Patient Models
data class Patient(
    val id: String?,
    val patientId: String?,
    @SerializedName("patientName", alternate = ["name"])
    val name: String,
    val age: Int,
    val gender: String,
    val contactNumber: String? = null,
    val cvmStage: String? = "CVM 3",
    val status: String? = "Active",
    val diagnosis: String? = "Class III Skeletal Malocclusion",
    val bampStartDate: String? = null,
    val createdAt: String? = null,
    val history: List<PatientHistoryItem>? = null
)

data class PatientHistoryItem(
    val date: String,
    val type: String,
    val description: String
)

data class AddPatientRequest(
    @SerializedName("patientName", alternate = ["name"])
    val name: String,
    val age: Int,
    val gender: String,
    val contactNumber: String? = null,
    val cvmStage: String? = "CVM 3",
    val diagnosis: String? = "Class III Skeletal Malocclusion",
    val bampStartDate: String? = null
)

data class UpdatePatientRequest(
    val name: String? = null,
    val age: Int? = null,
    val gender: String? = null,
    val contactNumber: String? = null,
    val cvmStage: String? = null,
    val status: String? = null,
    val diagnosis: String? = null,
    val bampStartDate: String? = null
)

// Dashboard Stats Model
data class DashboardStats(
    val totalPatients: Int = 0,
    val totalPredictions: Int = 0,
    val successfulCases: Int = 0,
    val moderateRiskCases: Int = 0,
    val highRiskCases: Int = 0,
    val totalXRaysUploaded: Int = 0,
    val totalReports: Int = 0,
    val recentPatients: List<Patient>? = emptyList()
)

data class XRayUploadData(
    val xrayId: String?,
    val imageUrl: String?,
    val patientId: String?,
    val validationStatus: String? = "Accepted",
    val confidenceScore: Float? = 95.0f,
    val rejectionReason: String? = null,
    val validatedByAI: Boolean? = true
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

data class CalculateMeasurementsRequest(
    val patientId: String,
    val landmarks: List<Landmark>
)

data class CephMeasurements(
    val sna: Float = 82f,
    val snb: Float = 80f,
    val anb: Float = 2f,
    val witts: Float = 0f
)

data class PredictRequest(
    val patientId: String,
    val age: Int,
    val gender: String,
    val cvmStage: String? = "CVM 3",
    val growthPotential: String? = "High",
    val landmarks: List<Landmark>? = null,
    val measurements: CephMeasurements? = null
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

// Reports
data class GenerateReportRequest(
    val patientId: String,
    val predictionId: String? = null
)

data class ReportData(
    val reportId: String,
    val pdfUrl: String,
    val patientName: String,
    val generatedAt: String
)

// Profile & Notifications
data class UserProfileUpdateRequest(
    val fullName: String? = null,
    val hospitalName: String? = null,
    val mobileNumber: String? = null
)

data class UserNotification(
    val id: String,
    val title: String,
    val message: String,
    val timestamp: String,
    val read: Boolean = false
)
