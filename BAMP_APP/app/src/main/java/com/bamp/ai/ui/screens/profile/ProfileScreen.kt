package com.bamp.ai.ui.screens.profile

import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
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
import com.bamp.ai.data.model.User
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
fun ProfileScreen(
    onMenuClick: () -> Unit,
    onNavigateNotifications: () -> Unit
) {
    val firestoreRepository = remember { FirestoreRepository() }
    val currentUser = FirebaseClient.auth.currentUser

    var name by remember { mutableStateOf("") }
    var specialization by remember { mutableStateOf("Orthodontics & Dentofacial Orthopedics") }
    var clinicName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(true) }
    var isSaving by remember { mutableStateOf(false) }

    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    LaunchedEffect(currentUser?.uid) {
        if (currentUser != null) {
            val user = firestoreRepository.getUserProfile(currentUser.uid)
            if (user != null) {
                name = user.name
                specialization = user.specialization
                clinicName = user.clinicName
                phone = user.phone
            } else {
                name = currentUser.displayName ?: ""
            }
        }
        isLoading = false
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Doctor Profile",
                onMenuClick = onMenuClick,
                onNotificationClick = onNavigateNotifications,
                onProfileClick = {}
            )
        },
        containerColor = BampBackground
    ) { padding ->
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = BampSecondary)
            }
        } else {
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
                        Text("Doctor Credentials & Details", color = BampSecondary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Text("Shared profile across Web & Android platforms.", color = BampTextSecondary, fontSize = 12.sp)

                        Spacer(modifier = Modifier.height(16.dp))

                        Text("Email: ${currentUser?.email}", color = BampTextPrimary, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                        Spacer(modifier = Modifier.height(12.dp))

                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Full Name", color = BampTextSecondary) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BampSecondary,
                                unfocusedBorderColor = BampTextSecondary,
                                focusedTextColor = BampTextPrimary,
                                unfocusedTextColor = BampTextPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = specialization,
                            onValueChange = { specialization = it },
                            label = { Text("Specialization", color = BampTextSecondary) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BampSecondary,
                                unfocusedBorderColor = BampTextSecondary,
                                focusedTextColor = BampTextPrimary,
                                unfocusedTextColor = BampTextPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = clinicName,
                            onValueChange = { clinicName = it },
                            label = { Text("Clinic / Center Name", color = BampTextSecondary) },
                            singleLine = true,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = BampSecondary,
                                unfocusedBorderColor = BampTextSecondary,
                                focusedTextColor = BampTextPrimary,
                                unfocusedTextColor = BampTextPrimary
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )

                        Spacer(modifier = Modifier.height(10.dp))

                        OutlinedTextField(
                            value = phone,
                            onValueChange = { phone = it },
                            label = { Text("Phone Number", color = BampTextSecondary) },
                            singleLine = true,
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
                                if (currentUser == null) return@Button
                                isSaving = true
                                scope.launch {
                                    try {
                                        val updatedUser = User(
                                            uid = currentUser.uid,
                                            name = name.trim(),
                                            email = currentUser.email ?: "",
                                            specialization = specialization.trim(),
                                            clinicName = clinicName.trim(),
                                            phone = phone.trim()
                                        )
                                        firestoreRepository.saveUserProfile(updatedUser)
                                        isSaving = false
                                        Toast.makeText(context, "Profile Updated & Synced!", Toast.LENGTH_SHORT).show()
                                    } catch (e: Exception) {
                                        isSaving = false
                                        Toast.makeText(context, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
                                    }
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                            shape = RoundedCornerShape(8.dp),
                            enabled = !isSaving,
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                        ) {
                            if (isSaving) {
                                CircularProgressIndicator(color = BampTextPrimary, modifier = Modifier.height(24.dp))
                            } else {
                                Text("Save Profile Changes", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}
