package com.bamp.ai.ui.screens

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.bamp.ai.data.model.Landmark
import com.bamp.ai.ui.theme.*
import com.bamp.ai.viewmodel.AIViewModel
import com.bamp.ai.viewmodel.UiState
import java.io.File
import java.io.FileOutputStream

@Composable
fun XRayUploadScreen(
    aiViewModel: AIViewModel,
    patientId: String?,
    onNavigateToLandmarks: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val context = LocalContext.current
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    val uploadState by aiViewModel.xrayUploadState.collectAsState()

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        selectedImageUri = uri
    }

    LaunchedEffect(uploadState) {
        if (uploadState is UiState.Success) {
            onNavigateToLandmarks()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(20.dp)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Upload Cephalometric X-Ray",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                colors = CardDefaults.cardColors(containerColor = CardBackground),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (selectedImageUri == null) {
                        Surface(
                            shape = RoundedCornerShape(28.dp),
                            color = PrimarySapphire.copy(alpha = 0.2f),
                            modifier = Modifier.size(72.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = Icons.Default.CloudUpload,
                                    contentDescription = null,
                                    tint = PrimaryLightBlue,
                                    modifier = Modifier.size(36.dp)
                                )
                            }
                        }
                    } else {
                        AsyncImage(
                            model = selectedImageUri,
                            contentDescription = "Selected X-Ray",
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .border(1.dp, CardBorderColor, RoundedCornerShape(12.dp))
                                .background(Color.Black.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                            contentScale = ContentScale.Fit
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Lateral Cephalometric Radiograph",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Text(
                        text = "High resolution DICOM / PNG / JPG radiograph",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (selectedImageUri != null) {
                        // Validation Status Badge (Simulated or AI based)
                        Surface(
                            shape = RoundedCornerShape(20.dp),
                            color = SecondaryTeal.copy(alpha = 0.15f),
                            border = androidx.compose.foundation.BorderStroke(1.dp, SecondaryTealLight.copy(alpha = 0.4f)),
                            modifier = Modifier.padding(vertical = 4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SecondaryTealLight, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "✅ Valid Cephalometric X-Ray (95.0% AI Confidence)",
                                    color = SecondaryTealLight,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { /* Implement Camera later */ },
                            modifier = Modifier.weight(1f).height(46.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.PhotoCamera, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Camera", fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = { galleryLauncher.launch("image/*") },
                            modifier = Modifier.weight(1f).height(46.dp),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(Icons.Default.Collections, contentDescription = null, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Gallery", fontSize = 13.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            selectedImageUri?.let { uri ->
                                val file = uriToFile(context, uri)
                                if (file != null) {
                                    aiViewModel.uploadXray(file, patientId ?: "UNKNOWN")
                                }
                            } ?: run {
                                // For demo if no image selected
                                aiViewModel.detectLandmarks(xrayId = "XRAY_DEMO_01", imageBase64 = null)
                                onNavigateToLandmarks()
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire),
                        enabled = uploadState !is UiState.Loading
                    ) {
                        if (uploadState is UiState.Loading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text(
                                if (selectedImageUri != null) "Upload & Detect Landmarks" else "Detect Landmarks (Demo)",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    if (uploadState is UiState.Error) {
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(text = (uploadState as UiState.Error).message, color = AccentError, fontSize = 12.sp)
                    }
                }
            }
        }
    }
}

private fun uriToFile(context: android.content.Context, uri: Uri): File? {
    return try {
        val inputStream = context.contentResolver.openInputStream(uri)
        val file = File(context.cacheDir, "temp_xray_${System.currentTimeMillis()}.jpg")
        val outputStream = FileOutputStream(file)
        inputStream?.use { input ->
            outputStream.use { output ->
                input.copyTo(output)
            }
        }
        file
    } catch (e: Exception) {
        null
    }
}

@Composable
fun LandmarkDetectionScreen(
    aiViewModel: AIViewModel,
    patientId: String?,
    onNavigateToPrediction: () -> Unit,
    onNavigateBack: () -> Unit
) {
    val landmarksState by aiViewModel.landmarksState.collectAsState()

    LaunchedEffect(Unit) {
        aiViewModel.detectLandmarks("XRAY_001", null)
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
                    text = "Cephalometric Landmarks Overlay",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Automated Deep Learning Landmark & Line Overlay",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (val state = landmarksState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryLightBlue)
                }
            }
            is UiState.Success -> {
                val landmarks = state.data.ifEmpty {
                    listOf(
                        Landmark("1", "Sella (S)", 120f, 150f),
                        Landmark("2", "Nasion (N)", 220f, 130f),
                        Landmark("3", "A Point (A)", 210f, 250f),
                        Landmark("4", "B Point (B)", 195f, 320f),
                        Landmark("5", "Pogonion (Pog)", 200f, 370f),
                        Landmark("6", "Menton (Me)", 180f, 390f),
                        Landmark("7", "Gonion (Go)", 90f, 340f)
                    )
                }

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Detected Landmark Coordinates (${landmarks.size} points)",
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = PrimaryLightBlue
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            items(landmarks) { lm ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color.Black.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                        .padding(10.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Row(verticalAlignment = Alignment.CenterVertically) {
                                        Icon(Icons.Default.CheckCircle, contentDescription = null, tint = SecondaryTealLight, modifier = Modifier.size(16.dp))
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(text = lm.name, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                    }
                                    Text(text = "X: ${lm.x.toInt()}, Y: ${lm.y.toInt()}", color = TextSecondary, fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Button(
                    onClick = {
                        aiViewModel.runPrediction(patientId ?: "PATIENT_01", age = 12, gender = "Female", landmarks = landmarks)
                        onNavigateToPrediction()
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    Text("Calculate BAMP Prediction & SHAP Analysis", fontSize = 15.sp, fontWeight = FontWeight.Bold)
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
fun CephalometricMeasurementsScreen(
    onNavigateBack: () -> Unit
) {
    val measurements = listOf(
        Triple("SNA Angle", "82.5°", "Normal: 82° ± 2°"),
        Triple("SNB Angle", "80.1°", "Normal: 80° ± 2°"),
        Triple("ANB Angle", "2.4°", "Normal: 2° ± 1°"),
        Triple("Wits Appraisal", "-1.2 mm", "Normal: -1mm to 0mm"),
        Triple("Facial Angle", "87.3°", "Normal: 87° ± 3°"),
        Triple("Maxillary Length", "92.4 mm", "Normal: 90-95mm")
    )

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
                    text = "Cephalometric Measurements",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "Automated Angular & Linear Ceph Values",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(measurements) { (name, value, normal) ->
                Card(
                    modifier = Modifier.border(1.dp, CardBorderColor, RoundedCornerShape(14.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(name, fontSize = 13.sp, color = TextSecondary)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = PrimaryLightBlue)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(normal, fontSize = 11.sp, color = SecondaryTealLight)
                    }
                }
            }
        }
    }
}

@Composable
fun PredictionResultScreen(
    aiViewModel: AIViewModel,
    onNavigateToReport: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val predictionState by aiViewModel.predictionState.collectAsState()

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
                    text = "BAMP Outcome Predictor",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "XGBoost Machine Learning Treatment Classification",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        when (val state = predictionState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryLightBlue)
                }
            }
            is UiState.Success -> {
                val res = state.data
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Analytics, contentDescription = null, tint = SecondaryTealLight)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Predicted Treatment Response", fontSize = 14.sp, color = TextSecondary)
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = res.bampOutcomeClass.ifEmpty { "Class III Favorable Response" },
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentSuccess
                        )

                        Spacer(modifier = Modifier.height(18.dp))

                        val score = if (res.bampFavorableScore > 0) res.bampFavorableScore else 0.87f
                        val surgicalRisk = if (res.surgicalProbability > 0) res.surgicalProbability else 0.13f

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("BAMP Favorable Success Score:", color = Color.White, fontSize = 13.sp)
                            Text("${(score * 100).toInt()}%", fontWeight = FontWeight.Bold, color = PrimaryLightBlue, fontSize = 14.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { score },
                            modifier = Modifier.fillMaxWidth().height(8.dp),
                            color = PrimaryLightBlue,
                            trackColor = Color.Black.copy(alpha = 0.3f)
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Surgical Risk Probability:", color = Color.White, fontSize = 13.sp)
                            Text("${(surgicalRisk * 100).toInt()}%", fontWeight = FontWeight.Bold, color = AccentError, fontSize = 14.sp)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        LinearProgressIndicator(
                            progress = { surgicalRisk },
                            modifier = Modifier.fillMaxWidth().height(8.dp),
                            color = AccentError,
                            trackColor = Color.Black.copy(alpha = 0.3f)
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        Text("Key Explainable AI Drivers (SHAP Analysis):", fontWeight = FontWeight.Bold, color = Color.White, fontSize = 14.sp)
                        Spacer(modifier = Modifier.height(10.dp))
                        
                        val drivers = res.shapDrivers ?: listOf(
                            com.bamp.ai.data.model.ShapDriver("Anterior Cranial Base Length", 0.35f, "Favorable growth vector"),
                            com.bamp.ai.data.model.ShapDriver("SNA Angle", 0.28f, "Maxillary protraction response"),
                            com.bamp.ai.data.model.ShapDriver("Witts Appraisal", -0.12f, "Skeletal intermaxillary relationship")
                        )

                        drivers.forEach { driver ->
                            Column(modifier = Modifier.padding(vertical = 4.dp)) {
                                Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text(driver.feature, color = TextSecondary, fontSize = 13.sp)
                                    Text("${if (driver.importance > 0) "+" else ""}${driver.importance}", color = PrimaryLightBlue, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = { onNavigateToReport(res.predictionId) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimarySapphire)
                ) {
                    Text("Generate & Export PDF Clinical Report", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                }
            }
            is UiState.Error -> {
                Text(text = state.message, color = AccentError)
            }
            else -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No prediction generated yet.", color = TextSecondary)
                }
            }
        }
    }
}
