package com.bamp.ai.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.bamp.ai.ui.screens.*
import com.bamp.ai.viewmodel.AIViewModel
import com.bamp.ai.viewmodel.AuthViewModel
import com.bamp.ai.viewmodel.PatientViewModel

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Signup : Screen("signup")
    object ForgotPassword : Screen("forgot_password")
    object Dashboard : Screen("dashboard")
    object Directory : Screen("directory")
    object UploadXRay : Screen("upload_xray")
    object PredictionResult : Screen("prediction_result")
    object AIChat : Screen("ai_chat")
    object Profile : Screen("profile")
}

@Composable
fun BampNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    patientViewModel: PatientViewModel,
    aiViewModel: AIViewModel
) {
    NavHost(navController = navController, startDestination = Screen.Login.route) {
        composable(Screen.Login.route) {
            LoginScreen(
                authViewModel = authViewModel,
                onNavigateToSignup = { navController.navigate(Screen.Signup.route) },
                onNavigateToForgotPassword = { navController.navigate(Screen.ForgotPassword.route) },
                onLoginSuccess = { navController.navigate(Screen.Dashboard.route) { popUpTo(Screen.Login.route) { inclusive = true } } }
            )
        }

        composable(Screen.Signup.route) {
            SignupScreen(
                authViewModel = authViewModel,
                onNavigateToLogin = { navController.popBackStack() },
                onSignupSuccess = { navController.navigate(Screen.Dashboard.route) { popUpTo(Screen.Login.route) { inclusive = true } } }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                patientViewModel = patientViewModel,
                onNavigateToDirectory = { navController.navigate(Screen.Directory.route) },
                onNavigateToXRayUpload = { navController.navigate(Screen.UploadXRay.route) },
                onNavigateToAIChat = { navController.navigate(Screen.AIChat.route) }
            )
        }

        composable(Screen.Directory.route) {
            PatientDirectoryScreen(
                patientViewModel = patientViewModel,
                onPatientSelected = { _ -> navController.navigate(Screen.PredictionResult.route) }
            )
        }

        composable(Screen.UploadXRay.route) {
            XRayUploadScreen(
                aiViewModel = aiViewModel,
                onNavigateToLandmarks = { navController.navigate(Screen.PredictionResult.route) }
            )
        }

        composable(Screen.PredictionResult.route) {
            PredictionResultScreen(aiViewModel = aiViewModel)
        }

        composable(Screen.AIChat.route) {
            AIChatScreen()
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                authViewModel = authViewModel,
                onLogout = { navController.navigate(Screen.Login.route) { popUpTo(0) } }
            )
        }
    }
}
