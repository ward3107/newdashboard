# Universal Accessibility, Security & Privacy Implementation Kit

> **Purpose:** This document serves as a comprehensive prompt/guide for AI assistants to implement a complete accessibility, security, and privacy system on any web application. Copy this entire document and provide it to any AI when starting a new project.

---

## PROMPT START

You are implementing a comprehensive Accessibility, Security, and Privacy system for a web application. Follow this specification exactly, adapting component syntax and styling to match the project's existing technology stack (React, Vue, Svelte, vanilla JS, etc.).

---

## 1. ARCHITECTURE OVERVIEW

### Core Components to Create:

```
/components
  /ui
    AccessibilityWidget.{tsx|vue|svelte|js}
    CookieConsent.{tsx|vue|svelte|js}

/security
  csp.{ts|js}
  rateLimiter.{ts|js}
  securityManager.{ts|js}

/styles
  accessibility.css

/pages (or /routes)
  PrivacyPolicyPage.{tsx|vue|svelte|js}
  TermsOfServicePage.{tsx|vue|svelte|js}
```

### localStorage Keys (Use Consistent Naming):

```javascript
const STORAGE_KEYS = {
  // Privacy
  COOKIE_CONSENT: '{app-name}-cookie-consent',        // 'true' | null
  COOKIE_PREFERENCES: '{app-name}-cookie-preferences', // JSON object

  // Accessibility
  ACCESSIBILITY_SETTINGS: '{app-name}-accessibility-settings', // JSON object

  // Security (internal)
  CSP_VIOLATIONS: 'csp_violations',           // Array (max 50)
  SECURITY_VIOLATIONS: 'security_violations', // Array (max 100)
};
```

---

## 2. FIRST VISIT FLOW SPECIFICATION

Implement this exact sequence when a user first visits the website:

```
STEP 1: App Initialization
├── Mount global error handlers
├── Initialize security systems (CSP, rate limiters)
├── Start performance monitoring (optional)
└── Render main application

STEP 2: UI Components Mount (immediate)
├── Accessibility Widget renders (floating button, always visible)
├── Toast/notification system ready
└── Check localStorage for cookie consent

STEP 3: Cookie Consent Check (after 1-second delay)
├── IF localStorage[COOKIE_CONSENT] exists:
│   └── Load preferences, do NOT show banner
└── IF localStorage[COOKIE_CONSENT] is null/undefined:
    └── Show Cookie Consent Banner (modal/overlay)

STEP 4: User Must Interact
├── Cookie banner blocks interaction until choice made (or dismissed)
├── Accessibility widget always accessible regardless of banner
└── User choices saved to localStorage immediately
```

---

## 3. COOKIE CONSENT COMPONENT

### Required Features:

1. **Delayed appearance** - Show 1 second after page load (avoids flash)
2. **Focus trap** - When open, Tab/Shift+Tab cycles within modal only
3. **Keyboard support** - Escape key closes modal
4. **Screen reader announcements** - Use aria-live regions
5. **Persists choice** - Never show again after user decides

### Cookie Categories (Standard):

```javascript
const DEFAULT_COOKIE_PREFERENCES = {
  necessary: true,      // ALWAYS true, cannot be disabled
  functional: true,     // Preferences, language, UI settings
  analytics: false,     // Usage tracking, performance metrics
  marketing: false,     // Personalization, recommendations
  advertising: false,   // Third-party ads, retargeting
};
```

### UI Requirements:

```
┌─────────────────────────────────────────────────────────────┐
│                     COOKIE CONSENT MODAL                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Icon] We use cookies to enhance your experience          │
│                                                             │
│  Brief explanation of cookie usage (2-3 sentences)         │
│                                                             │
│  [Link to full Privacy Policy]                              │
│                                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ Accept All  │ │  Customize  │ │ Decline All │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Customize Panel (Expandable):

```
┌─────────────────────────────────────────────────────────────┐
│  COOKIE SETTINGS                                    [X]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✓ Necessary Cookies (Always On)          [████████] ON    │
│    Required for basic site functionality                    │
│                                                             │
│  ○ Functional Cookies                      [Toggle Switch]  │
│    Remember preferences and settings                        │
│                                                             │
│  ○ Analytics Cookies                       [Toggle Switch]  │
│    Help us understand how you use the site                  │
│                                                             │
│  ○ Marketing Cookies                       [Toggle Switch]  │
│    Personalized content and recommendations                 │
│                                                             │
│  ○ Advertising Cookies                     [Toggle Switch]  │
│    Targeted advertisements                                  │
│                                                             │
│                                    [Save Preferences]       │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Logic:

