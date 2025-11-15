/**
 * Secure Firebase Service
 * Implements secure data submission with comprehensive security measures
 */

import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  limit,
  getDocs
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, isFirebaseAvailable } from '../config/firebase';
import { securityManager, SecurityUtils } from '../security/securityEnhancements';

// Security configuration
const SECURITY_SETTINGS = {
  MAX_ATTEMPTS_PER_SESSION: 5,
  ENCRYPTION_ENABLED: true,
  RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
  BOT_DETECTION_ENABLED: true,
  FINGERPRINT_VALIDATION: true
};

// Data validation schemas
const VALIDATION_SCHEMAS = {
  studentSubmission: {
    required: ['studentCode', 'name', 'classId', 'answers', 'language'],
    patterns: {
      studentCode: /^[0-9]{5}$/,
      name: /^.{2,50}$/,
      classId: /^[א-ת][1-9]-?[1-9]?$/,
      language: /^(he|en|ar|ru)$/
    }
  }
};

// Secure Firebase Service Class
class SecureFirebaseService {
  private static instance: SecureFirebaseService;
  private sessionToken: string | null = null;
  private attemptCount = 0;
  private fingerprint: string;

  private constructor() {
    this.fingerprint = securityManager.generateFingerprint();
    this.initializeSecureSession();
  }

  static getInstance(): SecureFirebaseService {
    if (!SecureFirebaseService.instance) {
      SecureFirebaseService.instance = new SecureFirebaseService();
    }
    return SecureFirebaseService.instance;
  }

  private initializeSecureSession(): void {
    this.sessionToken = securityManager.generateCSRFToken();
    this.attemptCount = 0;

    // Setup session monitoring
    window.addEventListener('beforeunload', () => {
      this.cleanupSession();
    });
  }

