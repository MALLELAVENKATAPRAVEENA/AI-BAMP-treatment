package com.bamp.ai.ui.navigation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.bamp.ai.ui.screens.*
import com.bamp.ai.ui.theme.*
import com.bamp.ai.viewmodel.*
import kotlinx.coroutines.launch

sealed class Screen(val route: String, val title: String = "") {
    object Login : Screen("login")
    object Signup : Screen("signup")
    object ForgotPassword : Screen("forgot_password")
    object OTP : Screen("otp/{email}") {
        fun createRoute(email: String) = "otp/$email"
    }
    object ResetPassword : Screen("reset_password/{email}/{otp}") {
        fun createRoute(email: String, otp: String) = "reset_password/$email/$otp"
    }
    object Dashboard : Screen("dashboard", "Orthodontist Dashboard")
    object Directory : Screen("directory", "Patient Directory")
    object RegisterPatient : Screen("register_patient", "Register New Patient")
    object PatientDetail : Screen("patient_detail/{patientId}") {
        fun createRoute(patientId: String) = "patient_detail/$patientId"
    }
    object UploadXRay : Screen("upload_xray?patientId={patientId}", "Upload X-Ray Radiograph") {
        fun createRoute(patientId: String? = null) = if (patientId != null) "upload_xray?patientId=$patientId" else "upload_xray"
    }
    object LandmarkDetection : Screen("landmark_detection?patientId={patientId}", "Landmark Detection Overlay") {
        fun createRoute(patientId: String? = null) = if (patientId != null) "landmark_detection?patientId=$patientId" else "landmark_detection"
    }
    object CephalometricMeasurements : Screen("cephalometric_measurements", "Cephalometric Measurements")
    object PredictionResult : Screen("prediction_result", "AI Outcome Predictor")
    object AIChat : Screen("ai_chat", "AI Assistant Chatbot")
    object Reports : Screen("reports?patientId={patientId}", "Generated PDF Reports") {
        fun createRoute(patientId: String? = null) = if (patientId != null) "reports?patientId=$patientId" else "reports"
    }
    object Profile : Screen("profile", "Practitioner Profile Settings")
    object Settings : Screen("settings", "Settings")
    object Notifications : Screen("notifications", "Notifications")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BampNavGraph(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    patientViewModel: PatientViewModel,
    aiViewModel: AIViewModel,
    reportViewModel: ReportViewModel,
    userViewModel: UserViewModel
) {
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val isAuthScreen = currentRoute in listOf(
        Screen.Login.route,
        Screen.Signup.route,
        Screen.ForgotPassword.route,
        Screen.OTP.route,
        Screen.ResetPassword.route
    )

    val currentUser = authViewModel.currentUser

    if (isAuthScreen) {
        NavHostContent(
            navController = navController,
            authViewModel = authViewModel,
            patientViewModel = patientViewModel,
            aiViewModel = aiViewModel,
            reportViewModel = reportViewModel,
            userViewModel = userViewModel
        )
    } else {
        ModalNavigationDrawer(
            drawerState = drawerState,
            gesturesEnabled = true,
            drawerContent = {
                ModalDrawerSheet(
                    drawerContainerColor = CardBackground,
                    drawerContentColor = TextPrimary,
                    modifier = Modifier.width(300.dp)
                ) {
                    DrawerHeader(user = currentUser)
                    HorizontalDivider(color = CardBorderColor)
                    
                    Column(modifier = Modifier.padding(12.dp)) {
                        // Section 1: CLINICAL DASHBOARD
                        DrawerSectionHeader("CLINICAL DASHBOARD")
                        DrawerItem(
                            title = "Orthodontist Dashboard",
                            icon = Icons.Default.Dashboard,
                            isSelected = currentRoute == Screen.Dashboard.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.Dashboard.route) {
                                    popUpTo(Screen.Dashboard.route) { inclusive = true }
                                }
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Section 2: PATIENT CLINIC
                        DrawerSectionHeader("PATIENT CLINIC")
                        DrawerItem(
                            title = "Patient Directory",
                            icon = Icons.Default.People,
                            isSelected = currentRoute == Screen.Directory.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.Directory.route)
                            }
                        )
                        DrawerItem(
                            title = "Register New Patient",
                            icon = Icons.Default.PersonAdd,
                            isSelected = currentRoute == Screen.RegisterPatient.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.RegisterPatient.route)
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Section 3: AI CLINICAL WORKFLOW
                        DrawerSectionHeader("AI CLINICAL WORKFLOW")
                        DrawerItem(
                            title = "Upload X-Ray Radiograph",
                            icon = Icons.Default.CloudUpload,
                            isSelected = currentRoute?.startsWith("upload_xray") == true,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.UploadXRay.createRoute())
                            }
                        )
                        DrawerItem(
                            title = "Landmark Detection Overlay",
                            icon = Icons.Default.Visibility,
                            isSelected = currentRoute?.startsWith("landmark_detection") == true,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.LandmarkDetection.createRoute())
                            }
                        )
                        DrawerItem(
                            title = "Cephalometric Measurements",
                            icon = Icons.Default.Straighten,
                            isSelected = currentRoute == Screen.CephalometricMeasurements.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.CephalometricMeasurements.route)
                            }
                        )
                        DrawerItem(
                            title = "AI Outcome Predictor",
                            icon = Icons.Default.Psychology,
                            isSelected = currentRoute == Screen.PredictionResult.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.PredictionResult.route)
                            }
                        )
                        DrawerItem(
                            title = "AI Assistant Chatbot",
                            icon = Icons.AutoMirrored.Filled.Chat,
                            isSelected = currentRoute == Screen.AIChat.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.AIChat.route)
                            }
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        // Section 4: PDF REPORTS & SETTINGS
                        DrawerSectionHeader("PDF REPORTS & SETTINGS")
                        DrawerItem(
                            title = "Generated PDF Reports",
                            icon = Icons.Default.PictureAsPdf,
                            isSelected = currentRoute?.startsWith("reports") == true,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.Reports.createRoute())
                            }
                        )
                        DrawerItem(
                            title = "Practitioner Profile Settings",
                            icon = Icons.Default.Person,
                            isSelected = currentRoute == Screen.Profile.route,
                            onClick = {
                                scope.launch { drawerState.close() }
                                navController.navigate(Screen.Profile.route)
                            }
                        )
                    }
                }
            }
        ) {
            Scaffold(
                containerColor = BackgroundDark,
                topBar = {
                    TopAppBar(
                        title = {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    shape = RoundedCornerShape(8.dp),
                                    color = PrimarySapphire,
                                    modifier = Modifier.size(34.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Icon(
                                            imageVector = Icons.Default.LocalHospital,
                                            contentDescription = "Logo",
                                            tint = Color.White,
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text(
                                        text = "AI BAMP Predictor",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = "Class III Clinical Portal",
                                        fontSize = 11.sp,
                                        color = TextSecondary
                                    )
                                }
                            }
                        },
                        navigationIcon = {
                            IconButton(onClick = { scope.launch { drawerState.open() } }) {
                                Icon(
                                    imageVector = Icons.Default.Menu,
                                    contentDescription = "Open Sidebar Drawer",
                                    tint = Color.White
                                )
                            }
                        },
                        actions = {
                            // User Role Badge
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = SecondaryTeal.copy(alpha = 0.2f)
                            ) {
                                Text(
                                    text = currentUser?.role ?: "Orthodontist",
                                    color = SecondaryTealLight,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(4.dp))
                            // Refresh Button
                            IconButton(onClick = { patientViewModel.fetchDashboardStats() }) {
                                Icon(Icons.Default.Refresh, contentDescription = "Refresh Data", tint = TextSecondary)
                            }
                            // Notification Icon
                            IconButton(onClick = { navController.navigate(Screen.Notifications.route) }) {
                                Icon(Icons.Default.Notifications, contentDescription = "Notifications", tint = TextSecondary)
                            }
                            // User Avatar
                            Surface(
                                shape = CircleShape,
                                color = PrimarySapphire,
                                modifier = Modifier
                                    .padding(end = 8.dp)
                                    .size(32.dp)
                                    .clickable { navController.navigate(Screen.Profile.route) }
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = (currentUser?.name ?: "Dr").take(1).uppercase(),
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(containerColor = CardBackground)
                    )
                },
                floatingActionButton = {
                    if (currentRoute != Screen.AIChat.route) {
                        FloatingActionButton(
                            onClick = { navController.navigate(Screen.AIChat.route) },
                            containerColor = PrimarySapphire,
                            shape = CircleShape
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.Chat,
                                contentDescription = "AI Assistant Chatbot",
                                tint = Color.White
                            )
                        }
                    }
                }
            ) { innerPadding ->
                Box(modifier = Modifier.padding(innerPadding)) {
                    NavHostContent(
                        navController = navController,
                        authViewModel = authViewModel,
                        patientViewModel = patientViewModel,
                        aiViewModel = aiViewModel,
                        reportViewModel = reportViewModel,
                        userViewModel = userViewModel
                    )
                }
            }
        }
    }
}