```javascript
// Pseudocode - adapt to your framework

function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState(DEFAULT_COOKIE_PREFERENCES);

  useEffect(() => {
    // Check if user already made a choice
    const hasConsent = localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT);

    if (!hasConsent) {
      // Delay showing banner by 1 second
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const saved = localStorage.getItem(STORAGE_KEYS.COOKIE_PREFERENCES);
      if (saved) setPreferences(JSON.parse(saved));
    }
  }, []);

  function acceptAll() {
    const allEnabled = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
      advertising: true,
    };
    savePreferences(allEnabled);
  }

  function declineAll() {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
      advertising: false,
    };
    savePreferences(onlyNecessary);
  }

  function savePreferences(prefs) {
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'true');
    localStorage.setItem(STORAGE_KEYS.COOKIE_PREFERENCES, JSON.stringify(prefs));
    setIsVisible(false);

    // Trigger event for other parts of app to react
    window.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: prefs }));
  }

  // ... render modal with focus trap and keyboard handling
}
```

---

## 4. ACCESSIBILITY WIDGET COMPONENT

### Required Features:

1. **Always visible** - Floating button, does not interfere with content
2. **Position** - Bottom-left or bottom-right corner (configurable)
3. **Collapsible panel** - Click button to expand settings
4. **Instant application** - Changes apply immediately to DOM
5. **Auto-save** - Every change saves to localStorage automatically
6. **Focus trap** - When panel open, focus stays within
7. **Keyboard navigation** - Tab through controls, Escape to close

### Accessibility Settings (Standard):

```javascript
const DEFAULT_ACCESSIBILITY_SETTINGS = {
  fontSize: 100,           // Percentage: 80-150
  highContrast: false,     // Boolean
  darkMode: false,         // Boolean (or 'system' | 'light' | 'dark')
  reducedMotion: false,    // Boolean
  keyboardNav: true,       // Boolean - enhanced focus indicators
  lineHeight: 'normal',    // 'normal' | 'relaxed' | 'loose' (optional)
  letterSpacing: 'normal', // 'normal' | 'wide' | 'wider' (optional)
};
```

### UI Requirements:

```
┌──────┐
│  ♿  │  ← Floating button (icon: accessibility symbol)
└──────┘

EXPANDED PANEL:
┌─────────────────────────────────────────────────────────────┐
│  ACCESSIBILITY SETTINGS                             [X]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Font Size                                                  │
│  [−] ════════════●══════════ [+]                           │
│       80%              100%              150%               │
│                                                             │
│  High Contrast                              [Toggle Switch] │
│  Increases color contrast for better visibility             │
│                                                             │
│  Dark Mode                                  [Toggle Switch] │
│  Reduces eye strain in low-light conditions                 │
│                                                             │
│  Reduced Motion                             [Toggle Switch] │
│  Minimizes animations and transitions                       │
│                                                             │
│  Keyboard Navigation                        [Toggle Switch] │
│  Enhanced focus indicators for keyboard users               │
│                                                             │
│                                      [Reset to Defaults]    │
└─────────────────────────────────────────────────────────────┘
```

### CSS Classes to Apply (on document root):

```css
/* Apply these classes to <html> or <body> based on settings */

/* High Contrast */
.high-contrast {
  filter: contrast(1.2);
}

/* Reduced Motion */
.reduce-motion,
.reduce-motion * {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
}

/* Keyboard Navigation - Enhanced Focus */
.keyboard-nav *:focus {
  outline: 3px solid currentColor !important;
  outline-offset: 2px !important;
}

/* Font Size - Apply to root element */
html {
  font-size: var(--user-font-size, 100%);
}
```

### Implementation Logic:

```javascript
// Pseudocode - adapt to your framework

function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_ACCESSIBILITY_SETTINGS);
  const panelRef = useRef(null);

  // Load settings on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS);
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
      applySettings(parsed);
    }
  }, []);

  // Apply settings to DOM
  function applySettings(newSettings) {
    const root = document.documentElement;

    // Font size
    root.style.setProperty('--user-font-size', `${newSettings.fontSize}%`);

    // High contrast
    root.classList.toggle('high-contrast', newSettings.highContrast);

    // Reduced motion
    root.classList.toggle('reduce-motion', newSettings.reducedMotion);

    // Keyboard navigation
    root.classList.toggle('keyboard-nav', newSettings.keyboardNav);

    // Dark mode (integrate with your theme system)
    if (newSettings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Update and save setting
  function updateSetting(key, value) {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
    localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY_SETTINGS, JSON.stringify(newSettings));

    // Announce change to screen readers
    announceToScreenReader(`${key} updated to ${value}`);
  }

  function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // ... render floating button and expandable panel
}
```

