package com.bamp.ai

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.navigation.compose.rememberNavController
import com.bamp.ai.ui.navigation.BampNavGraph
import com.bamp.ai.ui.theme.AIBAMPTheme
import com.bamp.ai.viewmodel.*

class MainActivity : ComponentActivity() {

    private val authViewModel: AuthViewModel by viewModels()
    private val patientViewModel: PatientViewModel by viewModels()
    private val aiViewModel: AIViewModel by viewModels()
    private val reportViewModel: ReportViewModel by viewModels()
    private val userViewModel: UserViewModel by viewModels()

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Permission handled
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        askNotificationPermission()
        setContent {
            AIBAMPTheme {
                val navController = rememberNavController()
                BampNavGraph(
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

    private fun askNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) !=
                PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
