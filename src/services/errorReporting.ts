/**
 * Error Reporting Service
 *
 * Integrates with multiple error monitoring services
 * - Google Analytics for basic error tracking
 * - Ready for Sentry integration
 * - Local storage for development debugging
 */

export interface ErrorReport {
  error: Error;
  context: {
    component?: string;
    action?: string;
    userAgent?: string;
    url?: string;
    userId?: string;
    timestamp?: string;
    additionalInfo?: Record<string, any>;
  };
  level: 'error' | 'warning' | 'info';
}

interface ErrorReportingConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  version: string;
  userId?: string;
  release?: string;
}

class ErrorReportingService {
  private config: ErrorReportingConfig;
  private errorQueue: ErrorReport[] = [];
  private isOnline = navigator.onLine;

  constructor() {
    this.config = {
      enabled: true,
      environment: (import.meta.env.MODE as any) || 'development',
      version: import.meta.env.VITE_APP_VERSION || '1.0.0',
      release: `ishebot-dashboard@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`
    };

    this.setupErrorListeners();
    this.processErrorQueue();
  }

  private setupErrorListeners() {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for unhandled errors
    window.addEventListener('error', (event) => {
      this.reportError(event.error, {
        component: 'GlobalErrorHandler',
        action: 'uncaughtException',
        url: window.location.href,
        additionalInfo: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        }
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError(event.reason, {
        component: 'GlobalErrorHandler',
        action: 'unhandledPromiseRejection',
        url: window.location.href,
      });
    });
  }

  /**
   * Report an error to all configured services
   */
  public reportError(error: Error, context: Partial<ErrorReport['context']>): void {
    if (!this.config.enabled) return;

    const errorReport: ErrorReport = {
      error: this.sanitizeError(error),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context,
      },
      level: 'error',
    };

    // Add to queue for processing
    this.errorQueue.push(errorReport);

    // Process immediately if online
    if (this.isOnline) {
      this.processErrorQueue();
    }
  }

  /**
   * Report a warning or info message
   */
  public reportMessage(message: string, level: 'warning' | 'info' = 'info', context?: Partial<ErrorReport['context']>): void {
    if (!this.config.enabled || level === 'info') return; // Don't send info messages in production

    const errorReport: ErrorReport = {
      error: new Error(message),
      context: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context,
      },
      level,
    };

    this.sendToAnalytics(errorReport);
  }

  /**
   * Set user context for error reports
   */
  public setUser(userId: string, additionalInfo?: Record<string, any>): void {
    this.config.userId = userId;

    // Store user context for error reports
    if (typeof window !== 'undefined') {
      (window as any).__ERROR_REPORTING_USER__ = { userId, ...additionalInfo };
    }
  }

  /**
   * Clear user context
   */
  public clearUser(): void {
    this.config.userId = undefined;
    if (typeof window !== 'undefined') {
      delete (window as any).__ERROR_REPORTING_USER__;
    }
  }

  /**
   * Process queued errors and send them to reporting services
   */
  private async processErrorQueue(): Promise<void> {
    if (!this.isOnline || this.errorQueue.length === 0) return;

    const errorsToProcess = [...this.errorQueue];
    this.errorQueue = [];

    for (const errorReport of errorsToProcess) {
      try {
        await this.sendToReportingServices(errorReport);
      } catch (processingError) {
        // If sending fails, add back to queue for retry
        console.warn('Failed to send error report, re-queuing:', processingError);
        this.errorQueue.push(errorReport);
      }
    }
  }

  /**
   * Send error to all configured reporting services
   */
  private async sendToReportingServices(errorReport: ErrorReport): Promise<void> {
    await Promise.allSettled([
      this.sendToAnalytics(errorReport),
      this.sendToLocalStorage(errorReport),
      // Future: this.sendToSentry(errorReport),
    ]);
  }

  /**
   * Send error to Google Analytics
   */
  private sendToAnalytics(errorReport: ErrorReport): void {
    try {
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: errorReport.error.message,
          fatal: false,
          custom_map: {
            component: errorReport.context.component,
            action: errorReport.context.action,
            user_id: this.config.userId,
          }
        });
      }
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  /**
   * Store error in local storage for development debugging
   */
  private sendToLocalStorage(errorReport: ErrorReport): void {
    if (this.config.environment === 'development') {
      try {
        const storedErrors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
        storedErrors.push({
          ...errorReport,
          timestamp: new Date().toISOString(),
        });

        // Keep only last 50 errors
        const trimmedErrors = storedErrors.slice(-50);
        localStorage.setItem('debug_errors', JSON.stringify(trimmedErrors));
      } catch (error) {
        // Silently fail if localStorage is full or disabled
      }
    }
  }

  /**
   * Sanitize error to remove sensitive information
   */
  private sanitizeError(error: Error): Error {
    const sanitizedError = new Error(error.message);

    // Copy non-sensitive properties
    sanitizedError.name = error.name;
    sanitizedError.stack = error.stack;

    // Don't copy custom properties that might contain sensitive data
    return sanitizedError;
  }

  /**
   * Get recent errors from local storage (for development)
   */
  public getRecentErrors(count = 10): ErrorReport[] {
    if (this.config.environment !== 'development') return [];

    try {
      const storedErrors = JSON.parse(localStorage.getItem('debug_errors') || '[]');
      return storedErrors.slice(-count);
    } catch (error) {
      return [];
    }
  }

  /**
   * Clear stored errors (for development)
   */
  public clearStoredErrors(): void {
    localStorage.removeItem('debug_errors');
  }
}

// Export singleton instance
export const errorReporting = new ErrorReportingService();

// Export convenience functions
export const reportError = (error: Error, context?: Partial<ErrorReport['context']>) => {
  errorReporting.reportError(error, context);
};

export const reportWarning = (message: string, context?: Partial<ErrorReport['context']>) => {
  errorReporting.reportMessage(message, 'warning', context);
};

export const setUserContext = (userId: string, additionalInfo?: Record<string, any>) => {
  errorReporting.setUser(userId, additionalInfo);
};

export const clearUserContext = () => {
  errorReporting.clearUser();
};