/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */

import React, { createContext, useEffect, useState, useCallback } from 'react';
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  onAuthStateChanged,
  sendEmailVerification,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type {
  User,
  AuthContextState,
  LoginCredentials,
  SignupData,
  UserRole,
} from '../types/auth';

/**
 * Auth Context
 */
export const AuthContext = createContext<AuthContextState | undefined>(undefined);

/**
 * Props for AuthProvider
 */
interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Google Auth Provider instance
 */
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Force account selection
});

/**
 * Auth Provider Component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch user data from Firestore
   */
  const fetchUserData = useCallback(async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        console.error('User document not found in Firestore');
        return null;
      }

      const userData = userDoc.data() as User;

      // Convert Firestore Timestamps to Dates
      return {
        ...userData,
        uid: firebaseUser.uid,
        email: firebaseUser.email || userData.email,
        photoURL: firebaseUser.photoURL || userData.photoURL,
        createdAt: userData.createdAt instanceof Date
          ? userData.createdAt
          : new Date(userData.createdAt),
        lastLogin: userData.lastLogin instanceof Date
          ? userData.lastLogin
          : userData.lastLogin
          ? new Date(userData.lastLogin)
          : undefined,
      };
    } catch (err) {
      console.error('Error fetching user data:', err);
      return null;
    }
  }, []);

  /**
   * Update last login timestamp
   */
  const updateLastLogin = useCallback(async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLogin: serverTimestamp(),
      });
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  }, []);

  /**
   * Listen to auth state changes
   */
  useEffect(() => {
    console.log('🔐 AuthContext: Setting up auth listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔐 AuthContext: Auth state changed', { firebaseUser: firebaseUser?.email || 'none' });

      if (firebaseUser) {
        // User is signed in
        console.log('🔐 AuthContext: User is signed in, fetching data');
        const userData = await fetchUserData(firebaseUser);

        if (userData) {
          console.log('🔐 AuthContext: User data found', { email: userData.email, role: userData.role });
          setUser(userData);
          await updateLastLogin(firebaseUser.uid);
        } else {
          // User exists in Firebase Auth but not in Firestore
          console.log('🔐 AuthContext: User data NOT found in Firestore');
          setUser(null);
          setError('User data not found. Please contact support.');
        }
      } else {
        // User is signed out
        console.log('🔐 AuthContext: No user signed in');
        setUser(null);
      }

      console.log('🔐 AuthContext: Setting loading to false');
      setLoading(false);
    }, (error) => {
      console.error('🔐 AuthContext: Auth listener error', error);
      setUser(null);
      setLoading(false);
    });

    return unsubscribe;
  }, [fetchUserData, updateLastLogin]);

  /**
   * Login with email and password
   */
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
      }

      // Fetch user data
      const userData = await fetchUserData(userCredential.user);

      if (!userData) {
        await signOut(auth);
        throw new Error('User data not found. Please contact support.');
      }

      // Check if account is active
      if (!userData.isActive) {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact your school administrator.');
      }

      setUser(userData);
    } catch (err: any) {
      console.error('Login error:', err);

      // User-friendly error messages
      let errorMessage = 'Login failed. Please try again.';

      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password.';
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  /**
   * Login with Google
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const userCredential = await signInWithPopup(auth, googleProvider);

      // Fetch user data
      const userData = await fetchUserData(userCredential.user);

      if (!userData) {
        await signOut(auth);
        throw new Error('User data not found. Please contact support to set up your account.');
      }

      // Check if account is active
      if (!userData.isActive) {
        await signOut(auth);
        throw new Error('Your account has been deactivated. Please contact your school administrator.');
      }

      setUser(userData);
    } catch (err: any) {
      console.error('Google login error:', err);

      let errorMessage = 'Google login failed. Please try again.';

      if (err.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login cancelled.';
      } else if (err.code === 'auth/popup-blocked') {
        errorMessage = 'Popup blocked. Please enable popups for this site.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [fetchUserData]);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Logout failed. Please try again.');
      throw err;
    }
  }, []);

  /**
   * Signup (for admins to create accounts)
   */
  const signup = useCallback(async (data: SignupData) => {
    try {
      setError(null);
      setLoading(true);

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update display name
      await firebaseUpdateProfile(userCredential.user, {
        displayName: data.displayName,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Create Firestore user document
      const newUser: User = {
        uid: userCredential.user.uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role,
        schoolId: data.schoolId,
        createdAt: new Date(),
        isActive: true,
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
      });

      // Sign out (require email verification before login)
      await signOut(auth);

      console.log('User created successfully. Please verify email.');
    } catch (err: any) {
      console.error('Signup error:', err);

      let errorMessage = 'Signup failed. Please try again.';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (err: any) {
      console.error('Password reset error:', err);

      let errorMessage = 'Password reset failed. Please try again.';

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      setError(null);

      if (!user) {
        throw new Error('No user logged in');
      }

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), data);

      // Update Firebase Auth profile if display name changed
      if (data.displayName && auth.currentUser) {
        await firebaseUpdateProfile(auth.currentUser, {
          displayName: data.displayName,
        });
      }

      // Update local state
      setUser({ ...user, ...data });
    } catch (err: any) {
      console.error('Profile update error:', err);
      setError('Profile update failed. Please try again.');
      throw err;
    }
  }, [user]);

  /**
   * Context value
   */
  const value: AuthContextState = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    logout,
    signup,
    resetPassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
