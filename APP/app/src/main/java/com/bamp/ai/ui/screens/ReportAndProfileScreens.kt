package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.ui.theme.BackgroundDark
import com.bamp.ai.ui.theme.CardBackground
import com.bamp.ai.ui.theme.PrimaryBlue
import com.bamp.ai.ui.theme.TextSecondary
import com.bamp.ai.viewmodel.AuthViewModel

@Composable
fun AIChatScreen() {
    var message by remember { mutableStateOf("") }
    val chatHistory = remember { mutableStateListOf("AI Assistant: Hello Doctor! How can I assist with BAMP treatment planning today?") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        Text(
            text = "AI Clinical Assistant",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                chatHistory.forEach { msg ->
                    Text(text = msg, color = Color.White, fontSize = 14.sp)
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth()) {
            OutlinedTextField(
                value = message,
                onValueChange = { message = it },
                placeholder = { Text("Ask about Class III BAMP protocols...") },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = {
                    if (message.isNotBlank()) {
                        chatHistory.add("You: $message")
                        chatHistory.add("AI Assistant: BAMP protocol recommendations updated based on maxillary protraction metrics.")
                        message = ""
                    }
                },
                modifier = Modifier.height(56.dp)
            ) {
                Text("Send")
            }
        }
    }
}

@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    onLogout: () -> Unit
) {
    val user = authViewModel.currentUser

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(20.dp),
        contentAlignment = Alignment.Center
    ) {
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Orthodontist Practitioner Profile",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(text = "Name: ${user?.name ?: "Dr. Orthodontist"}", color = Color.White, fontSize = 16.sp)
                Text(text = "Email: ${user?.email ?: "doctor@orthocenter.org"}", color = TextSecondary, fontSize = 14.sp)
                Text(text = "Role: ${user?.role ?: "Orthodontist"}", color = PrimaryBlue, fontWeight = FontWeight.Bold, fontSize = 14.sp)

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = onLogout,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Red)
                ) {
                    Text("Sign Out of Portal", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
