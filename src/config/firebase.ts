/**
 * Firebase Configuration
 * Initializes Firebase services (Auth, Firestore, and Cloud Functions)
 */

import logger from '../utils/logger';
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

/**
 * Firebase configuration from environment variables
 * These values come from your .env file
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/**
 * Check if Firebase configuration is complete
 */
function isFirebaseConfigured() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  return requiredKeys.every(
    (key) => firebaseConfig[key as keyof typeof firebaseConfig]
  );
}

const firebaseConfigured = isFirebaseConfigured();

// Only warn during development, not during build
if (!firebaseConfigured && import.meta.env.DEV) {
  logger.warn(
    '⚠️ Firebase not configured. Set VITE_FIREBASE_* environment variables.\n' +
    'See docs/FIREBASE_SETUP_GUIDE.md for instructions.'
  );
}

/**
 * Initialize Firebase App (only if configured)
 */
export const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;

/**
 * Initialize Firebase Authentication (only if configured)
 */
export const auth = app ? getAuth(app) : null;

/**
 * Initialize Firestore Database (only if configured)
 */
export const db = app ? getFirestore(app) : null;

/**
 * Initialize Firebase Cloud Functions (only if configured)
 */
export const functions = app ? getFunctions(app) : null;

/**
 * Connect to Firebase Emulators (for local development)
 */
if (app && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  if (auth) connectAuthEmulator(auth, 'http://localhost:9099');
  if (db) connectFirestoreEmulator(db, 'localhost', 8080);
  if (functions) connectFunctionsEmulator(functions, 'localhost', 5001);
}

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseAvailable = (): boolean => {
  return app !== null && db !== null;
};

/**
 * Firebase configuration info (for debugging)
 */
export const firebaseInfo = {
  configured: firebaseConfigured,
  projectId: firebaseConfig.projectId || null,
  authDomain: firebaseConfig.authDomain || null,
  isEmulator: import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
  isAvailable: isFirebaseAvailable(),
};

export default app;