---

## 5. ACCESSIBILITY CSS FILE

Create a dedicated CSS file with WCAG 2.1 AA compliance utilities:

```css
/* accessibility.css */

/* ==========================================
   SCREEN READER ONLY UTILITY
   ========================================== */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

/* ==========================================
   FOCUS INDICATORS (WCAG 2.4.7)
   ========================================== */
*:focus {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

*:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

/* Enhanced focus for keyboard navigation mode */
.keyboard-nav *:focus,
.keyboard-nav *:focus-visible {
  outline: 3px solid currentColor !important;
  outline-offset: 3px !important;
  box-shadow: 0 0 0 6px rgba(0, 0, 0, 0.1);
}

/* ==========================================
   HIGH CONTRAST MODE
   ========================================== */
.high-contrast {
  filter: contrast(1.2);
}

.high-contrast img {
  filter: contrast(1);
}

/* Respect system preference */
@media (prefers-contrast: more) {
  :root {
    --contrast-multiplier: 1.2;
  }
}

/* ==========================================
   REDUCED MOTION
   ========================================== */
.reduce-motion,
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.001ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.001ms !important;
  scroll-behavior: auto !important;
}

/* Respect system preference */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

/* ==========================================
   TOUCH TARGETS (WCAG 2.5.5 - AAA, 2.5.8 - AA)
   ========================================== */
button,
[role="button"],
a,
input,
select,
textarea,
[tabindex]:not([tabindex="-1"]) {
  min-height: 44px;
  min-width: 44px;
}

/* For inline links, ensure adequate spacing */
a {
  padding: 0.25em 0;
}

/* ==========================================
   TEXT SPACING (WCAG 1.4.12)
   ========================================== */
.text-spacing-relaxed {
  line-height: 1.5 !important;
  letter-spacing: 0.12em !important;
  word-spacing: 0.16em !important;
}

.text-spacing-loose {
  line-height: 2 !important;
  letter-spacing: 0.16em !important;
  word-spacing: 0.24em !important;
}

/* ==========================================
   SKIP LINK
   ========================================== */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  padding: 1rem;
  background: #000;
  color: #fff;
  z-index: 9999;
  text-decoration: none;
}

.skip-link:focus {
  top: 0;
}

/* ==========================================
   COLOR CONTRAST HELPERS
   (Define your own color variables)
   ========================================== */
/* Ensure 4.5:1 ratio for normal text */
/* Ensure 3:1 ratio for large text (18pt or 14pt bold) */
/* Ensure 3:1 ratio for UI components and graphics */

/* ==========================================
   PRINT STYLES
   ========================================== */
@media print {
  .accessibility-widget,
  .cookie-consent,
  .skip-link {
    display: none !important;
  }
}
```

---

## 6. CONTENT SECURITY POLICY (CSP)

### Implementation:

```javascript
// security/csp.js

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    // Add trusted script sources (e.g., analytics, CDNs)
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for most CSS-in-JS solutions
    // Add trusted style sources (e.g., Google Fonts)
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:', // Or specific image CDN domains
  ],
  'font-src': [
    "'self'",
    'data:',
    // Add font CDN domains (e.g., fonts.gstatic.com)
  ],
  'connect-src': [
    "'self'",
    // Add API endpoints, WebSocket URLs
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'none'"], // Or specific allowed frames
  'frame-ancestors': ["'none'"], // Prevents clickjacking
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'upgrade-insecure-requests': [],
};

// For development, add more permissive rules
const DEV_ADDITIONS = {
  'script-src': ["'unsafe-eval'"], // Required for HMR
  'connect-src': ['ws:', 'wss:'],  // WebSocket for dev server
};

export function initializeCSP() {
  // Only apply in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('[CSP] Skipped in development mode');
    return;
  }

  const directives = { ...CSP_DIRECTIVES };

  // Build CSP string
  const cspString = Object.entries(directives)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(' ')}`;
    })
    .join('; ');

  // Apply via meta tag
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = cspString;
  document.head.appendChild(meta);

  // Set up violation reporting
  document.addEventListener('securitypolicyviolation', handleCSPViolation);

  console.log('[CSP] Content Security Policy applied');
}

