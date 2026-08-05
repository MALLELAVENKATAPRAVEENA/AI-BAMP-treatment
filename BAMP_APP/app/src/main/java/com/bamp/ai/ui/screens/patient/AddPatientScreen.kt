package com.bamp.ai.ui.screens.patient

import android.widget.Toast
import androidx.compose.foundation.background
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.launch

@Composable
fun AddPatientScreen(
    onNavigateBack: () -> Unit,
    onPatientAdded: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var ageStr by remember { mutableStateOf("") }
    var gender by remember { mutableStateOf("Male") }
    var malocclusion by remember { mutableStateOf("Class III Malocclusion") }
    var contact by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val firestoreRepository = remember { FirestoreRepository() }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Register New Patient",
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
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BampCardBg, RoundedCornerShape(12.dp))
                    .padding(20.dp)
            ) {
                Text(
                    text = "Patient Personal Info",
                    color = BampSecondary,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(12.dp))

                if (errorMessage.isNotEmpty()) {
                    Text(text = errorMessage, color = androidx.compose.ui.graphics.Color.Red, fontSize = 13.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                }

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name*", color = BampTextSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = ageStr,
                    onValueChange = { ageStr = it },
                    label = { Text("Age (years)*", color = BampTextSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text("Gender", color = BampTextSecondary, fontSize = 14.sp)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(
                        selected = gender == "Male",
                        onClick = { gender = "Male" },
                        colors = RadioButtonDefaults.colors(selectedColor = BampSecondary)
                    )
                    Text("Male", color = BampTextPrimary)
                    Spacer(modifier = Modifier.padding(horizontal = 12.dp))
                    RadioButton(
                        selected = gender == "Female",
                        onClick = { gender = "Female" },
                        colors = RadioButtonDefaults.colors(selectedColor = BampSecondary)
                    )
                    Text("Female", color = BampTextPrimary)
                }

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = malocclusion,
                    onValueChange = { malocclusion = it },
                    label = { Text("Malocclusion Classification", color = BampTextSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = contact,
                    onValueChange = { contact = it },
                    label = { Text("Contact Phone", color = BampTextSecondary) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Clinical Notes", color = BampTextSecondary) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        val age = ageStr.toIntOrNull()
                        if (name.isBlank() || age == null) {
                            errorMessage = "Please enter valid Patient Name and Age"
                            return@Button
                        }

                        isLoading = true
                        errorMessage = ""

                        scope.launch {
                            try {
                                val generatedId = "PAT-${System.currentTimeMillis().toString().takeLast(6)}"
                                val currentUser = FirebaseClient.auth.currentUser
                                val newPatient = Patient(
                                    patientId = generatedId,
                                    name = name.trim(),
                                    age = ageStr.toDoubleOrNull() ?: 11.0,
                                    gender = gender,
                                    malocclusionType = malocclusion,
                                    contactNumber = contact.trim(),
                                    notes = notes.trim(),
                                    doctorUid = currentUser?.uid ?: ""
                                )

                                val docId = firestoreRepository.addPatient(newPatient)
                                isLoading = false
                                Toast.makeText(context, "Patient Registered!", Toast.LENGTH_SHORT).show()
                                onPatientAdded(docId)
                            } catch (e: Exception) {
                                isLoading = false
                                errorMessage = e.message ?: "Failed to save patient"
                            }
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                    shape = RoundedCornerShape(8.dp),
                    enabled = !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(color = BampTextPrimary, modifier = Modifier.height(24.dp))
                    } else {
                        Text("Save Patient Record", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
