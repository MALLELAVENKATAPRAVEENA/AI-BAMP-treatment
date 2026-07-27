package com.bamp.ai.data.config

object AppConfig {
    // Production Cloud Endpoint
    const val PRODUCTION_BASE_URL = "https://bamp-1de96.web.app/api/"

    // Default to Production URL for all devices (Physical phones & Emulators)
    var BASE_URL: String = PRODUCTION_BASE_URL

    fun setCustomBaseUrl(url: String) {
        BASE_URL = if (url.endsWith("/")) url else "$url/"
    }

    const val FIREBASE_PROJECT_ID = "bamp-1de96"
    const val USER_ROLE_ORTHODONTIST = "Orthodontist"
    const val MIN_PATIENT_AGE = 8
    const val MAX_PATIENT_AGE = 25
    const val OTP_EXPIRY_SECONDS = 60
    const val RESEND_COOLDOWN_SECONDS = 60
}
