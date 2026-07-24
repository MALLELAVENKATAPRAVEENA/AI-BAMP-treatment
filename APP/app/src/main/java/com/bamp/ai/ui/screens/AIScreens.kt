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
import com.bamp.ai.ui.theme.SecondaryBlue
import com.bamp.ai.ui.theme.TextSecondary
import com.bamp.ai.viewmodel.AIViewModel
import com.bamp.ai.viewmodel.UiState

@Composable
fun XRayUploadScreen(
    aiViewModel: AIViewModel,
    onNavigateToLandmarks: () -> Unit
) {
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
                    text = "Upload Cephalometric X-Ray",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "Lateral Cephalometric Radiograph (.png, .jpeg)",
                    fontSize = 13.sp,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(24.dp))

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp)
                        .background(Color.Black.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Tap to Select Radiograph", color = PrimaryBlue, fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = onNavigateToLandmarks,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Detect Cephalometric Landmarks", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun PredictionResultScreen(
    aiViewModel: AIViewModel
) {
    val predictionState by aiViewModel.predictionState.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundDark)
            .padding(20.dp)
    ) {
        Text(
            text = "AI BAMP Outcome Prediction",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )

        Text(
            text = "Machine Learning Treatment Response Classification",
            fontSize = 13.sp,
            color = TextSecondary
        )

        Spacer(modifier = Modifier.height(20.dp))

        when (val state = predictionState) {
            is UiState.Loading -> {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryBlue)
                }
            }
            is UiState.Success -> {
                val res = state.data
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = CardBackground),
                    shape = RoundedCornerShape(16.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Text("Outcome Classification", fontSize = 14.sp, color = TextSecondary)
                        Text(
                            text = res.bampOutcomeClass,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = SecondaryBlue
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("BAMP Favorable Score:", color = Color.White)
                            Text("${(res.bampFavorableScore * 100).toInt()}%", fontWeight = FontWeight.Bold, color = PrimaryBlue)
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Surgical Probability:", color = Color.White)
                            Text("${(res.surgicalProbability * 100).toInt()}%", fontWeight = FontWeight.Bold, color = Color.Red)
                        }
                    }
                }
            }
            is UiState.Error -> {
                Text(text = state.message, color = Color.Red)
            }
            else -> {
                Text("Select a patient and run AI prediction to view results.", color = TextSecondary)
            }
        }
    }
}