function handleCSPViolation(event) {
  const violation = {
    blockedURI: event.blockedURI,
    violatedDirective: event.violatedDirective,
    originalPolicy: event.originalPolicy,
    timestamp: new Date().toISOString(),
    sourceFile: event.sourceFile,
    lineNumber: event.lineNumber,
  };

  // Store violations (max 50)
  const stored = JSON.parse(localStorage.getItem('csp_violations') || '[]');
  stored.push(violation);
  if (stored.length > 50) stored.shift();
  localStorage.setItem('csp_violations', JSON.stringify(stored));

  // Log in development
  console.warn('[CSP Violation]', violation);

  // Optional: Send to analytics/monitoring service
  // sendToAnalytics('csp_violation', violation);
}
```

---

## 7. RATE LIMITER

### Implementation:

```javascript
// security/rateLimiter.js

const rateLimitStore = new Map();

// Default rate limits (customize per endpoint)
const RATE_LIMITS = {
  // Authentication
  login: { maxRequests: 5, windowMs: 5 * 60 * 1000 },      // 5 per 5 minutes
  resetPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 per hour

  // API endpoints
  submitForm: { maxRequests: 10, windowMs: 60 * 1000 },    // 10 per minute
  exportData: { maxRequests: 5, windowMs: 60 * 1000 },     // 5 per minute
  uploadFile: { maxRequests: 20, windowMs: 60 * 1000 },    // 20 per minute

  // Default fallback
  default: { maxRequests: 100, windowMs: 60 * 1000 },      // 100 per minute
};

export function checkRateLimit(endpoint) {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const key = endpoint;
  const now = Date.now();

  let record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  record.count++;
  rateLimitStore.set(key, record);

  const isAllowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);
  const resetTime = record.resetTime;

  return {
    allowed: isAllowed,
    remaining,
    resetTime,
    retryAfter: isAllowed ? 0 : Math.ceil((resetTime - now) / 1000),
  };
}

// Wrapper for API calls
export async function withRateLimit(endpoint, apiCall) {
  const result = checkRateLimit(endpoint);

  if (!result.allowed) {
    const error = new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
    error.code = 'RATE_LIMIT_EXCEEDED';
    error.retryAfter = result.retryAfter;
    throw error;
  }

  return apiCall();
}

// React hook version
export function useRateLimit(endpoint) {
  return {
    checkLimit: () => checkRateLimit(endpoint),
    withLimit: (apiCall) => withRateLimit(endpoint, apiCall),
  };
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Every minute
```

---

## 8. SECURITY MANAGER

### Implementation:

```javascript
// security/securityManager.js

class SecurityManager {
  static instance = null;

  constructor() {
    this.sessionId = this.generateSecureId();
    this.csrfToken = this.generateSecureId();
    this.loginAttempts = 0;
    this.lastLoginAttempt = 0;
    this.lockoutUntil = 0;
  }

  static getInstance() {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  // Generate cryptographically secure random ID
  generateSecureId(length = 32) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // CSRF Token management
  getCSRFToken() {
    return this.csrfToken;
  }

  validateCSRFToken(token) {
    return token === this.csrfToken;
  }

  refreshCSRFToken() {
    this.csrfToken = this.generateSecureId();
    return this.csrfToken;
  }

  // Login attempt tracking
  recordLoginAttempt(success) {
    const now = Date.now();

    if (success) {
      this.loginAttempts = 0;
      this.lockoutUntil = 0;
      return { allowed: true };
    }

    this.loginAttempts++;
    this.lastLoginAttempt = now;

    // Lockout after 5 failed attempts
    if (this.loginAttempts >= 5) {
      this.lockoutUntil = now + (15 * 60 * 1000); // 15 minutes
      return {
        allowed: false,
        lockoutMinutes: 15,
        message: 'Too many failed attempts. Please try again in 15 minutes.',
      };
    }

    return {
      allowed: true,
      attemptsRemaining: 5 - this.loginAttempts,
    };
  }

  isLockedOut() {
    if (this.lockoutUntil && Date.now() < this.lockoutUntil) {
      const remainingMs = this.lockoutUntil - Date.now();
      return {
        locked: true,
        remainingMinutes: Math.ceil(remainingMs / 60000),
      };
    }
    return { locked: false };
  }

  // Input sanitization
  sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }

  // XSS detection
  detectXSS(input) {
    if (typeof input !== 'string') return false;

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
    ];

    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Log security violation
  logViolation(type, details) {
    const violation = {
      type,
      details,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Store locally (max 100)
    const stored = JSON.parse(localStorage.getItem('security_violations') || '[]');
    stored.push(violation);
    if (stored.length > 100) stored.shift();
    localStorage.setItem('security_violations', JSON.stringify(stored));

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[Security Violation]', violation);
    }

    // Optional: Send to server for monitoring
    // this.reportViolation(violation);
  }
}

export default SecurityManager;
export const securityManager = SecurityManager.getInstance();
```

---

## 9. APP INITIALIZATION

### Main App Setup:

```javascript
// App.jsx or main.js - adapt to your framework

import { initializeCSP } from './security/csp';
import { securityManager } from './security/securityManager';

function App() {
  useEffect(() => {
    // Initialize security systems
    initializeCSP();

    // Log security status (development only)
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Security] Systems initialized');
      console.log('[Security] Session ID:', securityManager.sessionId);
    }

    // Set security headers via meta tags
    setSecurityHeaders();

  }, []);

  return (
    <>
      {/* Main app content */}
      <Router>
        {/* Routes */}
      </Router>

      {/* Always render these - they manage their own visibility */}
      <AccessibilityWidget />
      <CookieConsent />

      {/* Toast notifications */}
      <ToastContainer />
    </>
  );
}

