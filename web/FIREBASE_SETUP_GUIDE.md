# Firebase Setup Guide

## 1. Create a Firebase Project
1. Navigate to [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it `bamp-ai-predictor`.
3. Enable **Firebase Authentication**, **Cloud Firestore**, and **Firebase Storage**.

## 2. Authentication Setup
1. In Firebase Console, go to **Authentication** > **Sign-in method**.
2. Enable **Email/Password**.

## 3. Cloud Firestore Setup
1. Navigate to **Firestore Database** > **Create database**.
2. Choose a database location (e.g., `us-central`).
3. Apply the security rules from `web/firebase/firestore.rules`.

## 4. Service Account Credentials (Backend)
1. Go to **Project Settings** > **Service Accounts**.
2. Click **Generate New Private Key**.
3. Save key as `firebaseAdmin.json` inside `web/backend/src/firebase/`.

## 5. Web App Configuration (Frontend)
1. Go to **Project Settings** > **General** > **Your apps** > **Web**.
2. Copy the firebaseConfig JSON and paste into `web/frontend/src/firebase/firebaseConfig.js`.
