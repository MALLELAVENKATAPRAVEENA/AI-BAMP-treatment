package com.bamp.ai.data.config

object AppConfig {
    // Base URL pointing to the SINGLE existing backend
    // 10.0.2.2 is Android Emulator localhost for Port 5000
    // Live Deployed Backend URL: https://bamp-1de96.web.app/api/
    var BASE_URL: String = "http://10.0.2.2:5000/api/"
    
    const val FIREBASE_PROJECT_ID = "bamp-1de96"
    const val USER_ROLE_ORTHODONTIST = "Orthodontist"
    const val MIN_PATIENT_AGE = 8
    const val MAX_PATIENT_AGE = 25
    const val OTP_EXPIRY_SECONDS = 600 // 10 Minutes
    const val RESEND_COOLDOWN_SECONDS = 60 // 60 Seconds
}
