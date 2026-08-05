package com.bamp.ai.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class Prediction(
    @DocumentId val id: String = "",
    val patientId: String = "",
    val patientName: String = "",
    val doctorUid: String = "",
    val successProbability: Double = 0.0, // e.g., 88.5%
    val boneDensityScore: Double = 0.0,
    val relapseRiskPercent: Double = 0.0,
    val softTissueProfileChange: String = "Favorable Mandibular Retraction & Maxillary Protraction",
    val maxillaAdvancementMm: Double = 0.0,
    val mandibleRetractionMm: Double = 0.0,
    val treatmentDurationMonths: Int = 18,
    val keyFeatures: Map<String, Double> = emptyMap(), // SHAP values
    val mesh3dAvailable: Boolean = true,
    @ServerTimestamp val createdAt: Date? = null
)
