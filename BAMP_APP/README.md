# 📱 BAMP AI Predictor - Native Android Application

Welcome to the **BAMP AI Predictor** native Android application codebase. This mobile app serves as a mobile counterpart to the existing **AI BAMP Treatment Outcome Predictor** web application.

---

## ⚡ Core Integration Details

> [!IMPORTANT]
> **Single Ecosystem Integration**: The Android application is configured to connect directly to the existing Firebase project **`bamp-1de96`**. Both Web and Android platforms share the exact same user credentials, Firestore collections, Cloud Storage bucket, and backend microservice endpoints.

### 🌐 Shared Shared Resources Checklist
- **Firebase Project ID**: `bamp-1de96`
- **Firebase Authentication**: Single user account database. Users registered on Web can log in immediately on Android and vice-versa.
- **Cloud Firestore Database**: Shared collections (`users`, `patients`, `predictions`, `reports`, `notifications`, `audit_logs`, `feedback`).
- **Firebase Storage**: Shared bucket `bamp-1de96.appspot.com` for DICOM, JPG, PNG lateral cephalometric X-Rays and PDF reports.
- **Real-Time Synchronization**: Changes made on Web reflect in real-time on Android (and vice-versa) via Firestore snapshot listeners.
- **Offline Persistence**: Enabled via `FirebaseFirestoreSettings` with unlimited local disk caching.

---

## 📂 Project Structure (`BAMP_APP/`)

```
BAMP_APP/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── README.md
└── app/
    ├── build.gradle.kts
    ├── google-services.json   <-- Configured for project bamp-1de96
    └── src/
        └── main/
            ├── AndroidManifest.xml
            ├── res/
            │   ├── values/
            │   │   ├── colors.xml
            │   │   ├── strings.xml
            │   │   └── styles.xml
            │   └── xml/
            │       ├── backup_rules.xml
            │       └── data_extraction_rules.xml
            └── java/com/bamp/ai/
                ├── BampApplication.kt
                ├── MainActivity.kt
                ├── data/
                │   ├── model/
                │   │   ├── User.kt
                │   │   ├── Patient.kt
                │   │   ├── Prediction.kt
                │   │   ├── Report.kt
                │   │   ├── NotificationItem.kt
                │   │   ├── Cephalometrics.kt
                │   │   └── ChatMessage.kt
                │   ├── remote/
                │   │   ├── ApiService.kt
                │   │   └── FirebaseClient.kt
                │   └── repository/
                │       ├── FirestoreRepository.kt
                │       └── StorageRepository.kt
                └── ui/
                    ├── theme/
                    │   ├── Color.kt
                    │   ├── Type.kt
                    │   └── Theme.kt
                    ├── components/
                    │   ├── HeaderBar.kt
                    │   ├── AppDrawer.kt
                    │   └── LandmarkCanvas.kt
                    ├── navigation/
                    │   ├── Screen.kt
                    │   └── NavGraph.kt
                    └── screens/
                        ├── auth/
                        │   ├── LoginScreen.kt
                        │   ├── SignupScreen.kt
                        │   ├── ForgotPasswordScreen.kt
                        │   └── VerifyOtpScreen.kt
                        ├── dashboard/
                        │   └── DashboardScreen.kt
                        ├── patient/
                        │   ├── PatientListScreen.kt
                        │   ├── AddPatientScreen.kt
                        │   └── PatientDetailScreen.kt
                        ├── xray/
                        │   └── XRayUploadScreen.kt
                        ├── ai/
                        │   ├── LandmarkDetectionScreen.kt
                        │   ├── CephalometricAnalysisScreen.kt
                        │   ├── PredictionResultsScreen.kt
                        │   └── AIChatScreen.kt
                        ├── reports/
                        │   ├── ReportsScreen.kt
                        │   └── ReportViewerScreen.kt
                        ├── notifications/
                        │   └── NotificationsScreen.kt
                        ├── profile/
                        │   └── ProfileScreen.kt
                        └── settings/
                            └── SettingsScreen.kt
```

---

## 🛠️ Build & APK Generation Instructions

### Prerequisites
- Android Studio Ladybug / Koala or latest version installed
- Android SDK 35 installed
- JDK 17 configured in environment / Android Studio

### Step 1: Open Project in Android Studio
1. Launch Android Studio.
2. Select **Open** and choose the `BAMP_APP` directory.
3. Allow Gradle to sync dependencies.

### Step 2: Build Debug APK via Command Line
Run from inside `BAMP_APP/`:
```bash
./gradlew assembleDebug
```
The output APK will be generated at:
`app/build/outputs/apk/debug/app-debug.apk`

### Step 3: Build Production Signed APK
```bash
./gradlew assembleRelease
```
Output APK location:
`app/build/outputs/apk/release/app-release-unsigned.apk`

---

## 🔍 Verification & Audit Summary

| Requirement | Status | Verification Detail |
|---|---|---|
| Single Firebase Project | ✅ Verified | Connected to `bamp-1de96` via `google-services.json` |
| Shared Authentication | ✅ Verified | Firebase Auth `signInWithEmailAndPassword` & `createUserWithEmailAndPassword` |
| Shared Firestore Collections | ✅ Verified | Real-time snapshots on `users`, `patients`, `predictions`, `reports`, `notifications` |
| Shared Storage | ✅ Verified | Direct upload to `gs://bamp-1de96.appspot.com/xrays/` |
| 16 Native Screens | ✅ Verified | Full Jetpack Compose screens matching web app functionality |
| Offline Support | ✅ Verified | `setPersistenceEnabled(true)` enabled in `BampApplication.kt` |
