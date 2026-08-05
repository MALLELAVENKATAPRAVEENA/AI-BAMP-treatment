package com.bamp.ai.data.model

import java.util.Date

data class ChatMessage(
    val id: String = java.util.UUID.randomUUID().toString(),
    val sender: String = "user", // user, assistant
    val text: String = "",
    val timestamp: Date = Date()
)