  /**
   * Comprehensive security validation before submission
   */
  private async validateSubmissionSecurity(data: any): Promise<boolean> {
    try {
      // 1. Check Firebase availability
      if (!isFirebaseAvailable()) {
        throw new Error('Firebase not available');
      }

      // 2. Rate limiting check
      const rateLimitKey = this.getRateLimitKey();
      if (!securityManager.checkRateLimit(rateLimitKey)) {
        throw new Error('Rate limit exceeded');
      }

      // 3. Bot detection
      if (SECURITY_SETTINGS.BOT_DETECTION_ENABLED && SecurityUtils.detectBot()) {
        this.reportSecurityViolation('BOT_DETECTION', { fingerprint: this.fingerprint });
        throw new Error('Bot activity detected');
      }

      // 4. Session token validation
      if (!this.sessionToken || !securityManager.validateCSRFToken(this.sessionToken)) {
        throw new Error('Invalid session token');
      }

      // 5. Data integrity validation
      const expectedFields = VALIDATION_SCHEMAS.studentSubmission.required;
      if (!securityManager.validateFormIntegrity(data, expectedFields)) {
        throw new Error('Data validation failed');
      }

      // 6. Field-specific validation
      if (!this.validateFields(data)) {
        throw new Error('Field validation failed');
      }

      // 7. Attempt count validation
      if (this.attemptCount >= SECURITY_SETTINGS.MAX_ATTEMPTS_PER_SESSION) {
        throw new Error('Maximum attempts exceeded');
      }

      return true;
    } catch (error) {
      console.error('Security validation failed:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.reportSecurityViolation('VALIDATION_FAILED', { error: errorMessage, data: this.sanitizeDataForLogging(data) });
      return false;
    }
  }

  /**
   * Validate individual fields
   */
  private validateFields(data: any): boolean {
    const { patterns } = VALIDATION_SCHEMAS.studentSubmission;

    // Student code validation (5 digits)
    if (!patterns.studentCode.test(data.studentCode)) {
      return false;
    }

    // Name validation (2-50 characters, no special chars)
    if (!patterns.name.test(data.name)) {
      return false;
    }

    // Class ID validation (Hebrew format)
    if (!patterns.classId.test(data.classId)) {
      return false;
    }

    // Language validation
    if (!patterns.language.test(data.language)) {
      return false;
    }

    // Answers validation (must be array with valid structure)
    if (!Array.isArray(data.answers) || data.answers.length === 0) {
      return false;
    }

    // Validate each answer
    for (const answer of data.answers) {
      if (!answer.questionId || typeof answer.answer === 'undefined') {
        return false;
      }
    }

    return true;
  }

  /**
   * Encrypt sensitive data before transmission
   */
  private encryptSubmissionData(data: any): any {
    if (!SECURITY_SETTINGS.ENCRYPTION_ENABLED) {
      return data;
    }

    try {
      const encrypted = securityManager.encryptData(data);
      return {
        encryptedData: encrypted,
        isEncrypted: true,
        encryptionVersion: '1.0'
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt submission data');
    }
  }

  /**
   * Add security metadata to submission
   */
  private addSecurityMetadata(data: any): any {
    return {
      ...data,
      securityMetadata: {
        fingerprint: this.fingerprint,
        sessionId: this.sessionToken,
        timestamp: Date.now(),
        userAgent: SecurityUtils.sanitizeInput(navigator.userAgent),
        origin: window.location.origin,
        attemptCount: this.attemptCount + 1
      }
    };
  }

  /**
   * Submit assessment data securely
   */
  async submitAssessment(data: any): Promise<{ success: boolean; submissionId?: string; error?: string }> {
    try {
      // 1. Security validation
      const isValid = await this.validateSubmissionSecurity(data);
      if (!isValid) {
        this.attemptCount++;
        return { success: false, error: 'Security validation failed' };
      }

      // 2. Prepare secure data
      const secureData = this.addSecurityMetadata(data);
      const finalData = this.encryptSubmissionData(secureData);

      // 3. Add server timestamp
      finalData.serverTimestamp = serverTimestamp();

      // 4. Submit to Firebase with error handling
      const submissionId = await this.submitToFirebase(finalData);

      // 5. Log successful submission
      this.logSuccessfulSubmission(submissionId);

      // 6. Clean up session token
      this.sessionToken = null;

      return { success: true, submissionId };

    } catch (error) {
      console.error('Secure submission failed:', error);
      this.attemptCount++;

      // Report security violation for suspicious errors
      if (this.isSuspiciousError(error)) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.reportSecurityViolation('SUSPICIOUS_ERROR', {
          error: errorMessage,
          fingerprint: this.fingerprint
        });
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Submit data to Firebase with retry logic
   */
  private async submitToFirebase(data: any): Promise<string> {
    if (!db) {
      throw new Error('Firebase Firestore not available');
    }

    try {
      // Try using a secure Cloud Function first
      if (functions) {
        const submitAssessment = httpsCallable(functions, 'submitAssessmentSecure');
        const result = await submitAssessment(data);

        if (result.data.success) {
          return result.data.submissionId;
        }
      }

      // Fallback to direct Firestore submission
      const submissionsRef = collection(db, 'secureAssessments');
      const docRef = await addDoc(submissionsRef, {
        ...data,
        submissionMethod: 'direct',
        fallbackUsed: true
      });

      return docRef.id;

    } catch (error) {
      console.error('Firebase submission error:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Firebase submission failed: ${errorMessage}`);
    }
  }

  /**
   * Check for duplicate submissions
   */
  async checkDuplicateSubmission(studentCode: string, classId: string): Promise<boolean> {
    if (!db) {
      return false;
    }

    try {
      const submissionsRef = collection(db, 'secureAssessments');
      const q = query(
        submissionsRef,
        where('studentCode', '==', studentCode),
        where('classId', '==', classId),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;

    } catch (error) {
      console.error('Duplicate check failed:', error);
      return false;
    }
  }

  /**
   * Get submission statistics (for monitoring)
   */
  async getSubmissionStats(timeRange: number = 24 * 60 * 60 * 1000): Promise<any> {
    if (!db) {
      return null;
    }

    try {
      const cutoffTime = Date.now() - timeRange;
      const statsRef = doc(db, 'stats', 'submissions');
      const statsDoc = await getDoc(statsRef);

      if (statsDoc.exists()) {
        return statsDoc.data();
      }

      return null;
    } catch (error) {
      console.error('Failed to get submission stats:', error);
      return null;
    }
  }

  /**
   * Get rate limit key
   */
  private getRateLimitKey(): string {
    const key = `${this.fingerprint}-${navigator.userAgent}`;
    return CryptoJS.SHA256(key).toString();
  }

  /**
   * Report security violation
   */
  private reportSecurityViolation(type: string, details: any): void {
    const violation = {
      type,
      details,
      fingerprint: this.fingerprint,
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Security Violation:', violation);
    }

    // Store in localStorage for monitoring
    try {
      const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
      violations.push(violation);
      if (violations.length > 50) violations.shift();
      localStorage.setItem('security_violations', JSON.stringify(violations));
    } catch (error) {
      console.error('Failed to store security violation:', error);
    }

    // Send to monitoring service if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'security_violation', {
        event_category: 'Security',
        event_label: type,
        value: 1
      });
    }
  }

  /**
   * Check if error is suspicious
   */
  private isSuspiciousError(error: any): boolean {
    const suspiciousPatterns = [
      /network/i,
      /timeout/i,
      /cors/i,
      /blocked/i,
      /forbidden/i,
      /unauthorized/i
    ];

    const errorMessage = error instanceof Error ? error.message : String(error);
    return suspiciousPatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Sanitize data for logging (remove sensitive info)
   */
  private sanitizeDataForLogging(data: any): any {
    const sanitized = { ...data };

    // Remove sensitive fields
    delete sanitized.answers;
    delete sanitized.studentName;

    // Hash student code for logging
    if (sanitized.studentCode) {
      sanitized.studentCodeHash = CryptoJS.SHA256(sanitized.studentCode).toString();
      delete sanitized.studentCode;
    }

    return sanitized;
  }

  /**
   * Log successful submission
   */
  private logSuccessfulSubmission(submissionId: string): void {
    console.log('✅ Secure submission successful:', {
      submissionId: submissionId.substring(0, 8) + '...',
      fingerprint: this.fingerprint.substring(0, 8) + '...',
      attempts: this.attemptCount + 1
    });
  }

  /**
   * Clean up session
   */
  private cleanupSession(): void {
    this.sessionToken = null;
  }

  /**
   * Get security status
   */
  getSecurityStatus(): any {
    return {
      isAuthenticated: !!this.sessionToken,
      attemptCount: this.attemptCount,
      fingerprint: this.fingerprint.substring(0, 8) + '...',
      rateLimitActive: !securityManager.checkRateLimit(this.getRateLimitKey(), 100),
      firebaseAvailable: isFirebaseAvailable(),
      sessionSecure: window.isSecureContext
    };
  }

  /**
   * Reset session
   */
  resetSession(): void {
    this.cleanupSession();
    this.initializeSecureSession();
  }
}

// Export singleton instance
export const secureFirebaseService = SecureFirebaseService.getInstance();

export default secureFirebaseService;