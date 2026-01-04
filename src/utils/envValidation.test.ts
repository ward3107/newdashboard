/**
 * Environment Validation Tests
 * Tests for production environment variable validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateProductionEnv,
  getEnvSummary,
  assertProductionEnvValid,
} from './envValidation';

// Mock import.meta.env
const mockEnv = {
  MODE: 'production',
  PROD: true,
  DEV: false,
  VITE_FIREBASE_API_KEY: 'test-api-key-123',
  VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'test-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
  VITE_SENTRY_DSN: 'https://test@sentry.io/123',
  VITE_USE_FIRESTORE: 'true',
  VITE_SCHOOL_ID: 'test-school',
  VITE_API_URL: '',
  VITE_OPTIMIZATION_API_URL: '',
  VITE_APP_VERSION: '1.0.0',
};

describe('Environment Validation', () => {
  beforeEach(() => {
    // Reset environment
    vi.stubGlobal('import.meta', { env: { ...mockEnv } });
  });

  describe('validateProductionEnv', () => {
    it('should pass with complete Firebase configuration', () => {
      const result = validateProductionEnv();

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail with missing Firebase configuration', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_PROJECT_ID: '',
      };

      const result = validateProductionEnv();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Firebase'))).toBe(true);
    });

    it('should warn about missing Sentry DSN', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_SENTRY_DSN: '',
      };

      const result = validateProductionEnv();

      expect(result.warnings.some(w => w.includes('Sentry'))).toBe(true);
    });

    it('should warn about missing optimization API URL', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_OPTIMIZATION_API_URL: '',
      };

      const result = validateProductionEnv();

      expect(result.warnings.some(w => w.includes('OPTIMIZATION_API_URL'))).toBe(true);
    });

    it('should warn about invalid Firebase API key format', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_FIREBASE_API_KEY: 'invalid-key-format',
      };

      const result = validateProductionEnv();

      expect(result.warnings.some(w => w.includes('API_KEY'))).toBe(true);
    });

    it('should skip validation in development mode', () => {
      (import.meta as any).env = {
        ...mockEnv,
        MODE: 'development',
        DEV: true,
        PROD: false,
      };

      const result = validateProductionEnv();

      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.includes('skipped'))).toBe(true);
    });

    it('should require SCHOOL_ID when using Firestore', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_USE_FIRESTORE: 'true',
        VITE_SCHOOL_ID: '',
      };

      const result = validateProductionEnv();

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('SCHOOL_ID'))).toBe(true);
    });
  });

  describe('getEnvSummary', () => {
    it('should return environment summary', () => {
      const summary = getEnvSummary();

      expect(summary).toHaveProperty('mode');
      expect(summary).toHaveProperty('isProduction');
      expect(summary).toHaveProperty('isDevelopment');
      expect(summary).toHaveProperty('useFirestore');
      expect(summary).toHaveProperty('firebaseConfigured');
      expect(summary).toHaveProperty('schoolId');
      expect(summary).toHaveProperty('sentryConfigured');
      expect(summary).toHaveProperty('optimizationApiConfigured');
    });

    it('should reflect current environment state', () => {
      (import.meta as any).env = {
        ...mockEnv,
        MODE: 'development',
      };

      const summary = getEnvSummary();

      expect(summary.mode).toBe('development');
      expect(summary.isDevelopment).toBe(true);
      expect(summary.isProduction).toBe(false);
    });

    it('should detect Firestore configuration', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_FIREBASE_PROJECT_ID: 'my-project',
      };

      const summary = getEnvSummary();

      expect(summary.firebaseConfigured).toBe(true);
    });

    it('should detect missing Firestore configuration', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_FIREBASE_PROJECT_ID: '',
      };

      const summary = getEnvSummary();

      expect(summary.firebaseConfigured).toBe(false);
    });
  });

  describe('assertProductionEnvValid', () => {
    it('should not throw with valid configuration', () => {
      expect(() => assertProductionEnvValid()).not.toThrow();
    });

    it('should throw in production with invalid configuration', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_PROJECT_ID: '',
      };

      // Note: This will throw because PROD is true
      expect(() => assertProductionEnvValid()).toThrow(Error);
    });

    it('should not throw in development with invalid configuration', () => {
      (import.meta as any).env = {
        ...mockEnv,
        MODE: 'development',
        DEV: true,
        PROD: false,
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_PROJECT_ID: '',
      };

      expect(() => assertProductionEnvValid()).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty environment variables', () => {
      (import.meta as any).env = {
        MODE: 'production',
        PROD: true,
        DEV: false,
        VITE_FIREBASE_API_KEY: '',
        VITE_FIREBASE_AUTH_DOMAIN: '',
        VITE_FIREBASE_PROJECT_ID: '',
        VITE_FIREBASE_STORAGE_BUCKET: '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '',
        VITE_FIREBASE_APP_ID: '',
        VITE_SENTRY_DSN: '',
        VITE_USE_FIRESTORE: '',
        VITE_SCHOOL_ID: '',
        VITE_API_URL: '',
        VITE_OPTIMIZATION_API_URL: '',
        VITE_APP_VERSION: '',
      };

      const result = validateProductionEnv();

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should handle malformed Sentry DSN (no validation currently)', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_SENTRY_DSN: 'not-a-valid-dsn',
      };

      const result = validateProductionEnv();

      // Currently no format validation for Sentry DSN
      // Just checking it doesn't crash
      expect(result).toBeDefined();
    });

    it('should handle optimization API URL without protocol (no validation currently)', () => {
      (import.meta as any).env = {
        ...mockEnv,
        VITE_OPTIMIZATION_API_URL: 'invalid-url-without-protocol',
      };

      const result = validateProductionEnv();

      // Currently no format validation for optimization API URL
      // Just checking it doesn't crash
      expect(result).toBeDefined();
    });
  });
});
