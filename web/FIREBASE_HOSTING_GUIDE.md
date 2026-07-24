# 🚀 Complete Firebase Hosting & Deployment Guide

This guide covers deploying the **AI BAMP Treatment Outcome Predictor** web application directly to **Firebase Hosting** for project `bamp-1de96`.

---

## 📋 Prerequisites

1. Install Firebase CLI globally (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. Login to your Firebase account:
   ```bash
   firebase login
   ```

---

## ⚡ Quick Deploy (Frontend Web App to Firebase Hosting)

### Step 1: Build the Production App
Run the Vite production build command inside the project:
```bash
cd web/frontend
npm run build
```
This compiles the web application into `web/frontend/dist/`.

### Step 2: Deploy to Firebase Hosting
From the root project directory (`AI BAMP TREAMENT`), run:
```bash
npx firebase deploy --only hosting
```

Your web app will be live at:
- 🌐 `https://bamp-1de96.web.app`
- 🌐 `https://bamp-1de96.firebaseapp.com`

---

## ⚙️ How Firebase Hosting is Configured

The project contains pre-configured Firebase files:

1. **`.firebaserc`**:
   Points to your active Firebase project:
   ```json
   {
     "projects": {
       "default": "bamp-1de96"
     }
   }
   ```

2. **`firebase.json`**:
   Configures Firebase Hosting build directory and Single-Page Application (SPA) routing:
   ```json
   {
     "hosting": {
       "public": "web/frontend/dist",
       "ignore": [
         "firebase.json",
         "**/.*",
         "**/node_modules/**"
       ],
       "rewrites": [
         {
           "source": "**",
           "destination": "/index.html"
         }
       ]
     },
     "firestore": {
       "rules": "web/firebase/firestore.rules",
       "indexes": "web/firebase/firestore.indexes.json"
     }
   }
   ```

---

## 🌐 Deploying the Backend API & Python Microservice

Firebase Hosting serves your frontend static assets. For hosting the backend API & Python AI service on Google Cloud / Firebase infrastructure:

### Option 1: Google Cloud Run (Recommended for Node + Python Microservices)
1. Deploy Backend API to Cloud Run:
   ```bash
   cd web/backend
   gcloud run deploy bamp-backend-api --source . --region us-central1 --allow-unauthenticated
   ```

2. Deploy Python AI Service to Cloud Run:
   ```bash
   cd web/backend/ai-service
   gcloud run deploy bamp-ai-service --source . --region us-central1 --allow-unauthenticated
   ```

3. Update `web/frontend/.env` with your production API URL:
   ```env
   VITE_API_BASE_URL=https://bamp-backend-api-xxxx-uc.a.run.app/api
   ```
   Rebuild (`npm run build`) and deploy (`npx firebase deploy`).

---

## 🛠️ Deploying Security Rules & Firestore Indexes

To push your Firestore Security Rules and Indexes:
```bash
npx firebase deploy --only firestore
```
