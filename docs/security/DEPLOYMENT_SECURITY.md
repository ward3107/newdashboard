# Deployment Security Guide

**ISHEBOT - Production Deployment Security Best Practices**

This guide covers security measures for deploying ISHEBOT to production environments.

---

## 🎯 Overview

Deploying to production requires additional security measures beyond development. This guide ensures your deployment is secure, compliant, and protected against common threats.

---

## 🔐 Environment Configuration

### 1. Environment Variables

**NEVER** hardcode secrets in your code. Always use environment variables.

#### Required Environment Variables:

```bash
# Firebase Configuration (REQUIRED)
VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Apps Script (REQUIRED)
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID

# Admin Security (REQUIRED)
VITE_ADMIN_PASSWORD=use_bcrypt_hashed_password_here_min_16_chars
VITE_SESSION_TIMEOUT_MS=3600000  # 1 hour recommended
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION_MS=900000  # 15 minutes

# OpenAI / ISHEBOT (REQUIRED)
VITE_OPENAI_API_KEY=sk-your-real-openai-key
VITE_ISHEBOT_API_KEY=your_production_ishebot_key

# Production Settings (REQUIRED)
NODE_ENV=production
VITE_DEV_MODE=false
VITE_LOG_LEVEL=error  # or 'warn', NOT 'debug'
```

#### Security Best Practices for Environment Variables:

1. **Use your hosting platform's secret management:**
   - **Vercel:** Environment Variables in project settings
   - **Netlify:** Environment variables in site settings
   - **AWS:** AWS Secrets Manager or Parameter Store
   - **Azure:** Azure Key Vault
   - **Google Cloud:** Secret Manager

2. **Never commit `.env` files** - Already in `.gitignore`

3. **Rotate secrets regularly:**
   - API keys: Every 90 days
   - Admin passwords: Every 60 days
   - Database credentials: Every 90 days

4. **Use different secrets for each environment:**
   - Development
   - Staging
   - Production

---

## 🛡️ Firebase Security

### Firebase Security Rules

**Firestore Rules Example:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }

    // More restrictive: Only admins
    match /students/{studentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.auth.token.admin == true;
    }
  }
}
```

**Firebase Storage Rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
                     request.resource.size < 5 * 1024 * 1024; // 5MB max
    }
  }
}
```

### Firebase Configuration Restrictions:

1. **Restrict API key to authorized domains:**
   - Go to Google Cloud Console
   - Navigate to "Credentials"
   - Edit API Key
   - Add only your production domain(s)

2. **Enable Firebase App Check:**
   - Prevents abuse from unauthorized apps
   - Requires reCAPTCHA or device attestation

3. **Set up billing alerts:**
   - Prevent unexpected costs from abuse
   - Set daily/monthly spending limits

---

## 🔒 HTTPS & SSL/TLS

### Requirements:

- ✅ **HTTPS is mandatory** - No HTTP in production
- ✅ **TLS 1.2 or higher** - Disable older protocols
- ✅ **Valid SSL certificate** - No self-signed certs
- ✅ **HSTS enabled** - Force HTTPS for all requests

### Implementation:

Most hosting platforms (Vercel, Netlify) handle HTTPS automatically. For custom servers:

**Nginx Configuration:**

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 🛡️ Security Headers

### Required Security Headers:

Add these headers to your production deployment:

```javascript
// vite.config.js or server configuration
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "geolocation=(), microphone=(), camera=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.openai.com https://*.googleapis.com https://*.firebaseapp.com"
        }
      ]
    }
  ]
}
```

### For Vercel (vercel.json):

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000"
        }
      ]
    }
  ]
}
```

### For Netlify (_headers file):

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

---

## 🔐 API Security

### Rate Limiting

Implement rate limiting to prevent abuse:

**Example using Express:**

```javascript
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', apiLimiter);
```

### CORS Configuration

**Production CORS - Be Specific:**

```javascript
// ❌ BAD - Don't use in production
app.use(cors({ origin: '*' }));

