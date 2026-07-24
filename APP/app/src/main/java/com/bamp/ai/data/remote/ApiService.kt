package com.bamp.ai.data.remote

import com.bamp.ai.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // Auth Routes
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponseData>>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthResponseData>>

    @POST("auth/google-login")
    suspend fun googleLogin(@Body request: GoogleLoginRequest): Response<ApiResponse<AuthResponseData>>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ApiResponse<Any>>

    @POST("auth/verify-otp")
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): Response<ApiResponse<Any>>

    @POST("auth/reset-password")
    suspend fun resetPassword(@Body request: ResetPasswordRequest): Response<ApiResponse<Any>>

    // Dashboard Routes
    @GET("dashboard/stats")
    suspend fun getDashboardStats(): Response<ApiResponse<DashboardStats>>

    // Patient Directory Routes
    @GET("patients")
    suspend fun getPatients(): Response<ApiResponse<List<Patient>>>

    @POST("patients")
    suspend fun addPatient(@Body request: AddPatientRequest): Response<ApiResponse<Patient>>

    // AI Prediction Routes
    @POST("ai/detect-landmarks")
    suspend fun detectLandmarks(@Body request: DetectLandmarksRequest): Response<ApiResponse<List<Landmark>>>

    @POST("ai/predict")
    suspend fun predictOutcome(@Body request: PredictRequest): Response<ApiResponse<PredictResponse>>

    @POST("ai/chat")
    suspend fun askAIChat(@Body request: AIChatRequest): Response<ApiResponse<AIChatResponse>>
}
