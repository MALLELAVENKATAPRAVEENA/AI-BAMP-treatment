package com.bamp.ai.data.model

data class LandmarkPoint(
    val name: String,
    val x: Float, // Normalized 0..1 or pixel coordinate
    val y: Float,
    val label: String
)

data class CephalometricAnalysisResult(
    val snaAngle: Double = 82.0,
    val snaInterpretation: String = "Normal Maxillary Position",
    val snbAngle: Double = 84.5,
    val snbInterpretation: String = "Mandibular Prognathism (Class III)",
    val anbAngle: Double = -2.5,
    val anbInterpretation: String = "Class III Skeletal Relationship",
    val witsAppraisalMm: Double = -4.2,
    val witsInterpretation: String = "Severe Class III Disharmony",
    val fmaAngle: Double = 25.0,
    val fmaInterpretation: String = "Normodivergent Growth Pattern",
    val impaAngle: Double = 86.0,
    val impaInterpretation: String = "Retroclined Lower Incisors (Compensatory)",
    val landmarks: List<LandmarkPoint> = emptyList()
)
