package com.bamp.ai.data.model

import com.google.firebase.firestore.DocumentId
import com.google.firebase.firestore.ServerTimestamp
import java.util.Date

data class NotificationItem(
    @DocumentId val id: String = "",
    val userId: String = "",
    val title: String = "",
    val message: String = "",
    val type: String = "info", // info, success, warning, prediction, report
    val read: Boolean = false,
    @ServerTimestamp val createdAt: Date? = null
)
