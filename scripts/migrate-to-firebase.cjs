/**
 * Firebase Migration Script
 * Migrates student data from Google Sheets (via Apps Script) to Firebase Firestore
 */

const admin = require('firebase-admin');
const { https } = require('follow-redirects');
const fs = require('fs');
const path = require('path');

// ====================================
// CONFIGURATION
// ====================================

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'ishebott';
const FIREBASE_SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json';

// Load environment variables from .env file
require('dotenv').config();

const GOOGLE_SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL || process.env.VITE_API_URL;
const SCHOOL_ID = process.argv.find(arg => arg.startsWith('--school-id='))?.split('=')[1] || 'ishebott';
const DRY_RUN = process.argv.includes('--dry-run');

// ====================================
// INITIALIZE FIREBASE
// ====================================

let db;

function initializeFirebase() {
  try {
    const serviceAccountPath = path.resolve(FIREBASE_SERVICE_ACCOUNT_PATH);

    if (!fs.existsSync(serviceAccountPath)) {
      throw new Error(`Service account file not found: ${serviceAccountPath}`);
    }

    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: FIREBASE_PROJECT_ID,
    });

    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return false;
  }
}

// ====================================
// FETCH DATA FROM GOOGLE SHEETS
// ====================================

function buildUrl(action, params = {}) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error('VITE_GOOGLE_SCRIPT_URL or VITE_API_URL not set in .env');
  }

  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.toString();
}

function fetchFromGoogleSheets(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error(`Failed to parse JSON: ${error.message}`));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function fetchAllStudents() {
  try {
    console.log('📡 Fetching students from Google Sheets...');
    const url = buildUrl('getAllStudents');
    const response = await fetchFromGoogleSheets(url);

    // Handle different response formats
    let students = [];
    if (response.success && response.data?.students) {
      // Format: {success: true, data: {students: [...]}}
      students = response.data.students;
    } else if (response.students) {
      // Format: {students: [...]}
      students = response.students;
    } else if (Array.isArray(response)) {
      // Format: [...]
      students = response;
    } else {
      throw new Error('Unexpected response format');
    }

    console.log(`✅ Fetched ${students.length} students`);
    return students;
  } catch (error) {
    console.error('❌ Error fetching students:', error.message);
    throw error;
  }
}

