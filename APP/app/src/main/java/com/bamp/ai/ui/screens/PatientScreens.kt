package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.AddPatientRequest
import com.bamp.ai.data.model.Patient
import com.bamp.ai.data.model.UpdatePatientRequest
import com.bamp.ai.ui.theme.*
import com.bamp.ai.viewmodel.PatientViewModel
import com.bamp.ai.viewmodel.UiState

@Composable
fun PatientDirectoryScreen(
    patientViewModel: PatientViewModel,
    onPatientSelected: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val patientsState by patientViewModel.patientsState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }
    var showAddDialog by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        patientViewModel.fetchPatients()
    }

    Scaffold(
        containerColor = BackgroundDark,
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddDialog = true },
                containerColor = PrimarySapphire
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
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Column {
                    Text(
                        text = "Patient Directory",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Orthodontic Growth Assessment Records (Age 8 to 25 yrs)",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by patient name or ID...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            Spacer(modifier = Modifier.height(16.dp))

            when (val state = patientsState) {
                is UiState.Loading -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = PrimaryLightBlue)
                    }
                }
                is UiState.Success -> {
                    val filteredPatients = state.data.filter {
                        it.name.contains(searchQuery, ignoreCase = true) ||
                                (it.patientId?.contains(searchQuery, ignoreCase = true) == true)
                    }

                    if (filteredPatients.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("No patient records found.", color = TextSecondary)
                        }
                    } else {
                        LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                            items(filteredPatients) { patient ->
                                PatientCardItem(
                                    patient = patient,
                                    onView = { patient.id?.let { onPatientSelected(it) } },
                                    onDelete = { patient.id?.let { patientViewModel.deletePatient(it) } }
                                )
                            }
                        }
                    }
                }
                is UiState.Error -> {
                    Text(text = state.message, color = AccentError)
                }
                else -> {}
            }
        }

        if (showAddDialog) {
            AddPatientDialog(
                onDismiss = { showAddDialog = false },
                onAdd = { req ->
                    showAddDialog = false
                    patientViewModel.addPatient(req)
                }
            )
        }
    }
}

@Composable
fun PatientCardItem(
    patient: Patient,
    onView: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderColor, RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = CardBackground),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(20.dp),
                        color = PrimarySapphire.copy(alpha = 0.2f),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = patient.name.take(1).uppercase(),
                                color = PrimaryLightBlue,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(text = patient.name, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                        Text(text = "Case ID: ${patient.patientId ?: patient.id ?: "N/A"}", fontSize = 12.sp, color = TextSecondary)
                    }
                }

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = SecondaryTeal.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = patient.cvmStage ?: "CVM 3",
                        color = SecondaryTealLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Age: ${patient.age} yrs | Gender: ${patient.gender}", fontSize = 12.sp, color = TextSecondary)
                Text(text = "Score: 87% Favorable", fontSize = 12.sp, color = AccentSuccess, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onView) {
                    Icon(Icons.Default.Visibility, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("View", color = PrimaryLightBlue, fontSize = 13.sp)
                }
                TextButton(onClick = onDelete) {
                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete", color = AccentError, fontSize = 13.sp)
                }
            }
        }
    }
}

