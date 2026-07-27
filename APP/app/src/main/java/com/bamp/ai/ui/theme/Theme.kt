package com.bamp.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Sapphire Deep Blue Brand Colors (Matching Web MUI Theme)
val PrimarySapphire = Color(0xFF0F52BA)
val PrimaryLightBlue = Color(0xFF3B82F6)
val SecondaryTeal = Color(0xFF0D9488)
val SecondaryTealLight = Color(0xFF14B8A6)

// Dark Mode Surface & Background Tokens
val BackgroundDark = Color(0xFF0B0F19)
val CardBackground = Color(0xFF111827)
val CardBorderColor = Color(0xFF1F2937)

// Status & Indicator Colors
val AccentSuccess = Color(0xFF10B981)
val AccentWarning = Color(0xFFF59E0B)
val AccentError = Color(0xFFEF4444)

// Text Tokens
val TextPrimary = Color(0xFFF3F4F6)
val TextSecondary = Color(0xFF9CA3AF)
val TextMuted = Color(0xFF6B7280)

// Legacy alias definitions for existing screens
val PrimaryBlue = PrimaryLightBlue
val SecondaryBlue = SecondaryTealLight

private val DarkColorScheme = darkColorScheme(
    primary = PrimarySapphire,
    secondary = SecondaryTeal,
    background = BackgroundDark,
    surface = CardBackground,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    error = AccentError
)

@Composable
fun AIBAMPTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
