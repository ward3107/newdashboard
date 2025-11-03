# 🔥 Firestore Migration Guide

Complete guide to migrate from Google Sheets to Firestore as your primary database.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Setup Steps](#setup-steps)
4. [Running the Migration](#running-the-migration)
5. [Verification](#verification)
6. [Updating Your App](#updating-your-app)
7. [Troubleshooting](#troubleshooting)

---

## Overview

### What's Included

- ✅ **Complete TypeScript types** (`src/types/firestore.ts`)
- ✅ **Firebase service layer** (`src/services/firebaseService.ts`)
- ✅ **Security rules** (`firestore.rules`)
- ✅ **Indexes configuration** (`firestore.indexes.json`)
- ✅ **Migration script** (`scripts/migrateToFirestore.js`)

### Data Structure

```
/schools/{schoolId}/
├── /students/{studentCode}       # Student profiles
├── /responses/{responseId}        # Questionnaire responses
├── /analyses/{analysisId}         # AI analysis results
└── /classrooms/{classId}          # Class metadata
```

---

## Prerequisites

### 1. Firebase Project Setup

If you haven't already:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Your project should already exist (for authentication)
3. Enable **Firestore Database**:
   - Click "Firestore Database" in sidebar
   - Click "Create database"
   - Choose "Start in test mode" (we'll add rules later)
   - Select a location (closest to your users)

### 2. Firebase Admin SDK (for migration script)

You need a service account key for the migration script:

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save the JSON file as `firebase-service-account.json` in the root directory
4. **⚠️ IMPORTANT**: Add this file to `.gitignore` (already done)

### 3. Install Dependencies

```bash
# The project already has firebase installed
# Just make sure firebase-admin is installed
npm install firebase-admin node-fetch
```

---

## Setup Steps

### Step 1: Set Your School ID

Decide on a school ID (e.g., `school_001`, `main_school`, etc.)

```bash
# This will be used in the migration
export SCHOOL_ID="school_001"
```

### Step 2: Deploy Firestore Rules

```bash
# Install Firebase CLI if you haven't
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore (if not done already)
firebase init firestore
# Select: Use existing project
# Accept default filenames (firestore.rules, firestore.indexes.json)

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Step 3: Verify Configuration

Check that your `.env` file has Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abc123

VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

---

## Running the Migration

### Option 1: Dry Run (Recommended First)

This validates the data without writing to Firestore:

```bash
node scripts/migrateToFirestore.js \
  --school-id=school_001 \
  --dry-run \
  --verbose
```

**What it does:**
- ✅ Fetches data from Google Sheets
- ✅ Validates data transformation
- ✅ Shows what would be migrated
- ❌ Does NOT write to Firestore

### Option 2: Migration with Backup

Creates a backup before migrating:

```bash
node scripts/migrateToFirestore.js \
  --school-id=school_001 \
  --backup \
  --verbose
```

**What it does:**
- ✅ Creates JSON backup in `backups/` folder
- ✅ Migrates all data to Firestore
- ✅ Shows detailed progress

### Option 3: Quick Migration

No backup, less verbose:

```bash
node scripts/migrateToFirestore.js --school-id=school_001
```

### Script Options

| Option | Description |
|--------|-------------|
| `--school-id=<id>` | **Required** - School ID for the data |
| `--dry-run` | Validate only, don't write to Firestore |
| `--backup` | Create JSON backup before migration |
| `--verbose` | Show detailed logs |

---

## Verification

### 1. Check Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database"
4. You should see:
   - `/schools/{your-school-id}/students/` collection
   - `/schools/{your-school-id}/responses/` collection
   - `/schools/{your-school-id}/analyses/` collection

### 2. Check Document Counts

```bash
# Total students
firebase firestore:count schools/{school_id}/students

# Total responses
firebase firestore:count schools/{school_id}/responses

# Total analyses
firebase firestore:count schools/{school_id}/analyses
```

### 3. Test Reading Data

Create a test script `scripts/testFirestore.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  // ... other config
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const studentsRef = collection(db, 'schools', 'school_001', 'students');
  const snapshot = await getDocs(studentsRef);

  console.log(`Found ${snapshot.size} students`);

  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
  });
}

test();
```

Run it:

```bash
node scripts/testFirestore.js
```

---

## Updating Your App

### Step 1: Replace API Calls

**Before** (using Google Sheets):
```javascript
import { getAllStudents } from '../services/googleAppsScriptAPI';

const result = await getAllStudents();
const students = result.students;
```

**After** (using Firestore):
```javascript
import { getAllStudents } from '../services/firebaseService';

const schoolId = 'school_001'; // Get from user context
const result = await getAllStudents(schoolId);
const students = result.students;
```

### Step 2: Update Components

Example component update:

```typescript
// OLD: src/components/StudentList.tsx
import { getAllStudents } from '../services/googleAppsScriptAPI';

function StudentList() {
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function fetchStudents() {
      const result = await getAllStudents();
      setStudents(result.students);
    }
    fetchStudents();
  }, []);

  // ... rest of component
}
```

```typescript
// NEW: src/components/StudentList.tsx
import { getAllStudents } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext'; // Get school ID

function StudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.schoolId) return;

    async function fetchStudents() {
      const result = await getAllStudents(user.schoolId);
      setStudents(result.students);
    }
    fetchStudents();
  }, [user?.schoolId]);

  // ... rest of component
}
```

### Step 3: Add Real-Time Updates (Optional)

Make your app live with real-time listeners:

```typescript
import { subscribeToStudents } from '../services/firebaseService';
import { useAuth } from '../contexts/AuthContext';

