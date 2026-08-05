package com.bamp.ai.ui.screens.patient

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampPrimary
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary

@Composable
fun PatientListScreen(
    onMenuClick: () -> Unit,
    onNavigateAddPatient: () -> Unit,
    onSelectPatient: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    val firestoreRepository = remember { FirestoreRepository() }
    val patients by firestoreRepository.getPatientsFlow().collectAsState(initial = emptyList())

    var searchQuery by remember { mutableStateOf("") }

    val filteredPatients = patients.filter {
        it.name.contains(searchQuery, ignoreCase = true) ||
                it.patientId.contains(searchQuery, ignoreCase = true) ||
                it.malocclusionType.contains(searchQuery, ignoreCase = true)
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Patient Directory",
                onMenuClick = onMenuClick,
                onNotificationClick = onNavigateNotifications,
                onProfileClick = onNavigateProfile
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onNavigateAddPatient,
                containerColor = BampSecondary
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Patient", tint = BampTextPrimary)
            }
        },
        containerColor = BampBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search by name, ID, or malocclusion type...", color = BampTextSecondary) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = BampTextSecondary) },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BampSecondary,
                    unfocusedBorderColor = BampTextSecondary,
                    focusedTextColor = BampTextPrimary,
                    unfocusedTextColor = BampTextPrimary
                ),
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(16.dp))

            if (filteredPatients.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (searchQuery.isEmpty()) "No patients registered yet. Tap + to register." else "No matching patients found.",
                        color = BampTextSecondary,
                        fontSize = 14.sp
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    items(filteredPatients) { patient ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = BampCardBg),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { onSelectPatient(patient.id) }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .background(BampPrimary, RoundedCornerShape(8.dp))
                                        .padding(12.dp)
                                ) {
                                    Icon(Icons.Default.Person, contentDescription = null, tint = BampSecondary)
                                }
                                Spacer(modifier = Modifier.width(14.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = patient.name,
                                        color = BampTextPrimary,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "${patient.patientId} • ${patient.gender}, ${patient.age} yrs",
                                        color = BampTextSecondary,
                                        fontSize = 12.sp
                                    )
                                    Text(
                                        text = patient.malocclusionType,
                                        color = BampSecondary,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = patient.status,
                                        color = BampSuccess,
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Icon(Icons.Default.ChevronRight, contentDescription = null, tint = BampTextSecondary)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
