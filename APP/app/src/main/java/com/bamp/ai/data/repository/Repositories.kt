package com.bamp.ai.data.repository

import com.bamp.ai.data.model.*
import com.bamp.ai.data.remote.RetrofitClient

class AuthRepository {
    private val api = RetrofitClient.apiService

    suspend fun login(req: LoginRequest) = api.login(req)
    suspend fun register(req: RegisterRequest) = api.register(req)
    suspend fun googleLogin(req: GoogleLoginRequest) = api.googleLogin(req)
    suspend fun forgotPassword(email: String) = api.forgotPassword(ForgotPasswordRequest(email))
    suspend fun verifyOtp(email: String, otp: String) = api.verifyOtp(VerifyOtpRequest(email, otp))
    suspend fun resetPassword(req: ResetPasswordRequest) = api.resetPassword(req)
}

class PatientRepository {
    private val api = RetrofitClient.apiService

    suspend fun getPatients() = api.getPatients()
    suspend fun addPatient(req: AddPatientRequest) = api.addPatient(req)
    suspend fun getDashboardStats() = api.getDashboardStats()
}

class AIRepository {
    private val api = RetrofitClient.apiService

    suspend fun detectLandmarks(xrayId: String?, imageBase64: String?) = 
        api.detectLandmarks(DetectLandmarksRequest(xrayId, imageBase64))

    suspend fun predictOutcome(req: PredictRequest) = api.predictOutcome(req)
    suspend fun askAIChat(message: String) = api.askAIChat(AIChatRequest(message))
}
