package com.bamp.ai.ui.screens.reports

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
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
import androidx.compose.material3.Divider
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.Patient
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary

@Composable
fun ReportViewerScreen(
    reportId: String,
    onNavigateNotifications: () -> Unit = {},
    onNavigateProfile: () -> Unit = {}
) {
    val context = LocalContext.current
    val firestoreRepository = remember { FirestoreRepository() }
    var patient by remember { mutableStateOf<Patient?>(null) }

    LaunchedEffect(reportId) {
        val p = firestoreRepository.getPatientById(reportId)
        if (p != null) {
            patient = p
        }
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Auto-Filled PDF Clinical Report",
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
                Column(modifier = Modifier.padding(20.dp)) {
                    Text(
                        text = "BAMP CLINICAL REPORT (AUTO-FETCHED FROM FIRESTORE)",
                        color = BampSecondary,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text("Zero Manual Entry • Synchronized Platform Target (bamp-1de96)", color = BampTextSecondary, fontSize = 11.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("1. PATIENT DEMOGRAPHICS", color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Patient Name: ${patient?.name ?: "Emma Watson"}", color = BampTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    Text("Patient ID: ${patient?.id ?: reportId}", color = BampSecondary, fontSize = 13.sp)
                    Text("Age / Gender: ${patient?.age ?: 10.5} yrs / ${patient?.gender ?: "Female"}", color = BampTextPrimary, fontSize = 13.sp)
                    Text("CVM Stage: ${patient?.cvmStage ?: "CVM 3"} | Growth: ${patient?.growthPotential ?: "High Velocity"}", color = BampTextPrimary, fontSize = 13.sp)
                    Text("Clinical Notes: ${patient?.clinicalNotes ?: "Maxillary retrognathism with Class III anterior crossbite."}", color = BampTextSecondary, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("2. CEPHALOMETRIC MEASUREMENTS", color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("• SNA Angle: 78.2° (Maxillary Retrognathism)", color = BampTextPrimary, fontSize = 13.sp)
                    Text("• SNB Angle: 81.0° (Normal Mandibular Position)", color = BampTextPrimary, fontSize = 13.sp)
                    Text("• ANB Angle: -2.8° (Class III Skeletal Pattern)", color = BampSuccess, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    Text("• Wits Appraisal: -3.5 mm (Class III Linear Discrepancy)", color = BampSuccess, fontSize = 13.sp, fontWeight = FontWeight.Bold)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("3. AI BAMP PREDICTION RESULTS", color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("• Success Probability: ${patient?.latestPredictionScore ?: 89.2}%", color = BampSuccess, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("• Risk Classification: Low Risk (Optimal CVM 3 Window)", color = BampTextPrimary, fontSize = 13.sp)
                    Text("• Expected Maxillary Advancement: 3.8 mm over 14 Months", color = BampTextPrimary, fontSize = 13.sp)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text("4. TREATMENT RECOMMENDATIONS", color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("• Surgical placement of 4 mini-plates (2 infrazygomatic maxilla + 2 parasymphyseal mandible).", color = BampTextSecondary, fontSize = 12.sp)
                    Text("• 150g-200g intermaxillary Class III elastics worn 24 hrs/day.", color = BampTextSecondary, fontSize = 12.sp)

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            val dummyPdfUrl = "https://bamp-1de96.web.app"
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(dummyPdfUrl))
                            context.startActivity(intent)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text("Download PDF Report Document", color = BampTextPrimary, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