// ✅ GOOD - Specific domains only
app.use(cors({
  origin: ['https://yourdomain.com', 'https://www.yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### API Key Validation

**Backend validation example:**

```javascript
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.ISHEBOT_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

app.use('/api/', validateApiKey);
```

---

## 🔒 Database Security

### If Using MongoDB:

1. **Enable authentication:**
   ```javascript
   mongodb://username:password@host:port/database
   ```

2. **Use connection string from environment variables:**
   ```javascript
   mongoose.connect(process.env.MONGODB_URI);
   ```

3. **Restrict IP access:**
   - MongoDB Atlas: Add only production server IPs

4. **Enable encryption at rest:**
   - Most cloud providers support this

### If Using PostgreSQL/MySQL:

1. **Use SSL connections:**
   ```javascript
   {
     ssl: {
       rejectUnauthorized: true,
       ca: fs.readFileSync('/path/to/ca-cert.pem')
     }
   }
   ```

2. **Principle of least privilege:**
   - App user should NOT have admin privileges
   - Only grant necessary permissions

---

## 🛡️ Content Security Policy (CSP)

Implement a strict CSP to prevent XSS attacks:

```html
<meta http-equiv="Content-Security-Policy"
      content="default-src 'self';
               script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;
               font-src 'self' data:;
               connect-src 'self' https://api.openai.com https://*.googleapis.com https://*.firebaseapp.com;
               frame-ancestors 'none';">
```

**Note:** Adjust based on your actual external resources.

---

## 📊 Monitoring & Logging

### Error Tracking

Implement error tracking (recommended: Sentry):

```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // 10% of transactions
  beforeSend(event) {
    // Filter out sensitive data
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  }
});
```

### Security Event Logging

Log security-critical events:
- Failed login attempts
- Password changes
- Admin actions
- API key usage
- Unauthorized access attempts

**Example:**

```javascript
const logSecurityEvent = (event, details) => {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'security',
    event: event,
    details: details,
    // DO NOT log passwords or API keys
  }));
};

// Usage
logSecurityEvent('failed_login', { username: 'admin', ip: req.ip });
```

---

## 🔄 Backup & Disaster Recovery

### Automated Backups

1. **Database backups:**
   - Daily automated backups
   - Keep 30 days of backups
   - Test restoration monthly

2. **Code repository:**
   - Git repository is your backup
   - Consider private mirror on another platform

3. **Environment configuration:**
   - Document all environment variables
   - Keep encrypted backup of production .env

### Disaster Recovery Plan

1. **Define Recovery Time Objective (RTO):** 4 hours
2. **Define Recovery Point Objective (RPO):** 24 hours
3. **Test restoration quarterly**
4. **Document recovery procedures**

---

## 🚨 Incident Response

See [INCIDENT_RESPONSE.md](./INCIDENT_RESPONSE.md) for detailed procedures.

**Quick response:**

1. **Security breach detected:**
   - Isolate affected systems
   - Rotate all credentials
   - Notify users if data compromised
   - Document everything
   - Contact: wardwas3107@gmail.com

2. **Unauthorized access:**
   - Block IP addresses
   - Review access logs
   - Change admin passwords
   - Enable 2FA if not already

3. **Data leak:**
   - Identify scope of leak
   - Notify affected parties
   - Report to authorities if required (GDPR, Israeli law)
   - Update security measures

---

## ✅ Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All environment variables set in hosting platform
- [ ] `.env` file is NOT deployed (in .gitignore)
- [ ] HTTPS is enforced
- [ ] Security headers are configured
- [ ] CORS is restricted to production domains
- [ ] API rate limiting is enabled
- [ ] Firebase security rules are configured
- [ ] Database access is restricted
- [ ] Error tracking is configured
- [ ] Backups are automated
- [ ] Monitoring alerts are set up
- [ ] Build is optimized: `npm run build`
- [ ] Security audit passed: `npm audit`
- [ ] All tests passing: `npm test`

---

## 📞 Security Support

For deployment security questions:
- **Owner:** Waseem Abu Akel
- **Email:** wardwas3107@gmail.com
- **Business Hours:** 10:00 - 19:00 (Israel Time)

---

**Last Updated:** January 2025

**Copyright © 2025 Waseem Abu Akel - All Rights Reserved**
