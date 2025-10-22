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
      isDevelopment ? 'ws://localhost:*' : '', // WebSocket for HMR
      isDevelopment ? 'http://localhost:*' : '',
    ].filter(Boolean),
    'font-src': [
      "'self'",
      'https://fonts.gstatic.com',
      'data:'
    ],
    'object-src': ["'none'"],
    'media-src': ["'self'"],
    'frame-src': ["'none'"],
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
 */
export function applyCSPMetaTag(isDevelopment = false): void {
  if (typeof document === 'undefined') return;

  const directives = getCSPDirectives(isDevelopment);
  const cspContent = generateCSPHeader(directives);

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

  console.log('🔒 CSP applied:', cspContent.substring(0, 100) + '...');
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

    // Store in localStorage for debugging
    try {
      const violations = JSON.parse(localStorage.getItem('csp_violations') || '[]');
      violations.push(violation);
      if (violations.length > 50) violations.shift();
      localStorage.setItem('csp_violations', JSON.stringify(violations));
    } catch (error) {
      console.error('Failed to store CSP violation:', error);
    }
  });
}

/**
 * Initialize CSP
 */
export function initializeCSP(): void {
  const isDevelopment = import.meta.env.DEV;
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