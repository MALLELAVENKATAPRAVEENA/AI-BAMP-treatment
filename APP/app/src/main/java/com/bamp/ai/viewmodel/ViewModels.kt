package com.bamp.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bamp.ai.data.config.AppConfig
import com.bamp.ai.data.model.*
import com.bamp.ai.data.remote.RetrofitClient
import com.bamp.ai.data.repository.*
import com.google.firebase.auth.FirebaseAuth
import com.google.gson.JsonSyntaxException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.launch
import java.io.File
import java.net.ConnectException
import java.net.UnknownHostException

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

private fun formatErrorMessage(e: Throwable): String {
    return when (e) {
        is JsonSyntaxException -> "Backend returned invalid response format."
        is ConnectException, is UnknownHostException -> "Server connection timeout. Verify internet connection."
        else -> e.message ?: "Authentication error occurred."
    }
}

class AuthViewModel : ViewModel() {
    private val repository = AuthRepository()
    private val firebaseAuth = FirebaseAuth.getInstance()

    private val _loginState = MutableStateFlow<UiState<AuthResponseData>>(UiState.Idle)
    val loginState: StateFlow<UiState<AuthResponseData>> = _loginState

    private val _otpState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val otpState: StateFlow<UiState<String>> = _otpState

    private val _verifyOtpState = MutableStateFlow<UiState<AuthResponseData>>(UiState.Idle)
    val verifyOtpState: StateFlow<UiState<AuthResponseData>> = _verifyOtpState

    private val _resetPasswordState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val resetPasswordState: StateFlow<UiState<String>> = _resetPasswordState

    var currentUser: User? = null
        private set

