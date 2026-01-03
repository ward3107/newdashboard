/**
 * Content Security Policy Configuration
 * Implements strict CSP headers for XSS protection
 */

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'connect-src': string[];
  'font-src': string[];
  'object-src': string[];
  'media-src': string[];
  'frame-src': string[];
  'worker-src': string[];
  'form-action': string[];
  'frame-ancestors': string[];
  'base-uri': string[];
  'manifest-src': string[];
}

/**
 * Get CSP configuration based on environment
 */
export function getCSPDirectives(isDevelopment = false): CSPDirectives {
  const baseDirectives: CSPDirectives = {
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-eval'", // Required for some React features
      'https://apis.google.com',
      'https://script.google.com',
      isDevelopment ? "'unsafe-inline'" : '', // Only in dev for HMR
    ].filter(Boolean),
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for styled-components
      'https://fonts.googleapis.com'
    ],
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
    ],
    'connect-src': [
      "'self'",
      'https://script.google.com',
      'https://script.googleusercontent.com',
      'https://apis.google.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://firestore.googleapis.com',
      'https://us-central1-ishebott.cloudfunctions.net',
      'https://*.firebaseapp.com',
      'https://*.firebase.google.com',
      isDevelopment ? 'ws://localhost:*' : '', // WebSocket for HMR
      isDevelopment ? 'http://localhost:*' : '', // Development APIs
      isDevelopment ? 'ws://127.0.0.1:*' : '',
      isDevelopment ? 'http://127.0.0.1:*' : '',
      // Optimization backend (Python FastAPI)
      // Optimization backend (Python FastAPI) - allow in both dev and prod
      'http://localhost:8000',
      'http://127.0.0.1:8000',
      'https://localhost:8000',
      // Production optimization backend (Render)
      'https://*.onrender.com',
      'https://*.render.com',
    ].filter(Boolean),
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': [
      "'self'",
      'https://vercel.live',
      'https://*.vercel.live',
      'https://vercel.com',
      'https://*.vercel.com',
    ],
    'worker-src': ["'self'", 'blob:'],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
    'base-uri': ["'self'"],
    'manifest-src': ["'self'"]
  };

  return baseDirectives;
}

/**
 * Generate CSP header string
 */
export function generateCSPHeader(directives: CSPDirectives): string {
  return Object.entries(directives)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}

/**
 * Apply CSP meta tag to document
 * Note: frame-ancestors is removed as it only works in HTTP headers
 */
export function applyCSPMetaTag(isDevelopment = false): void {
  if (typeof document === 'undefined') return;

  const directives = getCSPDirectives(isDevelopment);

  // Remove frame-ancestors (only works in HTTP headers, not meta tags)
  const metaDirectives = { ...directives };
  delete (metaDirectives as any)['frame-ancestors'];

  const cspContent = generateCSPHeader(metaDirectives);

  // Remove existing CSP meta tag if present
  const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (existingMeta) {
    existingMeta.remove();
  }

  // Add new CSP meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspContent;
  document.head.appendChild(meta);

  // CSP configured - violations will be reported to console in development
}

/**
 * Report CSP violations
 */
export function setupCSPReporting(): void {
  if (typeof document === 'undefined') return;

  document.addEventListener('securitypolicyviolation', (event) => {
    const violation = {
      blockedURI: event.blockedURI,
      violatedDirective: event.violatedDirective,
      originalPolicy: event.originalPolicy,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      timestamp: new Date().toISOString()
    };

    console.error('CSP Violation:', violation);

    // Send to monitoring service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'csp_violation', {
        event_category: 'Security',
        event_label: event.violatedDirective,
        value: 1
      });
    }

    // Note: CSP violations logged to console only
    // localStorage removed for security (could be blocked by CSP)
  });
}

/**
 * Initialize CSP
 */
export function initializeCSP(): void {
  const isDevelopment = import.meta.env.DEV;

  // Skip CSP in development to avoid blocking development features
  if (isDevelopment) {
    return;
  }

  applyCSPMetaTag(isDevelopment);
  setupCSPReporting();
}

export default {
  getCSPDirectives,
  generateCSPHeader,
  applyCSPMetaTag,
  setupCSPReporting,
  initializeCSP
};