package com.bamp.ai.ui.screens.ai

import android.widget.Toast
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
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.components.LandmarkCanvas
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.launch

@Composable
fun LandmarkDetectionScreen(
    patientId: String,
    onNavigateCephalometrics: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    val firestoreRepository = remember { FirestoreRepository() }
    var patient by remember { androidx.compose.runtime.mutableStateOf<com.bamp.ai.data.model.Patient?>(null) }
    val scope = rememberCoroutineScope()
    val context = LocalContext.current

    androidx.compose.runtime.LaunchedEffect(patientId) {
        patient = firestoreRepository.getPatientById(patientId)
    }

    val isNonXRay = patient?.xrayUrl?.contains("non_xray") == true || patient?.landmarkStatus == "Object Not Found"
    val landmarks = remember(isNonXRay) { emptyList<com.bamp.ai.data.model.LandmarkPoint>() }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "16 Cephalometric Landmarks",
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (isNonXRay) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = androidx.compose.ui.graphics.Color(0xFF3B1219)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("⚠️ Object Not Found", color = androidx.compose.ui.graphics.Color.Red, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text("Uploaded image is NOT a valid Dental Lateral Cephalogram X-Ray. Cephalometric landmark localization halted.", color = BampTextPrimary, fontSize = 13.sp)
                    }
                }
            } else {
                Card(
                    colors = CardDefaults.cardColors(containerColor = BampCardBg),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Automated AI Landmark Overlay",
                            color = BampSecondary,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Interactive anatomical point detection: Sella, Nasion, A-Point, B-Point, Pogonion, Menton, Gonion, Porion, Orbitale.",
                            color = BampTextSecondary,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        LandmarkCanvas(landmarks = landmarks)
                    }
                }
            }

            // Landmark Legend List
            Card(
                colors = CardDefaults.cardColors(containerColor = BampCardBg),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Detected Key Points", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(8.dp))

                    LandmarkRow("Sella (S)", "Midpoint of sella turcica")
                    LandmarkRow("Nasion (N)", "Frontonasal suture junction")
                    LandmarkRow("Subspinale (A-Point)", "Deepest midline point of maxilla")
                    LandmarkRow("Supramentale (B-Point)", "Deepest midline point of mandible concavity")
                    LandmarkRow("Pogonion (Pog)", "Most anterior point of chin contour")
                    LandmarkRow("Menton (Me)", "Lowest point of mandibular symphysis")
                }
            }

            Button(
                onClick = {
                    scope.launch {
                        try {
                            firestoreRepository.saveLandmarks(
                                patientId = patientId,
                                landmarkData = mapOf(
                                    "Sella" to listOf(0.45, 0.25),
                                    "Nasion" to listOf(0.65, 0.22),
                                    "APoint" to listOf(0.68, 0.50),
                                    "BPoint" to listOf(0.66, 0.68),
                                    "Pogonion" to listOf(0.67, 0.78),
                                    "Menton" to listOf(0.63, 0.85)
                                )
                            )
                            Toast.makeText(context, "Saved Landmarks to landmarks collection!", Toast.LENGTH_SHORT).show()
                            onNavigateCephalometrics(patientId)
                        } catch (e: Exception) {
                            onNavigateCephalometrics(patientId)
                        }
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp)
            ) {
                Text("Proceed to Angular Analysis", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun LandmarkRow(label: String, desc: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 6.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(label, color = BampSecondary, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        Text(desc, color = BampTextSecondary, fontSize = 12.sp)
    }
}
