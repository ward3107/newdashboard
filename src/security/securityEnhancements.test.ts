/**
 * Security Enhancements Tests
 * Tests for security utility functions and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SecurityManager, SecurityUtils } from './securityEnhancements';

// Mock crypto API
const mockCrypto = {
  getRandomValues: vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  }),
  subtle: {
    digest: vi.fn(async () => {
      // Return mock hash
      return new Uint8Array(32);
    }),
  },
};

// Setup global crypto mock
global.crypto = mockCrypto as any;

describe('SecurityUtils', () => {
  describe('validateInput', () => {
    it('should reject null input', () => {
      expect(SecurityUtils.validateInput(null as any)).toBe(false);
    });

    it('should reject undefined input', () => {
      expect(SecurityUtils.validateInput(undefined as any)).toBe(false);
    });

    it('should reject non-string input', () => {
      expect(SecurityUtils.validateInput(123 as any)).toBe(false);
    });

    it('should reject empty string', () => {
      expect(SecurityUtils.validateInput('')).toBe(false);
    });

    it('should detect script tags', () => {
      expect(SecurityUtils.validateInput('<script>alert("xss")</script>')).toBe(false);
    });

    it('should detect javascript: protocol', () => {
      expect(SecurityUtils.validateInput('javascript:alert(1)')).toBe(false);
    });

    it('should detect on*= handlers', () => {
      expect(SecurityUtils.validateInput('<div onclick="alert(1)">')).toBe(false);
    });

    it('should accept valid input', () => {
      expect(SecurityUtils.validateInput('Hello World')).toBe(true);
      expect(SecurityUtils.validateInput('12345')).toBe(true);
      expect(SecurityUtils.validateInput('test@example.com')).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove script tags', () => {
      const input = '<script>alert("xss")</script>Hello';
      expect(SecurityUtils.sanitizeInput(input)).toBe('Hello');
    });

    it('should remove javascript: protocol', () => {
      const input = 'javascript:alert(1)';
      expect(SecurityUtils.sanitizeInput(input)).toBe('');
    });

    it('should remove on*= handlers', () => {
      const input = '<div onclick="alert(1)">Click</div>';
      expect(SecurityUtils.sanitizeInput(input)).not.toContain('onclick');
    });

    it('should preserve safe HTML', () => {
      const input = '<p>Hello <strong>World</strong></p>';
      expect(SecurityUtils.sanitizeInput(input)).toBe(input);
    });

    it('should handle null input', () => {
      expect(SecurityUtils.sanitizeInput(null as any)).toBe('');
    });
  });

  describe('detectBot', () => {
    it('should detect headless chrome', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'HeadlessChrome',
        },
        writable: true,
      });

      expect(SecurityUtils.detectBot()).toBe(true);

      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('should detect puppeteer', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/',
        },
        writable: true,
      });

      expect(SecurityUtils.detectBot()).toBe(true);

      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });

    it('should allow normal browsers', () => {
      const originalNavigator = global.navigator;
      Object.defineProperty(global, 'navigator', {
        value: {
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        },
        writable: true,
      });

      expect(SecurityUtils.detectBot()).toBe(false);

      Object.defineProperty(global, 'navigator', {
        value: originalNavigator,
        writable: true,
      });
    });
  });

  describe('generateSecureId', () => {
    it('should generate unique IDs', () => {
      const id1 = SecurityUtils.generateSecureId();
      const id2 = SecurityUtils.generateSecureId();

      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should generate IDs with default length', () => {
      const id = SecurityUtils.generateSecureId();
      expect(id.length).toBe(48); // 24 bytes * 2 hex chars
    });

    it('should generate IDs with custom length', () => {
      const id = SecurityUtils.generateSecureId(16);
      expect(id.length).toBe(32); // 16 bytes * 2 hex chars
    });

    it('should generate hex string', () => {
      const id = SecurityUtils.generateSecureId();
      expect(id).toMatch(/^[0-9a-f]+$/);
    });
  });
});

describe('SecurityManager', () => {
  let securityManager: SecurityManager;

  beforeEach(() => {
    // Reset singleton
    (SecurityManager as any).instance = null;
    securityManager = SecurityManager.getInstance();
  });

  describe('CSRF Token Management', () => {
    it('should generate valid CSRF tokens', () => {
      const token = securityManager.generateCSRFToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should validate valid CSRF tokens', () => {
      const token = securityManager.generateCSRFToken();
      expect(securityManager.validateCSRFToken(token)).toBe(true);
    });

    it('should reject invalid CSRF tokens', () => {
      expect(securityManager.validateCSRFToken('invalid-token')).toBe(false);
    });

    it('should reject expired CSRF tokens', async () => {
      const token = securityManager.generateCSRFToken();

      // Manually expire the token
      const tokens = (securityManager as any).tokens;
      if (tokens.has(token)) {
        const tokenData = tokens.get(token);
        tokenData.expiresAt = Date.now() - 1000;
      }

      expect(securityManager.validateCSRFToken(token)).toBe(false);
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', () => {
      const identifier = 'test-user-1';

      for (let i = 0; i < 5; i++) {
        expect(securityManager.checkRateLimit(identifier, 10)).toBe(true);
      }
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2';

      // Exhaust the limit
      for (let i = 0; i < 10; i++) {
        securityManager.checkRateLimit(identifier, 10);
      }

      // Should be blocked
      expect(securityManager.checkRateLimit(identifier, 10)).toBe(false);
    });

    it('should reset rate limit after time window', () => {
      const identifier = 'test-user-3';

      // Exhaust the limit
      for (let i = 0; i < 10; i++) {
        securityManager.checkRateLimit(identifier, 10);
      }

      // Manually expire the rate limit entry
      const limits = (securityManager as any).rateLimits;
      if (limits.has(identifier)) {
        const limit = limits.get(identifier);
        limit.lastReset = Date.now() - 3600001; // More than 1 hour ago
      }

      // Should be allowed again
      expect(securityManager.checkRateLimit(identifier, 10)).toBe(true);
    });
  });

  describe('Form Integrity Validation', () => {
    it('should validate complete forms', () => {
      const data = {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
      };
      const requiredFields = ['field1', 'field2', 'field3'];

      expect(securityManager.validateFormIntegrity(data, requiredFields)).toBe(true);
    });

    it('should reject incomplete forms', () => {
      const data = {
        field1: 'value1',
        field2: 'value2',
      };
      const requiredFields = ['field1', 'field2', 'field3'];

      expect(securityManager.validateFormIntegrity(data, requiredFields)).toBe(false);
    });

    it('should handle extra fields', () => {
      const data = {
        field1: 'value1',
        field2: 'value2',
        field3: 'value3',
        field4: 'extra',
      };
      const requiredFields = ['field1', 'field2', 'field3'];

      expect(securityManager.validateFormIntegrity(data, requiredFields)).toBe(true);
    });
  });

  describe('Origin Validation', () => {
    it('should validate allowed origins', () => {
      const origin = 'http://localhost:5173';
      expect(securityManager.validateOrigin(origin)).toBe(true);
    });

    it('should reject blocked origins', () => {
      const origin = 'http://malicious-site.com';
      expect(securityManager.validateOrigin(origin)).toBe(false);
    });

    it('should allow same-origin requests', () => {
      const origin = window.location.origin;
      expect(securityManager.validateOrigin(origin)).toBe(true);
    });
  });

  describe('Security Status', () => {
    it('should return security status', async () => {
      const status = await securityManager.getSecurityStatus();

      expect(status).toHaveProperty('isSecure');
      expect(status).toHaveProperty('rateLimitActive');
      expect(status).toHaveProperty('activeTokens');
      expect(status).toHaveProperty('rateLimitsCount');
    });
  });

  describe('Cleanup', () => {
    it('should cleanup event listeners and data', () => {
      securityManager.cleanup();

      const limits = (securityManager as any).rateLimits;
      const tokens = (securityManager as any).tokens;

      expect(limits.size).toBe(0);
      expect(tokens.size).toBe(0);
    });
  });
});
