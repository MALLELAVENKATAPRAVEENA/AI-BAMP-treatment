package com.bamp.ai.data.remote

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.POST
import retrofit2.http.Path

data class LoginRequest(val email: String, val password: String)
data class AuthResponse(
    val success: Boolean,
    val message: String,
    val token: String?,
    val user: Map<String, Any>?
)

data class ForgotPasswordRequest(val email: String)
data class VerifyOtpRequest(val email: String, val otpCode: String)
data class ResetPasswordRequest(val email: String, val otpCode: String, val newPassword: String)
data class GenericResponse(val success: Boolean, val message: String)

data class ChatRequest(val message: String, val context: Map<String, Any>? = null)
data class ChatResponse(val success: Boolean, val reply: String)

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(@Body request: Map<String, Any>): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<GenericResponse>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): Response<GenericResponse>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<GenericResponse>

    @GET("dashboard/metrics")
    suspend fun getDashboardMetrics(@Header("Authorization") token: String): Response<Map<String, Any>>

    @POST("ai/chat")
    suspend fun sendChatMessage(
        @Header("Authorization") token: String,
        @Body request: ChatRequest
    ): Response<ChatResponse>
}