@Composable
fun RegisterPatientScreen(
    patientViewModel: PatientViewModel,
    onNavigateBack: () -> Unit,
    onSuccess: () -> Unit
) {
    var fullName by remember { mutableStateOf("") }
    var ageText by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("Female") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var diagnosis by remember { mutableStateOf("Class III Skeletal Malocclusion") }
    var notes by remember { mutableStateOf("") }
    val actionState by patientViewModel.actionState.collectAsState()
    val scrollState = rememberScrollState()

    LaunchedEffect(actionState) {
        if (actionState is UiState.Success) {
            onSuccess()
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
            .verticalScroll(scrollState)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Register New Patient",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Connect directly to Firebase Firestore & Storage",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Patient Personal Information", fontWeight = FontWeight.Bold, color = PrimaryLightBlue, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = fullName,
                    onValueChange = { fullName = it },
                    label = { Text("Full Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = ageText,
                        onValueChange = { ageText = it },
                        label = { Text("Age (8 - 25)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = gender,
                        onValueChange = { gender = it },
                        label = { Text("Gender") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { Text("Contact Email") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone Number") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text("Clinical Diagnosis & Notes", fontWeight = FontWeight.Bold, color = PrimaryLightBlue, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = diagnosis,
                    onValueChange = { diagnosis = it },
                    label = { Text("Diagnosis") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Clinical Treatment Notes") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    minLines = 3
                )

                Spacer(modifier = Modifier.height(18.dp))

                // Upload Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = { /* Upload Photo */ },
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.AddAPhoto, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Upload Photo", fontSize = 12.sp)
                    }

                    OutlinedButton(
                        onClick = { /* Upload X-Ray */ },
                        modifier = Modifier.weight(1f).height(44.dp),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.UploadFile, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Upload X-Ray", fontSize = 12.sp)
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        val age = ageText.toIntOrNull() ?: 12
                        patientViewModel.addPatient(
                            AddPatientRequest(
                                name = fullName,
                                age = age,
                                gender = gender,
                                contactNumber = phone,
                                cvmStage = "CVM 3",
                                diagnosis = diagnosis
                            )
                        )
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    if (actionState is UiState.Loading) {
                        CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                    } else {
                        Text("Save Patient to Firebase Firestore", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
fun PatientDetailScreen(
    patientId: String,
    patientViewModel: PatientViewModel,
    onNavigateBack: () -> Unit,
    onRunPrediction: (Patient) -> Unit
) {
    val selectedState by patientViewModel.selectedPatientState.collectAsState()
    var showEditDialog by remember { mutableStateOf(false) }

    LaunchedEffect(patientId) {
        patientViewModel.fetchPatientDetails(patientId)
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        when (val state = selectedState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryLightBlue)
                }
            }
            is UiState.Success -> {
                val patient = state.data
                Column(modifier = Modifier.fillMaxSize()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        IconButton(onClick = onNavigateBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = patient.name,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.weight(1f)
                        )
                        IconButton(onClick = { showEditDialog = true }) {
                            Icon(Icons.Default.Edit, contentDescription = "Edit", tint = PrimaryLightBlue)
                        }
                        IconButton(onClick = {
                            patient.id?.let { patientViewModel.deletePatient(it) }
                            onNavigateBack()
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete", tint = AccentError)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                        colors = CardDefaults.cardColors(containerColor = CardBackground),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = PrimaryLightBlue)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Patient Clinical Record", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Spacer(modifier = Modifier.height(14.dp))
                            DetailRow("Patient ID", patient.patientId ?: patient.id ?: "N/A")
                            DetailRow("Age", "${patient.age} years (BAMP Eligible)")
                            DetailRow("Gender", patient.gender)
                            DetailRow("CVM Cervical Stage", patient.cvmStage ?: "CVM 3 (Peak Growth)")
                            DetailRow("Primary Diagnosis", patient.diagnosis ?: "Class III Skeletal Malocclusion")
                            DetailRow("Status", patient.status ?: "Active")
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = { onRunPrediction(patient) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                    ) {
                        Text("Start BAMP AI Outcome Prediction", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                }

                if (showEditDialog) {
                    EditPatientDialog(
                        patient = patient,
                        onDismiss = { showEditDialog = false },
                        onUpdate = { req ->
                            showEditDialog = false
                            patient.id?.let { patientViewModel.updatePatient(it, req) }
                        }
                    )
                }
            }
            is UiState.Error -> {
                Text(text = state.message, color = AccentError)
            }
            else -> {}
        }
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 13.sp, color = TextSecondary)
        Text(text = value, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color.White)
    }
}

@Composable
fun AddPatientDialog(
    onDismiss: () -> Unit,
    onAdd: (AddPatientRequest) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var ageText by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("Female") }
    var cvmStage by remember { mutableStateOf("CVM 3") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Patient Registration", fontWeight = FontWeight.Bold, color = Color.White) },
        text = {
            Column {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = ageText, onValueChange = { ageText = it }, label = { Text("Age (8 to 25 yrs)") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = gender, onValueChange = { gender = it }, label = { Text("Gender (Male/Female)") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = cvmStage, onValueChange = { cvmStage = it }, label = { Text("CVM Stage (e.g. CVM 3)") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val age = ageText.toIntOrNull() ?: 10
                    onAdd(AddPatientRequest(name, age, gender, null, cvmStage))
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
            ) {
                Text("Save Patient")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextSecondary) }
        },
        containerColor = CardBackground
    )
}

@Composable
fun EditPatientDialog(
    patient: Patient,
    onDismiss: () -> Unit,
    onUpdate: (UpdatePatientRequest) -> Unit
) {
    var name by remember { mutableStateOf(patient.name) }
    var ageText by remember { mutableStateOf(patient.age.toString()) }
    var gender by remember { mutableStateOf(patient.gender) }
    var cvmStage by remember { mutableStateOf(patient.cvmStage ?: "CVM 3") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Update Patient Record", fontWeight = FontWeight.Bold, color = Color.White) },
        text = {
            Column {
                OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Full Name") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = ageText, onValueChange = { ageText = it }, label = { Text("Age") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = gender, onValueChange = { gender = it }, label = { Text("Gender") }, modifier = Modifier.fillMaxWidth())
                Spacer(modifier = Modifier.height(8.dp))
                OutlinedTextField(value = cvmStage, onValueChange = { cvmStage = it }, label = { Text("CVM Stage") }, modifier = Modifier.fillMaxWidth())
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val age = ageText.toIntOrNull() ?: patient.age
                    onUpdate(UpdatePatientRequest(name, age, gender, null, cvmStage, patient.status))
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
            ) {
                Text("Save Changes")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextSecondary) }
        },
        containerColor = CardBackground
    )
}
