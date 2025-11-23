/**
 * TEMPORARY MOCK AUTHENTICATION
 *
 * ⚠️ FOR TESTING ONLY - REMOVE BEFORE PRODUCTION ⚠️
 *
 * This provides a simple authentication bypass for testing
 * without Firebase setup. Delete this file when Firebase is configured.
 */

import type { User, UserRole } from '../types/auth';

// Test users - you can log in with any of these
export const MOCK_USERS = {
  teacher: {
    uid: 'mock-teacher-001',
    email: 'teacher@test.com',
    password: 'teacher123', // ⚠️ Never do this in production!
    displayName: 'Test Teacher',
    role: 'teacher' as UserRole,
    schoolId: 'school-001',
    isActive: true,
    createdAt: new Date(),
  },
  admin: {
    uid: 'mock-admin-001',
    email: 'admin@test.com',
    password: 'admin123',
    displayName: 'Test Admin',
    role: 'admin' as UserRole,
    schoolId: 'school-001',
    isActive: true,
    createdAt: new Date(),
  },
  manager: {
    uid: 'mock-manager-001',
    email: 'manager@test.com',
    password: 'manager123',
    displayName: 'Test Manager',
    role: 'teacher' as UserRole, // Managers have teacher role
    schoolId: 'school-001',
    isActive: true,
    createdAt: new Date(),
  },
};

/**
 * Mock login function
 */
export const mockLogin = (email: string, password: string): User | null => {
  const user = Object.values(MOCK_USERS).find(
    (u) => u.email === email && u.password === password
  );

  if (user) {
    // Don't store password in returned user
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  return null;
};

/**
 * Check if we should use mock auth (Firebase not configured)
 */
export const shouldUseMockAuth = (): boolean => {
  // Check if Firebase environment variables are set
  const firebaseConfigured =
    import.meta.env.VITE_FIREBASE_API_KEY &&
    import.meta.env.VITE_FIREBASE_PROJECT_ID;

  return !firebaseConfigured;
};

/**
 * Store mock auth session
 */
export const setMockAuthSession = (user: User): void => {
  localStorage.setItem('mock_auth_user', JSON.stringify(user));
};

/**
 * Get mock auth session
 */
export const getMockAuthSession = (): User | null => {
  const stored = localStorage.getItem('mock_auth_user');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
};

/**
 * Clear mock auth session
 */
export const clearMockAuthSession = (): void => {
  localStorage.removeItem('mock_auth_user');
};

/**
 * Get list of available test accounts
 */
export const getTestAccounts = () => {
  return Object.entries(MOCK_USERS).map(([key, user]) => ({
    role: key,
    email: user.email,
    password: user.password,
    displayName: user.displayName,
  }));
};
