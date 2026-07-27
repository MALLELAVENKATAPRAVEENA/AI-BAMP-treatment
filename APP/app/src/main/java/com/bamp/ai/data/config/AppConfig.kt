package com.bamp.ai.data.config

import android.os.Build

object AppConfig {
    const val EMULATOR_BASE_URL = "http://10.0.2.2:5000/api/"
    // PC Wi-Fi IP address for physical phone connectivity
    const val PHYSICAL_DEVICE_LOCAL_URL = "http://172.23.52.139:5000/api/"
    const val PRODUCTION_BASE_URL = "https://bamp-1de96.web.app/api/"

    // Auto-detected base URL
    var BASE_URL: String = determineBaseUrl()

    private fun determineBaseUrl(): String {
        val isEmulator = (Build.FINGERPRINT.startsWith("generic")
                || Build.FINGERPRINT.startsWith("unknown")
                || Build.MODEL.contains("google_sdk")
                || Build.MODEL.contains("Emulator")
                || Build.MODEL.contains("Android SDK built for x86")
                || Build.MANUFACTURER.contains("Genymotion")
                || (Build.BRAND.startsWith("generic") && Build.DEVICE.startsWith("generic"))
                || "google_sdk" == Build.PRODUCT)

        return if (isEmulator) {
            EMULATOR_BASE_URL
        } else {
            // Physical Phone on same Wi-Fi network uses PC LAN IP
            PHYSICAL_DEVICE_LOCAL_URL
        }
    }

    fun setCustomBaseUrl(url: String) {
        BASE_URL = if (url.endsWith("/")) url else "$url/"
    }

    const val FIREBASE_PROJECT_ID = "bamp-1de96"
    const val USER_ROLE_ORTHODONTIST = "Orthodontist"
    const val MIN_PATIENT_AGE = 8
    const val MAX_PATIENT_AGE = 25
    const val OTP_EXPIRY_SECONDS = 600
    const val RESEND_COOLDOWN_SECONDS = 60
}
