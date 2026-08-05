package com.bamp.ai.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PointMode
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.unit.dp
import com.bamp.ai.data.model.LandmarkPoint
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess

@Composable
fun LandmarkCanvas(
    landmarks: List<LandmarkPoint>,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(350.dp)
            .background(BampCardBg)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Standard Cephalometric landmarks mapping
            val defaultPoints = if (landmarks.isEmpty()) {
                listOf(
                    LandmarkPoint("Sella (S)", 0.45f, 0.25f, "S"),
                    LandmarkPoint("Nasion (N)", 0.65f, 0.22f, "N"),
                    LandmarkPoint("A-Point (A)", 0.68f, 0.50f, "A"),
                    LandmarkPoint("B-Point (B)", 0.66f, 0.68f, "B"),
                    LandmarkPoint("Pogonion (Pog)", 0.67f, 0.78f, "Pog"),
                    LandmarkPoint("Menton (Me)", 0.63f, 0.85f, "Me"),
                    LandmarkPoint("Gnathion (Gn)", 0.65f, 0.82f, "Gn"),
                    LandmarkPoint("Gonion (Go)", 0.35f, 0.70f, "Go"),
                    LandmarkPoint("Porion (Po)", 0.30f, 0.32f, "Po"),
                    LandmarkPoint("Orbitale (Or)", 0.58f, 0.35f, "Or")
                )
            } else landmarks

            val points = defaultPoints.map {
                Offset(it.x * width, it.y * height)
            }

            // Draw connecting cephalometric lines (S-N, N-A, N-B, Mandibular Plane Go-Me)
            val s = points[0]
            val n = points[1]
            val a = points[2]
            val b = points[3]
            val go = points[7]
            val me = points[5]

            // S-N Line
            drawLine(color = Color.Yellow, start = s, end = n, strokeWidth = 3.dp.toPx())
            // N-A Line
            drawLine(color = BampSecondary, start = n, end = a, strokeWidth = 2.dp.toPx())
            // N-B Line
            drawLine(color = BampSecondary, start = n, end = b, strokeWidth = 2.dp.toPx())
            // Go-Me Mandibular Plane
            drawLine(color = BampSuccess, start = go, end = me, strokeWidth = 3.dp.toPx())

            // Draw Landmark Dots & Labels
            defaultPoints.forEachIndexed { index, landmark ->
                val px = landmark.x * width
                val py = landmark.y * height

                drawCircle(
                    color = Color.Red,
                    radius = 6.dp.toPx(),
                    center = Offset(px, py)
                )

                drawContext.canvas.nativeCanvas.drawText(
                    landmark.label,
                    px + 12f,
                    py + 6f,
                    android.graphics.Paint().apply {
                        color = android.graphics.Color.WHITE
                        textSize = 32f
                        isFakeBoldText = true
                    }
                )
            }
        }
    }
}
