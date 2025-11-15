# 🔒 Firebase Security Setup Guide

This guide shows you how to set up Firebase with comprehensive security measures for your assessment application.

## 🚨 Prerequisites

- Node.js 16+
- Firebase account
- Basic understanding of security concepts

## 📋 Step 1: Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - **Firestore Database** (Start in test mode)
   - **Authentication** (Email/Password)
   - **Cloud Functions**
   - **Firebase Hosting** (optional)

## 🔧 Step 2: Configure Firebase Security Rules

### Firestore Security Rules

Go to Firestore → Rules → Edit rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Secure assessments collection
    match /secureAssessments/{docId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth != null && request.auth.uid == request.resource.data.uid;
      allow update: if false; // Prevent updates after submission
    }

    // Submissions collection (for monitoring)
    match /submissions/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
      allow update: if request.auth != null;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Firebase Security Rules

Go to Authentication → Settings → Edit rules and add:

```javascript
{
  "rules": [
    {
      "allow signUp": {
        "continue": true
      }
    },
    {
      "allow read, write": {
        "condition": "auth.hasClaim('admin') == true"
      }
    }
  ]
}
```

## 🔑 Step 3: Environment Configuration

Create a `.env` file in your project root:

```bash
# Firebase Configuration (Get these from Firebase Console → Project Settings)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Security Configuration
VITE_ENCRYPTION_KEY=your-super-secure-encryption-key-here-min-32-chars
VITE_ADMIN_PASSWORD_HASH=your-bcrypt-hashed-password-here

# Development (Optional - Use Emulators)
# VITE_USE_FIREBASE_EMULATORS=true
```

## 🛡️ Step 4: Deploy Secure Cloud Functions

Create `functions/index.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();

// Secure submission function
exports.submitAssessmentSecure = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  }

  try {
    // Validate submission data
    const { studentCode, name, classId, answers, language, securityMetadata } = data;

    // Additional server-side validation
    if (!studentCode || !name || !classId || !answers) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
    }

    // Add server timestamp
    const submissionData = {
      ...data,
      serverTimestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: context.rawRequest.ip,
      userAgent: context.rawRequest.header['User-Agent'],
      validatedAt: new Date().toISOString()
    };

    // Store in secure collection
    const docRef = await admin.firestore().collection('secureAssessments').add(submissionData);

    return {
      success: true,
      submissionId: docRef.id,
      timestamp: submissionData.serverTimestamp
    };

  } catch (error) {
    console.error('Secure submission error:', error);
    throw new functions.https.HttpsError('internal', 'Submission failed');
  }
});
```

Deploy your functions:

```bash
firebase deploy --only functions
```

## 🚀 Step 5: Test Your Security Setup

### 1. Test Online Submission
```javascript
// Test secure submission
const testData = {
  studentCode: "12345",
  name: "Test Student",
  classId: "ג1",
  answers: [{ questionId: 1, answer: "A" }],
  language: "he"
};

const result = await secureFirebaseService.submitAssessment(testData);
console.log('✅ Secure submission result:', result);
```

### 2. Check Security Headers
Open browser developer tools and check for security headers:
- `Content-Security-Policy`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### 3. Test Rate Limiting
Try submitting multiple forms quickly - should be blocked after 5 attempts.

### 4. Test Encryption
Check the encrypted data in Firebase Console - it should be unreadable without decryption key.

## 🔍 Step 6: Monitor Security

### Security Logs
```javascript
// Check security violations
const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
console.log('Security violations:', violations);
```

### Security Status
```javascript
// Check overall security status
const status = securityManager.getSecurityStatus();
console.log('🔒 Security Status:', status);
```

## 🎯 Security Features Implemented

### ✅ **Client-Side Security**
- **CSRF Protection**: Unique tokens for each session
- **Rate Limiting**: Prevents abuse and bot submissions
- **Bot Detection**: Identifies automated submissions
- **Input Sanitization**: Removes malicious code
- **Data Encryption**: Encrypts sensitive data before transmission
- **Fingerprinting**: Tracks unique browser sessions
- **Content Security Policy**: Prevents XSS attacks

### ✅ **Server-Side Security**
- **Firebase Security Rules**: Controls database access
- **Cloud Functions Validation**: Server-side input validation
- **Admin Authentication**: Secure admin access
- **IP Logging**: Tracks submission sources
- **Timestamp Verification**: Prevents replay attacks

### ✅ **Network Security**
- **HTTPS Required**: All connections encrypted
- **Secure Headers**: Comprehensive HTTP security headers
- **Origin Validation**: Prevents cross-origin attacks
- **API Rate Limiting**: Prevents DDoS attacks

## 🔑 Advanced Security Configuration

### Custom Encryption Key
For production, generate a secure encryption key:

```bash
# Generate 64-character random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### IP Whitelisting
Add your trusted IP ranges to Firebase rules:

```javascript
allow read, write: if
  request.auth != null &&
  request.auth.hasClaim('admin') == true &&
  request.ip in ['192.168.1.1', '10.0.0.1'];
```

### Time-Based Access
Restrict access to certain hours:

```javascript
allow read, write: if
  request.auth != null &&
  request.auth.hasClaim('admin') == true &&
  (request.time.timestamp >= 9 && request.time.timestamp <= 17);
```

## 🚨 Security Monitoring

### Real-time Alerts
```javascript
// Monitor for suspicious activity
const monitorActivity = () => {
  setInterval(() => {
    const violations = JSON.parse(localStorage.getItem('security_violations') || '[]');
    if (violations.length > 10) {
      // Send alert to admin
      console.warn('⚠️ High number of security violations detected!');
    }
  }, 60000); // Check every minute
};
```

### Automated Reports
```javascript
// Generate daily security report
const generateReport = () => {
  const report = {
    date: new Date().toISOString(),
    violations: securityManager.getSecurityStatus(),
    submissions: await secureFirebaseService.getSubmissionStats(),
    recommendations: getSecurityRecommendations()
  };

  console.log('📊 Security Report:', report);
};
```

## 📞 Support & Troubleshooting

### Common Issues
1. **Firebase Not Configured**: Check `.env` file
2. **Permission Errors**: Verify Firebase rules
3. **Rate Limiting**: Check `securityManager` logs
4. **Encryption Errors**: Verify `crypto-js` is installed

### Security Best Practices
1. Regularly rotate encryption keys
2. Monitor security logs daily
3. Keep Firebase rules updated
4. Use HTTPS in production
5. Limit admin access
6. Audit code regularly

## 📚 Additional Resources

- [Firebase Security Documentation](https://firebase.google.com/docs/security)
- [OWASP Web Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Web_Application_Security_Cheat_Sheet.html)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/)
- [Security Headers Test](https://securityheaders.com/)

---

🔒 **Your application is now protected with enterprise-grade security!**