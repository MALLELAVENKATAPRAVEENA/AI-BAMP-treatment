package com.bamp.ai.ui.theme

import android.app.Activity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val BampDarkColorScheme = darkColorScheme(
    primary = BampPrimary,
    onPrimary = BampTextPrimary,
    primaryContainer = BampPrimaryLight,
    secondary = BampSecondary,
    onSecondary = BampTextPrimary,
    background = BampBackground,
    onBackground = BampTextPrimary,
    surface = BampCardBg,
    onSurface = BampTextPrimary,
    outline = BampBorder,
    error = BampError
)

@Composable
fun BAMPAIPredictorTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = BampDarkColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            @Suppress("DEPRECATION")
            window.statusBarColor = BampPrimary.toArgb()
            @Suppress("DEPRECATION")
            window.navigationBarColor = BampBackground.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
