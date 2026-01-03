/**
 * Sentry Error Tracking Configuration
 *
 * Initializes Sentry for production error monitoring.
 * Sentry is disabled in development by default.
 */

import * as Sentry from "@sentry/react";
import { browserTracingIntegration } from "@sentry/react";
import type { User } from "../types/auth";

/**
 * Initialize Sentry with configuration
 */
export function initSentry(): void {
  // Only initialize in production if DSN is configured
  const isProduction = import.meta.env.PROD;
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!isProduction || !sentryDsn) {
    // Don't initialize Sentry in development or if not configured
    return;
  }

  Sentry.init({
    dsn: sentryDsn,

    // Environment
    environment: import.meta.env.MODE,

    // Release version (from package.json)
    release: import.meta.env.VITE_APP_VERSION || "1.0.0",

    // Integrations
    integrations: [
      browserTracingIntegration(),
    ],

    // Performance monitoring
    tracesSampleRate: isProduction ? 0.1 : 0, // 10% of transactions in production

    // beforeSend: Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive data from request headers
      if (event.request?.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }

      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.filter((breadcrumb) => {
          // Filter out breadcrumbs with potentially sensitive data
          if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
            const data = breadcrumb.data as { url?: string };
            if (data?.url && includesSensitivePath(data.url)) {
              return false;
            }
          }
          return true;
        });
      }

      // Add custom context
      event.contexts = {
        ...event.contexts,
        app: {
          name: "ISHEBOT",
          useFirestore: import.meta.env.VITE_USE_FIRESTORE === "true",
        },
      };

      return event;
    },

    // Filter out specific errors
    ignoreErrors: [
      // Browser extensions
      "top.GLOBALS",
      // Random plugins/extensions
      "originalCreateNotification",
      "canvas.contentDocument",
      "MyApp_RemoveAllHighlights",
      // Facebook related
      "fb_xd_fragment",
      // Network errors that are not actionable
      "Network Error",
      "Non-Error promise rejection captured",
    ],

    // Filter out specific URLs from tracing
    denyUrls: [
      // Chrome extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      // Firefox extensions
      /^resource:\/\//i,
      /^about:\/\//i,
      // Other browsers
      /^safari-extension:\/\//i,
      /^moz-extension:\/\//i,
      /^ms-browser-extension:\/\//i,
    ],

    // beforeSendTransaction: Filter sensitive spans
    beforeSendTransaction(transaction) {
      // Filter transactions with sensitive paths
      const txn = transaction as any; // Type assertion for name property
      if (txn.name && includesSensitivePath(txn.name)) {
        return null; // Don't send this transaction
      }
      return transaction;
    },
  });
}

/**
 * Set the current user in Sentry context
 */
export function setSentryUser(user: User | null): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  if (user) {
    Sentry.setUser({
      id: user.uid,
      email: user.email,
      username: user.displayName,
      // Don't send sensitive fields
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture an exception with additional context
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    // Fallback to console in development
    console.error("Error captured:", error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setContext(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capture a message with level
 */
export function captureMessage(message: string, level: "info" | "warning" | "error" = "info"): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    // Fallback to console in development
    console.log(`[${level.toUpperCase()}]`, message);
    return;
  }

  Sentry.captureMessage(message, { level });
}

/**
 * Add a breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string = "custom",
  level: "info" | "warning" | "error" = "info"
): void {
  if (!import.meta.env.PROD || !import.meta.env.VITE_SENTRY_DSN) {
    return;
  }

  Sentry.addBreadcrumb({
    message,
    category,
    level,
  });
}

/**
 * Check if a URL/path contains sensitive information
 */
function includesSensitivePath(url: string): boolean {
  const sensitivePaths = ["/api/auth", "/api/user", "/reset-password", "/invite"];
  return sensitivePaths.some((path) => url.includes(path));
}
