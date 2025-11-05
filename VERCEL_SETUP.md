# Vercel Deployment Setup Guide

## 🚀 Quick Start

Your app is now deployed to Vercel! However, you need to configure environment variables to see your real data.

---

## 📋 Current Status

### ✅ What's Working
- App deploys successfully
- Build process completes
- Mock/sample data shows by default

### ⚠️ What Needs Configuration
- Firebase credentials (for real student data)
- Environment variables in Vercel dashboard

---

## 🔧 Setting Up Environment Variables in Vercel

### Step 1: Access Vercel Dashboard

1. Go to [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Click on your project: **newdashboard**
3. Click on **Settings** tab
4. Click on **Environment Variables** in the sidebar

### Step 2: Choose Your Data Source

You have 3 options:

#### Option A: Use Mock Data (Demo/Testing) ✅ **Currently Active**

**Perfect for:** Testing, demos, development

Add these variables in Vercel:
```
VITE_USE_MOCK_DATA=true
VITE_USE_FIRESTORE=false
```

**Result:** Dashboard shows sample students (דני כהן, שרה לוי, etc.)

---

#### Option B: Use Firebase/Firestore (Recommended for Production)

**Perfect for:** Real student data, production use

1. Get your Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to **Project Settings** (⚙️) > **General**
   - Scroll to "Your apps" > Click Web app
   - Copy the config values

2. Add these variables in Vercel:

```
VITE_USE_MOCK_DATA=false
VITE_USE_FIRESTORE=true
VITE_FIREBASE_API_KEY=AIzaSy...your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abcdef
VITE_SCHOOL_ID=ishebott
```

**Important:** Your Firestore data structure should be:
```
schools/
  └── ishebott/  (or your VITE_SCHOOL_ID)
      └── students/
          ├── student1 (document)
          ├── student2 (document)
          └── ...
```

---

#### Option C: Use Google Sheets

**Perfect for:** If you're using Google Forms + Sheets

Add these variables in Vercel:
```
VITE_USE_MOCK_DATA=false
VITE_USE_FIRESTORE=false
VITE_API_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
VITE_SPREADSHEET_ID=YOUR_SPREADSHEET_ID
```

---

## 🔄 How to Add Environment Variables

### Method 1: Web UI (Recommended)

1. In Vercel Settings > Environment Variables
2. Click **Add New**
3. Enter:
   - **Key:** Variable name (e.g., `VITE_USE_MOCK_DATA`)
   - **Value:** Variable value (e.g., `true`)
   - **Environments:** Select **Production**, **Preview**, **Development** (all 3)
4. Click **Save**
5. Repeat for all variables

### Method 2: Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_USE_MOCK_DATA
# When prompted, enter: true

vercel env add VITE_USE_FIRESTORE
# When prompted, enter: false

# ... repeat for all variables
```

---

## 🎯 After Adding Variables

### Trigger a New Deployment

**Option 1:** Push a commit
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push
```

**Option 2:** Redeploy from Vercel Dashboard
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋯** (three dots)
4. Click **Redeploy**

---

## 🐛 Troubleshooting

### Issue: Still seeing "Firebase not configured" error

**Solution:**
1. Check that environment variables are set for **Production** environment
2. Verify variable names start with `VITE_` (required for Vite)
3. Trigger a new deployment (env vars only apply to new builds)
4. Check Vercel build logs for errors

### Issue: Manifest 401 Error

**Solution:**
- Already fixed in `vercel.json`
- Will be resolved after next deployment

### Issue: No students showing

**Solutions:**
1. **If using mock data:** Ensure `VITE_USE_MOCK_DATA=true` in Vercel
2. **If using Firebase:**
   - Check all Firebase env vars are set
   - Verify Firestore collection path: `schools/ishebott/students`
   - Check Firebase security rules allow reading
3. **If using Google Sheets:**
   - Verify Apps Script is deployed as web app
   - Check `VITE_API_URL` is correct

### Issue: Build fails

**Check:**
1. Build logs in Vercel dashboard
2. TypeScript errors: `npm run typecheck` locally
3. Lint errors: `npm run lint` locally

---

## 📊 Verifying It Works

After deployment:

1. **Open your site**
2. **Open Browser Console** (F12 > Console tab)
3. **Look for logs:**
   - `✅ Firebase initialized successfully` (if using Firebase)
   - `📊 Fetching stats from Firestore` (if using Firebase)
   - `⚠️ Firebase not configured. Using mock data as fallback.` (if using mock)

4. **Check Dashboard:**
   - Should see student cards
   - Stats should show numbers
   - Click on a student - details should load

---

## 🔐 Security Best Practices

### ✅ Safe to Commit (Already in repo)
- `.env.example` - Template with no real values
- `.env.production` - Template with defaults

### ❌ Never Commit
- `.env` - Local development secrets
- `.env.local` - Personal overrides
- Actual Firebase credentials
- API keys

### 🔒 Firebase Security

If using Firebase, set proper security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /schools/{schoolId}/students/{studentId} {
      // Allow read for authenticated users only
      allow read: if request.auth != null;

      // Or for public demo:
      // allow read: true;

      // Only allow write from admin
      allow write: if false;
    }
  }
}
```

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Firebase Setup Guide](./docs/FIREBASE_SETUP_GUIDE.md)
- [Data Setup Instructions](./DATA_SETUP_INSTRUCTIONS.md)

---

## 🆘 Need Help?

If you're still having issues:

1. Check browser console for errors
2. Check Vercel deployment logs
3. Verify all environment variables are set correctly
4. Contact: wardwas3107@gmail.com

---

**Last Updated:** 2025-11-05
