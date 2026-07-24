# Environment Variables Guide

## Backend (.env inside `web/backend/.env`)

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=super_secret_bamp_jwt_key_2026_production
JWT_EXPIRES_IN=24h
AI_SERVICE_URL=http://localhost:8000

# Email Nodemailer configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=notifications@bamportho.ai
EMAIL_PASS=app_password_here
```

## Frontend (.env inside `web/frontend/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyDummyKeyForBampApp
VITE_FIREBASE_AUTH_DOMAIN=bamp-ai-predictor.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bamp-ai-predictor
VITE_FIREBASE_STORAGE_BUCKET=bamp-ai-predictor.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef123456
```
