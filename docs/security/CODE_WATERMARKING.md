# Code Watermarking & Fingerprinting

**ISHEBOT - Tracking Unauthorized Copies**

This document explains how to add digital fingerprints and watermarks to your code to track unauthorized copies and prove ownership.

---

## 🎯 Purpose

Code watermarking helps you:
- **Prove ownership** in copyright disputes
- **Track unauthorized copies** and identify the source
- **Deter theft** by making copying detectable
- **Identify violators** by unique fingerprints

---

## 🔍 Types of Watermarking

### 1. Copyright Headers (Already Implemented)

**Location:** `src/App.tsx:1`, `src/main.tsx:1`, `src/services/ishebotClient.js:1`

Every major source file includes:
```javascript
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
```

**Detection:** Easy - visible in source code and preserved in compiled code

---

### 2. Metadata Watermarks

**In package.json:**

```json
{
  "name": "ai-student-analysis-dashboard",
  "version": "1.0.1",
  "description": "AI-powered student analysis dashboard with Claude AI integration",
  "private": true,
  "author": {
    "name": "Waseem Abu Akel",
    "email": "wardwas3107@gmail.com"
  },
  "copyright": "Copyright (c) 2025 Waseem Abu Akel - All Rights Reserved",
  "license": "PROPRIETARY"
}
```

**Detection:** Easy - check package.json in any copy

---

### 3. Build-time Watermarks

**Add to vite.config.js:**

```javascript
import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_ID__: JSON.stringify(crypto.randomUUID()),
    __COPYRIGHT__: JSON.stringify('© 2025 Waseem Abu Akel - ISHEBOT™'),
    __LICENSE_INFO__: JSON.stringify('PROPRIETARY - Unauthorized use prohibited'),
  },
  // ... rest of config
});
```

**Usage in code:**

```javascript
// This will be replaced at build time
console.log('Build:', __BUILD_TIME__, __BUILD_ID__);
console.log('Copyright:', __COPYRIGHT__);

// Add to a hidden div in your app
<div style={{ display: 'none' }} data-build-id={__BUILD_ID__} data-copyright={__COPYRIGHT__} />
```

**Detection:** Check compiled JavaScript for these constants

---

### 4. Unique Component IDs

**Add unique identifiers to components:**

```javascript
// In App.tsx or main components
const ISHEBOT_APP_ID = 'ishebot-v1-2025-prod-auth-wabuakel';
const ISHEBOT_SIGNATURE = btoa('ISHEBOT©2025-WaseemAbuAkel');

function App() {
  return (
    <div
      data-app-id={ISHEBOT_APP_ID}
      data-signature={ISHEBOT_SIGNATURE}
      className="app"
    >
      {/* Your app */}
    </div>
  );
}
```

**Detection:**
- View page source: `Ctrl+U` or `Cmd+Option+U`
- Search for `ishebot` or `wabuakel`

---

### 5. Stealth Watermarks (Hidden Comments)

**Add hidden comments in strategic locations:**

```javascript
// In various files throughout the codebase
/*
 * Proprietary code - Copyright 2025 Waseem Abu Akel
 * Build: [unique-build-id]
 * License: PROPRIETARY
 */

// or even more subtle:
// prettier-ignore
const _license = 'PROPRIETARY-ISHEBOT-2025-WA'; // DO NOT REMOVE

// or in CSS:
/*! Copyright 2025 Waseem Abu Akel - ISHEBOT™ - All Rights Reserved */
```

**Note:** Comments might be removed by minifiers. Use `/*! */` to preserve in production.

---

### 6. Console Watermarks

**Add to main.tsx or App.tsx:**

```javascript
// Add this early in your app initialization
if (import.meta.env.PROD) {
  console.log(
    '%c⚠️ ISHEBOT™ - PROPRIETARY SOFTWARE',
    'color: red; font-size: 20px; font-weight: bold;'
  );
  console.log(
    '%cCopyright © 2025 Waseem Abu Akel - All Rights Reserved',
    'color: orange; font-size: 14px;'
  );
  console.log(
    '%cUnauthorized use, copying, or distribution is strictly prohibited.',
    'color: yellow; font-size: 12px;'
  );
  console.log(
    '%cFor licensing: wardwas3107@gmail.com',
    'color: white; font-size: 12px;'
  );
  console.log(
    '%cViolators will be prosecuted to the fullest extent of the law.',
    'color: red; font-size: 12px; font-weight: bold;'
  );
}
```

**Detection:** Open browser console - watermark is visible

---

### 7. Custom Error Messages

**Add proprietary notices to error boundaries:**

```javascript
// In ErrorBoundary component
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('ISHEBOT Error (© 2025 Waseem Abu Akel):', error);

    // Log to your error tracking service
    this.logError(error, {
      ...errorInfo,
      copyright: 'ISHEBOT © 2025 Waseem Abu Akel',
      license: 'PROPRIETARY',
      contact: 'wardwas3107@gmail.com'
    });
  }
}
```

**Detection:** Trigger an error, check console or error logs

---

### 8. Analytics Fingerprints

**If using analytics, add custom dimensions:**

