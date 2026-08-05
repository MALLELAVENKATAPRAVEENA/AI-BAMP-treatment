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
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.CephalometricAnalysisResult
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampBorder
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import com.bamp.ai.ui.theme.BampWarning
import kotlinx.coroutines.launch

@Composable
fun CephalometricAnalysisScreen(
    patientId: String,
    onNavigatePrediction: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    val analysis = remember { CephalometricAnalysisResult() }
    val firestoreRepository = remember { FirestoreRepository() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Cephalometric Analysis",
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
            Card(
                colors = CardDefaults.cardColors(containerColor = BampCardBg),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Steiner & Wits Cephalometric Summary",
                        color = BampSecondary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Skeletal Class III malocclusion diagnostics calculated from AI landmarks.",
                        color = BampTextSecondary,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    MeasurementRow("SNA Angle", "${analysis.snaAngle}°", "82.0° ± 2°", analysis.snaInterpretation, BampSuccess)
                    HorizontalDivider(color = BampBorder, modifier = Modifier.padding(vertical = 8.dp))

                    MeasurementRow("SNB Angle", "${analysis.snbAngle}°", "80.0° ± 2°", analysis.snbInterpretation, BampWarning)
                    HorizontalDivider(color = BampBorder, modifier = Modifier.padding(vertical = 8.dp))

                    MeasurementRow("ANB Difference", "${analysis.anbAngle}°", "2.0° ± 2°", analysis.anbInterpretation, Color.Red)
                    HorizontalDivider(color = BampBorder, modifier = Modifier.padding(vertical = 8.dp))

                    MeasurementRow("Wits Appraisal", "${analysis.witsAppraisalMm} mm", "0.0 mm ± 1 mm", analysis.witsInterpretation, Color.Red)
                    HorizontalDivider(color = BampBorder, modifier = Modifier.padding(vertical = 8.dp))

                    MeasurementRow("FMA Plane Angle", "${analysis.fmaAngle}°", "25.0° ± 3°", analysis.fmaInterpretation, BampSuccess)
                    HorizontalDivider(color = BampBorder, modifier = Modifier.padding(vertical = 8.dp))

                    MeasurementRow("IMPA Angle", "${analysis.impaAngle}°", "90.0° ± 3°", analysis.impaInterpretation, BampWarning)
                }
            }

            Button(
                onClick = {
                    scope.launch {
                        try {
                            firestoreRepository.saveCephalometricAnalysis(
                                patientId = patientId,
                                analysisData = mapOf(
                                    "snaAngle" to analysis.snaAngle,
                                    "snbAngle" to analysis.snbAngle,
                                    "anbAngle" to analysis.anbAngle,
                                    "witsAppraisalMm" to analysis.witsAppraisalMm,
                                    "fmaAngle" to analysis.fmaAngle,
                                    "impaAngle" to analysis.impaAngle
                                )
                            )
                            Toast.makeText(context, "Saved Analysis to cephalometricAnalysis collection!", Toast.LENGTH_SHORT).show()
                            onNavigatePrediction(patientId)
                        } catch (e: Exception) {
                            onNavigatePrediction(patientId)
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text("Generate AI Treatment Prediction", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun MeasurementRow(
    parameter: String,
    patientVal: String,
    normVal: String,
    diagnosis: String,
    statusColor: Color
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(parameter, color = BampTextPrimary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Text(patientVal, color = statusColor, fontWeight = FontWeight.Bold, fontSize = 15.sp)
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Norm: $normVal", color = BampTextSecondary, fontSize = 12.sp)
            Text(diagnosis, color = statusColor, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}
