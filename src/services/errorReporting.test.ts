/**
 * Error Reporting Service Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { errorReporting, reportError, reportWarning, setUserContext, clearUserContext } from './errorReporting';

// Mock console methods
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    onLine: true,
    userAgent: 'Test User Agent',
  },
  writable: true,
});

// Mock window location
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://example.com/test',
  },
  writable: true,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Mock gtag
const mockGtag = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

describe('Error Reporting Service', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset environment
    vi.stubEnv('MODE', 'test');
    vi.stubEnv('VITE_APP_VERSION', '1.0.0');

    // Clear error queue
    (errorReporting as any).errorQueue = [];
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Basic Error Reporting', () => {
    it('should report errors to the queue', () => {
      const error = new Error('Test error');
      const context = { component: 'TestComponent' };

      errorReporting.reportError(error, context);

      expect((errorReporting as any).errorQueue).toHaveLength(1);
      expect((errorReporting as any).errorQueue[0]).toMatchObject({
        error: expect.any(Error),
        level: 'error',
        context: {
          component: 'TestComponent',
          userAgent: 'Test User Agent',
          url: 'https://example.com/test',
        }
      });
    });

    it('should report warnings', () => {
      errorReporting.reportMessage('Test warning', 'warning');

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test warning',
        fatal: false,
      });
    });

    it('should not report info messages in production', () => {
      vi.stubEnv('MODE', 'production');

      errorReporting.reportMessage('Test info', 'info');

      expect(mockGtag).not.toHaveBeenCalled();
    });
  });

  describe('User Context', () => {
    it('should set user context', () => {
      setUserContext('user123', { name: 'Test User' });

      expect((errorReporting as any).config.userId).toBe('user123');
    });

    it('should clear user context', () => {
      setUserContext('user123');
      clearUserContext();

      expect((errorReporting as any).config.userId).toBeUndefined();
    });
  });

  describe('Error Processing', () => {
    it('should process errors when online', async () => {
      const error = new Error('Test error');
      errorReporting.reportError(error, { component: 'TestComponent' });

      // Process should happen automatically
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Test error',
        fatal: false,
      });
    });

    it('should queue errors when offline', () => {
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, onLine: false },
        writable: true,
      });

      const error = new Error('Test error');
      errorReporting.reportError(error, { component: 'TestComponent' });

      expect((errorReporting as any).errorQueue).toHaveLength(1);
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should process queued errors when coming back online', async () => {
      // Start offline
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, onLine: false },
        writable: true,
      });

      const error = new Error('Test error');
      errorReporting.reportError(error, { component: 'TestComponent' });

      expect((errorReporting as any).errorQueue).toHaveLength(1);

      // Come back online
      Object.defineProperty(window, 'navigator', {
        value: { ...window.navigator, onLine: true },
        writable: true,
      });

      // Trigger online event
      window.dispatchEvent(new Event('online'));

      await new Promise(resolve => setTimeout(resolve, 0));

      expect((errorReporting as any).errorQueue).toHaveLength(0);
      expect(mockGtag).toHaveBeenCalled();
    });
  });

  describe('Local Storage Integration', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'development');
    });

    it('should store errors in local storage in development', () => {
      mockLocalStorage.getItem.mockReturnValue('[]');

      const error = new Error('Test error');
      errorReporting.reportError(error, { component: 'TestComponent' });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'debug_errors',
        expect.stringContaining('Test error')
      );
    });

    it('should retrieve recent errors from local storage', () => {
      const mockErrors = [
        {
          error: { message: 'Test error 1' },
          context: { component: 'TestComponent' },
          timestamp: '2023-01-01T00:00:00.000Z',
        },
        {
          error: { message: 'Test error 2' },
          context: { component: 'TestComponent' },
          timestamp: '2023-01-01T00:00:01.000Z',
        },
      ];

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockErrors));

      const recentErrors = errorReporting.getRecentErrors(2);

      expect(recentErrors).toHaveLength(2);
      expect(recentErrors[0].error.message).toBe('Test error 1');
    });

    it('should clear stored errors', () => {
      errorReporting.clearStoredErrors();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('debug_errors');
    });

    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('localStorage is full');
      });

      expect(() => {
        const error = new Error('Test error');
        errorReporting.reportError(error, { component: 'TestComponent' });
      }).not.toThrow();
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize error objects', () => {
      const error = new Error('Test error');
      (error as any).sensitiveData = 'secret';
      (error as any).apiKey = '12345';

      errorReporting.reportError(error, { component: 'TestComponent' });

      const errorReport = (errorReporting as any).errorQueue[0];
      expect(errorReport.error.sensitiveData).toBeUndefined();
      expect(errorReport.error.apiKey).toBeUndefined();
      expect(errorReport.error.message).toBe('Test error');
      expect(errorReport.error.name).toBe('Error');
    });
  });

  describe('Global Error Handlers', () => {
    it('should handle uncaught errors', () => {
      const error = new Error('Uncaught error');

      // Simulate uncaught error
      window.dispatchEvent(new ErrorEvent('error', { error }));

      expect((errorReporting as any).errorQueue.length).toBeGreaterThan(0);
    });

    it('should handle unhandled promise rejections', () => {
      const error = new Error('Unhandled rejection');

      // Simulate unhandled promise rejection
      window.dispatchEvent(new PromiseRejectionEvent('unhandledrejection', {
        reason: error,
      }));

      expect((errorReporting as any).errorQueue.length).toBeGreaterThan(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should provide reportError function', () => {
      const error = new Error('Test error');
      reportError(error, { component: 'TestComponent' });

      expect((errorReporting as any).errorQueue).toHaveLength(1);
    });

    it('should provide reportWarning function', () => {
      reportWarning('Test warning', { component: 'TestComponent' });

      expect(mockGtag).toHaveBeenCalled();
    });

    it('should provide setUserContext function', () => {
      setUserContext('user123');

      expect((errorReporting as any).config.userId).toBe('user123');
    });

    it('should provide clearUserContext function', () => {
      setUserContext('user123');
      clearUserContext();

      expect((errorReporting as any).config.userId).toBeUndefined();
    });
  });

  describe('Error Retry Logic', () => {
    it('should re-queue errors if sending fails', async () => {
      mockGtag.mockImplementationOnce(() => {
        throw new Error('Failed to send');
      });

      const error = new Error('Test error');
      errorReporting.reportError(error, { component: 'TestComponent' });

      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        'Failed to send error report, re-queuing:',
        expect.any(Error)
      );
    });
  });
});