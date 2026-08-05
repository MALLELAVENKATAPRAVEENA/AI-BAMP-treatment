package com.bamp.ai.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Dashboard
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.remote.FirebaseClient
import com.bamp.ai.ui.navigation.Screen
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampBorder
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampPrimary
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary

@Composable
fun AppDrawerContent(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    onLogout: () -> Unit
) {
    val currentUser = FirebaseClient.auth.currentUser

    Column(
        modifier = Modifier
            .width(280.dp)
            .fillMaxHeight()
            .background(BampCardBg)
            .verticalScroll(rememberScrollState())
    ) {
        // Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(BampPrimary)
                .padding(20.dp)
        ) {
            Text(
                text = "BAMP AI Predictor",
                color = BampSecondary,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Bone-Anchored Maxillary Protraction",
                color = BampTextSecondary,
                fontSize = 12.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = currentUser?.email ?: "Orthodontist Account",
                color = BampTextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Navigation Items
        DrawerMenuItem(
            label = "Dashboard",
            icon = Icons.Default.Dashboard,
            isSelected = currentRoute == Screen.Dashboard.route,
            onClick = { onNavigate(Screen.Dashboard.route) }
        )

        DrawerMenuItem(
            label = "Patient Directory",
            icon = Icons.Default.People,
            isSelected = currentRoute == Screen.PatientList.route,
            onClick = { onNavigate(Screen.PatientList.route) }
        )

        DrawerMenuItem(
            label = "AI Predictor & Analysis",
            icon = Icons.Default.Analytics,
            isSelected = currentRoute.startsWith("landmark_detection"),
            onClick = { onNavigate(Screen.PatientList.route) }
        )

        DrawerMenuItem(
            label = "Clinical Reports",
            icon = Icons.Default.Description,
            isSelected = currentRoute == Screen.Reports.route,
            onClick = { onNavigate(Screen.Reports.route) }
        )

        DrawerMenuItem(
            label = "Notifications",
            icon = Icons.Default.Notifications,
            isSelected = currentRoute == Screen.Notifications.route,
            onClick = { onNavigate(Screen.Notifications.route) }
        )

        DrawerMenuItem(
            label = "AI Assistant Chat",
            icon = Icons.AutoMirrored.Filled.Chat,
            isSelected = currentRoute == Screen.AIChat.route,
            onClick = { onNavigate(Screen.AIChat.route) }
        )

        HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = BampBorder)

        DrawerMenuItem(
            label = "Profile",
            icon = Icons.Default.Person,
            isSelected = currentRoute == Screen.Profile.route,
            onClick = { onNavigate(Screen.Profile.route) }
        )

        DrawerMenuItem(
            label = "Settings",
            icon = Icons.Default.Settings,
            isSelected = currentRoute == Screen.Settings.route,
            onClick = { onNavigate(Screen.Settings.route) }
        )

        Spacer(modifier = Modifier.weight(1f))

        HorizontalDivider(color = BampBorder)

        DrawerMenuItem(
            label = "Log Out",
            icon = Icons.AutoMirrored.Filled.ExitToApp,
            isSelected = false,
            onClick = onLogout
        )
    }
}

@Composable
fun DrawerMenuItem(
    label: String,
    icon: ImageVector,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val bg = if (isSelected) BampBackground else BampCardBg
    val tint = if (isSelected) BampSecondary else BampTextSecondary

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(bg)
            .clickable(onClick = onClick)
            .padding(horizontal = 20.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = label, tint = tint)
        Spacer(modifier = Modifier.width(16.dp))
        Text(
            text = label,
            color = if (isSelected) BampTextPrimary else BampTextSecondary,
            fontSize = 15.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}
