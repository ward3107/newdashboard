# Firestore Setup Guide

This guide will help you complete the Firebase setup so your dashboard can read from Firestore.

## 🎯 What You Need To Do (5 minutes)

### Step 1: Deploy Firestore Security Rules

These rules allow your web app to read student data from Firestore.

```powershell
# Login to Firebase (will open a browser window)
firebase login

# Deploy the security rules
firebase deploy --only firestore:rules
```

### Step 2: Create a Web App and Get Config

1. Open Firebase Console: https://console.firebase.google.com/project/ishebott/settings/general

2. Scroll down to "Your apps" section

3. If you don't see a web app (</> icon), click "Add app" → Select "Web" (</> icon)

4. Register app:
   - App nickname: `ishebott-dashboard` (or any name you like)
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

5. Copy the Firebase configuration. It will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ishebott.firebaseapp.com",
  projectId: "ishebott",
  storageBucket: "ishebott.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef1234567890"
};
```

6. Update your `.env` file with these values:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=ishebott.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ishebott
VITE_FIREBASE_STORAGE_BUCKET=ishebott.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef1234567890
```

### Step 3: Test the Dashboard

```powershell
# Start the development server
npm run dev
```

Open the dashboard and it should now read from Firestore! 🎉

---

## 🔄 How Automatic Sync Works

### Current Workflow:

```
Google Forms → Google Sheets → Google Apps Script (AI Analysis)
                                        ↓
                                    Firestore ← Dashboard reads here (FAST!)
```

### Syncing New Data:

When you have new form submissions, run:

```powershell
npm run migrate:backup -- --school-id=ishebott
```

This will sync all new students from Google Sheets to Firestore.

### Option: Automatic Daily Sync (Optional)

You can set up a scheduled task to run the migration automatically:

**Windows Task Scheduler:**

1. Open Task Scheduler
2. Create Basic Task
3. Name: "Sync Firestore Daily"
4. Trigger: Daily at 2:00 AM (or your preferred time)
5. Action: Start a program
   - Program: `C:\Program Files\nodejs\node.exe`
   - Arguments: `scripts/migrate-to-firebase.js --backup --school-id=ishebott`
   - Start in: `C:\Users\User\Desktop\newdashboard`

---

## 🔐 Security Notes

- The Firestore rules allow **read-only** access to student data
- No one can write/modify data from the web app (only via migration script)
- If you want to restrict access, you can add Firebase Authentication later

---

## ❓ Troubleshooting

**Problem:** Dashboard shows "Firebase not configured"
- Solution: Make sure you updated .env with the correct Firebase config values

**Problem:** "Permission denied" errors
- Solution: Deploy Firestore rules: `firebase deploy --only firestore:rules`

**Problem:** No data showing
- Solution: Run migration: `npm run migrate:backup -- --school-id=ishebott`

---

## 📊 Benefits of Using Firestore

✅ **Faster loading** - Cached data, no need to call Google Sheets every time
✅ **Offline support** - Works even without internet (uses cached data)
✅ **Real-time updates** - Can add live updates later if needed
✅ **Better performance** - Indexed queries, pagination support
✅ **Scalability** - Handles thousands of students easily

---

Need help? Let me know! 🚀
