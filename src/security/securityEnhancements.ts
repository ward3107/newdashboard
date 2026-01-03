/**
 * Advanced Security Enhancements
 * Implements multiple layers of security for hack-proof HTML
 *
 * NOTE: Client-side encryption removed - HTTPS provides encryption in transit.
 * Client-side encryption with public keys is not effective for security.
 */

import logger from '../utils/logger';

// Security Configuration
export const SECURITY_CONFIG = {
  // Rate limiting
  MAX_SUBMISSIONS_PER_HOUR: 5,
  MAX_LOGIN_ATTEMPTS: 3,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes

  // Token security
  TOKEN_EXPIRY_MS: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN_BUFFER_MS: 5 * 60 * 1000, // 5 minutes

  // Request validation
  MAX_REQUEST_SIZE_BYTES: 1024 * 1024, // 1MB
  ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://yourdomain.com'
  ],
};

// Security Interfaces
// Note: Most headers are set via HTTP headers in vercel.json
// Only client-side applicable headers are listed here
interface SecurityHeaders {
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

interface RateLimitEntry {
  count: number;
  lastReset: number;
  isLocked: boolean;
  lockUntil?: number;
}

interface SecurityToken {
  value: string;
  createdAt: number;
  expiresAt: number;
  type: 'csrf' | 'session' | 'submit';
}

/**
 * Security State Management
 */
class SecurityManager {
  private static instance: SecurityManager;
  private rateLimits = new Map<string, RateLimitEntry>();
  private tokens = new Map<string, SecurityToken>();
  private sessionId: string;
  private clickHandler: (() => void) | null = null;

  private constructor() {
    this.sessionId = this.generateSecureId();
    this.initializeSecurity();
  }

  static getInstance(): SecurityManager {
    if (!SecurityManager.instance) {
      SecurityManager.instance = new SecurityManager();
    }
    return SecurityManager.instance;
  }

  private generateSecureId(): string {
    // Use crypto.getRandomValues for secure random ID generation
    const array = new Uint8Array(24);
    window.crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private initializeSecurity(): void {
    // Clear old data on init
    this.clearExpiredData();

    // Setup monitoring
    this.setupSecurityMonitoring();

    // Apply security headers
    this.applySecurityHeaders();
  }

  /**
   * Apply comprehensive security headers
   * Note: Most security headers are set via HTTP headers in vercel.json
   * Only client-side applicable headers are set here
   */
  private applySecurityHeaders(): void {
    // Security headers are primarily set via HTTP headers in vercel.json
    // X-Frame-Options, HSTS, and X-Content-Type-Options cannot be set via meta tags
    // Only setting CSP-compatible headers here
    const headers = {
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()'
    };

    // Apply to document (for client-side)
    Object.entries(headers).forEach(([key, value]) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = key;
      meta.content = value;
      document.head.appendChild(meta);
    });
  }

  /**
   * Rate limiting implementation
   */
  public checkRateLimit(identifier: string, maxRequests: number = SECURITY_CONFIG.MAX_SUBMISSIONS_PER_HOUR): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(identifier);

    if (!entry) {
      this.rateLimits.set(identifier, {
        count: 1,
        lastReset: now,
        isLocked: false
      });
      return true;
    }

    // Check if locked
    if (entry.isLocked && entry.lockUntil && entry.lockUntil > now) {
      return false;
    }

    // Reset lock if expired
    if (entry.isLocked && entry.lockUntil && entry.lockUntil <= now) {
      entry.isLocked = false;
      entry.count = 0;
      entry.lastReset = now;
    }

    // Reset counter if hour has passed
    const hourInMs = 60 * 60 * 1000;
    if (now - entry.lastReset > hourInMs) {
      entry.count = 1;
      entry.lastReset = now;
      return true;
    }

    // Check limit
    if (entry.count >= maxRequests) {
      entry.isLocked = true;
      entry.lockUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION_MS;
      return false;
    }

    entry.count++;
    return true;
  }

  /**
   * Generate secure CSRF token
   */
  public generateCSRFToken(): string {
    const token: SecurityToken = {
      value: this.generateSecureId(),
      createdAt: Date.now(),
      expiresAt: Date.now() + SECURITY_CONFIG.TOKEN_EXPIRY_MS,
      type: 'csrf'
    };

    this.tokens.set(token.value, token);
    return token.value;
  }

  /**
   * Validate CSRF token
   */
  public validateCSRFToken(token: string): boolean {
    const storedToken = this.tokens.get(token);

    if (!storedToken || storedToken.type !== 'csrf') {
      return false;
    }

    if (Date.now() > storedToken.expiresAt) {
      this.tokens.delete(token);
      return false;
    }

    return true;
  }

  /**
   * Validate request origin
   */
  public validateOrigin(origin: string): boolean {
    return SECURITY_CONFIG.ALLOWED_ORIGINS.includes(origin) ||
           origin.startsWith('http://localhost:') ||
           origin.endsWith('.yourdomain.com');
  }

