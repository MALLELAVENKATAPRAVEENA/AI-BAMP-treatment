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
    onNavigateToRegister: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val patientsState by patientViewModel.patientsState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        patientViewModel.fetchPatients()
    }

    Scaffold(
        containerColor = BackgroundDark,
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateToRegister,
                containerColor = PrimarySapphire
            ) {
                Icon(Icons.Default.Add, contentDescription = "Register New Patient", tint = Color.White)
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
                        text = "Live Real-Time Firestore Patient Records & Growth Assessments",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by patient name, ID, or CVM stage...") },
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
                                (it.patientId?.contains(searchQuery, ignoreCase = true) == true) ||
                                (it.cvmStage?.contains(searchQuery, ignoreCase = true) == true)
                    }

                    if (filteredPatients.isEmpty()) {
                        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                            Text("No registered patient records found in Firestore.", color = TextSecondary)
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
    val autoGeneratedId = remember { "PAT-${System.currentTimeMillis()}" }
    var patientId by remember { mutableStateOf(autoGeneratedId) }
    var fullName by remember { mutableStateOf("") }
    var ageText by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("Female") }
    var dob by remember { mutableStateOf("2014-05-12") }
    var growthStatus by remember { mutableStateOf("Active Peak Growth") }
    var cvmStage by remember { mutableStateOf("CVM 3") }
    var skeletalAge by remember { mutableStateOf("") }
    var chronologicalAge by remember { mutableStateOf("") }
    var clinicalNotes by remember { mutableStateOf("") }
    var diagnosis by remember { mutableStateOf("Class III Skeletal Malocclusion") }

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
                    text = "STEP 1 – Register New Patient",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Store patient record in Firestore before X-Ray analysis",
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
                Text("Patient Required Information", fontWeight = FontWeight.Bold, color = PrimaryLightBlue, fontSize = 15.sp)
                Spacer(modifier = Modifier.height(12.dp))

                OutlinedTextField(
                    value = patientId,
                    onValueChange = { patientId = it },
                    label = { Text("Patient ID (Auto Generated)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

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
                        onValueChange = {
                            ageText = it
                            if (chronologicalAge.isEmpty()) chronologicalAge = "$it yrs"
                            if (skeletalAge.isEmpty()) skeletalAge = "$it yrs"
                        },
                        label = { Text("Age (8 - 25)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = gender,
                        onValueChange = { gender = it },
                        label = { Text("Gender (Male/Female)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = dob,
                    onValueChange = { dob = it },
                    label = { Text("Date of Birth (YYYY-MM-DD)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = growthStatus,
                        onValueChange = { growthStatus = it },
                        label = { Text("Growth Status") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = cvmStage,
                        onValueChange = { cvmStage = it },
                        label = { Text("CVM Stage (CVM 1-6)") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = skeletalAge,
                        onValueChange = { skeletalAge = it },
                        label = { Text("Skeletal Age") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = chronologicalAge,
                        onValueChange = { chronologicalAge = it },
                        label = { Text("Chronological Age") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(12.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text("Clinical Notes & Assessment", fontWeight = FontWeight.Bold, color = PrimaryLightBlue, fontSize = 15.sp)
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
                    value = clinicalNotes,
                    onValueChange = { clinicalNotes = it },
                    label = { Text("Clinical Notes") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    minLines = 3
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        val age = ageText.toIntOrNull() ?: 12
                        patientViewModel.addPatient(
                            AddPatientRequest(
                                patientId = patientId,
                                name = fullName,
                                age = age,
                                gender = gender,
                                dateOfBirth = dob,
                                growthStatus = growthStatus,
                                cvmStage = cvmStage,
                                skeletalAge = skeletalAge.ifEmpty { "$age yrs" },
                                chronologicalAge = chronologicalAge.ifEmpty { "$age yrs" },
                                clinicalNotes = clinicalNotes,
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
                    Icon(Icons.Default.Save, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("SAVE PATIENT TO FIRESTORE", fontWeight = FontWeight.Bold, fontSize = 15.sp)
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
                    onAdd(AddPatientRequest(name = name, age = age, gender = gender, cvmStage = cvmStage))
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
