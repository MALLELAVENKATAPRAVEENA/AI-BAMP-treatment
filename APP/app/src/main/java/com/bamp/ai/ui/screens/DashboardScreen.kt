package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.DashboardStats
import com.bamp.ai.data.model.Patient
import com.bamp.ai.ui.theme.*
import com.bamp.ai.viewmodel.PatientViewModel
import com.bamp.ai.viewmodel.UiState

@Composable
fun DashboardScreen(
    patientViewModel: PatientViewModel,
    onNavigateToDirectory: () -> Unit,
    onNavigateToRegisterPatient: () -> Unit,
    onNavigateToXRayUpload: () -> Unit,
    onNavigateToAIChat: () -> Unit
) {
    val statsState by patientViewModel.statsState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(Unit) {
        patientViewModel.fetchDashboardStats()
    }

    Box(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundDark)
                .padding(16.dp)
                .verticalScroll(scrollState)
        ) {
            // Header with Title, Subtitle, and + New Patient Action Button matching Web Screenshot 1
            Column(modifier = Modifier.fillMaxWidth()) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Orthodontist Clinical Dashboard",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "Real-time BAMP Treatment Outcome Monitoring & Live Firebase Firestore Predictive Analytics",
                            fontSize = 11.sp,
                            color = TextSecondary
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    // + New Patient Button (Navigates Directly to Register Patient)
                    Button(
                        onClick = onNavigateToRegisterPatient,
                        shape = RoundedCornerShape(10.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 8.dp)
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("+ New Patient", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 7 Live Firestore Metric Cards matching Web Dashboard Screenshot 1
            when (val state = statsState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryLightBlue)
                    }
                }
                is UiState.Success<DashboardStats> -> {
                    val stats = state.data

                    // Row 1: Total Patients & Total Predictions
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        WebStyleMetricCard("TOTAL PATIENTS", stats.totalPatients.toString(), "Live Registered Cases", Icons.Default.People, PrimaryLightBlue, Modifier.weight(1f))
                        WebStyleMetricCard("TOTAL PREDICTIONS", stats.totalPredictions.toString(), "AI Inference Runs", Icons.Default.AutoAwesome, PrimaryLightBlue, Modifier.weight(1f))
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Row 2: Successful Cases & Uploaded X-Rays
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        WebStyleMetricCard("SUCCESSFUL CASES", stats.successfulCases.toString(), ">85% Success Rate", Icons.Default.CheckCircle, AccentSuccess, Modifier.weight(1f))
                        WebStyleMetricCard("UPLOADED X-RAYS", stats.totalXRaysUploaded.toString(), "Lateral Cephalograms", Icons.Default.CloudUpload, PrimaryLightBlue, Modifier.weight(1f))
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Row 3: Moderate Risk & High Risk Cases
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        WebStyleMetricCard("MODERATE RISK CASES", stats.moderateRiskCases.toString(), "70-85% Success Rate", Icons.Default.Warning, AccentWarning, Modifier.weight(1f))
                        WebStyleMetricCard("HIGH RISK CASES", stats.highRiskCases.toString(), "<70% Success Rate", Icons.Default.Error, AccentError, Modifier.weight(1f))
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Row 4: Total Reports Generated
                    WebStyleMetricCard("TOTAL REPORTS", stats.totalReports.toString(), "Clinical PDFs Generated", Icons.Default.Description, PrimaryLightBlue, Modifier.fillMaxWidth())

                    Spacer(modifier = Modifier.height(24.dp))

                    // Section: Recent Patients Registered in Firestore (Screenshot 2)
                    Text(
                        text = "Recent Patients Registered in Firestore",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    val patientsList = stats.recentPatients.orEmpty()
                    if (patientsList.isEmpty()) {
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .border(1.dp, CardBorderColor, RoundedCornerShape(14.dp)),
                            colors = CardDefaults.cardColors(containerColor = CardBackground),
                            shape = RoundedCornerShape(14.dp)
                        ) {
                            Column(
                                modifier = Modifier.padding(24.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Icon(Icons.Default.PeopleOutline, contentDescription = null, tint = TextSecondary, modifier = Modifier.size(48.dp))
                                Spacer(modifier = Modifier.height(12.dp))
                                Text("No Patients Found in Firestore Database", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("Click + New Patient to add your first clinical record.", color = TextSecondary, fontSize = 13.sp)
                            }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            patientsList.take(10).forEach { patient ->
                                WebPatientTableRowCard(patient = patient, onClick = onNavigateToDirectory)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(60.dp))
                }
                is UiState.Error -> {
                    Text(text = state.message, color = AccentError)
                }
                else -> {}
            }
        }

        // Floating AI Bot Assistant Button at bottom right matching Web Screenshot 2
        FloatingActionButton(
            onClick = onNavigateToAIChat,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(20.dp),
            containerColor = SecondaryTeal,
            contentColor = Color.White,
            shape = CircleShape
        ) {
            Icon(Icons.Default.SmartToy, contentDescription = "AI Assistant", modifier = Modifier.size(26.dp))
        }
    }
}

@Composable
fun WebStyleMetricCard(title: String, count: String, subtitle: String, icon: ImageVector, accentColor: Color, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.border(1.dp, CardBorderColor, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = title, fontSize = 11.sp, color = TextSecondary, fontWeight = FontWeight.SemiBold)
                Surface(
                    shape = CircleShape,
                    color = accentColor.copy(alpha = 0.15f),
                    modifier = Modifier.size(32.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(imageVector = icon, contentDescription = null, tint = accentColor, modifier = Modifier.size(18.dp))
                    }
                }
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = count, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(4.dp))
            Text(text = subtitle, fontSize = 11.sp, color = TextSecondary)
        }
    }
}

@Composable
fun WebPatientTableRowCard(patient: Patient, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderColor, RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = patient.patientId ?: "PAT-${patient.id?.take(8) ?: "01"}",
                    fontWeight = FontWeight.Bold,
                    color = PrimaryLightBlue,
                    fontSize = 14.sp
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = SecondaryTeal.copy(alpha = 0.15f),
                    border = androidx.compose.foundation.BorderStroke(1.dp, SecondaryTealLight.copy(alpha = 0.5f))
                ) {
                    Text(
                        text = patient.cvmStage ?: "CVM 3",
                        color = SecondaryTealLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = patient.name ?: "Unknown Patient", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = Color.White)
                    Text(
                        text = "${patient.age} yrs / ${patient.gender ?: "Female"}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }

                Text(
                    text = patient.bampStartDate ?: "2026-01-15",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }
    }
}
