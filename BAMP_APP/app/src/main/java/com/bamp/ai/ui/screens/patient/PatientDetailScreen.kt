package com.bamp.ai.ui.screens.patient

import android.widget.Toast
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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.PinDrop
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampPrimary
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.launch

@Composable
fun PatientDetailScreen(
    patientId: String,
    onNavigateUploadXRay: (String) -> Unit,
    onNavigateLandmarks: (String) -> Unit,
    onNavigateCephalometrics: (String) -> Unit,
    onNavigatePrediction: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit,
    onNavigateBack: (() -> Unit)? = null
) {
    val firestoreRepository = remember { FirestoreRepository() }
    var patient by remember { mutableStateOf<Patient?>(null) }
    var isLoading by remember { mutableStateOf(true) }

    var showEditDialog by remember { mutableStateOf(false) }
    var showDeleteDialog by remember { mutableStateOf(false) }

    var editName by remember { mutableStateOf("") }
    var editAgeStr by remember { mutableStateOf("") }
    var editMalocclusion by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    LaunchedEffect(patientId) {
        patient = firestoreRepository.getPatientById(patientId)
        if (patient != null) {
            editName = patient!!.name
            editAgeStr = patient!!.age.toString()
            editMalocclusion = patient!!.malocclusionType
        }
        isLoading = false
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Patient Clinical File",
                onNotificationClick = onNavigateNotifications,
                onProfileClick = onNavigateProfile
            )
        },
        containerColor = BampBackground
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BampSecondary)
            }
        } else if (patient == null) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Patient Record Not Found", color = BampTextPrimary)
            }
        } else {
            val currentPatient = patient!!
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .padding(16.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Header Details
                Card(
                    colors = CardDefaults.cardColors(containerColor = BampCardBg),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentPatient.name,
                                color = BampTextPrimary,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Row {
                                OutlinedButton(
                                    onClick = { showEditDialog = true },
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.Edit, contentDescription = "Edit", tint = BampSecondary)
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                OutlinedButton(
                                    onClick = { showDeleteDialog = true },
                                    shape = RoundedCornerShape(6.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = androidx.compose.ui.graphics.Color.Red)
                                }
                            }
                        }

                        Text(
                            text = "${currentPatient.patientId} • ${currentPatient.gender}, ${currentPatient.age} years",
                            color = BampTextSecondary,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row {
                            Text("Malocclusion: ", color = BampTextSecondary, fontSize = 13.sp)
                            Text(currentPatient.malocclusionType, color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                        Row {
                            Text("Status: ", color = BampTextSecondary, fontSize = 13.sp)
                            Text(currentPatient.status, color = BampSuccess, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        }
                    }
                }

                // AI Workflow Modules
                Text("Clinical AI Workflow", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)

                WorkflowActionCard(
                    title = "1. Lateral Cephalometric X-Ray",
                    description = if (currentPatient.xrayUrl.isEmpty()) "No X-Ray uploaded yet. Tap to upload DICOM/JPG/PNG." else "X-Ray Active in File",
                    icon = Icons.Default.CloudUpload,
                    buttonText = if (currentPatient.xrayUrl.isEmpty()) "Upload X-Ray" else "Manage X-Ray",
                    onClick = { onNavigateUploadXRay(patientId) }
                )

                WorkflowActionCard(
                    title = "2. Landmark Detection",
                    description = "Automated AI detection of 16 anatomical cephalometric landmarks.",
                    icon = Icons.Default.PinDrop,
                    buttonText = "View Landmarks",
                    onClick = { onNavigateLandmarks(patientId) }
                )

                WorkflowActionCard(
                    title = "3. Cephalometric Analysis",
                    description = "Angular & linear skeletal measurements (SNA, SNB, ANB, Wits, FMA).",
                    icon = Icons.Default.Description,
                    buttonText = "Analysis Table",
                    onClick = { onNavigateCephalometrics(patientId) }
                )

                WorkflowActionCard(
                    title = "4. AI Outcome Prediction",
                    description = "BAMP treatment success probability & bone density profile.",
                    icon = Icons.Default.Analytics,
                    buttonText = "Predict Outcome",
                    onClick = { onNavigatePrediction(patientId) }
                )
            }

            // Edit Patient Dialog
            if (showEditDialog) {
                AlertDialog(
                    onDismissRequest = { showEditDialog = false },
                    title = { Text("Edit Patient Record", color = BampTextPrimary) },
                    text = {
                        Column {
                            OutlinedTextField(
                                value = editName,
                                onValueChange = { editName = it },
                                label = { Text("Name", color = BampTextSecondary) },
                                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = BampTextPrimary)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = editAgeStr,
                                onValueChange = { editAgeStr = it },
                                label = { Text("Age", color = BampTextSecondary) },
                                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = BampTextPrimary)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = editMalocclusion,
                                onValueChange = { editMalocclusion = it },
                                label = { Text("Malocclusion", color = BampTextSecondary) },
                                colors = OutlinedTextFieldDefaults.colors(focusedTextColor = BampTextPrimary)
                            )
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                val newAge = editAgeStr.toIntOrNull() ?: currentPatient.age
                                val updated = currentPatient.copy(name = editName, age = newAge, malocclusionType = editMalocclusion)
                                scope.launch {
                                    firestoreRepository.updatePatient(updated)
                                    patient = updated
                                    showEditDialog = false
                                    Toast.makeText(context, "Patient Record Updated!", Toast.LENGTH_SHORT).show()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = BampSecondary)
                        ) {
                            Text("Save")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showEditDialog = false }) {
                            Text("Cancel", color = BampTextSecondary)
                        }
                    },
                    containerColor = BampCardBg
                )
            }

            // Delete Patient Dialog
            if (showDeleteDialog) {
                AlertDialog(
                    onDismissRequest = { showDeleteDialog = false },
                    title = { Text("Delete Patient Record", color = androidx.compose.ui.graphics.Color.Red) },
                    text = { Text("Are you sure you want to delete ${currentPatient.name}? This action cannot be undone.", color = BampTextPrimary) },
                    confirmButton = {
                        Button(
                            onClick = {
                                scope.launch {
                                    firestoreRepository.deletePatient(patientId)
                                    showDeleteDialog = false
                                    Toast.makeText(context, "Patient Deleted!", Toast.LENGTH_SHORT).show()
                                    onNavigateBack?.invoke()
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = androidx.compose.ui.graphics.Color.Red)
                        ) {
                            Text("Delete")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showDeleteDialog = false }) {
                            Text("Cancel", color = BampTextSecondary)
                        }
                    },
                    containerColor = BampCardBg
                )
            }
        }
    }
}

@Composable
fun WorkflowActionCard(
    title: String,
    description: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    buttonText: String,
    onClick: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = BampCardBg),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .background(BampPrimary, RoundedCornerShape(8.dp))
                    .padding(12.dp)
            ) {
                Icon(icon, contentDescription = null, tint = BampSecondary)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(title, color = BampTextPrimary, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Text(description, color = BampTextSecondary, fontSize = 12.sp)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = onClick,
                colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(buttonText, color = BampTextPrimary, fontSize = 12.sp)
            }
        }
    }
}
