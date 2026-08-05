package com.bamp.ai.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Login : Screen("login", "Login")
    object Signup : Screen("signup", "Sign Up")
    object ForgotPassword : Screen("forgot_password", "Forgot Password")
    object VerifyOtp : Screen("verify_otp", "Verify OTP")
    
    object Dashboard : Screen("dashboard", "Dashboard")
    object PatientList : Screen("patient_list", "Patient Directory")
    object AddPatient : Screen("add_patient", "Register Patient")
    object PatientDetail : Screen("patient_detail/{patientId}", "Patient Details") {
        fun createRoute(patientId: String) = "patient_detail/$patientId"
    }

    object XRayUpload : Screen("xray_upload/{patientId}", "Upload X-Ray") {
        fun createRoute(patientId: String) = "xray_upload/$patientId"
    }

    object LandmarkDetection : Screen("landmark_detection/{patientId}", "Landmark Detection") {
        fun createRoute(patientId: String) = "landmark_detection/$patientId"
    }

    object CephalometricAnalysis : Screen("cephalometric_analysis/{patientId}", "Cephalometric Analysis") {
        fun createRoute(patientId: String) = "cephalometric_analysis/$patientId"
    }

    object PredictionResults : Screen("prediction_results/{patientId}", "AI Outcome Prediction") {
        fun createRoute(patientId: String) = "prediction_results/$patientId"
    }

    object Reports : Screen("reports", "Clinical Reports")
    object ReportViewer : Screen("report_viewer/{reportId}", "Report Viewer") {
        fun createRoute(reportId: String) = "report_viewer/$reportId"
    }

    object Notifications : Screen("notifications", "Notifications")
    object Profile : Screen("profile", "Doctor Profile")
    object Settings : Screen("settings", "App Settings")
    object AIChat : Screen("ai_chat", "BAMP AI Assistant")
}