async function fetchStudentDetails(studentCode) {
  try {
    const url = buildUrl('getStudent', { studentId: studentCode });
    const response = await fetchFromGoogleSheets(url);

    // Handle different response formats
    if (response.success && response.data) {
      return response.data;
    } else if (response.studentCode) {
      // Direct student object
      return response;
    } else {
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error(`⚠️  Failed to fetch details for student ${studentCode}:`, error.message);
    return null;
  }
}

// ====================================
// TRANSFORM DATA FOR FIRESTORE
// ====================================

function transformStudentForFirestore(student, detailedData = null) {
  const baseData = {
    studentCode: student.studentCode,
    name: student.name,
    classId: student.classId,
    quarter: student.quarter,
    learningStyle: student.learningStyle,
    keyNotes: student.keyNotes,
    strengthsCount: student.strengthsCount || 0,
    challengesCount: student.challengesCount || 0,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  // Add detailed data if available
  if (detailedData) {
    baseData.studentSummary = detailedData.student_summary || null;
    baseData.insights = detailedData.insights || [];
    baseData.immediateActions = detailedData.immediate_actions || [];
    baseData.seatingArrangement = detailedData.seating_arrangement || null;
  }

  return baseData;
}

// ====================================
// WRITE TO FIRESTORE
// ====================================

async function writeToFirestore(students, schoolId) {
  const batch = db.batch();
  const schoolRef = db.collection('schools').doc(schoolId);

  let successCount = 0;
  let errorCount = 0;

  console.log(`\n📝 Writing ${students.length} students to Firestore...`);

  // Create/update school document
  batch.set(schoolRef, {
    schoolId: schoolId,
    name: schoolId,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  // Add each student
  for (const student of students) {
    try {
      const studentRef = schoolRef.collection('students').doc(student.studentCode);
      const studentData = transformStudentForFirestore(student);

      batch.set(studentRef, studentData, { merge: true });
      successCount++;

      // Show progress
      if (successCount % 10 === 0) {
        process.stdout.write(`\r   Progress: ${successCount}/${students.length} students`);
      }
    } catch (error) {
      console.error(`\n⚠️  Error preparing student ${student.studentCode}:`, error.message);
      errorCount++;
    }
  }

  process.stdout.write(`\r   Progress: ${successCount}/${students.length} students\n`);

  // Commit the batch
  try {
    await batch.commit();
    console.log(`✅ Successfully wrote ${successCount} students to Firestore`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} students had errors`);
    }
  } catch (error) {
    console.error('❌ Failed to commit batch:', error.message);
    throw error;
  }

  return { successCount, errorCount };
}

async function writeDetailedStudent(studentCode, detailedData, schoolId) {
  try {
    const studentRef = db.collection('schools').doc(schoolId).collection('students').doc(studentCode);

    const updateData = {
      studentSummary: detailedData.student_summary || null,
      insights: detailedData.insights || [],
      immediateActions: detailedData.immediate_actions || [],
      seatingArrangement: detailedData.seating_arrangement || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await studentRef.set(updateData, { merge: true });
    return true;
  } catch (error) {
    console.error(`⚠️  Failed to write detailed data for ${studentCode}:`, error.message);
    return false;
  }
}

// ====================================
// MIGRATION WORKFLOW
// ====================================

async function runMigration() {
  console.log('\n🚀 Firebase Migration Starting...\n');
  console.log(`   School ID: ${SCHOOL_ID}`);
  console.log(`   Mode: ${DRY_RUN ? 'DRY RUN (no data will be written)' : 'LIVE MIGRATION'}\n`);

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.error('❌ Error: VITE_GOOGLE_SCRIPT_URL or VITE_API_URL not configured in .env');
    console.error('   Please update your .env file with the correct Google Apps Script URL');
    process.exit(1);
  }

  // Initialize Firebase
  if (!DRY_RUN) {
    const firebaseInitialized = initializeFirebase();
    if (!firebaseInitialized) {
      process.exit(1);
    }
  } else {
    console.log('⚠️  Skipping Firebase initialization (dry run mode)');
  }

  try {
    // Fetch all students
    const students = await fetchAllStudents();

    if (students.length === 0) {
      console.log('⚠️  No students found in Google Sheets');
      process.exit(0);
    }

    // Show summary
    console.log('\n📊 Migration Summary:');
    console.log(`   Total students: ${students.length}`);
    console.log(`   Classes: ${[...new Set(students.map(s => s.classId))].join(', ')}`);
    console.log(`   Learning styles: ${[...new Set(students.map(s => s.learningStyle))].join(', ')}`);

    // Show sample data
    console.log('\n📝 Sample student data:');
    const sample = students[0];
    console.log(JSON.stringify(transformStudentForFirestore(sample), null, 2));

    if (DRY_RUN) {
      console.log('\n✅ Dry run completed successfully!');
      console.log('   Run without --dry-run flag to perform actual migration');
      process.exit(0);
    }

    // Write to Firestore
    const { successCount, errorCount } = await writeToFirestore(students, SCHOOL_ID);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ MIGRATION COMPLETED');
    console.log('='.repeat(50));
    console.log(`   Total students processed: ${students.length}`);
    console.log(`   Successfully migrated: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log(`   School ID: ${SCHOOL_ID}`);
    console.log('='.repeat(50));
    console.log('\n🔗 View your data at:');
    console.log(`   https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore`);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function runBackupMigration() {
  console.log('\n🚀 Firebase Backup Migration Starting...\n');
  console.log('   This will fetch detailed data for each student');
  console.log(`   School ID: ${SCHOOL_ID}\n`);

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('PASTE_YOUR')) {
    console.error('❌ Error: VITE_GOOGLE_SCRIPT_URL or VITE_API_URL not configured in .env');
    process.exit(1);
  }

  const firebaseInitialized = initializeFirebase();
  if (!firebaseInitialized) {
    process.exit(1);
  }

  try {
    const students = await fetchAllStudents();

    if (students.length === 0) {
      console.log('⚠️  No students found');
      process.exit(0);
    }

    console.log(`📡 Fetching detailed data for ${students.length} students...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      process.stdout.write(`\r   Progress: ${i + 1}/${students.length} - ${student.name}`);

      const detailedData = await fetchStudentDetails(student.studentCode);

      if (detailedData) {
        const success = await writeDetailedStudent(student.studentCode, detailedData, SCHOOL_ID);
        if (success) {
          successCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n\n' + '='.repeat(50));
    console.log('✅ BACKUP MIGRATION COMPLETED');
    console.log('='.repeat(50));
    console.log(`   Total students: ${students.length}`);
    console.log(`   Successful: ${successCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('\n❌ Backup migration failed:', error.message);
    process.exit(1);
  }
}

// ====================================
// MAIN EXECUTION
// ====================================

const isBackupMode = process.argv.includes('--backup');

if (isBackupMode) {
  runBackupMigration();
} else {
  runMigration();
}
