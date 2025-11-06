# 🔐 Environment Variables Reference

**Project:** ISHEBOT Student Analysis Dashboard
**Last Updated:** 2025-01-06

---

## 📋 Overview

This document lists all environment variables used in the application and where to configure them.

---

## 🔥 Firebase Configuration (REQUIRED for Production)

These variables connect your app to Firebase for authentication and Firestore database.

### Where to Get Values
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ **Settings** → **Project Settings**
4. Scroll to **"Your apps"** section
5. Find your Web App configuration

### Variables

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIzaSyC...` | ✅ Yes |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `my-app.firebaseapp.com` | ✅ Yes |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-id` | ✅ Yes |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `my-app.appspot.com` | ✅ Yes |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender ID | `123456789012` | ✅ Yes |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` | ✅ Yes |

### Where to Set

#### For Vercel:
1. Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add each variable with scope: **Production**, **Preview**, **Development**

#### For Local Development:
Create a `.env` file in project root:
```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🗄️ Data Source Configuration

These control where the app gets student data from.

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_USE_FIRESTORE` | Use Firestore for data | `true` | `true`, `false` |
| `VITE_USE_MOCK_DATA` | Use mock/sample data | `false` | `true`, `false` |
| `VITE_SCHOOL_ID` | School identifier for Firestore | `ishebott` | Any string |

### Configuration Matrix

| Firestore | Mock Data | Result |
|-----------|-----------|--------|
| `true` | `false` | ✅ **Production:** Real Firestore data |
| `false` | `true` | 🧪 **Demo:** Sample/mock data |
| `false` | `false` | 📊 **Sheets:** Google Sheets API (requires `VITE_API_URL`) |

---

## 🔬 Python Optimization API (Optional)

For classroom seating optimization using genetic algorithm.

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_OPTIMIZATION_API_URL` | Python FastAPI backend URL | `http://localhost:8000` | ⚠️ Optional |

**Production URL:** `https://ishebot-optimization-api.onrender.com`

**Usage:**
- Used by `/classroom-optimization` page
- Genetic algorithm for optimal seating arrangements
- If not available, feature gracefully degrades

---

## 📊 Google Sheets API (Alternative Data Source)

If not using Firestore, you can use Google Sheets.

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Google Apps Script Web App URL | `https://script.google.com/macros/s/...` | ⚠️ If using Sheets |

**When to Use:**
- Set `VITE_USE_FIRESTORE=false`
- Set `VITE_USE_MOCK_DATA=false`
- Set `VITE_API_URL` to your Google Apps Script URL

---

## ⚙️ Feature Flags

Control which features are enabled.

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_ENABLE_AI_ANALYSIS` | Enable AI-powered analysis | `true` | `true`, `false` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics tracking | `true` | `true`, `false` |
| `VITE_ENABLE_PWA` | Enable Progressive Web App | `true` | `true`, `false` |
| `VITE_ENABLE_EXPORT` | Enable data export features | `true` | `true`, `false` |

---

## 🌐 Localization

Configure language and locale settings.

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_DEFAULT_LOCALE` | Default language | `he` | `he`, `en`, `ar`, `ru` |
| `VITE_SUPPORTED_LOCALES` | Supported languages | `he,en,ar,ru` | Comma-separated list |

---

## 🔧 API Configuration

Network and API behavior settings.

| Variable | Description | Default | Unit |
|----------|-------------|---------|------|
| `VITE_API_TIMEOUT` | API request timeout | `30000` | milliseconds |
| `VITE_RETRY_ATTEMPTS` | Number of retry attempts | `3` | count |
| `VITE_RETRY_DELAY` | Delay between retries | `1000` | milliseconds |

---

## 🧪 Development Settings (Optional)

For local development and testing.

| Variable | Description | Default | Options |
|----------|-------------|---------|---------|
| `VITE_USE_FIREBASE_EMULATORS` | Use Firebase local emulators | `false` | `true`, `false` |
| `NODE_ENV` | Node environment | `development` | `development`, `production` |

**Firebase Emulator Ports:**
- Auth: `http://localhost:9099`
- Firestore: `http://localhost:8080`
- Functions: `http://localhost:5001`

---

## 📦 Complete Production Setup

### Vercel Environment Variables

Copy-paste this into your `.env` notes and fill in your values:

```bash
# Firebase (REQUIRED)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456

# Data Source
VITE_USE_FIRESTORE=true
VITE_USE_MOCK_DATA=false
VITE_SCHOOL_ID=ishebott

# Feature Flags
VITE_ENABLE_AI_ANALYSIS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_EXPORT=true

# Localization
VITE_DEFAULT_LOCALE=he
VITE_SUPPORTED_LOCALES=he,en,ar,ru

# API Configuration
VITE_API_TIMEOUT=30000
VITE_RETRY_ATTEMPTS=3
VITE_RETRY_DELAY=1000

# Optimization API (Optional)
VITE_OPTIMIZATION_API_URL=https://ishebot-optimization-api.onrender.com
```

---

## 🔍 Checking Environment Variables

### In Browser Console

```javascript
// Check if Firebase is configured
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? 'Set' : 'Missing',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  useFirestore: import.meta.env.VITE_USE_FIRESTORE,
  useMock: import.meta.env.VITE_USE_MOCK_DATA
});
```

### Build Time Check

```bash
# Check if variables are accessible during build
npm run build 2>&1 | grep -i "firebase\|firestore"
```

---

## ⚠️ Common Issues

### Issue 1: "Firebase not configured"

**Cause:** Missing Firebase environment variables

**Solution:**
1. Add all 6 `VITE_FIREBASE_*` variables to Vercel
2. Redeploy the application
3. Clear browser cache

---

### Issue 2: Build succeeds but app shows blank page

**Cause:** Environment variables not propagated to client

**Solution:**
1. Variables MUST start with `VITE_` to be accessible in browser
2. Redeploy after adding variables
3. Check browser console for errors

---

### Issue 3: Variables work locally but not in production

**Cause:** Variables only in `.env` file, not in Vercel

**Solution:**
1. Add variables to Vercel dashboard (not just `.env`)
2. Set scope to "Production"
3. Trigger new deployment

---

## 📚 Related Documentation

- [Firestore Fixes Deployment Guide](FIRESTORE_FIXES_DEPLOYMENT_GUIDE.md)
- [Firebase Setup Guide](docs/FIREBASE_SETUP_GUIDE.md)
- [Vercel Deployment Setup](VERCEL_DEPLOYMENT_SETUP.md)

---

## 🆘 Need Help?

If variables are not working:

1. **Check Vercel Dashboard:**
   - Settings → Environment Variables
   - Verify all variables are present

2. **Check Variable Names:**
   - Must be EXACTLY as listed above
   - Case-sensitive
   - Must start with `VITE_`

3. **Redeploy:**
   - Changes require redeployment
   - Deployments → Latest → "..." → Redeploy

4. **Check Browser Console:**
   - F12 → Console
   - Look for "Firebase not configured" or similar errors

---

**Last Updated:** 2025-01-06
