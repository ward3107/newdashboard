/**
 * Smart Logger Utility
 *
 * Logs only in development mode, silent in production.
 * Prevents exposing internal debugging info to users.
 */

const isDevelopment = import.meta.env.DEV;

/**
 * Logger object with same interface as console
 */
export const logger = {
  /**
   * Log informational messages (dev only)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log informational messages (dev only)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log warnings (dev only)
   */
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },

  /**
   * Log errors (always shown, even in production)
   * Use this for actual errors that need to be reported
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log debug messages (dev only)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Create a group (dev only)
   */
  group: (...args: any[]) => {
    if (isDevelopment) {
      console.group(...args);
    }
  },

  /**
   * End a group (dev only)
   */
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  },

  /**
   * Log a table (dev only)
   */
  table: (data: any) => {
    if (isDevelopment) {
      console.table(data);
    }
  },
};

/**
 * Deprecated: Use logger instead
 * This is a drop-in replacement for console.log
 */
export const devLog = logger.log;
export const devWarn = logger.warn;
export const devError = logger.error;

export default logger;
