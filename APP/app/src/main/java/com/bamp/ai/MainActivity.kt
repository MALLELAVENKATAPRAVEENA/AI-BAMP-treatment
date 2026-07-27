package com.bamp.ai

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
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
}
