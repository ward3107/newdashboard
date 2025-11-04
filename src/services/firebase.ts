/**
 * Firebase Configuration and Initialization
 * Provides Firestore database access for the dashboard
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFunctions, Functions } from 'firebase/functions';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('PASTE_YOUR')
);

// Initialize Firebase
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    functions = getFunctions(app);

    if (import.meta.env.DEV) {
      console.log('✅ Firebase initialized successfully');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error);
  }
} else {
  if (import.meta.env.DEV) {
    console.warn('⚠️ Firebase not configured. Set Firebase environment variables in .env');
  }
}

export { app, db, functions, isFirebaseConfigured };
export default db;
