# 🔥 Firebase Migration - Complete Checklist
# Project: ishebott (Project Number: 828210897775)
# Date: 2025-11-03

## ✅ ALREADY COMPLETED:

1. ✅ Firebase Project Created
   - Project ID: ishebott
   - Project Number: 828210897775
   - Location: Netherlands

2. ✅ Firebase Configuration (for .env file):
   - API Key: AIzaSyBE-VDlg8K7_Tr6wYVkKiSU99nsw6XQbWw
   - Auth Domain: ishebott.firebaseapp.com
   - Project ID: ishebott
   - Storage Bucket: ishebott.firebasestorage.app
   - Messaging Sender ID: 828210897775
   - App ID: 1:828210897775:web:48e0fcbb9e054ef23c3e9a
   - Measurement ID: G-6CP5Y6MS5P

3. ✅ Firestore Database Enabled
   - Location: Netherlands (europe-west4)
   - Status: Active

4. ✅ Google Apps Script URL
   - URL: https://script.google.com/macros/s/AKfycbxSawbi4f370i94rPA2EpVZh3LlfMisq7uu6r3pS0Q3rQU8nW5qTk_Witm1FVd5kQtb/exec

---

## 📋 WHAT YOU NEED ON YOUR COMPUTER:

### File 1: .env (in project root)
Location: /path/to/newdashboard/.env

Should contain:
```env
VITE_FIREBASE_API_KEY=AIzaSyBE-VDlg8K7_Tr6wYVkKiSU99nsw6XQbWw
VITE_FIREBASE_AUTH_DOMAIN=ishebott.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ishebott
VITE_FIREBASE_STORAGE_BUCKET=ishebott.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=828210897775
VITE_FIREBASE_APP_ID=1:828210897775:web:48e0fcbb9e054ef23c3e9a
VITE_FIREBASE_MEASUREMENT_ID=G-6CP5Y6MS5P

VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxSawbi4f370i94rPA2EpVZh3LlfMisq7uu6r3pS0Q3rQU8nW5qTk_Witm1FVd5kQtb/exec
```

CHECK: [ ] Do you have this file?

---

### File 2: .firebaserc (in project root)
Location: /path/to/newdashboard/.firebaserc

Should contain:
```json
{
  "projects": {
    "default": "ishebott"
  }
}
```

CHECK: [ ] Do you have this file?

If NO: Run `firebase init firestore` in your project folder

---

### File 3: firebase-service-account.json (in project root)
Location: /path/to/newdashboard/firebase-service-account.json

This is the SECRET key file downloaded from Firebase Console.

CHECK: [ ] Do you have this file?

If NO:
1. Go to https://console.firebase.google.com/
2. Click ishebott project
3. Click gear icon ⚙️ → Project settings
4. Click "Service accounts" tab
5. Click "Generate new private key"
6. Save as: firebase-service-account.json

⚠️ NEVER commit this file to git!

---

## 🔧 SOFTWARE NEEDED ON YOUR COMPUTER:

### 1. Node.js & npm
CHECK: [ ] Run: `node --version` (should show v18+)
CHECK: [ ] Run: `npm --version` (should show v9+)

### 2. Firebase CLI
CHECK: [ ] Run: `firebase --version` (should show version number)

If NO: Run `npm install -g firebase-tools`

### 3. Firebase Login
CHECK: [ ] Run: `firebase projects:list` (should show ishebott)

If NO: Run `firebase login`

---

## 🚀 READY TO MIGRATE?

Once you have ALL checkboxes ✅, run:

### Step 1: Test (Dry Run)
```bash
npm run migrate:dry-run -- --school-id=ishebott
```

Expected: Shows what will be migrated, but doesn't write anything

### Step 2: Real Migration
```bash
npm run migrate:backup -- --school-id=ishebott
```

Expected: Migrates ~32 students to Firestore in 5-10 seconds

---

## 📝 QUICK VERIFICATION COMMANDS:

Run these on your computer to check what you have:

```bash
# Check if .env exists
ls -la .env

# Check if .firebaserc exists
ls -la .firebaserc

# Check if service account key exists
ls -la firebase-service-account.json

# Check Firebase CLI installed
firebase --version

# Check Firebase login
firebase projects:list

# Check Google Sheets connection (optional)
node scripts/checkStudentCount.cjs
```

---

## 🆘 MISSING SOMETHING?

Tell me what you're missing from the checklist:
- "I don't have .env file"
- "I don't have .firebaserc file"
- "I don't have firebase-service-account.json"
- "Firebase CLI not installed"
- "Not logged in to Firebase"

I'll help you get it! 🚀

---

## ✅ EVERYTHING READY?

If all checkboxes are ✅, just run:
```bash
npm run migrate:dry-run -- --school-id=ishebott
```

Then tell me what happens!
