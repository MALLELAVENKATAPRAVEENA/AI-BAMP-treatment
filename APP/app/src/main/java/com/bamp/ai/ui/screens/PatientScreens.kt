package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.AddPatientRequest
import com.bamp.ai.ui.theme.BackgroundDark
import com.bamp.ai.ui.theme.CardBackground
import com.bamp.ai.ui.theme.PrimaryBlue
import com.bamp.ai.ui.theme.TextSecondary
import com.bamp.ai.viewmodel.PatientViewModel
import com.bamp.ai.viewmodel.UiState

@Composable
fun PatientDirectoryScreen(
    patientViewModel: PatientViewModel,
    onPatientSelected: (String) -> Unit
) {
    val patientsState by patientViewModel.patientsState.collectAsState()
    var showAddDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        patientViewModel.fetchPatients()
    }

    Scaffold(
        containerColor = BackgroundDark,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = PrimaryBlue
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Patient", tint = Color.White)
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            Text(
                text = "Patient Directory",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "Orthodontic Growth Assessment Records (Age 8 to 25 yrs)",
                fontSize = 13.sp,
                color = TextSecondary
            )

            Spacer(modifier = Modifier.height(16.dp))

            when (val state = patientsState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryBlue)
                    }
                }
                is UiState.Success -> {
                    LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(state.data) { patient ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = CardBackground),
                                onClick = { patient.id?.let { onPatientSelected(it) } }
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(text = patient.name, fontSize = 17.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                    Text(text = "Patient ID: ${patient.patientId ?: "N/A"}", fontSize = 12.sp, color = PrimaryBlue)
                                    Text(text = "Age: ${patient.age} yrs | Gender: ${patient.gender}", fontSize = 13.sp, color = TextSecondary)
                                }
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

        if (showAddDialog) {
            AddPatientDialog(
                onDismiss = { showAddDialog = false },
                onAdd = { req ->
                    // Add patient call
                    showAddDialog = false
                    patientViewModel.fetchPatients()
                }
            )
        }
    }
}

@Composable
fun AddPatientDialog(
    onDismiss: () -> Unit,
    onAdd: (AddPatientRequest) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var ageText by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("Male") }
    var contact by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add New Patient", fontWeight = FontWeight.Bold, color = Color.White) },
        text = {
            Column {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Patient Full Name") })
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = ageText, onValueChange = { ageText = it }, label = { Text("Age (8 to 25 yrs)") })
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = gender, onValueChange = { gender = it }, label = { Text("Gender (Male/Female)") })
            }
        },
        confirmButton = {
            Button(onClick = {
                val age = ageText.toIntOrNull() ?: 12
                onAdd(AddPatientRequest(name, age, gender, contact))
            }) {
                Text("Save Patient")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
        containerColor = CardBackground
    )
}
