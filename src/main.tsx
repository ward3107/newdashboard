/**
 * ISHEBOT - Intelligent Student Holistic Evaluation & Behavior Optimization Tool
 *
 * Copyright (c) 2025 Waseem Abu Akel - All Rights Reserved
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of ISHEBOT proprietary software. Unauthorized copying,
 * modification, distribution, or use of this file, via any medium, is strictly
 * prohibited without the express written permission of the copyright holder.
 *
 * For licensing inquiries: wardwas3107@gmail.com
 */

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./i18n"; // Initialize i18n before app renders
import logger from "./utils/logger";
import { initSentry } from "./monitoring/sentry";

// Initialize Sentry error tracking (production only)
initSentry();

// Global error handlers for debugging
window.addEventListener('error', (event) => {
  logger.error('❌ Global error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: new Date().toISOString(),
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.error('❌ Unhandled promise rejection:', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString(),
  });
});

// Log environment info for debugging
logger.log('🔧 Environment:', {
  mode: import.meta.env.MODE,
  baseUrl: import.meta.env.BASE_URL,
  useFirestore: import.meta.env.VITE_USE_FIRESTORE,
  useMockData: import.meta.env.VITE_USE_MOCK_DATA,
  timestamp: new Date().toISOString(),
});

// Ensure DOM is ready
const initApp = () => {
  logger.log('🚀 Initializing app...');
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    logger.error("❌ Failed to find the root element");
    logger.error('Document body HTML:', document.body.innerHTML.substring(0, 200));
    document.body.innerHTML = '<div style="padding: 20px; font-family: sans-serif;"><h1>Error Loading Application</h1><p>Could not find root element. Please refresh the page.</p><p style="color: #666; font-size: 12px;">Error ID: ROOT_NOT_FOUND</p></div>';
    return;
  }

  try {
    logger.log('✅ Root element found, rendering app...');
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
    logger.log('✅ App rendered successfully');
  } catch (error) {
    logger.error("❌ Error rendering app:", error);
    logger.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    rootElement.innerHTML = `<div style="padding: 20px; font-family: sans-serif;">
      <h1>Error Loading Application</h1>
      <p>An error occurred while loading the application. Please refresh the page.</p>
      <details style="margin-top: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
        <summary style="cursor: pointer; font-weight: bold;">Error Details</summary>
        <pre style="margin-top: 10px; overflow: auto; font-size: 12px;">${error instanceof Error ? error.message : String(error)}</pre>
      </details>
      <p style="color: #666; font-size: 12px; margin-top: 10px;">Error ID: RENDER_FAILED</p>
    </div>`;
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
