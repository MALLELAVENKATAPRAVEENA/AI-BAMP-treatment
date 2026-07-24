import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBamp1de96ApiKeyProduction",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "bamp-1de96.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bamp-1de96",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "bamp-1de96.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "111605092071944690207",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:111605092071944690207:web:bamp1de96app"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
