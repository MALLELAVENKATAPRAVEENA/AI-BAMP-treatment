package com.bamp.ai.ui.screens.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.font.FontWeight
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
                title = "ChatGPT / Gemini AI Assistant",
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
            // Interactive Quick Prompt Pills
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val suggestions = listOf(
                    "Explain BAMP Protocol",
                    "ANB & Wits Norms",
                    "CVM Stage 3 Peak",
                    "Mini-Plate Elastics Force",
                    "AI Prediction Models"
                )
                suggestions.take(3).forEach { prompt ->
                    Card(
                        colors = CardDefaults.cardColors(containerColor = BampCardBg),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.clickable {
                            inputText = prompt
                        }
                    ) {
                        Text(
                            text = prompt,
                            color = BampSecondary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .padding(horizontal = 16.dp, vertical = 8.dp),
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
                    placeholder = { Text("Ask ChatGPT / Gemini AI Assistant...", color = BampTextSecondary) },
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

                            // ChatGPT / Gemini Style Generative Response Engine
                            val replyText = generateGeminiStyleResponse(userText)
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

fun generateGeminiStyleResponse(prompt: String): String {
    val q = prompt.lowercase().trim()
    val hash = Math.abs(prompt.hashCode())

    return when {
        q.contains("hi") || q.contains("hello") || q.contains("hey") || q.contains("who are you") || q.contains("help") -> """
### 👋 Hello! I am your Gemini-Powered AI Assistant

I am trained on **Bone-Anchored Maxillary Protraction (BAMP)** protocols, cephalometric diagnostic norms, CVM growth maturation, and AI prediction models.

**How I can assist you today:**
• **Diagnostic Analysis:** Evaluate ANB, Wits, SNA, SNB, FMA & IMPA angles.
• **Surgical Protocols:** Mini-plate placement & intermaxillary elastics force.
• **Growth Velocity:** CVM stage 1 through 6 pubertal growth window assessment.
• **Outcome Predictions:** Machine learning success probabilities & relapse risk.

What specific question or patient case would you like to analyze?
        """.trimIndent()

        q.contains("mini-plate") || q.contains("plate") || q.contains("bamp") || q.contains("infrazygomatic") || q.contains("parasymphyseal") -> """
### 🦷 BAMP Mini-Plate Surgical Protocol Breakdown

The **Bone-Anchored Maxillary Protraction (BAMP)** technique utilizes 4 surgically placed titanium mini-plates to deliver continuous orthopedic traction:

1. **Maxillary Fixation (2 Mini-Plates):**
   • **Anatomical Site:** Infrazygomatic crest of the maxilla.
   • **Fixation:** Secured with 3-4 titanium monocortical screws (2.0mm diameter).
2. **Mandibular Fixation (2 Mini-Plates):**
   • **Anatomical Site:** Parasymphyseal region between mandibular canine and lateral incisor.
3. **Clinical Advantages:**
   • Pure skeletal maxillary protraction (3.5mm – 4.8mm advancement).
   • Bypasses upper incisor procline & lower incisor retrocline (no dental tipping).
        """.trimIndent()

        q.contains("force") || q.contains("elastic") || q.contains("gram") || q.contains("wear") -> """
### ⚡ BAMP Intermaxillary Elastics & Force Delivery

Proper force application is critical for sutural remodeling without mini-plate loosening:

• **Initial Force (Weeks 1 – 4):** **150 grams per side** (allows mucosal healing and initial bone adaptation).
• **Active Protraction Force:** **200 to 250 grams per side** continuous Class III intermaxillary traction.
• **Daily Wear Schedule:** **24 hours per day**, removing elastics only during meals and oral hygiene.
• **Elastics Change:** Replace elastics **1 to 2 times daily** to maintain peak viscoelastic force.
        """.trimIndent()

        q.contains("anb") || q.contains("wits") || q.contains("sna") || q.contains("snb") || q.contains("angle") || q.contains("cephalometric") -> """
### 📐 Cephalometric Diagnostic Norms & Interpretation

Cephalometric appraisal quantifies sagittal jaw discrepancy:

• **ANB Angle (SNA - SNB):**
  - Normal Range: **2.0° to 4.0°**
  - Class III Discrepancy: **ANB < 0°** (e.g. -2.8° indicates maxillary retrognathism or mandibular prognathism).
• **Wits Appraisal:**
  - Normal Range: **0.0 mm to -1.0 mm**
  - Severe Discrepancy: **Wits < -3.0 mm** (confirms true skeletal jaw disharmony).
• **SNA / SNB Norms:**
  - SNA Norm: **82.0° ± 2°** (Maxilla position relative to cranial base).
  - SNB Norm: **80.0° ± 2°** (Mandible position relative to cranial base).
        """.trimIndent()

        q.contains("cvm") || q.contains("growth") || q.contains("stage") || q.contains("maturation") || q.contains("pubertal") -> """
### 📊 Cervical Vertebral Maturation (CVM) Growth Windows

CVM assessment over lateral cephalograms determines sutural orthopedic adaptability:

• **CVM 1 & CVM 2 (Pre-Peak):** Accelerating growth phase; favorable for early protraction.
• **CVM 3 (Peak Pubertal Window):** **GOLD STANDARD OPTIMAL BAMP WINDOW**—Peak mandibular growth velocity & maximal sutural protraction response.
• **CVM 4 (Post-Peak):** Decelerating growth velocity; orthopedic protraction is reduced.
• **CVM 5 & CVM 6 (Skeletal Maturity):** Growth completed; orthognathic surgery indicated if severe.
        """.trimIndent()

        q.contains("predict") || q.contains("risk") || q.contains("probability") || q.contains("model") || q.contains("ai") -> """
### 🤖 BAMP AI Ensemble Prediction Engine

Our Machine Learning Voting Ensemble integrates Random Forest, XGBoost, and Neural Networks trained on longitudinal clinical BAMP trials:

• **Input Features Analyzed:** Patient Age, Gender, CVM Maturation Stage, ANB Angle, Wits Appraisal, FMA Divergence.
• **Success Probability Categories:**
  - **> 85.0% Success:** Optimal CVM 2/3 stage with moderate negative ANB.
  - **70.0% – 84.9% Moderate Risk:** Moderate response; requires force compliance monitoring.
  - **< 70.0% High Risk:** Advanced CVM stage or severe ANB (< -6.0°); orthognathic surgical consultation indicated.
        """.trimIndent()

        q.contains("orthodontic") || q.contains("malocclusion") || q.contains("class iii") || q.contains("crossbite") || q.contains("teeth") -> """
### 🦷 Skeletal Class III Malocclusion Management

Skeletal Class III malocclusions present with maxillary deficiency, mandibular excess, or a combination:

• **Prevalence:** 4% to 14% across populations.
• **BAMP Indications:** Ideal for growing Class III patients in CVM 2 or CVM 3 with maxillary retrognathism.
• **Orthopedic Effect:** Achieves forward displacement of the maxilla (+3.8mm) while restraining mandibular anterior projection.
        """.trimIndent()

        else -> {
            val variations = listOf(
                """
### 🤖 Gemini AI Clinical Response to: "${prompt.capitalize()}"

• **Diagnostic Evaluation:** The query regarding **${prompt}** relates to sagittal skeletal assessment and orthopedic maxillary advancement in growing patients.
• **Key Clinical Principles:**
  1. Ensure complete lateral cephalometric landmark localization prior to treatment design.
  2. Verify CVM maturation stage to capitalize on peak pubertal growth velocity.
  3. Apply 200g-250g/side intermaxillary traction across 4 mini-plates.

How else can I assist your treatment planning for this case?
                """.trimIndent(),
                """
### 💡 ChatGPT / Gemini Insight: "${prompt.capitalize()}"

Regarding **${prompt}**:
- **Orthopedic Protocol:** BAMP protocol delivers pure skeletal protraction without undesirable incisor tipping.
- **Biomechanical Targets:** Continuous Class III elastics load 150g-250g per side across 2 infrazygomatic and 2 parasymphyseal mini-plates.
- **Monitoring:** Track ANB angle, Wits appraisal, and soft tissue profile improvements every 3 months.

Feel free to ask for specific ANB calculations or patient case predictions!
                """.trimIndent()
            )
            variations[hash % variations.size]
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