function StudentList() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (!user?.schoolId) return;

    // Subscribe to real-time updates
    const unsubscribe = subscribeToStudents(
      user.schoolId,
      (updatedStudents) => {
        setStudents(updatedStudents);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user?.schoolId]);

  // ... rest of component
}
```

### Step 4: API Mapping Reference

| Google Sheets API | Firebase Service | Notes |
|-------------------|------------------|-------|
| `getAllStudents()` | `getAllStudents(schoolId)` | Now needs schoolId |
| `getStudent(code)` | `getStudent(schoolId, code)` | Now needs schoolId |
| `getStats()` | `getClassStatistics(schoolId, classId)` | More detailed |
| `analyzeOneStudent(code)` | Create analysis then `createAnalysis(schoolId, data)` | Different flow |
| `syncStudents()` | Not needed (real-time) | Firestore is always synced |

---

## Troubleshooting

### Error: "Permission denied"

**Cause**: Firestore rules not deployed or user not authenticated

**Solution**:
```bash
# Deploy rules
firebase deploy --only firestore:rules

# Check user is authenticated
console.log('User:', auth.currentUser);
```

### Error: "Missing indexes"

**Cause**: Complex queries need indexes

**Solution**:
```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Or click the link in the error message to auto-create
```

### Error: "Service account not found"

**Cause**: Migration script can't find `firebase-service-account.json`

**Solution**:
```bash
# Download from Firebase Console → Project Settings → Service Accounts
# Save as firebase-service-account.json in project root

# Or set environment variable
export FIREBASE_SERVICE_ACCOUNT_PATH="/path/to/key.json"
```

### Data Looks Weird in Firestore

**Cause**: Timestamp conversion or data transformation issue

**Solution**:
1. Check the data in Google Sheets
2. Run migration with `--dry-run --verbose`
3. Check transformation logic in `transformStudentData()`
4. Report specific data issues

### Migration is Slow

**Cause**: Large dataset or slow network

**Tips**:
- Migration processes in batches of 500
- For 1000 students: ~30-60 seconds
- For 5000 students: ~3-5 minutes
- Run during off-hours if possible

---

## Next Steps

After successful migration:

1. ✅ **Test thoroughly** - Verify all data migrated correctly
2. ✅ **Update components** - Replace Google Sheets API calls
3. ✅ **Add real-time** - Use subscriptions for live updates
4. ✅ **Deploy rules** - Ensure security rules are active
5. ✅ **Monitor usage** - Check Firebase Console for quota usage
6. ✅ **Keep backup** - Maintain Google Sheets as backup for 1-2 weeks
7. ✅ **Build custom form** - Phase 3: Replace Google Forms with custom questionnaire

---

## Support

If you encounter issues:

1. Check Firebase Console logs
2. Check browser console for errors
3. Run migration with `--verbose` flag
4. Check Firestore rules are deployed
5. Verify user authentication is working

---

## Cost Monitoring

Firebase has generous free tier:

- **Firestore**: 50k reads/day, 20k writes/day (FREE)
- **Storage**: 1 GB (FREE)

For 500 students with daily access:
- ~5k reads/day (well under limit)
- ~500 writes/day (well under limit)
- ~50 MB storage (well under limit)

**You'll stay free for a long time!** 🎉

Monitor usage: [Firebase Console → Usage Tab](https://console.firebase.google.com/)

---

## FAQ

**Q: Can I keep using Google Forms during migration?**
A: Yes! Keep Google Forms active while testing Firestore. Migrate when confident.

**Q: Will this break my existing app?**
A: No, if you keep Google Sheets API calls until you're ready to switch.

**Q: How do I rollback if something goes wrong?**
A: Use the `--backup` flag. You can restore from the JSON backup in `backups/` folder.

**Q: Can I migrate multiple schools?**
A: Yes! Run the script multiple times with different `--school-id` values.

**Q: What happens to Google Sheets after migration?**
A: Nothing! Keep it as backup or archive. You can stop using it when comfortable.

---

**Ready to migrate? Start with a dry run! 🚀**

```bash
node scripts/migrateToFirestore.js --school-id=school_001 --dry-run --verbose
```