```javascript
// When initializing analytics
analytics.setCustomDimension('app_owner', 'Waseem Abu Akel');
analytics.setCustomDimension('app_copyright', 'ISHEBOT-2025');
analytics.setCustomDimension('license_type', 'PROPRIETARY');
```

**Detection:** Check analytics configuration in network tab

---

## 🔒 License Validation (Advanced)

**For licensed deployments, add license key validation:**

```javascript
// src/utils/licenseValidator.ts
export function validateLicense(licenseKey: string): boolean {
  // Simple example - in production, use more robust validation
  const validLicenses = [
    // Hash of valid license keys
    'school-abc-2025-hash',
    'school-xyz-2025-hash'
  ];

  const hash = btoa(licenseKey).substring(0, 20);

  if (!validLicenses.includes(hash)) {
    console.error('INVALID LICENSE - ISHEBOT © 2025 Waseem Abu Akel');
    console.error('Contact: wardwas3107@gmail.com');
    return false;
  }

  return true;
}

// In App.tsx
useEffect(() => {
  const license = import.meta.env.VITE_LICENSE_KEY;

  if (!validateLicense(license)) {
    alert('Invalid or missing license. Contact wardwas3107@gmail.com');
    // Optionally disable functionality
  }
}, []);
```

**Detection:** Unauthorized copies will fail license validation

---

## 🕵️ Detecting Unauthorized Copies

### Automated Detection:

**1. Google Search Operators:**
```
"ISHEBOT" -site:github.com/ward3107
"Waseem Abu Akel" "student analytics"
"ishebotClient" filetype:js
```

**2. GitHub Code Search:**
```
"Copyright (c) 2025 Waseem Abu Akel"
"ISHEBOT - Intelligent Student"
org:* "ishebotClient"
```

**3. Monitor Your Watermarks:**
Set up Google Alerts for:
- "ISHEBOT"
- "Waseem Abu Akel" + "student analytics"
- Your unique build IDs or signatures

### Manual Detection:

**When you find a suspicious deployment:**

1. **View page source** (Ctrl+U)
2. **Search for your watermarks:**
   - Copyright notices
   - ISHEBOT mentions
   - Your name
   - Unique IDs
3. **Check console** for console watermarks
4. **Inspect network tab** for API calls to your services
5. **Check package.json** (if accessible)

**Evidence Collection:**

```bash
# Save evidence
curl https://suspicious-site.com > evidence.html

# Check for watermarks
grep -i "waseem" evidence.html
grep -i "ishebot" evidence.html
grep -i "Copyright.*2025" evidence.html

# Screenshot everything
# Document URLs, dates, what features they copied
```

---

## 📋 Implementation Checklist

Implement these watermarks in your project:

- [x] **Copyright headers** in main source files (Already done)
- [ ] **package.json metadata** with author and copyright
- [ ] **Build-time constants** with unique IDs
- [ ] **Component data attributes** with signatures
- [ ] **Console watermarks** in production
- [ ] **Error message watermarks**
- [ ] **CSS comments** preserved with `/*! */`
- [ ] **Analytics custom dimensions** (if using analytics)
- [ ] **License validation** (optional, for licensed deployments)

---

## ⚖️ Legal Considerations

### What Watermarks Prove:

✅ **Prove ownership:** Your copyright notices in their code
✅ **Prove copying:** Identical unique IDs, build signatures
✅ **Establish timeline:** Build dates, version numbers
✅ **Show intent:** Your explicit warnings were visible

### What Watermarks DON'T Prevent:

❌ **Prevent copying:** Determined thieves can remove watermarks
❌ **Prevent stripping:** Watermarks can be removed (but leaves evidence of tampering)
❌ **Replace legal protection:** Still need LICENSE, DMCA, etc.

### Best Practices:

1. **Multiple layers:** Use many different watermarking techniques
2. **Some obvious, some hidden:** Copyright headers are obvious; build IDs are subtle
3. **Document everything:** Keep records of your watermarking strategy
4. **Regular monitoring:** Check for unauthorized copies monthly
5. **Quick response:** Act fast when you find violations

---

## 🛠️ Maintenance

### When Deploying:

1. **Generate new build ID** for each deployment
2. **Log build IDs** in a secure location
3. **Update version numbers** appropriately
4. **Verify watermarks** in production build

### When Finding Violations:

1. **Document the watermarks found** in the unauthorized copy
2. **Compare with your records** (build IDs, dates, etc.)
3. **Screenshot everything** before they can remove evidence
4. **Use as evidence** in DMCA takedown or legal action

---

## 📞 Questions?

For questions about implementing watermarks:
- **Owner:** Waseem Abu Akel
- **Email:** wardwas3107@gmail.com
- **Business Hours:** 10:00 - 19:00 (Israel Time)

---

## 📚 Related Documents

- [Anti-Abuse Guidelines](../../ANTI_ABUSE.md)
- [DMCA Takedown Template](./DMCA_TAKEDOWN_TEMPLATE.md)
- [Security Policy](../../SECURITY.md)
- [Incident Response](./INCIDENT_RESPONSE.md)

---

**Last Updated:** January 2025

**Copyright © 2025 Waseem Abu Akel - All Rights Reserved**
