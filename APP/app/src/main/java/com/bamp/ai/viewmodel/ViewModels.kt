package com.bamp.ai.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.bamp.ai.data.model.*
import com.bamp.ai.data.remote.RetrofitClient
import com.bamp.ai.data.repository.AIRepository
import com.bamp.ai.data.repository.AuthRepository
import com.bamp.ai.data.repository.PatientRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

sealed class UiState<out T> {
    object Idle : UiState<Nothing>()
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

class AuthViewModel : ViewModel() {
    private val repository = AuthRepository()

    private val _loginState = MutableStateFlow<UiState<AuthResponseData>>(UiState.Idle)
    val loginState: StateFlow<UiState<AuthResponseData>> = _loginState

    private val _otpState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val otpState: StateFlow<UiState<String>> = _otpState

    var currentUser: User? = null
        private set

    fun login(email: String, pass: String) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            try {
                val res = repository.login(LoginRequest(email, pass))
                if (res.isSuccessful && res.body()?.success == true) {
                    val data = res.body()?.data
                    RetrofitClient.setAuthToken(data?.token)
                    currentUser = data?.user
                    _loginState.value = UiState.Success(data!!)
                } else {
                    _loginState.value = UiState.Error(res.body()?.message ?: "Login Failed")
                }
            } catch (e: Exception) {
                _loginState.value = UiState.Error(e.message ?: "Network Connection Error")
            }
        }
    }

    fun register(req: RegisterRequest) {
        viewModelScope.launch {
            _loginState.value = UiState.Loading
            try {
                val res = repository.register(req)
                if (res.isSuccessful && res.body()?.success == true) {
                    val data = res.body()?.data
                    RetrofitClient.setAuthToken(data?.token)
                    currentUser = data?.user
                    _loginState.value = UiState.Success(data!!)
                } else {
                    _loginState.value = UiState.Error(res.body()?.message ?: "Registration Failed")
                }
            } catch (e: Exception) {
                _loginState.value = UiState.Error(e.message ?: "Network Connection Error")
            }
        }
    }

    fun requestOtp(email: String) {
        viewModelScope.launch {
            _otpState.value = UiState.Loading
            try {
                val res = repository.forgotPassword(email)
                if (res.isSuccessful) {
                    _otpState.value = UiState.Success("Verification code sent to $email")
                } else {
                    _otpState.value = UiState.Error("Failed to send verification code")
                }
            } catch (e: Exception) {
                _otpState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }

    fun verifyOtpAndReset(email: String, otp: String, pass: String) {
        viewModelScope.launch {
            _otpState.value = UiState.Loading
            try {
                val res = repository.resetPassword(ResetPasswordRequest(email, otp, pass))
                if (res.isSuccessful) {
                    _otpState.value = UiState.Success("Password updated successfully. Please sign in.")
                } else {
                    _otpState.value = UiState.Error(res.body()?.message ?: "Password Reset Failed")
                }
            } catch (e: Exception) {
                _otpState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }
}

class PatientViewModel : ViewModel() {
    private val repository = PatientRepository()

    private val _patientsState = MutableStateFlow<UiState<List<Patient>>>(UiState.Idle)
    val patientsState: StateFlow<UiState<List<Patient>>> = _patientsState

    private val _statsState = MutableStateFlow<UiState<DashboardStats>>(UiState.Idle)
    val statsState: StateFlow<UiState<DashboardStats>> = _statsState

    fun fetchPatients() {
        viewModelScope.launch {
            _patientsState.value = UiState.Loading
            try {
                val res = repository.getPatients()
                if (res.isSuccessful && res.body()?.data != null) {
                    _patientsState.value = UiState.Success(res.body()!!.data!)
                } else {
                    _patientsState.value = UiState.Error("Failed to load patient records")
                }
            } catch (e: Exception) {
                _patientsState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }

    fun fetchDashboardStats() {
        viewModelScope.launch {
            _statsState.value = UiState.Loading
            try {
                val res = repository.getDashboardStats()
                if (res.isSuccessful && res.body()?.data != null) {
                    _statsState.value = UiState.Success(res.body()!!.data!)
                } else {
                    _statsState.value = UiState.Error("Failed to load dashboard metrics")
                }
            } catch (e: Exception) {
                _statsState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }
}

class AIViewModel : ViewModel() {
    private val repository = AIRepository()

    private val _predictionState = MutableStateFlow<UiState<PredictResponse>>(UiState.Idle)
    val predictionState: StateFlow<UiState<PredictResponse>> = _predictionState

    private val _chatState = MutableStateFlow<UiState<String>>(UiState.Idle)
    val chatState: StateFlow<UiState<String>> = _chatState

    fun runPrediction(patientId: String, age: Int, gender: String, landmarks: List<Landmark>?) {
        viewModelScope.launch {
            _predictionState.value = UiState.Loading
            try {
                val res = repository.predictOutcome(PredictRequest(patientId, age, gender, landmarks))
                if (res.isSuccessful && res.body()?.data != null) {
                    _predictionState.value = UiState.Success(res.body()!!.data!)
                } else {
                    _predictionState.value = UiState.Error("AI Calculation Failed")
                }
            } catch (e: Exception) {
                _predictionState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }

    fun sendChatMessage(msg: String) {
        viewModelScope.launch {
            _chatState.value = UiState.Loading
            try {
                val res = repository.askAIChat(msg)
                if (res.isSuccessful && res.body()?.data != null) {
                    _chatState.value = UiState.Success(res.body()!!.data!.reply)
                } else {
                    _chatState.value = UiState.Error("AI Assistant currently unavailable")
                }
            } catch (e: Exception) {
                _chatState.value = UiState.Error(e.message ?: "Network Error")
            }
        }
    }
}
