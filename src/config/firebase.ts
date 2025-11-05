/**
 * Firebase Configuration
 * Initializes Firebase services (Auth, Firestore, and Cloud Functions)
 */

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
 * Validate Firebase configuration
 */
function validateConfig(): boolean {
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
    console.warn(
      `⚠️ Missing Firebase configuration: ${missingKeys.join(', ')}\n` +
      'Firestore features will be disabled. App will use mock data.\n' +
      'To enable Firestore, set all VITE_FIREBASE_* variables in your environment.\n' +
      'See docs/FIREBASE_SETUP_GUIDE.md for instructions.'
    );
    return false;
  }
  return true;
}

// Validate configuration before initializing
const isConfigValid = validateConfig();

/**
 * Initialize Firebase App (only if config is valid)
 */
export let app: ReturnType<typeof initializeApp> | null = null;
export let auth: ReturnType<typeof getAuth> | null = null;
export let db: ReturnType<typeof getFirestore> | null = null;
export let functions: ReturnType<typeof getFunctions> | null = null;

try {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    functions = getFunctions(app);
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase not initialized - using mock data mode');
  }
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  console.warn('⚠️ Falling back to mock data mode');
  app = null;
  auth = null;
  db = null;
  functions = null;
}

/**
 * Connect to Firebase Emulators (for local development)
 * Uncomment these lines if you want to use Firebase Emulators
 */
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' && auth && db && functions) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
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
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  isEmulator: import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true',
  isAvailable: isFirebaseAvailable(),
};

// Firebase initialized - configuration available in firebaseInfo object

export default app;
