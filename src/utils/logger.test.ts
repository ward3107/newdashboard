/**
 * Logger Utility Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logger } from './logger';

// Mock console methods
const mockConsoleLog = vi.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

// Mock gtag
const mockGtag = vi.fn();
Object.defineProperty(window, 'gtag', {
  value: mockGtag,
  writable: true,
});

describe('Logger Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear();
    mockConsoleError.mockClear();
    mockGtag.mockClear();

    // Reset environment to development
    vi.stubEnv('MODE', 'development');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Development Logging', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'development');
    });

    it('should log debug messages in development', () => {
      logger.debug('TestComponent', 'Debug message', { key: 'value' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('🔍 ['),
        expect.stringContaining('TestComponent: Debug message'),
        expect.stringContaining('"key":"value"')
      );
    });

    it('should log info messages in development', () => {
      logger.info('TestComponent', 'Info message');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️ ['),
        expect.stringContaining('TestComponent: Info message')
      );
    });

    it('should log warning messages in development', () => {
      logger.warn('TestComponent', 'Warning message');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ ['),
        expect.stringContaining('TestComponent: Warning message')
      );
    });

    it('should log error messages in development', () => {
      const error = new Error('Test error');
      logger.error('TestComponent', 'Error occurred', error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ ['),
        expect.stringContaining('TestComponent: Error occurred'),
        expect.stringContaining('"error":{}')
      );
    });

    it('should log performance metrics', () => {
      logger.performance('TestComponent', 'test operation', 150);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️ ['),
        expect.stringContaining('Performance: test operation completed in 150ms')
      );
    });

    it('should log API calls with sanitized endpoints', () => {
      logger.api('TestComponent', 'GET', '/api/students/123', 200, 500);

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('ℹ️ ['),
        expect.stringContaining('API GET /api/students/*** - 200')
      );
    });
  });

  describe('Production Logging', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'production');
    });

    it('should not log debug messages in production', () => {
      logger.debug('TestComponent', 'Debug message');

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log info messages in production', () => {
      logger.info('TestComponent', 'Info message');

      expect(mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should log warning messages in production', () => {
      logger.warn('TestComponent', 'Warning message');

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('⚠️ ['),
        expect.stringContaining('TestComponent: Warning message')
      );
    });

    it('should log error messages in production', () => {
      const error = new Error('Test error');
      logger.error('TestComponent', 'Error occurred', error);

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('❌ ['),
        expect.stringContaining('TestComponent: Error occurred')
      );
    });

    it('should send errors to Google Analytics in production', () => {
      const error = new Error('Test error');
      logger.error('TestComponent', 'Error occurred', error);

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Error occurred',
        fatal: false,
      });
    });

    it('should send fatal errors to Google Analytics', () => {
      const error = new Error('Fatal error');
      logger.fatal('TestComponent', 'Fatal error occurred', error);

      expect(mockGtag).toHaveBeenCalledWith('event', 'exception', {
        description: 'Fatal error occurred',
        fatal: true,
      });
    });
  });

  describe('Log Message Formatting', () => {
    it('should include timestamp in log messages', () => {
      logger.info('TestComponent', 'Test message');

      const logMessage = mockConsoleLog.mock.calls[0][0];
      expect(logMessage).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
    });

    it('should include source component name', () => {
      logger.info('TestComponent', 'Test message');

      const logMessage = mockConsoleLog.mock.calls[0][0];
      expect(logMessage).toContain('TestComponent:');
    });

    it('should format context object as JSON', () => {
      logger.info('TestComponent', 'Test message', { key1: 'value1', key2: 42 });

      const logMessage = mockConsoleLog.mock.calls[0][0];
      expect(logMessage).toContain('"key1":"value1"');
      expect(logMessage).toContain('"key2":42');
    });

    it('should handle undefined context', () => {
      expect(() => {
        logger.info('TestComponent', 'Test message', undefined);
      }).not.toThrow();
    });
  });

  describe('Convenience Functions', () => {
    it('should provide logError convenience function', () => {
      const { logError } = require('./logger');
      const error = new Error('Test error');

      logError('TestComponent', 'Error message', error);

      expect(mockConsoleError).toHaveBeenCalled();
    });

    it('should provide logApi convenience function', () => {
      const { logApi } = require('./logger');

      logApi('TestComponent', 'POST', '/api/students', 201, 250);

      expect(mockConsoleLog).toHaveBeenCalled();
    });

    it('should provide logPerformance convenience function', () => {
      const { logPerformance } = require('./logger');

      logPerformance('TestComponent', 'database query', 75);

      expect(mockConsoleLog).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle circular references in context', () => {
      const context: any = { key: 'value' };
      context.self = context; // Create circular reference

      expect(() => {
        logger.info('TestComponent', 'Test message', context);
      }).not.toThrow();
    });

    it('should handle Google Analytics errors gracefully', () => {
      mockGtag.mockImplementationOnce(() => {
        throw new Error('gtag failed');
      });

      expect(() => {
        const error = new Error('Test error');
        logger.error('TestComponent', 'Error occurred', error);
      }).not.toThrow();
    });
  });
});