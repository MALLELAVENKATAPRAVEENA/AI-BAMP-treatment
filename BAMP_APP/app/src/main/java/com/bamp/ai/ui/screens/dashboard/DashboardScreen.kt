package com.bamp.ai.ui.screens.dashboard

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PersonAdd
import androidx.compose.material.icons.filled.Science
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.Patient
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampPrimary
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import com.bamp.ai.ui.theme.BampWarning
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(
    onMenuClick: () -> Unit,
    onNavigatePatients: () -> Unit,
    onNavigateAddPatient: () -> Unit,
    onNavigateReports: () -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    val firestoreRepository = remember { FirestoreRepository() }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    val patients by firestoreRepository.getPatientsFlow().collectAsState(initial = emptyList())
    val predictions by firestoreRepository.getPredictionsFlow().collectAsState(initial = emptyList())
    val reports by firestoreRepository.getReportsFlow().collectAsState(initial = emptyList())

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BampBackground)
    ) {
        HeaderBar(
            title = "Orthodontist Dashboard",
            onMenuClick = onMenuClick,
            onNotificationClick = onNavigateNotifications,
            onProfileClick = onNavigateProfile
        )

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "BAMP Clinical Outcome Overview",
                    color = BampTextPrimary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            // Real-time Stat Cards Row 1
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Total Patients",
                        count = patients.size.toString(),
                        icon = Icons.Default.People,
                        color = BampSecondary,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigatePatients
                    )

                    StatCard(
                        title = "AI Predictions",
                        count = predictions.size.toString(),
                        icon = Icons.Default.Analytics,
                        color = BampSuccess,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigatePatients
                    )
                }
            }

            // Real-time Stat Cards Row 2
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "PDF Reports",
                        count = reports.size.toString(),
                        icon = Icons.Default.Description,
                        color = BampWarning,
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateReports
                    )

                    StatCard(
                        title = "Active Cases",
                        count = patients.count { it.status.contains("Active", ignoreCase = true) }.toString(),
                        icon = Icons.Default.People,
                        color = Color(0xFFA855F7),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigatePatients
                    )
                }
            }

            // Quick Actions Section
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = BampCardBg),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Quick Clinical Actions",
                            color = BampTextPrimary,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Button(
                                onClick = onNavigateAddPatient,
                                colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.PersonAdd, contentDescription = null, tint = BampTextPrimary)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("New Patient", color = BampTextPrimary, fontSize = 13.sp)
                            }

                            Button(
                                onClick = onNavigateReports,
                                colors = ButtonDefaults.buttonColors(containerColor = BampPrimary),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Description, contentDescription = null, tint = BampSecondary)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Reports", color = BampTextPrimary, fontSize = 13.sp)
                            }
                        }
                    }
                }
            }



            // Recent Patient Activity List
            item {
                Text(
                    text = "Recent Patient Records",
                    color = BampTextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            if (patients.isEmpty()) {
                item {
                    Text(
                        text = "No patient records registered yet.",
                        color = BampTextSecondary,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(vertical = 12.dp)
                    )
                }
            } else {
                items(patients.take(5)) { patient ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BampCardBg),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onNavigatePatients() }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .background(BampPrimary, RoundedCornerShape(8.dp))
                                    .padding(10.dp)
                            ) {
                                Icon(Icons.Default.People, contentDescription = null, tint = BampSecondary)
                            }
                            Spacer(modifier = Modifier.width(12.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = patient.name,
                                    color = BampTextPrimary,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp
                                )
                                Text(
                                    text = "${patient.patientId} • ${patient.gender}, ${patient.age} yrs • ${patient.malocclusionType}",
                                    color = BampTextSecondary,
                                    fontSize = 12.sp
                                )
                            }
                            Text(
                                text = patient.status,
                                color = BampSuccess,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(
    title: String,
    count: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = BampCardBg),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier.clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = title, color = BampTextSecondary, fontSize = 13.sp)
                Icon(icon, contentDescription = title, tint = color)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = count,
                color = BampTextPrimary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}
