# API Documentation - AI BAMP Predictor System

Base URL: `http://localhost:5000/api`

---

## 🔐 Authentication Endpoints

### 1. Register User
`POST /auth/register`
- **Body**:
  ```json
  {
    "fullName": "Dr. Sarah Jenkins",
    "email": "sarah.jenkins@orthocenter.org",
    "mobileNumber": "+1234567890",
    "hospitalName": "St. Jude Orthodontic Institute",
    "role": "Orthodontist",
    "password": "Password1!",
    "confirmPassword": "Password1!"
  }
  ```
- **Response**: `{ "success": true, "message": "OTP sent to email for verification", "email": "..." }`

### 2. Verify OTP
`POST /auth/verify-otp`
- **Body**: `{ "email": "...", "otp": "123456" }`
- **Response**: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

### 3. Login
`POST /auth/login`
- **Body**: `{ "email": "...", "password": "..." }`
- **Response**: `{ "success": true, "token": "JWT_TOKEN", "user": { ... } }`

### 4. Resend OTP
`POST /auth/resend-otp`

### 5. Forgot Password
`POST /auth/forgot-password`

### 6. Reset Password
`POST /auth/reset-password`

---

## 👨‍⚕️ Patient Management Endpoints

### 1. Get All Patients
`GET /patients` (Headers: `Authorization: Bearer <JWT>`)

### 2. Add New Patient
`POST /patients`

### 3. Get Patient Details
`GET /patients/:id`

### 4. Update Patient
`PUT /patients/:id`

### 5. Delete Patient
`DELETE /patients/:id`

---

## 🖼️ X-Ray Endpoints

### 1. Upload X-Ray Image
`POST /xray/upload` (Form Data: `file`, `patientId`)

### 2. Get X-Ray Metadata
`GET /xray/:id`

---

## 🤖 AI Endpoints

### 1. Detect Cephalometric Landmarks
`POST /ai/detect-landmarks`
- **Body**: `{ "xrayId": "...", "imageUrl": "..." }`

### 2. Calculate Cephalometric Measurements
`POST /ai/calculate-measurements`
- **Body**: `{ "patientId": "...", "landmarks": { ... } }`

### 3. Predict BAMP Success Outcome
`POST /ai/predict`
- **Body**: `{ "patientId": "...", "age": 11, "gender": "Female", "cvmStage": "CVM 3", "growthPotential": "High", "measurements": { ... } }`

---

## 📊 Dashboard & Reports

### 1. Get Dashboard Statistics
`GET /dashboard/stats`

### 2. Generate PDF Report
`POST /report/generate`
- **Body**: `{ "patientId": "...", "predictionId": "..." }`
