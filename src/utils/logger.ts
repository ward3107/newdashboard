/**
 * Centralized logging utility for ISHEBOT Dashboard
 *
 * Replaces console statements with proper environment-aware logging
 * - Development: Full console logging
 * - Production: Structured logging without sensitive data
 * - Error reporting integration ready
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: Date;
  source: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logLevel = this.isDevelopment ? LogLevel.DEBUG : LogLevel.WARN;

  private formatMessage(entry: LogEntry): string {
    const levelEmoji = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
      [LogLevel.FATAL]: '💀',
    };

    const timestamp = entry.timestamp.toISOString();
    const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';

    return `${levelEmoji[entry.level]} [${timestamp}] ${entry.source}: ${entry.message}${contextStr}`;
  }

  private log(level: LogLevel, source: string, message: string, context?: Record<string, any>) {
    if (level < this.logLevel) return;

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date(),
      source,
    };

    // Console logging in development
    if (this.isDevelopment) {
      const formattedMessage = this.formatMessage(entry);

      switch (level) {
        case LogLevel.DEBUG:
        case LogLevel.INFO:
          console.log(formattedMessage);
          break;
        case LogLevel.WARN:
          console.warn(formattedMessage);
          break;
        case LogLevel.ERROR:
        case LogLevel.FATAL:
          console.error(formattedMessage);
          break;
      }
    }

    // In production, send to error reporting for errors and above
    if (!this.isDevelopment && level >= LogLevel.ERROR) {
      // TODO: Integrate with Sentry or similar service
      this.sendToErrorReporting(entry);
    }
  }

  private sendToErrorReporting(entry: LogEntry) {
    // Future integration with error reporting service
    // This will be implemented when we set up error boundaries
    try {
      // Placeholder for error reporting integration
      if (window.gtag) {
        window.gtag('event', 'exception', {
          description: entry.message,
          fatal: entry.level === LogLevel.FATAL,
        });
      }
    } catch (error) {
      // Silently fail to avoid infinite loops
    }
  }

  debug(source: string, message: string, context?: Record<string, any>) {
    this.log(LogLevel.DEBUG, source, message, context);
  }

  info(source: string, message: string, context?: Record<string, any>) {
    this.log(LogLevel.INFO, source, message, context);
  }

  warn(source: string, message: string, context?: Record<string, any>) {
    this.log(LogLevel.WARN, source, message, context);
  }

  error(source: string, message: string, error?: Error | Record<string, any>) {
    this.log(LogLevel.ERROR, source, message, { error });
  }

  fatal(source: string, message: string, error?: Error | Record<string, any>) {
    this.log(LogLevel.FATAL, source, message, { error });
  }

  // Performance logging
  performance(source: string, operation: string, duration: number) {
    this.info(source, `Performance: ${operation} completed in ${duration}ms`, { operation, duration });
  }

  // API logging (without sensitive data)
  api(source: string, method: string, endpoint: string, status: number, duration?: number) {
    this.info(source, `API ${method} ${endpoint} - ${status}`, {
      method,
      endpoint: endpoint.replace(/\/[^\/]*$/, '/***'), // Sanitize endpoint
      status,
      duration
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions for common patterns
export const logError = (source: string, message: string, error?: Error) => {
  logger.error(source, message, error);
};

export const logApi = (source: string, method: string, endpoint: string, status: number, duration?: number) => {
  logger.api(source, method, endpoint, status, duration);
};

export const logPerformance = (source: string, operation: string, duration: number) => {
  logger.performance(source, operation, duration);
};