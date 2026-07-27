package com.bamp.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
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
import com.bamp.ai.data.config.AppConfig
import com.bamp.ai.data.model.User
import com.bamp.ai.data.model.UserProfileUpdateRequest
import com.bamp.ai.data.repository.AuthRepository
import com.bamp.ai.ui.theme.*
import com.bamp.ai.viewmodel.AuthViewModel
import com.bamp.ai.viewmodel.ReportViewModel
import com.bamp.ai.viewmodel.UiState
import com.bamp.ai.viewmodel.UserViewModel

@Composable
fun AIChatScreen(
    onNavigateBack: () -> Unit
) {
    var message by remember { mutableStateOf("") }
    var isThinking by remember { mutableStateOf(false) }
    val chatHistory = remember {
        mutableStateListOf(
            "AI Assistant: Welcome Doctor! I am your AI Orthodontic Assistant trained on Class III BAMP protocols, cephalometrics, and skeletal growth prediction. How can I assist you with your patient case today?"
        )
    }

    fun generateClinicalResponse(query: String): String {
        val q = query.lowercase()
        return when {
            q.contains("bamp") || q.contains("protocol") || q.contains("plate") ->
                "AI Assistant: BAMP (Bone-Anchored Maxillary Protraction) Protocol Overview:\n• Mini-plates: 2 in Infrazygomatic Crest (Maxilla) & 2 between Mandibular Canines/Premolars.\n• Intermaxillary Elastics: Continuous Class III force (150g - 250g per side).\n• Optimal Window: Active growth period (CVM 2 to CVM 3 / Skeletal Age 9–12 yrs).\n• Skeletal Advantage: Pure maxillary protraction and mandibular growth redirection without dental compensation or incisor tipping."

            q.contains("cvm") || q.contains("growth") || q.contains("stage") || q.contains("age") ->
                "AI Assistant: Cervical Vertebral Maturation (CVM) Clinical Guidelines:\n• CVM 1-2 (Pre-peak): Ideal for preliminary BAMP planning & orthopedic expansion.\n• CVM 3 (Peak Pubertal Window): Maximum skeletal response for maxillary protraction.\n• CVM 4 (Post-peak): Moderate orthopedic effect; combined skeletal & dental changes.\n• CVM 5-6 (Growth Completion): Purely dental compensation or orthognathic surgical candidate."

            q.contains("sna") || q.contains("snb") || q.contains("anb") || q.contains("wits") || q.contains("measurement") ->
                "AI Assistant: Cephalometric Reference Norms for Class III Evaluation:\n• SNA Angle: Norm 82° ± 2. (< 80° indicates Maxillary Retrognathism)\n• SNB Angle: Norm 80° ± 2. (> 82° indicates Mandibular Prognathism)\n• ANB Angle: Norm 2° ± 1.5. (< 0° confirms Skeletal Class III Malocclusion)\n• Wits Appraisal: Norm -1mm to +1mm. (Wits < -3mm indicates severe Class III disparity)\n• IMPA (Lower Incisor Angle): Norm 90° ± 3."

            q.contains("predict") || q.contains("success") || q.contains("risk") ->
                "AI Assistant: BAMP AI Prediction Methodology:\nOur model combines XGBoost & Deep Neural Networks evaluating 18 cephalometric parameters, CVM growth stage, and chronological age to predict:\n1. Favorable Outcome (>85% Probability): Pure orthopedic correction achieved.\n2. Moderate Risk (70-85% Probability): Partial orthopedic result; mild fixed appliance refinement needed.\n3. High Risk (<70% Probability): High likelihood of post-pubertal mandibular overgrowth requiring surgical intervention."

            else ->
                "AI Assistant: Doctor, for Class III skeletal malocclusion assessment, BAMP therapy produces optimal maxillary protraction when initiated during CVM 2–3 (skeletal age 9–12 yrs). Please specify if you need landmark coordinates, cephalometric calculations, or patient risk predictions."
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "AI Clinical Assistant",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Cephalometric & BAMP Protocol Knowledge Base",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            LazyColumn(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                items(chatHistory) { msg ->
                    val isUser = msg.startsWith("You:")
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .wrapContentWidth(if (isUser) Alignment.End else Alignment.Start)
                            .background(
                                if (isUser) PrimarySapphire else Color.Black.copy(alpha = 0.4f),
                                RoundedCornerShape(12.dp)
                            )
                            .padding(12.dp)
                    ) {
                        Text(text = msg, color = Color.White, fontSize = 14.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { /* Voice Input */ }) {
                Icon(Icons.Default.Mic, contentDescription = "Voice Input", tint = PrimaryLightBlue)
            }
            Spacer(modifier = Modifier.width(4.dp))
            OutlinedTextField(
                value = message,
                onValueChange = { message = it },
                placeholder = { Text("Ask about Class III BAMP protocols, CVM, or cephalometrics...") },
                modifier = Modifier.weight(1f),
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            Button(
                onClick = {
                    if (message.isNotBlank()) {
                        val userMsg = message
                        chatHistory.add("You: $userMsg")
                        message = ""
                        val reply = generateClinicalResponse(userMsg)
                        chatHistory.add(reply)
                    }
                },
                modifier = Modifier.height(54.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
            ) {
                Text("Send", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun ReportsScreen(
    reportViewModel: ReportViewModel,
    patientId: String?,
    onNavigateBack: () -> Unit
) {
    val reportState by reportViewModel.reportState.collectAsState()

    LaunchedEffect(patientId) {
        if (!patientId.isNullOrEmpty()) {
            reportViewModel.generateReport(patientId, null)
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Generated PDF Reports",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Comprehensive BAMP Assessment & Cephalometric Analysis",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        when (val state = reportState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryLightBlue)
                }
            }
            is UiState.Success -> {
                val report = state.data
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text(text = "Report ID: ${report.reportId}", fontWeight = FontWeight.Bold, color = PrimaryLightBlue)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = "Patient: ${report.patientName}", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text(text = "Generated: ${report.generatedAt}", color = TextSecondary, fontSize = 13.sp)

                        Spacer(modifier = Modifier.height(20.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            Button(
                                onClick = { /* Download PDF */ },
                                modifier = Modifier.weight(1f).height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = SecondaryTeal)
                            ) {
                                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Export PDF", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }

                            Button(
                                onClick = { /* Share PDF */ },
                                modifier = Modifier.weight(1f).height(46.dp),
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                            ) {
                                Icon(Icons.Default.Share, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Share PDF", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
            else -> {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Clinical PDF Report Ready for Generation", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 16.sp)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text("Includes Cephalometric SNA, SNB, ANB, Witts, and SHAP outcome drivers.", color = TextSecondary, fontSize = 13.sp)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(
                            onClick = { reportViewModel.generateReport(patientId ?: "PATIENT_01", "PRED_01") },
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                        ) {
                            Text("Generate Clinical PDF Report", fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ProfileScreen(
    authViewModel: AuthViewModel,
    userViewModel: UserViewModel,
    onLogout: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val user = authViewModel.currentUser
    var showEditDialog by remember { mutableStateOf(false) }
    var isNightMode by remember { mutableStateOf(true) }
    val scrollState = rememberScrollState()

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
            Text(
                text = "Practitioner Profile & Theme Settings",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Profile Details Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    shape = CircleShape,
                    color = PrimarySapphire.copy(alpha = 0.2f),
                    modifier = Modifier.size(72.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Person, contentDescription = null, tint = PrimaryLightBlue, modifier = Modifier.size(40.dp))
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = user?.name ?: "Dr. Orthodontic Practitioner",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = user?.email ?: "doctor@orthocenter.org",
                    fontSize = 14.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(16.dp))

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = SecondaryTeal.copy(alpha = 0.15f)
                ) {
                    Text(
                        text = "Role: ${user?.role ?: AppConfig.USER_ROLE_ORTHODONTIST}",
                        color = SecondaryTealLight,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Hospital / Clinic: ${user?.hospitalName ?: "Orthodontic Medical Center"}",
                    color = TextSecondary,
                    fontSize = 13.sp
                )

                if (!user?.mobileNumber.isNullOrEmpty()) {
                    Text(
                        text = "Mobile: ${user?.mobileNumber}",
                        color = TextSecondary,
                        fontSize = 13.sp
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Edit Profile Button
                Button(
                    onClick = { showEditDialog = true },
                    modifier = Modifier.fillMaxWidth().height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    Icon(Icons.Default.Edit, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Edit Profile Information", fontWeight = FontWeight.Bold)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Night Mode & Bright Mode Toggle Card
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "App Theme & Visual Mode",
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Toggle between Night Mode (Dark) and Bright Mode (Light)",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(14.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = if (isNightMode) Icons.Default.NightsStay else Icons.Default.WbSunny,
                            contentDescription = null,
                            tint = if (isNightMode) PrimaryLightBlue else Color(0xFFFFB300),
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = if (isNightMode) "Night Mode (Dark Theme)" else "Bright Mode (Light Theme)",
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            fontSize = 14.sp
                        )
                    }

                    Switch(
                        checked = isNightMode,
                        onCheckedChange = { isNightMode = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color.White,
                            checkedTrackColor = PrimarySapphire,
                            uncheckedThumbColor = Color.White,
                            uncheckedTrackColor = SecondaryTeal
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Sign Out Button
        Button(
            onClick = {
                authViewModel.logout()
                onLogout()
            },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = AccentError)
        ) {
            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(6.dp))
            Text("Sign Out of Clinical Portal", fontWeight = FontWeight.Bold)
        }
    }

    // Edit Profile Dialog
    if (showEditDialog) {
        var nameEdit by remember { mutableStateOf(user?.name ?: "") }
        var hospitalEdit by remember { mutableStateOf(user?.hospitalName ?: "") }
        var mobileEdit by remember { mutableStateOf(user?.mobileNumber ?: "") }

        AlertDialog(
            onDismissRequest = { showEditDialog = false },
            title = { Text("Edit Practitioner Profile", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    OutlinedTextField(
                        value = nameEdit,
                        onValueChange = { nameEdit = it },
                        label = { Text("Full Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = hospitalEdit,
                        onValueChange = { hospitalEdit = it },
                        label = { Text("Hospital / Clinic Name") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = mobileEdit,
                        onValueChange = { mobileEdit = it },
                        label = { Text("Mobile Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val updatedUser = User(
                            uid = user?.uid ?: "user_01",
                            email = user?.email ?: "doctor@orthocenter.org",
                            name = nameEdit,
                            role = user?.role ?: "Orthodontist",
                            hospitalName = hospitalEdit,
                            mobileNumber = mobileEdit
                        )
                        AuthRepository().syncUserToFirestore(updatedUser)
                        userViewModel.updateProfile(nameEdit, hospitalEdit, mobileEdit)
                        showEditDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    Text("Save Changes", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditDialog = false }) {
                    Text("Cancel", color = TextSecondary)
                }
            },
            containerColor = CardBackground
        )
    }
}

@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit
) {
    var serverUrl by remember { mutableStateOf(AppConfig.BASE_URL) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Application Settings",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Backend API & Clinical Configuration",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text("Backend Base API Endpoint", fontWeight = FontWeight.Bold, color = PrimaryLightBlue)
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = serverUrl,
                    onValueChange = { serverUrl = it },
                    label = { Text("Base URL") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(14.dp))

                Button(
                    onClick = { AppConfig.setCustomBaseUrl(serverUrl) },
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    Text("Save Base URL", fontWeight = FontWeight.Bold)
                }
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
                Text("Firebase Integration", fontWeight = FontWeight.Bold, color = Color.White)
                Spacer(modifier = Modifier.height(6.dp))
                Text("Firebase Project ID: ${AppConfig.FIREBASE_PROJECT_ID}", color = TextSecondary, fontSize = 13.sp)
                Text("Firestore Database: Single Shared Collection", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}

@Composable
fun NotificationsScreen(
    userViewModel: UserViewModel,
    onNavigateBack: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(16.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Notifications",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Clinical Updates & AI Analysis Alerts",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
            colors = CardDefaults.cardColors(containerColor = CardBackground),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Notifications, contentDescription = null, tint = PrimaryLightBlue)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("AI Analysis Completed", fontWeight = FontWeight.Bold, color = Color.White)
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text("BAMP Favorable Outcome prediction calculated for patient.", color = TextSecondary, fontSize = 13.sp)
            }
        }
    }
}