function setSecurityHeaders() {
  // Referrer Policy
  const referrerMeta = document.createElement('meta');
  referrerMeta.name = 'referrer';
  referrerMeta.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerMeta);

  // Permissions Policy (formerly Feature Policy)
  // Note: Most permissions policies must be set server-side
  // This is informational/defensive
}
```

---

## 10. PRIVACY POLICY PAGE TEMPLATE

Create a privacy policy page at `/privacy-policy` route:

```markdown
# Privacy Policy

**Last Updated:** [DATE]

## 1. Introduction

[Company/App Name] ("we," "our," or "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our [website/application].

## 2. Information We Collect

### Information You Provide
- Account information (name, email, password)
- Profile information
- Content you submit
- Communications with us

### Automatically Collected Information
- Device information (browser type, operating system)
- Usage data (pages visited, features used)
- IP address (anonymized)
- Cookies and similar technologies

## 3. How We Use Your Information

- Provide and maintain our services
- Improve and personalize your experience
- Communicate with you
- Ensure security and prevent fraud
- Comply with legal obligations

## 4. Cookie Policy

We use the following types of cookies:

| Type | Purpose | Can Disable? |
|------|---------|--------------|
| Necessary | Core functionality | No |
| Functional | Preferences | Yes |
| Analytics | Usage insights | Yes |
| Marketing | Personalization | Yes |
| Advertising | Targeted ads | Yes |

You can manage your cookie preferences through our Cookie Settings.

## 5. Data Sharing

We do not sell your personal information. We may share data with:
- Service providers who assist our operations
- Legal authorities when required by law
- Business partners with your consent

## 6. Your Rights

You have the right to:
- Access your personal data
- Correct inaccurate data
- Delete your data
- Export your data
- Withdraw consent
- Object to processing

## 7. Data Security

We implement appropriate technical and organizational measures to protect your data, including:
- Encryption in transit and at rest
- Access controls
- Regular security assessments
- Incident response procedures

## 8. Data Retention

We retain your data only as long as necessary for the purposes described in this policy, unless a longer retention period is required by law.

## 9. Children's Privacy

Our services are not intended for children under [13/16] years of age. We do not knowingly collect data from children.

## 10. Changes to This Policy

We may update this Privacy Policy periodically. We will notify you of significant changes via [email/in-app notification].

## 11. Contact Us

For privacy-related inquiries:
- Email: [privacy@example.com]
- Address: [Physical address]

## 12. Regulatory Compliance

This policy complies with:
- [GDPR (EU)]
- [CCPA (California)]
- [Other applicable regulations]
```

---

## 11. CHECKLIST FOR IMPLEMENTATION

Use this checklist to ensure complete implementation:

### Cookie Consent
- [ ] Component created with modal/overlay
- [ ] 1-second delay before showing
- [ ] localStorage check on mount
- [ ] All 5 cookie categories implemented
- [ ] "Necessary" cannot be disabled
- [ ] Accept All / Decline All / Customize buttons
- [ ] Settings panel with toggles
- [ ] Focus trap when modal open
- [ ] Escape key closes modal
- [ ] Screen reader announcements
- [ ] Link to privacy policy
- [ ] Preferences saved to localStorage
- [ ] Event dispatched on consent change

### Accessibility Widget
- [ ] Floating button created
- [ ] Positioned bottom-left or bottom-right
- [ ] Click to expand panel
- [ ] Font size slider (80-150%)
- [ ] High contrast toggle
- [ ] Dark mode toggle
- [ ] Reduced motion toggle
- [ ] Keyboard navigation toggle
- [ ] Reset to defaults button
- [ ] Settings apply immediately
- [ ] Settings save to localStorage
- [ ] Focus trap when panel open
- [ ] Escape key closes panel
- [ ] Screen reader announcements
- [ ] Accessible icon/button

### Accessibility CSS
- [ ] .sr-only class for screen readers
- [ ] Focus indicators (:focus-visible)
- [ ] Enhanced focus for keyboard mode
- [ ] High contrast class
- [ ] Reduced motion class and media query
- [ ] Minimum touch target sizes (44x44px)
- [ ] Skip link styles
- [ ] Print styles (hide widgets)

### Security - CSP
- [ ] CSP directives defined
- [ ] Meta tag injection (production only)
- [ ] Violation event listener
- [ ] Violations stored in localStorage
- [ ] Console logging in development

### Security - Rate Limiter
- [ ] Rate limits defined per endpoint
- [ ] In-memory store with expiration
- [ ] checkRateLimit function
- [ ] withRateLimit wrapper
- [ ] useRateLimit hook (if using React)
- [ ] Cleanup interval for expired entries

### Security - Manager
- [ ] Singleton pattern
- [ ] Secure ID generation
- [ ] CSRF token management
- [ ] Login attempt tracking
- [ ] Lockout mechanism
- [ ] Input sanitization
- [ ] XSS detection
- [ ] Violation logging

### Privacy Policy
- [ ] Route created (/privacy-policy)
- [ ] All required sections included
- [ ] Cookie policy section
- [ ] User rights section
- [ ] Contact information
- [ ] Last updated date

### App Integration
- [ ] CSP initialized on mount
- [ ] Security manager instantiated
- [ ] Accessibility widget in component tree
- [ ] Cookie consent in component tree
- [ ] Privacy policy route accessible
- [ ] All localStorage keys documented

---

## 12. TESTING CHECKLIST

### Cookie Consent
- [ ] Banner appears on first visit (after 1 second)
- [ ] Banner does NOT appear on subsequent visits
- [ ] Accept All enables all cookies
- [ ] Decline All only enables necessary
- [ ] Customize panel opens correctly
- [ ] Individual toggles work
- [ ] Save Preferences saves correctly
- [ ] Clearing localStorage shows banner again
- [ ] Keyboard navigation works (Tab, Escape)
- [ ] Screen reader announces banner

### Accessibility Widget
- [ ] Button visible on all pages
- [ ] Panel opens on click
- [ ] Font size changes apply immediately
- [ ] High contrast visibly changes appearance
- [ ] Reduced motion stops animations
- [ ] Keyboard nav adds focus outlines
- [ ] Settings persist after page reload
- [ ] Reset restores defaults
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

### Security
- [ ] CSP violations logged (test with inline script)
- [ ] Rate limit blocks excessive requests
- [ ] CSRF token generated
- [ ] Input sanitization removes scripts
- [ ] XSS patterns detected
- [ ] Lockout triggers after failed logins

---

## PROMPT END

---

## Usage Instructions

1. **Copy this entire document** when starting a new project
2. **Provide to AI** with context about your tech stack (React, Vue, etc.)
3. **AI will adapt** component syntax, styling, and patterns to match your project
4. **Review and customize** the rate limits, CSP directives, and cookie categories for your specific needs
5. **Test thoroughly** using the provided checklists

## Customization Points

- **Colors/Styling:** Apply your design system's colors and spacing
- **Rate Limits:** Adjust based on your API's capacity
- **CSP Directives:** Add your specific trusted domains
- **Cookie Categories:** Add/remove based on what your app actually uses
- **Accessibility Features:** Add more options (dyslexia font, text spacing, etc.)
- **Translations:** Add i18n support for multi-language sites
