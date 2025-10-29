# Firebase Setup Guide

## Step-by-Step Instructions to Set Up Firebase

Follow these steps to create and configure your Firebase project. This should take about 10 minutes.

---

## Part 1: Create Firebase Project

### 1. Go to Firebase Console
- Visit: https://console.firebase.google.com/
- Sign in with your Google account

### 2. Create New Project
- Click **"Add project"** or **"Create a project"**
- Enter project name: `ishebot-dashboard` (or your preferred name)
- Click **Continue**

### 3. Google Analytics (Optional)
- You can enable or disable Google Analytics (recommended: disable for now)
- Click **Create project**
- Wait for project to be created (~30 seconds)
- Click **Continue** when ready

---

## Part 2: Set Up Authentication

### 1. Enable Authentication
- In the left sidebar, click **"Build"** → **"Authentication"**
- Click **"Get started"**

### 2. Enable Email/Password
- Click on **"Sign-in method"** tab
- Click on **"Email/Password"**
- Toggle **"Enable"** to ON
- Toggle **"Email link (passwordless sign-in)"** to OFF (we don't need this)
- Click **"Save"**

### 3. Enable Google Sign-In
- Still in **"Sign-in method"** tab
- Click on **"Google"**
- Toggle **"Enable"** to ON
- Enter **"Project support email"**: Your email address
- Click **"Save"**

---

## Part 3: Set Up Firestore Database

### 1. Create Firestore Database
- In the left sidebar, click **"Build"** → **"Firestore Database"**
- Click **"Create database"**

### 2. Choose Security Rules
- Select **"Start in production mode"** (we'll add custom rules)
- Click **"Next"**

### 3. Choose Location
- Select your nearest location (example: `us-central` or `europe-west`)
- **Important:** This cannot be changed later!
- Click **"Enable"**
- Wait for database to be created (~1 minute)

### 4. Set Up Security Rules
- Go to **"Rules"** tab
- Replace the default rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }

    function belongsToSchool(schoolId) {
      return isAuthenticated() && getUserData().schoolId == schoolId;
    }

    function isTeacher() {
      return isAuthenticated() && getUserData().role == 'teacher';
    }

    function isSchoolAdmin() {
      return isAuthenticated() && getUserData().role == 'school_admin';
    }

    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == 'super_admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isSuperAdmin());
      allow write: if isAuthenticated() && (request.auth.uid == userId || isSuperAdmin() || isSchoolAdmin());
    }

    // Schools collection
    match /schools/{schoolId} {
      allow read: if belongsToSchool(schoolId) || isSuperAdmin();
      allow write: if isSchoolAdmin() || isSuperAdmin();

      // Students subcollection
      match /students/{studentId} {
        allow read: if belongsToSchool(schoolId);
        allow write: if isSchoolAdmin() || isSuperAdmin();
      }

      // Responses subcollection
      match /responses/{responseId} {
        allow read: if belongsToSchool(schoolId);
        allow write: if isSchoolAdmin() || isSuperAdmin();
      }

      // Teachers subcollection
      match /teachers/{teacherId} {
        allow read: if belongsToSchool(schoolId);
        allow write: if isSchoolAdmin() || isSuperAdmin();
      }
    }
  }
}
```

- Click **"Publish"**

---

## Part 4: Get Your Firebase Configuration

### 1. Add Web App
- Click the gear icon ⚙️ next to "Project Overview" (top left)
- Click **"Project settings"**
- Scroll down to **"Your apps"** section
- Click the **Web icon** `</>`
- Enter app nickname: `ishebot-web-app`
- **Do NOT** check "Also set up Firebase Hosting"
- Click **"Register app"**

### 2. Copy Configuration
You'll see something like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ishebot-dashboard.firebaseapp.com",
  projectId: "ishebot-dashboard",
  storageBucket: "ishebot-dashboard.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 3. Save Configuration
- **COPY ALL OF THIS** - you'll need it in the next step
- Click **"Continue to console"**

---

## Part 5: Create Environment File

### 1. Create `.env` File
In your project root (`/home/user/newdashboard/`), I'll create a `.env` file with your Firebase config.

**YOU NEED TO:** Replace the placeholder values with your actual Firebase configuration from step Part 4.2

The file will look like this:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=ishebot-dashboard.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ishebot-dashboard
VITE_FIREBASE_STORAGE_BUCKET=ishebot-dashboard.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890

# Admin Configuration (optional, for later)
VITE_ADMIN_EMAIL=your-email@example.com
```

---

## Part 6: Enable Required Firebase Services

### 1. Enable Email Verification (Optional but Recommended)
- Go to **Authentication** → **Templates** tab
- Click **"Email address verification"**
- Customize the email template if desired
- Click **"Save"**

### 2. Enable Password Reset
- Still in **Templates** tab
- Click **"Password reset"**
- Customize the email template if desired
- Click **"Save"**

---

## Part 7: Set Up Test Data (I'll do this in code)

Once you've completed the above steps, I'll create:
- Test schools
- Test teachers
- Link to your existing 349 students

---

## Checklist ✅

Before we continue, make sure you've completed:

- [ ] Created Firebase project
- [ ] Enabled Email/Password authentication
- [ ] Enabled Google Sign-In authentication
- [ ] Created Firestore database
- [ ] Set up Firestore security rules
- [ ] Got your Firebase configuration
- [ ] Ready to add config to `.env` file

---

## What's Next?

Once you've completed these steps and have your Firebase configuration ready:

1. Tell me you're done
2. I'll create the `.env` file (you'll paste your config)
3. I'll implement all the authentication code
4. We'll test the login flow

---

## Troubleshooting

### Can't create Firebase project?
- Make sure you're signed in with a Google account
- Check if you have billing enabled (Firebase has a free tier, but Google may require payment method on file)

### Can't find Firestore?
- Make sure you clicked "Firestore Database" not "Realtime Database" (they're different)

### Security rules won't save?
- Check for syntax errors
- Make sure you're in the "Rules" tab, not "Indexes"

### Need help?
- Let me know what error you're seeing and I'll help troubleshoot

---

## Estimated Time
- **Total:** ~10 minutes
- Part 1-2: 3 minutes
- Part 3: 3 minutes
- Part 4-5: 4 minutes

Let me know when you're done and have your Firebase config ready! 🚀
