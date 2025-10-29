/**
 * Firebase Configuration
 * Initializes Firebase services (Auth and Firestore)
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

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
 * Validate Firebase configuration
 */
function validateConfig() {
  const requiredKeys = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingKeys = requiredKeys.filter(
    (key) => !firebaseConfig[key as keyof typeof firebaseConfig]
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing Firebase configuration: ${missingKeys.join(', ')}\n` +
      'Please check your .env file and ensure all VITE_FIREBASE_* variables are set.\n' +
      'See docs/FIREBASE_SETUP_GUIDE.md for instructions.'
    );
  }
}

// Validate configuration before initializing
validateConfig();

/**
 * Initialize Firebase App
 */
export const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 */
export const auth = getAuth(app);

/**
 * Initialize Firestore Database
 */
export const db = getFirestore(app);

/**
 * Connect to Firebase Emulators (for local development)
 * Uncomment these lines if you want to use Firebase Emulators
 */
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  console.log('🔧 Connected to Firebase Emulators');
}

/**
 * Firebase configuration info (for debugging)
 */
export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isEmulator: import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
};

// Log Firebase initialization in development
if (import.meta.env.DEV) {
  console.log('🔥 Firebase initialized:', {
    projectId: firebaseInfo.projectId,
    authDomain: firebaseInfo.authDomain,
    emulator: firebaseInfo.isEmulator,
  });
}

export default app;
