package com.bamp.ai.ui.screens.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.model.ChatMessage
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

@Composable
fun AIChatScreen(
    onMenuClick: () -> Unit = {},
    onNavigateNotifications: () -> Unit = {},
    onNavigateProfile: () -> Unit = {}
) {
    val firestoreRepository = remember { FirestoreRepository() }
    val messages = remember { mutableStateListOf<ChatMessage>() }
    var inputText by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        firestoreRepository.getChatMessagesFlow().collectLatest { list: List<ChatMessage> ->
            messages.clear()
            if (list.isEmpty()) {
                messages.add(
                    ChatMessage(
                        sender = "assistant",
                        text = "Hello Dr.! I am your BAMP AI Clinical Assistant. Ask me anything regarding Bone-Anchored Maxillary Protraction protocols, cephalometric angles, mini-plate placements, or patient outcome predictions."
                    )
                )
            } else {
                messages.addAll(list)
            }
        }
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "BAMP AI Assistant Chat",
                onMenuClick = onMenuClick,
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
        ) {
            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(messages) { msg ->
                    ChatBubble(message = msg)
                }
            }

            // Input Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(BampCardBg)
                    .padding(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedTextField(
                    value = inputText,
                    onValueChange = { inputText = it },
                    placeholder = { Text("Ask BAMP AI Assistant...", color = BampTextSecondary) },
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = BampSecondary,
                        unfocusedBorderColor = BampTextSecondary,
                        focusedTextColor = BampTextPrimary,
                        unfocusedTextColor = BampTextPrimary
                    ),
                    modifier = Modifier.weight(1f)
                )

                Spacer(modifier = Modifier.width(8.dp))

                IconButton(
                    onClick = {
                        if (inputText.isNotBlank()) {
                            val userText = inputText.trim()
                            inputText = ""
                            val userMsg = ChatMessage(sender = "user", text = userText)
                            messages.add(userMsg)

                            val q = userText.lowercase()
                            val replyText = when {
                                q.contains("hi") || q.contains("hello") || q.contains("hey") ->
                                    "Hello Dr.! How can I assist you today with BAMP treatment planning, cephalometrics, or patient predictions?"
                                q.contains("mini-plate") || q.contains("plate") ->
                                    "BAMP mini-plates are surgically placed at the infrazygomatic crest of the maxilla (2 plates) and parasymphyseal region of the mandible (2 plates) loaded with 150g-250g intermaxillary elastics."
                                q.contains("force") || q.contains("elastic") ->
                                    "Intermaxillary Class III elastics deliver 150g to 250g per side, worn 24 hours/day to achieve 2.5mm to 4.5mm skeletal maxillary protraction."
                                q.contains("anb") || q.contains("wits") || q.contains("sna") || q.contains("snb") ->
                                    "Cephalometric Norms: ANB (2° to 4°), Wits (0mm to -1mm). Negative ANB (<0°) and Wits (< -3mm) confirm skeletal Class III discrepancy."
                                q.contains("cvm") || q.contains("growth") || q.contains("stage") ->
                                    "CVM Stage 2 & 3 represent peak pubertal growth velocity—the optimal window for BAMP maxillary protraction."
                                q.contains("landmark") || q.contains("xray") || q.contains("scan") ->
                                    "Automated landmark localization detects Sella (S), Nasion (N), Point A, Point B, Pogonion (Pog), Menton (Me), Gnathion (Gn), Gonion (Go), Orbitale (Or), and Porion (Po) over lateral cephalograms."
                                q.contains("predict") || q.contains("risk") || q.contains("probability") ->
                                    "The AI Voting Ensemble evaluates success probability based on Patient Age, Gender, CVM Stage, ANB, and Wits appraisal (>85% Success, 70-84% Moderate Risk, <70% High Risk)."
                                else ->
                                    "In Class III malocclusions treated with BAMP, orthopedic maxillary protraction delivers favorable skeletal advancement while avoiding undesirable incisor tipping."
                            }

                            val aiMsg = ChatMessage(sender = "assistant", text = replyText)
                            messages.add(aiMsg)

                            scope.launch {
                                try {
                                    firestoreRepository.sendChatMessage(userMsg)
                                    firestoreRepository.sendChatMessage(aiMsg)
                                } catch (_: Exception) {}
                            }
                        }
                    }
                ) {
                    Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = BampSecondary)
                }
            }
        }
    }
}

@Composable
fun ChatBubble(message: ChatMessage) {
    val isUser = message.sender == "user"
    val align = if (isUser) Alignment.End else Alignment.Start
    val bg = if (isUser) BampSecondary else BampCardBg
    val textColor = BampTextPrimary

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = align
    ) {
        Card(
            colors = CardDefaults.cardColors(containerColor = bg),
            shape = RoundedCornerShape(12.dp)
        ) {
            Box(modifier = Modifier.padding(14.dp)) {
                Text(
                    text = message.text,
                    color = textColor,
                    fontSize = 14.sp
                )
            }
        }
    }
}
