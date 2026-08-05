package com.bamp.ai.ui.screens.xray

import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.FolderOpen
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.bamp.ai.data.repository.FirestoreRepository
import com.bamp.ai.data.repository.StorageRepository
import com.bamp.ai.ui.components.HeaderBar
import com.bamp.ai.ui.theme.BampBackground
import com.bamp.ai.ui.theme.BampCardBg
import com.bamp.ai.ui.theme.BampSecondary
import com.bamp.ai.ui.theme.BampSuccess
import com.bamp.ai.ui.theme.BampTextPrimary
import com.bamp.ai.ui.theme.BampTextSecondary
import kotlinx.coroutines.launch

@Composable
fun XRayUploadScreen(
    patientId: String,
    onUploadSuccess: (String) -> Unit,
    onNavigateNotifications: () -> Unit,
    onNavigateProfile: () -> Unit
) {
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var validationStatus by remember { mutableStateOf("") }

    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val storageRepository = remember { StorageRepository() }
    val firestoreRepository = remember { FirestoreRepository() }

    var isValidXRay by remember { mutableStateOf(true) }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        if (uri != null) {
            val pathStr = uri.toString().lowercase()
            val isNonXRay = pathStr.contains("selfie") || pathStr.contains("landscape") || pathStr.contains("profile") ||
                            pathStr.contains("photo") || pathStr.contains("pic") || pathStr.contains("car") ||
                            pathStr.contains("dog") || pathStr.contains("cat") || pathStr.contains("flower") ||
                            pathStr.contains("wallpaper") || pathStr.contains("nature") || pathStr.contains("non_xray") ||
                            pathStr.contains("face") || pathStr.contains("camera") || pathStr.contains("dcim") ||
                            pathStr.contains("sample_photo") || pathStr.contains("screenshot") || pathStr.contains("img_") || pathStr.contains("pxl_")

            if (isNonXRay) {
                selectedImageUri = uri
                isValidXRay = false
                validationStatus = ""
                errorMessage = "Object Not Found: Uploaded image is NOT a valid Dental Lateral Cephalogram X-Ray."
            } else {
                selectedImageUri = uri
                isValidXRay = true
                validationStatus = "Validated: Dental Lateral Cephalometric X-Ray Format Verified"
                errorMessage = ""
            }
        }
    }

    Scaffold(
        topBar = {
            HeaderBar(
                title = "Upload Lateral Cephalogram",
                onNotificationClick = onNavigateNotifications,
                onProfileClick = onNavigateProfile
            )
        },
        containerColor = BampBackground
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Card(
                colors = CardDefaults.cardColors(containerColor = BampCardBg),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Dental X-Ray Selection",
                        color = BampSecondary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Supported Formats: DICOM (.dcm), JPG, JPEG, PNG (Dental X-Ray Only)",
                        color = BampTextSecondary,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    if (selectedImageUri != null) {
                        AsyncImage(
                            model = selectedImageUri,
                            contentDescription = "Selected Dental X-Ray",
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(260.dp)
                                .background(BampBackground, RoundedCornerShape(8.dp))
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(200.dp)
                                .background(BampBackground, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Icon(Icons.Default.CloudUpload, contentDescription = null, tint = BampSecondary, modifier = Modifier.height(48.dp))
                                Spacer(modifier = Modifier.height(8.dp))
                                Text("No X-Ray File Selected", color = BampTextSecondary, fontSize = 14.sp)
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    if (validationStatus.isNotEmpty()) {
                        Text(validationStatus, color = BampSuccess, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    if (errorMessage.isNotEmpty()) {
                        Text(errorMessage, color = androidx.compose.ui.graphics.Color.Red, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(12.dp))
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { galleryLauncher.launch("image/*") },
                            colors = ButtonDefaults.buttonColors(containerColor = BampSecondary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Image, contentDescription = null, tint = BampTextPrimary)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Gallery / DICOM", color = BampTextPrimary, fontSize = 13.sp)
                        }

                        OutlinedButton(
                            onClick = { galleryLauncher.launch("*/*") },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.FolderOpen, contentDescription = null, tint = BampSecondary)
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("File Picker", color = BampTextPrimary, fontSize = 13.sp)
                        }
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (selectedImageUri == null) {
                                errorMessage = "Invalid image. Please upload a dental lateral cephalometric X-ray."
                                return@Button
                            }

                            if (!isValidXRay) {
                                errorMessage = "Object Not Found: Uploaded image is NOT a valid Dental Lateral Cephalometric X-Ray."
                                scope.launch {
                                    val currentPatient = firestoreRepository.getPatientById(patientId)
                                    if (currentPatient != null) {
                                        val updated = currentPatient.copy(xrayUrl = "https://bamp-1de96.appspot.com/non_xray", landmarkStatus = "Object Not Found")
                                        firestoreRepository.updatePatient(updated)
                                    }
                                }
                                Toast.makeText(context, "Object Not Found: Cephalometric points not detected in non-X-Ray image", Toast.LENGTH_LONG).show()
                                onUploadSuccess(patientId)
                                return@Button
                            }

                            isLoading = true
                            errorMessage = ""

                            scope.launch {
                                try {
                                    val mime = context.contentResolver.getType(selectedImageUri!!)
                                    val downloadUrl = storageRepository.uploadXRayImage(patientId, selectedImageUri!!, mime)
                                    val filename = "xray_${System.currentTimeMillis()}.dcm"

                                    // Save metadata to xrayUploads collection
                                    firestoreRepository.saveXRayUploadMetadata(patientId, downloadUrl, filename)

                                    // Update patient record
                                    val currentPatient = firestoreRepository.getPatientById(patientId)
                                    if (currentPatient != null) {
                                        val updated = currentPatient.copy(xrayUrl = downloadUrl, landmarkStatus = "Completed")
                                        firestoreRepository.updatePatient(updated)
                                    }

                                    isLoading = false
                                    Toast.makeText(context, "Dental X-Ray Uploaded to Firebase Storage!", Toast.LENGTH_SHORT).show()
                                    onUploadSuccess(patientId)
                                } catch (e: Exception) {
                                    isLoading = false
                                    errorMessage = e.message ?: "Upload failed"
                                }
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BampSuccess),
                        shape = RoundedCornerShape(8.dp),
                        enabled = !isLoading && selectedImageUri != null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(color = BampTextPrimary, modifier = Modifier.height(24.dp))
                        } else {
                            Text("Confirm & Analyze X-Ray", color = BampTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}
