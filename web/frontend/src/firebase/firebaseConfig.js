import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
const envAppId = import.meta.env.VITE_FIREBASE_APP_ID || "";

// Detect if user passed App ID into VITE_FIREBASE_API_KEY
let finalApiKey = envApiKey.startsWith("AIzaSy") ? envApiKey : "";
let finalAppId = envAppId;
let finalSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "824105088863";

if (envApiKey.startsWith("1:")) {
  finalAppId = envApiKey;
  const parts = envApiKey.split(":");
  if (parts.length > 1) finalSenderId = parts[1];
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCfKQNXwdARp9qJAz1IOi1k8VEmN3iiiFk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bamp-1de96.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bamp-1de96",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bamp-1de96.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "824105088863",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:824105088863:web:c9c542beec73897aa8a8ea",
  measurementId: "G-3HCD21BVCL"
};

let app;
let auth;
let db;
let storage;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  enableIndexedDbPersistence(db).catch((pErr) => {
    console.info('[Firebase Offline Persistence] Info/Notice:', pErr.code);
  });
} catch (err) {
  console.warn('[Firebase SDK Notice] Web Firebase SDK initialization note:', err.message);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, storage };
export default app;
