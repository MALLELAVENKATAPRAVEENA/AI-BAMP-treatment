package com.bamp.ai.data.remote

import com.bamp.ai.data.model.*
import okhttp3.MultipartBody
import okhttp3.RequestBody
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
    suspend fun verifyOtp(@Body request: VerifyOtpRequest): Response<ApiResponse<AuthResponseData>>

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

    @GET("patients/{id}")
    suspend fun getPatientById(@Path("id") id: String): Response<ApiResponse<Patient>>

    @PUT("patients/{id}")
    suspend fun updatePatient(@Path("id") id: String, @Body request: UpdatePatientRequest): Response<ApiResponse<Patient>>

    @DELETE("patients/{id}")
    suspend fun deletePatient(@Path("id") id: String): Response<ApiResponse<Any>>

    // X-Ray Upload Routes
    @Multipart
    @POST("xray/upload")
    suspend fun uploadXray(
        @Part file: MultipartBody.Part,
        @Part("patientId") patientId: RequestBody
    ): Response<ApiResponse<XRayUploadData>>

    @GET("xray/{id}")
    suspend fun getXrayById(@Path("id") id: String): Response<ApiResponse<XRayUploadData>>

    // AI Prediction Routes
    @POST("ai/detect-landmarks")
    suspend fun detectLandmarks(@Body request: DetectLandmarksRequest): Response<ApiResponse<List<Landmark>>>

    @POST("ai/calculate-measurements")
    suspend fun calculateMeasurements(@Body request: CalculateMeasurementsRequest): Response<ApiResponse<CephMeasurements>>

    @POST("ai/predict")
    suspend fun predictOutcome(@Body request: PredictRequest): Response<ApiResponse<PredictResponse>>

    @POST("ai/chat")
    suspend fun askAIChat(@Body request: AIChatRequest): Response<ApiResponse<AIChatResponse>>

    // Reports Route
    @POST("report/generate")
    suspend fun generateReport(@Body request: GenerateReportRequest): Response<ApiResponse<ReportData>>

    // Profile & User Routes
    @GET("users/profile")
    suspend fun getUserProfile(): Response<ApiResponse<User>>

    @PUT("users/profile")
    suspend fun updateUserProfile(@Body request: UserProfileUpdateRequest): Response<ApiResponse<User>>

    @GET("notifications")
    suspend fun getNotifications(): Response<ApiResponse<List<UserNotification>>>
}
