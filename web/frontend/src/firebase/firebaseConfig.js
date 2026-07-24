import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || "";
const isValidKey = apiKey && !apiKey.includes("Dummy") && !apiKey.includes("Production");

const firebaseConfig = {
  apiKey: isValidKey ? apiKey : "AIzaSyBamp1de96RealApiKeyPlaceholder",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bamp-1de96.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bamp-1de96",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bamp-1de96.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "111605092071944690207",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:111605092071944690207:web:bamp1de96app"
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
} catch (err) {
  console.warn('[Firebase SDK Notice] Web Firebase Auth SDK initialization note:', err.message);
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { app, auth, db, storage };
export default app;
