package com.bamp.ai.ui.screens.auth

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.User
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.launch

@Composable
fun SignupScreen(
    onSignupSuccess: () -> Unit,
    onNavigateLogin: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var clinicName by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    val scope = rememberCoroutineScope()
    val context = LocalContext.current
    val firestoreRepository = remember { FirestoreRepository() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BampBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(BampCardBg, shape = RoundedCornerShape(16.dp))
                .padding(24.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Register Account",
                color = BampSecondary,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Join BAMP AI Predictor Platform",
                color = BampTextSecondary,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            if (errorMessage.isNotEmpty()) {
                Text(
                    text = errorMessage,
                    color = androidx.compose.ui.graphics.Color.Red,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(bottom = 12.dp)
                )
            }

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
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address", color = BampTextSecondary) },
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
                label = { Text("Clinic / Hospital Name", color = BampTextSecondary) },
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
                value = password,
                onValueChange = { password = it },
                label = { Text("Password (min 6 chars)", color = BampTextSecondary) },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
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
                    if (email.isBlank() || password.isBlank() || name.isBlank()) {
                        errorMessage = "Please fill in all required fields"
                        return@Button
                    }
                    isLoading = true
                    errorMessage = ""

                    scope.launch {
                        FirebaseClient.auth.createUserWithEmailAndPassword(email.trim(), password)
                            .addOnCompleteListener { task ->
                                if (task.isSuccessful) {
                                    val uid = task.result?.user?.uid ?: ""
                                    val newUser = User(
                                        uid = uid,
                                        name = name.trim(),
                                        email = email.trim(),
                                        clinicName = clinicName.trim()
                                    )
                                    scope.launch {
                                        try {
                                            firestoreRepository.saveUserProfile(newUser)
                                            isLoading = false
                                            Toast.makeText(context, "Account Registered Successfully!", Toast.LENGTH_SHORT).show()
                                            onSignupSuccess()
                                        } catch (e: Exception) {
                                            isLoading = false
                                            errorMessage = e.message ?: "Failed to save profile"
                                        }
                                    }
                                } else {
                                    isLoading = false
                                    errorMessage = task.exception?.localizedMessage ?: "Registration failed"
                                }
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
                    Text("Create Account", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Already have an account?", color = BampTextSecondary, fontSize = 14.sp)
                TextButton(onClick = onNavigateLogin) {
                    Text("Sign In", color = BampSecondary, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
