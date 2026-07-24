const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let db = null;
let auth = null;
let storageBucket = null;
let firebaseInitialized = false;

// In-Memory store fallback to ensure API endpoints never crash
const inMemoryStore = {
  users: new Map(),
  patients: new Map(),
  growthAssessments: new Map(),
  xrays: new Map(),
  landmarks: new Map(),
  cephalometricMeasurements: new Map(),
  predictions: new Map(),
  reports: new Map(),
  auditLogs: new Map(),
  otps: new Map()
};

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccountFilePaths = [
    path.join(__dirname, 'firebase-service-account.json'),
    path.join(__dirname, '../firebase/serviceAccountKey.json'),
    path.join(__dirname, '../../firebase/serviceAccountKey.json')
  ];

  let serviceAccount = null;

  // 1. Try loading from Service Account JSON file
  for (const filePath of serviceAccountFilePaths) {
    if (fs.existsSync(filePath)) {
      try {
        serviceAccount = require(filePath);
        console.log(`[Firebase Admin] Found service account file at: ${filePath}`);
        break;
      } catch (err) {
        console.warn(`[Firebase Admin] Could not parse JSON file at ${filePath}:`, err.message);
      }
    }
  }

  try {
    if (serviceAccount && serviceAccount.project_id && serviceAccount.private_key && !serviceAccount.private_key.includes('dummy_')) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: serviceAccount.storage_bucket || process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`
      });
      firebaseInitialized = true;
      console.log('[Firebase Admin] Successfully initialized via Service Account JSON file.');
    } 
    // 2. Try loading from Environment Variables
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('...')) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
      });
      firebaseInitialized = true;
      console.log('[Firebase Admin] Successfully initialized via Environment Variables.');
    } else {
      console.warn('[Firebase Admin] Firebase Admin SDK credentials not configured.');
    }
  } catch (error) {
    console.error('[Firebase Admin Initialization Error]:', error.message);
    console.warn('[Firebase Admin] Firebase Admin SDK credentials not configured.');
  }

  if (firebaseInitialized && admin.apps.length) {
    try {
      db = admin.firestore();
      auth = admin.auth();
      storageBucket = admin.storage().bucket();
    } catch (e) {
      console.warn('[Firebase Admin] Failed to obtain Firestore/Auth handles:', e.message);
    }
  }

  return admin;
};

// Execute initialization
initializeFirebaseAdmin();

module.exports = {
  admin,
  db,
  auth,
  storageBucket,
  firebaseInitialized,
  inMemoryStore
};
