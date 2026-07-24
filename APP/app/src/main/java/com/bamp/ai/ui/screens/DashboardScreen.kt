package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.Patient
import com.bamp.ai.ui.theme.BackgroundDark
import com.bamp.ai.ui.theme.CardBackground
import com.bamp.ai.ui.theme.PrimaryBlue
import com.bamp.ai.ui.theme.SecondaryBlue
import com.bamp.ai.ui.theme.TextSecondary
import com.bamp.ai.viewmodel.PatientViewModel
import com.bamp.ai.viewmodel.UiState

@Composable
fun DashboardScreen(
    patientViewModel: PatientViewModel,
    onNavigateToDirectory: () -> Unit,
    onNavigateToXRayUpload: () -> Unit,
    onNavigateToAIChat: () -> Unit
) {
    val statsState by patientViewModel.statsState.collectAsState()

    LaunchedEffect(Unit) {
        patientViewModel.fetchDashboardStats()
    }

    Scaffold(
        containerColor = BackgroundDark
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "Orthodontist Portal Dashboard",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "AI-Driven BAMP Protocol & Class III Assessment",
                fontSize = 13.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Action Quick Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onNavigateToXRayUpload,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Icon(Icons.Default.UploadFile, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Upload X-Ray", fontSize = 13.sp)
                }

                Button(
                    onClick = onNavigateToDirectory,
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(containerColor = SecondaryBlue)
                ) {
                    Icon(Icons.Default.People, contentDescription = null)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Patients", fontSize = 13.sp)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Metrics Grid
            when (val state = statsState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryBlue)
                    }
                }
                is UiState.Success -> {
                    val stats = state.data
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        StatCard("Total Patients", stats.totalPatients.toString(), Modifier.weight(1f))
                        StatCard("AI Predictions", stats.totalPredictions.toString(), Modifier.weight(1f))
                        StatCard("X-Rays Processed", stats.totalXRaysUploaded.toString(), Modifier.weight(1f))
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Text(
                        text = "Recent Patient Growth Assessments",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    stats.recentPatients?.let { patients ->
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(patients) { patient ->
                                PatientRowCard(patient)
                            }
                        }
                    }
                }
                is UiState.Error -> {
                    Text(text = state.message, color = Color.Red)
                }
                else -> {}
            }
        }
    }
}

@Composable
fun StatCard(label: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = label, fontSize = 11.sp, color = TextSecondary)
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = PrimaryBlue)
        }
    }
}

@Composable
fun PatientRowCard(patient: Patient) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(10.dp)
    ) {
        Row(
            modifier = Modifier
                .padding(14.dp)
                .fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(text = patient.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                Text(text = "Age: ${patient.age} yrs | Gender: ${patient.gender}", fontSize = 12.sp, color = TextSecondary)
            }
            Text(
                text = patient.status ?: "Active",
                color = SecondaryBlue,
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp
            )
        }
    }
}