  /**
   * Generate secure fingerprint using SubtleCrypto API
   */
  public async generateFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Security fingerprint', 2, 2);
    }

    const fingerprintData = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      this.sessionId
    ].join('|');

    // Use SubtleCrypto for secure hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprintData);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clear expired data
   */
  private clearExpiredData(): void {
    const now = Date.now();

    // Clear expired tokens
    for (const [token, tokenData] of this.tokens.entries()) {
      if (now > tokenData.expiresAt) {
        this.tokens.delete(token);
      }
    }

    // Clear expired rate limits
    for (const [identifier, rateData] of this.rateLimits.entries()) {
      if (!rateData.isLocked && now - rateData.lastReset > 60 * 60 * 1000) {
        this.rateLimits.delete(identifier);
      }
    }
  }

  /**
   * Setup security monitoring
   */
  private setupSecurityMonitoring(): void {
    // Monitor for console access
    const originalConsole = { ...console };

    // Log security violations
    window.addEventListener('error', (event) => {
      if (event.message.includes('Security') || event.message.includes('CSP')) {
        this.reportSecurityViolation('SCRIPT_ERROR', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack
        });
      }
    });

    // Monitor for suspicious activity
    let suspiciousActivityCount = 0;
    this.clickHandler = () => {
      suspiciousActivityCount++;
      if (suspiciousActivityCount > 1000) { // Bot detection
        this.reportSecurityViolation('SUSPICIOUS_ACTIVITY', { clicks: suspiciousActivityCount });
      }
    };
    document.addEventListener('click', this.clickHandler);
  }

  /**
   * Report security violations
   */
  private async reportSecurityViolation(type: string, details: any): Promise<void> {
    const violation = {
      type,
      details,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      fingerprint: await this.generateFingerprint(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    logger.error('Security Violation:', violation);

    // Store for monitoring
    try {
      const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
      violations.push(violation);
      if (violations.length > 100) violations.shift(); // Keep only last 100
      localStorage.setItem('security_violations', JSON.stringify(violations));
    } catch (error) {
      logger.error('Failed to store security violation:', error);
    }
  }

  /**
   * Validate form data integrity
   */
  public validateFormIntegrity(data: any, expectedFields: string[]): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check for required fields
    for (const field of expectedFields) {
      if (!(field in data)) {
        return false;
      }
    }

    // Check for suspicious patterns
    const jsonString = JSON.stringify(data);
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(jsonString)) {
        this.reportSecurityViolation('SUSPICIOUS_INPUT', { data, pattern: pattern.source });
        return false;
      }
    }

    return true;
  }

  /**
   * Get security status
   */
  public async getSecurityStatus(): Promise<any> {
    return {
      sessionId: this.sessionId,
      fingerprint: await this.generateFingerprint(),
      rateLimitsCount: this.rateLimits.size,
      activeTokens: this.tokens.size,
      isSecure: this.isEnvironmentSecure()
    };
  }

  /**
   * Check if environment is secure
   */
  private isEnvironmentSecure(): boolean {
    return (
      window.isSecureContext &&
      !window.location.hostname.includes('localhost') &&
      !window.location.protocol.includes('http:') &&
      window.crypto.subtle !== undefined
    );
  }

  /**
   * Cleanup event listeners to prevent memory leaks
   * Call this when the security manager is no longer needed
   */
  public cleanup(): void {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
    // Clear rate limits and tokens
    this.rateLimits.clear();
    this.tokens.clear();
  }
}

/**
 * Export singleton instance
 */
export const securityManager = SecurityManager.getInstance();

/**
 * Security utility functions
 */
export const SecurityUtils = {
  /**
   * Validate input for security
   */
  validateInput(input: string): boolean {
    if (!input || typeof input !== 'string') return false;

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /data:text\/html/i,
      /vbscript:/i,
      /file:/i,
      /ftp:/i
    ];

    return !suspiciousPatterns.some(pattern => pattern.test(input));
  },

  /**
   * Sanitize input
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove HTML brackets
      .replace(/javascript:/gi, '') // Remove javascript URLs
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate Hebrew characters
   */
  validateHebrew(text: string): boolean {
    const hebrewRegex = /^[\u0590-\u05FF\s\-'".,!?()]+$/;
    return hebrewRegex.test(text);
  },

  /**
   * Check for bot behavior
   */
  detectBot(): boolean {
    const indicators = [
      navigator.webdriver, // Selenium detection
      !((window as any).chrome), // Headless browser detection
      navigator.languages.length === 0, // No languages set
      navigator.plugins.length === 0, // No plugins
      window.outerHeight === 0, // Headless browser
      window.outerWidth === 0
    ];

    return indicators.some(Boolean);
  },

  /**
   * Generate secure random number
   */
  secureRandom(min: number, max: number): number {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % (max - min + 1));
  }
};

export default securityManager;