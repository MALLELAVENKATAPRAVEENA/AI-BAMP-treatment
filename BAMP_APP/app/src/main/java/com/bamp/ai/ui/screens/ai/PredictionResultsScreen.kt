package com.bamp.ai.ui.screens.ai

import android.widget.Toast
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.Patient
import com.bamp.ai.data.model.Prediction
import com.bamp.ai.data.model.Report
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import com.bamp.ai.ui.theme.BampWarning
import kotlinx.coroutines.launch

@Composable
fun PredictionResultsScreen(
    patientId: String,
    onNavigateReports: () -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    val firestoreRepository = remember { FirestoreRepository() }
    var patient by remember { mutableStateOf<Patient?>(null) }
    var isSaving by remember { mutableStateOf(false) }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val successScore = 88.5
    val boneDensity = 0.74
    val relapseRisk = 11.5
    val riskCategory = "High Favorable Outcome (Low Relapse Risk)"
    val recommendation = "Proceed with 4 BAMP mini-plates and continuous intermaxillary force (150-250g/side) for 18 months."

    LaunchedEffect(patientId) {
        patient = firestoreRepository.getPatientById(patientId)
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "BAMP Outcome Prediction",
                onNotificationClick = onNavigateNotifications,
                onProfileClick = onNavigateProfile
            )
        },
        containerColor = BampBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Main Prediction Metric Card
            Card(
                colors = CardDefaults.cardColors(containerColor = BampCardBg),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Treatment Success Probability",
                        color = BampTextSecondary,
                        fontSize = 14.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "$successScore%",
                        color = BampSuccess,
                        fontSize = 42.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = riskCategory,
                        color = BampTextPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Prognostic Indicators
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = BampCardBg),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Bone Density Score", color = BampTextSecondary, fontSize = 12.sp)
                        Text("$boneDensity", color = BampSecondary, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Text("Optimal Anchor Base", color = BampSuccess, fontSize = 11.sp)
                    }
                }

                Card(
                    colors = CardDefaults.cardColors(containerColor = BampCardBg),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("Estimated Relapse Risk", color = BampTextSecondary, fontSize = 12.sp)
                        Text("$relapseRisk%", color = BampWarning, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                        Text("Low Long-term Risk", color = BampSuccess, fontSize = 11.sp)
                    }
                }
            }

            // Treatment Recommendation Card
            Card(
                colors = CardDefaults.cardColors(containerColor = BampCardBg),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Treatment Recommendation", color = BampSecondary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(recommendation, color = BampTextPrimary, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Predicted Skeletal & Soft Tissue Changes", color = BampTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("• Maxilla Advancement: +4.2 mm", color = BampTextSecondary, fontSize = 13.sp)
                    Text("• Mandible Retraction: -2.1 mm", color = BampTextSecondary, fontSize = 13.sp)
                    Text("• Soft Tissue Profile: Favorable Concavity Correction", color = BampSuccess, fontSize = 13.sp)
                }
            }

            // Save & Generate PDF Report Button
            Button(
                onClick = {
                    isSaving = true
                    scope.launch {
                        try {
                            val user = FirebaseClient.auth.currentUser
                            val newPred = Prediction(
                                patientId = patientId,
                                patientName = patient?.name ?: "Patient",
                                doctorUid = user?.uid ?: "",
                                successProbability = successScore,
                                boneDensityScore = boneDensity,
                                relapseRiskPercent = relapseRisk,
                                maxillaAdvancementMm = 4.2,
                                mandibleRetractionMm = 2.1,
                                treatmentDurationMonths = 18
                            )
                            firestoreRepository.savePrediction(newPred)

                            val reportNum = "REP-${System.currentTimeMillis().toString().takeLast(6)}"
                            val newReport = Report(
                                reportNumber = reportNum,
                                patientId = patientId,
                                patientName = patient?.name ?: "Patient",
                                doctorUid = user?.uid ?: "",
                                summary = "BAMP Success Probability: $successScore%. $riskCategory."
                            )
                            firestoreRepository.saveReport(newReport)

                            isSaving = false
                            Toast.makeText(context, "Prediction & PDF Report Saved to Firestore predictions collection!", Toast.LENGTH_SHORT).show()
                            onNavigateReports()
                        } catch (e: Exception) {
                            isSaving = false
                            Toast.makeText(context, "Error saving: ${e.message}", Toast.LENGTH_SHORT).show()
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                shape = RoundedCornerShape(8.dp),
                enabled = !isSaving,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                if (isSaving) {
                    CircularProgressIndicator(color = BampTextPrimary, modifier = Modifier.height(24.dp))
                } else {
                    Text("Save & Generate Clinical PDF Report", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
