package com.bamp.ai.ui.navigation

import androidx.compose.material3.DrawerValue
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.ui.components.AppDrawerContent
import com.bamp.ai.ui.screens.ai.AIChatScreen
import com.bamp.ai.ui.screens.ai.CephalometricAnalysisScreen
import com.bamp.ai.ui.screens.ai.LandmarkDetectionScreen
import com.bamp.ai.ui.screens.ai.PredictionResultsScreen
import com.bamp.ai.ui.screens.auth.ForgotPasswordScreen
import com.bamp.ai.ui.screens.auth.LoginScreen
import com.bamp.ai.ui.screens.auth.SignupScreen
import com.bamp.ai.ui.screens.auth.VerifyOtpScreen
import com.bamp.ai.ui.screens.dashboard.DashboardScreen
import com.bamp.ai.ui.screens.notifications.NotificationsScreen
import com.bamp.ai.ui.screens.patient.AddPatientScreen
import com.bamp.ai.ui.screens.patient.PatientDetailScreen
import com.bamp.ai.ui.screens.patient.PatientListScreen
import com.bamp.ai.ui.screens.profile.ProfileScreen
import com.bamp.ai.ui.screens.reports.ReportViewerScreen
import com.bamp.ai.ui.screens.reports.ReportsScreen
import com.bamp.ai.ui.screens.settings.SettingsScreen
import com.bamp.ai.ui.screens.xray.XRayUploadScreen
import kotlinx.coroutines.launch

@Composable
fun AppNavGraph(
    navController: NavHostController,
    startDestination: String = if (FirebaseClient.auth.currentUser != null) Screen.Dashboard.route else Screen.Login.route
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStackEntry = navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry.value?.destination?.route ?: ""

    val openDrawer = { scope.launch { drawerState.open() } }
    val closeDrawer = { scope.launch { drawerState.close() } }

    ModalNavigationDrawer(
        drawerState = drawerState,
        gesturesEnabled = currentRoute != Screen.Login.route && currentRoute != Screen.Signup.route,
        drawerContent = {
            AppDrawerContent(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    closeDrawer()
                    navController.navigate(route) {
                        launchSingleTop = true
                    }
                },
                onLogout = {
                    closeDrawer()
                    FirebaseClient.auth.signOut()
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    ) {
        NavHost(
            navController = navController,
            startDestination = startDestination
        ) {
            // Auth Routes
            composable(Screen.Login.route) {
                LoginScreen(
                    onLoginSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateSignup = { navController.navigate(Screen.Signup.route) },
                    onNavigateForgotPassword = { navController.navigate(Screen.ForgotPassword.route) }
                )
            }

            composable(Screen.Signup.route) {
                SignupScreen(
                    onSignupSuccess = {
                        navController.navigate(Screen.Dashboard.route) {
                            popUpTo(Screen.Signup.route) { inclusive = true }
                        }
                    },
                    onNavigateLogin = { navController.popBackStack() }
                )
            }

            composable(Screen.ForgotPassword.route) {
                ForgotPasswordScreen(
                    onNavigateVerifyOtp = { email ->
                        navController.navigate(Screen.VerifyOtp.route)
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            composable(Screen.VerifyOtp.route) {
                VerifyOtpScreen(
                    email = "",
                    onVerificationSuccess = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Login.route) { inclusive = true }
                        }
                    },
                    onNavigateBack = { navController.popBackStack() }
                )
            }

            // Main App Routes
            composable(Screen.Dashboard.route) {
                DashboardScreen(
                    onMenuClick = { openDrawer() },
                    onNavigatePatients = { navController.navigate(Screen.PatientList.route) },
                    onNavigateAddPatient = { navController.navigate(Screen.AddPatient.route) },
                    onNavigateReports = { navController.navigate(Screen.Reports.route) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.PatientList.route) {
                PatientListScreen(
                    onMenuClick = { openDrawer() },
                    onNavigateAddPatient = { navController.navigate(Screen.AddPatient.route) },
                    onSelectPatient = { id -> navController.navigate(Screen.PatientDetail.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.AddPatient.route) {
                AddPatientScreen(
                    onNavigateBack = { navController.popBackStack() },
                    onPatientAdded = { id ->
                        navController.navigate(Screen.PatientDetail.createRoute(id)) {
                            popUpTo(Screen.PatientList.route)
                        }
                    },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.PatientDetail.route,
                arguments = listOf(navArgument("patientId") { type = NavType.StringType })
            ) { backStack ->
                val patientId = backStack.arguments?.getString("patientId") ?: ""
                PatientDetailScreen(
                    patientId = patientId,
                    onNavigateUploadXRay = { id -> navController.navigate(Screen.XRayUpload.createRoute(id)) },
                    onNavigateLandmarks = { id -> navController.navigate(Screen.LandmarkDetection.createRoute(id)) },
                    onNavigateCephalometrics = { id -> navController.navigate(Screen.CephalometricAnalysis.createRoute(id)) },
                    onNavigatePrediction = { id -> navController.navigate(Screen.PredictionResults.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.XRayUpload.route,
                arguments = listOf(navArgument("patientId") { type = NavType.StringType })
            ) { backStack ->
                val patientId = backStack.arguments?.getString("patientId") ?: ""
                XRayUploadScreen(
                    patientId = patientId,
                    onUploadSuccess = { id -> navController.navigate(Screen.LandmarkDetection.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.LandmarkDetection.route,
                arguments = listOf(navArgument("patientId") { type = NavType.StringType })
            ) { backStack ->
                val patientId = backStack.arguments?.getString("patientId") ?: ""
                LandmarkDetectionScreen(
                    patientId = patientId,
                    onNavigateCephalometrics = { id -> navController.navigate(Screen.CephalometricAnalysis.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.CephalometricAnalysis.route,
                arguments = listOf(navArgument("patientId") { type = NavType.StringType })
            ) { backStack ->
                val patientId = backStack.arguments?.getString("patientId") ?: ""
                CephalometricAnalysisScreen(
                    patientId = patientId,
                    onNavigatePrediction = { id -> navController.navigate(Screen.PredictionResults.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.PredictionResults.route,
                arguments = listOf(navArgument("patientId") { type = NavType.StringType })
            ) { backStack ->
                val patientId = backStack.arguments?.getString("patientId") ?: ""
                PredictionResultsScreen(
                    patientId = patientId,
                    onNavigateReports = { navController.navigate(Screen.Reports.route) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.Reports.route) {
                ReportsScreen(
                    onMenuClick = { openDrawer() },
                    onSelectReport = { id -> navController.navigate(Screen.ReportViewer.createRoute(id)) },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(
                route = Screen.ReportViewer.route,
                arguments = listOf(navArgument("reportId") { type = NavType.StringType })
            ) { backStack ->
                val reportId = backStack.arguments?.getString("reportId") ?: ""
                ReportViewerScreen(
                    reportId = reportId,
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.Notifications.route) {
                NotificationsScreen(
                    onMenuClick = { openDrawer() },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    onMenuClick = { openDrawer() },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) }
                )
            }

            composable(Screen.Settings.route) {
                SettingsScreen(
                    onMenuClick = { openDrawer() },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }

            composable(Screen.AIChat.route) {
                AIChatScreen(
                    onMenuClick = { openDrawer() },
                    onNavigateNotifications = { navController.navigate(Screen.Notifications.route) },
                    onNavigateProfile = { navController.navigate(Screen.Profile.route) }
                )
            }
        }
    }
}