    fun login(email: String, pass: String) {
        val cleanEmail = email.trim()
        val cleanPass = pass.trim()

        if (cleanEmail.isEmpty() || cleanPass.isEmpty()) {
            _loginState.value = UiState.Error("Please enter email address and password.")
            return
        }

        viewModelScope.launch {
            _loginState.value = UiState.Loading

            // 1. Try Firebase Auth Direct
            firebaseAuth.signInWithEmailAndPassword(cleanEmail, cleanPass)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val fbUser = task.result?.user
                        val u = User(
                            uid = fbUser?.uid ?: "user_fb",
                            email = fbUser?.email ?: cleanEmail,
                            name = fbUser?.displayName ?: "Dr. Orthodontist",
                            role = AppConfig.USER_ROLE_ORTHODONTIST
                        )
                        currentUser = u
                        repository.syncUserToFirestore(u)
                        _loginState.value = UiState.Success(AuthResponseData(fbUser?.uid, u))
                    } else {
                        // 2. Try Backend API (syncs with Firestore and creates Firebase Auth user)
                        viewModelScope.launch {
                            try {
                                val res = repository.login(LoginRequest(cleanEmail, cleanPass))
                                val body = res.body()
                                if (res.isSuccessful && body != null && body.success) {
                                    val data = body.data ?: AuthResponseData(body.token, body.user)
                                    RetrofitClient.setAuthToken(data.token)
                                    currentUser = data.user
                                    repository.syncUserToFirestore(data.user ?: User("uid", cleanEmail, "Doctor", role = "Orthodontist"))
                                    _loginState.value = UiState.Success(data)
                                } else {
                                    _loginState.value = UiState.Error("Invalid Email or Password. Tap 'Register Account' if you don't have an account.")
                                }
                            } catch (e: Exception) {
                                _loginState.value = UiState.Error("Invalid Email or Password. Tap 'Register Account' to create a new account.")
                            }
                        }
                    }
                }
        }
    }

    fun register(req: RegisterRequest) {
        val cleanEmail = req.email.trim()
        val cleanPass = req.password.trim()

        if (cleanEmail.isEmpty() || cleanPass.isEmpty()) {
            _loginState.value = UiState.Error("Please fill out all registration fields.")
            return
        }

        viewModelScope.launch {
            _loginState.value = UiState.Loading

            // 1. Register directly in Firebase Cloud Auth (bamp-1de96)
            firebaseAuth.createUserWithEmailAndPassword(cleanEmail, cleanPass)
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        val fbUser = task.result?.user
                        val u = User(
                            uid = fbUser?.uid ?: "user_fb",
                            email = fbUser?.email ?: cleanEmail,
                            name = req.fullName,
                            role = req.role,
                            hospitalName = req.hospitalName,
                            mobileNumber = req.mobileNumber
                        )
                        currentUser = u
                        repository.syncUserToFirestore(u)

                        // Sync with backend API silently
                        viewModelScope.launch {
                            try { repository.register(req) } catch (_: Exception) {}
                        }

                        _loginState.value = UiState.Success(AuthResponseData(fbUser?.uid, u))
                    } else {
                        // 2. Fallback Backend API Register
                        viewModelScope.launch {
                            try {
                                val res = repository.register(req)
                                val body = res.body()
                                if (res.isSuccessful && body != null && body.success) {
                                    val data = body.data ?: AuthResponseData(body.token, body.user)
                                    RetrofitClient.setAuthToken(data.token)
                                    currentUser = data.user
                                    repository.syncUserToFirestore(data.user ?: User("uid", cleanEmail, req.fullName, role = req.role))
                                    _loginState.value = UiState.Success(data)
                                } else {
                                    _loginState.value = UiState.Error(task.exception?.message ?: body?.message ?: "Registration failed.")
                                }
                            } catch (e: Exception) {
                                _loginState.value = UiState.Error(task.exception?.message ?: formatErrorMessage(e))
                            }
                        }
                    }
                }
        }
    }

    fun requestOtp(email: String) {
        viewModelScope.launch {
            _otpState.value = UiState.Loading
            firebaseAuth.sendPasswordResetEmail(email.trim())
                .addOnCompleteListener { task ->
                    if (task.isSuccessful) {
                        _otpState.value = UiState.Success("Password reset instructions sent to $email")
                    } else {
                        viewModelScope.launch {
                            try {
                                val res = repository.forgotPassword(email)
                                if (res.isSuccessful) {
                                    _otpState.value = UiState.Success("Verification code sent to $email")
                                } else {
                                    _otpState.value = UiState.Error(task.exception?.message ?: "Failed to send reset email.")
                                }
                            } catch (e: Exception) {
                                _otpState.value = UiState.Error(task.exception?.message ?: formatErrorMessage(e))
                            }
                        }
                    }
                }
        }
    }

    fun verifyOtp(email: String, otp: String) {
        viewModelScope.launch {
            _verifyOtpState.value = UiState.Loading
            try {
                val res = repository.verifyOtp(email, otp)
                val body = res.body()
                if (res.isSuccessful && body != null) {
                    val data = body.data ?: AuthResponseData(body.token, body.user)
                    RetrofitClient.setAuthToken(data.token)
                    currentUser = data.user
                    _verifyOtpState.value = UiState.Success(data)
                } else {
                    _verifyOtpState.value = UiState.Error(body?.message ?: "Invalid OTP")
                }
            } catch (e: Exception) {
                _verifyOtpState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun verifyOtpAndReset(email: String, otp: String, pass: String) {
        viewModelScope.launch {
            _resetPasswordState.value = UiState.Loading
            try {
                val res = repository.resetPassword(ResetPasswordRequest(email, otp, pass))
                if (res.isSuccessful) {
                    _resetPasswordState.value = UiState.Success("Password updated successfully. Please sign in.")
                } else {
                    _resetPasswordState.value = UiState.Error(res.body()?.message ?: "Password Reset Failed")
                }
            } catch (e: Exception) {
                _resetPasswordState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun logout() {
        currentUser = null
        RetrofitClient.setAuthToken(null)
        try {
            firebaseAuth.signOut()
        } catch (_: Exception) {}
        _loginState.value = UiState.Idle
    }
}

class PatientViewModel : ViewModel() {
    private val repository = PatientRepository()

    private val _patientsState = MutableStateFlow<UiState<List<Patient>>>(UiState.Idle)
    val patientsState: StateFlow<UiState<List<Patient>>> = _patientsState

    private val _selectedPatientState = MutableStateFlow<UiState<Patient>>(UiState.Idle)
    val selectedPatientState: StateFlow<UiState<Patient>> = _selectedPatientState

    private val _statsState = MutableStateFlow<UiState<DashboardStats>>(UiState.Idle)
    val statsState: StateFlow<UiState<DashboardStats>> = _statsState

    private val _actionState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val actionState: StateFlow<UiState<String>> = _actionState

    init {
        viewModelScope.launch {
            repository.getPatientsRealtimeFlow()
                .catch { /* Fallback */ }
                .collect { list ->
                    _patientsState.value = UiState.Success(list)
                }
        }
        viewModelScope.launch {
            repository.getDashboardStatsRealtimeFlow()
                .catch { /* Fallback */ }
                .collect { stats ->
                    _statsState.value = UiState.Success(stats)
                }
        }
    }

    fun fetchPatients() {
        viewModelScope.launch {
            if (_patientsState.value !is UiState.Success) {
                _patientsState.value = UiState.Loading
            }
            try {
                val res = repository.getPatients()
                val list = res.body()?.data
                if (res.isSuccessful && list != null) {
                    _patientsState.value = UiState.Success(list)
                }
            } catch (e: Exception) {
                if (_patientsState.value !is UiState.Success) {
                    _patientsState.value = UiState.Error(formatErrorMessage(e))
                }
            }
        }
    }

    fun fetchPatientDetails(id: String) {
        viewModelScope.launch {
            _selectedPatientState.value = UiState.Loading
            try {
                val res = repository.getPatientById(id)
                val p = res.body()?.data
                if (res.isSuccessful && p != null) {
                    _selectedPatientState.value = UiState.Success(p)
                } else {
                    _selectedPatientState.value = UiState.Error("Patient not found")
                }
            } catch (e: Exception) {
                _selectedPatientState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun addPatient(req: AddPatientRequest) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            repository.savePatientToFirestore(req)
            try {
                val res = repository.addPatient(req)
                if (res.isSuccessful && res.body()?.success == true) {
                    _actionState.value = UiState.Success("Patient added successfully")
                    fetchPatients()
                } else {
                    _actionState.value = UiState.Success("Patient added to Firestore")
                }
            } catch (e: Exception) {
                _actionState.value = UiState.Success("Patient added to Firestore")
            }
        }
    }

    fun updatePatient(id: String, req: UpdatePatientRequest) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                val res = repository.updatePatient(id, req)
                if (res.isSuccessful && res.body()?.success == true) {
                    _actionState.value = UiState.Success("Patient record updated")
                    fetchPatients()
                    fetchPatientDetails(id)
                } else {
                    _actionState.value = UiState.Error("Failed to update patient")
                }
            } catch (e: Exception) {
                _actionState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun deletePatient(id: String) {
        viewModelScope.launch {
            _actionState.value = UiState.Loading
            try {
                val res = repository.deletePatient(id)
                if (res.isSuccessful) {
                    _actionState.value = UiState.Success("Patient record deleted")
                    fetchPatients()
                } else {
                    _actionState.value = UiState.Error("Failed to delete patient")
                }
            } catch (e: Exception) {
                _actionState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun fetchDashboardStats() {
        viewModelScope.launch {
            _statsState.value = UiState.Loading
            try {
                val res = repository.getDashboardStats()
                val stats = res.body()?.data
                if (res.isSuccessful && stats != null) {
                    _statsState.value = UiState.Success(stats)
                } else {
                    _statsState.value = UiState.Error("Failed to load dashboard metrics")
                }
            } catch (e: Exception) {
                _statsState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }
}

class AIViewModel : ViewModel() {
    private val repository = AIRepository()

    private val _xrayUploadState = MutableStateFlow<UiState<XRayUploadData>>(UiState.Idle)
    val xrayUploadState: StateFlow<UiState<XRayUploadData>> = _xrayUploadState

    private val _landmarksState = MutableStateFlow<UiState<List<Landmark>>>(UiState.Idle)
    val landmarksState: StateFlow<UiState<List<Landmark>>> = _landmarksState

    private val _predictionState = MutableStateFlow<UiState<PredictResponse>>(UiState.Idle)
    val predictionState: StateFlow<UiState<PredictResponse>> = _predictionState

    private val _chatState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val chatState: StateFlow<UiState<String>> = _chatState

    private val _realtimeChatState = MutableStateFlow<List<Pair<String, String>>>(emptyList())
    val realtimeChatState: StateFlow<List<Pair<String, String>>> = _realtimeChatState

    init {
        viewModelScope.launch {
            repository.getChatRealtimeFlow()
                .catch { /* Fallback */ }
                .collect { list ->
                    _realtimeChatState.value = list
                }
        }
    }

    fun uploadXray(file: File, patientId: String) {
        viewModelScope.launch {
            _xrayUploadState.value = UiState.Loading
            try {
                val res = repository.uploadXray(file, patientId)
                val data = res.body()?.data
                if (res.isSuccessful && data != null) {
                    _xrayUploadState.value = UiState.Success(data)
                } else {
                    _xrayUploadState.value = UiState.Error(res.body()?.message ?: "X-Ray upload failed")
                }
            } catch (e: Exception) {
                _xrayUploadState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun detectLandmarks(xrayId: String?, imageBase64: String?) {
        viewModelScope.launch {
            _landmarksState.value = UiState.Loading
            try {
                val res = repository.detectLandmarks(xrayId, imageBase64)
                val list = res.body()?.data
                if (res.isSuccessful && list != null) {
                    _landmarksState.value = UiState.Success(list)
                } else {
                    _landmarksState.value = UiState.Error("Landmark detection failed")
                }
            } catch (e: Exception) {
                _landmarksState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun runPrediction(patientId: String, age: Int, gender: String, cvmStage: String? = "CVM 3", landmarks: List<Landmark>? = null) {
        viewModelScope.launch {
            _predictionState.value = UiState.Loading
            try {
                val res = repository.predictOutcome(PredictRequest(patientId = patientId, age = age, gender = gender, cvmStage = cvmStage, landmarks = landmarks))
                val data = res.body()?.data
                if (res.isSuccessful && data != null) {
                    _predictionState.value = UiState.Success(data)
                } else {
                    _predictionState.value = UiState.Error("AI Calculation Failed")
                }
            } catch (e: Exception) {
                _predictionState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun sendChatMessage(msg: String) {
        viewModelScope.launch {
            _chatState.value = UiState.Loading
            try {
                val res = repository.askAIChat(msg)
                val reply = res.body()?.data?.reply
                if (res.isSuccessful && reply != null) {
                    _chatState.value = UiState.Success(reply)
                } else {
                    _chatState.value = UiState.Error("AI Assistant currently unavailable")
                }
            } catch (e: Exception) {
                _chatState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }
}

class ReportViewModel : ViewModel() {
    private val repository = ReportRepository()

    private val _reportState = MutableStateFlow<UiState<ReportData>>(UiState.Idle)
    val reportState: StateFlow<UiState<ReportData>> = _reportState

    private val _reportsListState = MutableStateFlow<List<ReportData>>(emptyList())
    val reportsListState: StateFlow<List<ReportData>> = _reportsListState

    init {
        viewModelScope.launch {
            repository.getReportsRealtimeFlow()
                .catch { /* Fallback */ }
                .collect { list ->
                    _reportsListState.value = list
                }
        }
    }

    fun generateReport(patientId: String, predictionId: String?) {
        viewModelScope.launch {
            _reportState.value = UiState.Loading
            try {
                val res = repository.generateReport(patientId, predictionId)
                val data = res.body()?.data
                if (res.isSuccessful && data != null) {
                    _reportState.value = UiState.Success(data)
                } else {
                    _reportState.value = UiState.Error("Report generation failed")
                }
            } catch (e: Exception) {
                _reportState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }
}

class UserViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _profileState = MutableStateFlow<UiState<User>>(UiState.Idle)
    val profileState: StateFlow<UiState<User>> = _profileState

    private val _notificationsState = MutableStateFlow<UiState<List<UserNotification>>>(UiState.Idle)
    val notificationsState: StateFlow<UiState<List<UserNotification>>> = _notificationsState

    fun listenToUserProfile(email: String) {
        viewModelScope.launch {
            repository.getUserProfileRealtimeFlow(email)
                .catch { /* Fallback */ }
                .collect { u ->
                    if (u != null) {
                        _profileState.value = UiState.Success(u)
                    }
                }
        }
    }

    fun fetchProfile() {
        viewModelScope.launch {
            if (_profileState.value !is UiState.Success) {
                _profileState.value = UiState.Loading
            }
            try {
                val res = repository.getUserProfile()
                val user = res.body()?.data
                if (res.isSuccessful && user != null) {
                    _profileState.value = UiState.Success(user)
                }
            } catch (e: Exception) {
                if (_profileState.value !is UiState.Success) {
                    _profileState.value = UiState.Error("Failed to fetch profile")
                }
            }
        }
    }

    fun updateProfile(fullName: String?, hospitalName: String?, mobileNumber: String?) {
        viewModelScope.launch {
            _profileState.value = UiState.Loading
            try {
                val res = repository.updateUserProfile(UserProfileUpdateRequest(fullName, hospitalName, mobileNumber))
                val user = res.body()?.data
                if (res.isSuccessful && user != null) {
                    _profileState.value = UiState.Success(user)
                } else {
                    _profileState.value = UiState.Error("Profile update failed")
                }
            } catch (e: Exception) {
                _profileState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }

    fun fetchNotifications() {
        viewModelScope.launch {
            _notificationsState.value = UiState.Loading
            try {
                val res = repository.getNotifications()
                val list = res.body()?.data
                if (res.isSuccessful && list != null) {
                    _notificationsState.value = UiState.Success(list)
                } else {
                    _notificationsState.value = UiState.Error("Failed to fetch notifications")
                }
            } catch (e: Exception) {
                _notificationsState.value = UiState.Error(formatErrorMessage(e))
            }
        }
    }
}