@Composable
fun DrawerHeader(user: com.bamp.ai.data.model.User?) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(CardBackground)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Surface(
                shape = CircleShape,
                color = PrimarySapphire,
                modifier = Modifier.size(48.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = (user?.name ?: "Dr").take(1).uppercase(),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp
                    )
                }
            }
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = user?.name ?: "Dr. Orthodontist Practitioner",
                    fontWeight = FontWeight.Bold,
                    fontSize = 15.sp,
                    color = Color.White
                )
                Text(
                    text = user?.email ?: "doctor@orthocenter.org",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }
    }
}

@Composable
fun DrawerSectionHeader(title: String) {
    Text(
        text = title,
        fontSize = 11.sp,
        fontWeight = FontWeight.Bold,
        color = TextMuted,
        modifier = Modifier.padding(start = 12.dp, top = 8.dp, bottom = 4.dp)
    )
}

@Composable
fun DrawerItem(
    title: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp),
        shape = RoundedCornerShape(10.dp),
        color = if (isSelected) PrimarySapphire.copy(alpha = 0.25f) else Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .clickable(onClick = onClick)
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = if (isSelected) PrimaryLightBlue else TextSecondary,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                color = if (isSelected) Color.White else TextPrimary
            )
        }
    }
}

@Composable
fun NavHostContent(
    navController: NavHostController,
    authViewModel: AuthViewModel,
    patientViewModel: PatientViewModel,
    aiViewModel: AIViewModel,
    reportViewModel: ReportViewModel,
    userViewModel: UserViewModel
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

        composable(Screen.ForgotPassword.route) {
            ForgotPasswordScreen(
                authViewModel = authViewModel,
                onNavigateToOtp = { email -> navController.navigate(Screen.OTP.createRoute(email)) },
                onNavigateToLogin = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.OTP.route,
            arguments = listOf(navArgument("email") { type = NavType.StringType })
        ) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            OtpVerificationScreen(
                email = email,
                authViewModel = authViewModel,
                onNavigateToResetPassword = { e, otp -> navController.navigate(Screen.ResetPassword.createRoute(e, otp)) },
                onNavigateToDashboard = { navController.navigate(Screen.Dashboard.route) { popUpTo(Screen.Login.route) { inclusive = true } } }
            )
        }

        composable(
            route = Screen.ResetPassword.route,
            arguments = listOf(
                navArgument("email") { type = NavType.StringType },
                navArgument("otp") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            val otp = backStackEntry.arguments?.getString("otp") ?: ""
            ResetPasswordScreen(
                email = email,
                otp = otp,
                authViewModel = authViewModel,
                onResetSuccess = { navController.navigate(Screen.Login.route) { popUpTo(0) } }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                patientViewModel = patientViewModel,
                onNavigateToDirectory = { navController.navigate(Screen.Directory.route) },
                onNavigateToXRayUpload = { navController.navigate(Screen.UploadXRay.createRoute()) },
                onNavigateToAIChat = { navController.navigate(Screen.AIChat.route) }
            )
        }

        composable(Screen.Directory.route) {
            PatientDirectoryScreen(
                patientViewModel = patientViewModel,
                onPatientSelected = { id -> navController.navigate(Screen.PatientDetail.createRoute(id)) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.RegisterPatient.route) {
            RegisterPatientScreen(
                patientViewModel = patientViewModel,
                onNavigateBack = { navController.popBackStack() },
                onSuccess = { navController.navigate(Screen.Directory.route) }
            )
        }

        composable(
            route = Screen.PatientDetail.route,
            arguments = listOf(navArgument("patientId") { type = NavType.StringType })
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getString("patientId") ?: ""
            PatientDetailScreen(
                patientId = patientId,
                patientViewModel = patientViewModel,
                onNavigateBack = { navController.popBackStack() },
                onRunPrediction = { _ -> navController.navigate(Screen.UploadXRay.createRoute(patientId)) }
            )
        }

        composable(
            route = Screen.UploadXRay.route,
            arguments = listOf(navArgument("patientId") { nullable = true; defaultValue = null })
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getString("patientId")
            XRayUploadScreen(
                aiViewModel = aiViewModel,
                patientId = patientId,
                onNavigateToLandmarks = { navController.navigate(Screen.LandmarkDetection.createRoute(patientId)) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.LandmarkDetection.route,
            arguments = listOf(navArgument("patientId") { nullable = true; defaultValue = null })
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getString("patientId")
            LandmarkDetectionScreen(
                aiViewModel = aiViewModel,
                patientId = patientId,
                onNavigateToPrediction = { navController.navigate(Screen.PredictionResult.route) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.CephalometricMeasurements.route) {
            CephalometricMeasurementsScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.PredictionResult.route) {
            PredictionResultScreen(
                aiViewModel = aiViewModel,
                onNavigateToReport = { predId -> navController.navigate(Screen.Reports.createRoute(predId)) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.Reports.route,
            arguments = listOf(navArgument("patientId") { nullable = true; defaultValue = null })
        ) { backStackEntry ->
            val patientId = backStackEntry.arguments?.getString("patientId")
            ReportsScreen(
                reportViewModel = reportViewModel,
                patientId = patientId,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.AIChat.route) {
            AIChatScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                authViewModel = authViewModel,
                userViewModel = userViewModel,
                onLogout = { navController.navigate(Screen.Login.route) { popUpTo(0) } },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(onNavigateBack = { navController.popBackStack() })
        }

        composable(Screen.Notifications.route) {
            NotificationsScreen(
                userViewModel = userViewModel,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
