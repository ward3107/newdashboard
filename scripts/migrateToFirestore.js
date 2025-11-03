#!/usr/bin/env node

/**
 * Migration Script: Google Sheets → Firestore
 *
 * This script migrates all student data from Google Sheets to Firestore
 *
 * Usage:
 *   node scripts/migrateToFirestore.js [options]
 *
 * Options:
 *   --dry-run          Run without writing to Firestore (validation only)
 *   --school-id=<id>   School ID to migrate data to (required)
 *   --backup           Create backup before migration
 *   --verbose          Show detailed logs
 *
 * Example:
 *   node scripts/migrateToFirestore.js --school-id=school_001 --backup --verbose
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  GOOGLE_SCRIPT_URL: process.env.VITE_GOOGLE_SCRIPT_URL || '',
  SCHOOL_ID: process.argv.find(arg => arg.startsWith('--school-id='))?.split('=')[1] || 'default_school',
  DRY_RUN: process.argv.includes('--dry-run'),
  BACKUP: process.argv.includes('--backup'),
  VERBOSE: process.argv.includes('--verbose'),
  BATCH_SIZE: 500,
};

// ============================================================================
// FIREBASE INITIALIZATION
// ============================================================================

let db;

function initializeFirebase() {
  try {
    // Try to load service account from environment or file
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
                                path.join(__dirname, '../firebase-service-account.json');

    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

      initializeApp({
        credential: cert(serviceAccount),
      });

      console.log('✅ Firebase Admin initialized with service account');
    } else {
      // Fallback to default credentials (for local development with firebase login)
      initializeApp();
      console.log('✅ Firebase Admin initialized with default credentials');
    }

    db = getFirestore();
    db.settings({ ignoreUndefinedProperties: true });

    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Firebase:', error.message);
    return false;
  }
}

// ============================================================================
// GOOGLE SHEETS API CLIENT
// ============================================================================

async function fetchFromGoogleSheets(action) {
  const url = `${CONFIG.GOOGLE_SCRIPT_URL}?action=${action}`;

  if (CONFIG.VERBOSE) {
    console.log(`📡 Fetching: ${url}`);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Unknown error from Google Sheets API');
  }

  return data;
}

async function getAllStudentsFromSheets() {
  console.log('📥 Fetching all students from Google Sheets...');
  const data = await fetchFromGoogleSheets('getAllStudents');
  console.log(`✅ Fetched ${data.students?.length || 0} students from Google Sheets`);
  return data.students || [];
}

// ============================================================================
// DATA TRANSFORMATION
// ============================================================================

function transformStudentData(sheetStudent) {
  // Extract basic student info
  const student = {
    studentCode: String(sheetStudent.studentCode || '').trim(),
    name: sheetStudent.name || `תלמיד ${sheetStudent.studentCode}`,
    classId: String(sheetStudent.classId || 'Unknown').trim(),
    schoolId: CONFIG.SCHOOL_ID,
    quarter: sheetStudent.quarter || 'Q1',
    avatar: sheetStudent.avatar || ((parseInt(sheetStudent.studentCode) % 4) + 1),
    hasCompletedQuestionnaire: !!sheetStudent.strengthsCount,
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  // Extract response data (if exists)
  let response = null;
  if (sheetStudent.responses || sheetStudent.formData) {
    response = {
      studentCode: student.studentCode,
      classId: student.classId,
      schoolId: CONFIG.SCHOOL_ID,
      answers: sheetStudent.responses || sheetStudent.formData || {},
      submittedAt: sheetStudent.date
        ? Timestamp.fromDate(new Date(sheetStudent.date))
        : Timestamp.now(),
      submittedFrom: 'google_forms',
      status: 'submitted',
      isAnalyzed: !!sheetStudent.analysis,
    };
  }

  // Extract analysis data (if exists)
  let analysis = null;
  if (sheetStudent.analysis || sheetStudent.insights || sheetStudent.scores) {
    analysis = {
      studentCode: student.studentCode,
      classId: student.classId,
      schoolId: CONFIG.SCHOOL_ID,
      quarter: student.quarter,
      responseId: '', // Will be set after response is created

      // Core analysis
      learningStyle: sheetStudent.learningStyle || sheetStudent.analysis?.learningStyle || '',
      keyNotes: sheetStudent.keyNotes || sheetStudent.analysis?.keyNotes || '',
      strengths: Array.isArray(sheetStudent.analysis?.strengths)
        ? sheetStudent.analysis.strengths
        : [],
      challenges: Array.isArray(sheetStudent.analysis?.challenges)
        ? sheetStudent.analysis.challenges
        : [],

      // Scores
      scores: {
        focus: sheetStudent.scores?.focus || 0,
        motivation: sheetStudent.scores?.motivation || 0,
        collaboration: sheetStudent.scores?.collaboration || 0,
        emotional_regulation: sheetStudent.scores?.emotional_regulation || 0,
        self_efficacy: sheetStudent.scores?.self_efficacy || 0,
        time_management: sheetStudent.scores?.time_management || 0,
      },

      strengthsCount: sheetStudent.strengthsCount || 0,
      challengesCount: sheetStudent.challengesCount || 0,

      // Insights
      insights: Array.isArray(sheetStudent.insights)
        ? sheetStudent.insights
        : Array.isArray(sheetStudent.analysis?.insights)
        ? sheetStudent.analysis.insights
        : [],

      // Recommendations
      immediateActions: Array.isArray(sheetStudent.analysis?.immediateActions)
        ? sheetStudent.analysis.immediateActions
        : [],

      seatingRecommendation: sheetStudent.analysis?.seatingRecommendation || null,
      riskFlags: Array.isArray(sheetStudent.analysis?.riskFlags)
        ? sheetStudent.analysis.riskFlags
        : [],

      // Metadata
      analyzedAt: sheetStudent.date
        ? Timestamp.fromDate(new Date(sheetStudent.date))
        : Timestamp.now(),
      analyzedBy: 'openai_gpt4',
      rawAnalysisJson: JSON.stringify(sheetStudent.analysis || {}),
    };
  }

  return { student, response, analysis };
}

function deduplicateStudents(students) {
  const studentMap = new Map();

  students.forEach((student) => {
    const code = student.studentCode;

    if (!studentMap.has(code)) {
      studentMap.set(code, student);
    } else {
      const existing = studentMap.get(code);

      // Keep the one with more complete data
      const existingScore =
        (existing.strengthsCount || 0) +
        (existing.keyNotes ? 1 : 0) +
        (existing.analysis ? 1 : 0);

      const newScore =
        (student.strengthsCount || 0) +
        (student.keyNotes ? 1 : 0) +
        (student.analysis ? 1 : 0);

      if (newScore > existingScore) {
        studentMap.set(code, student);
      }
    }
  });

  return Array.from(studentMap.values());
}

// ============================================================================
// FIRESTORE OPERATIONS
// ============================================================================

async function writeToFirestore(students) {
  const startTime = Date.now();
  const stats = {
    studentsCreated: 0,
    responsesCreated: 0,
    analysesCreated: 0,
    errors: [],
  };

  console.log(`\n📝 Writing ${students.length} students to Firestore...`);

  if (CONFIG.DRY_RUN) {
    console.log('⚠️  DRY RUN MODE - No data will be written\n');
  }

  // Process in batches
  for (let i = 0; i < students.length; i += CONFIG.BATCH_SIZE) {
    const batch = students.slice(i, i + CONFIG.BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / CONFIG.BATCH_SIZE) + 1}/${Math.ceil(students.length / CONFIG.BATCH_SIZE)}`);

    for (const sheetStudent of batch) {
      try {
        const { student, response, analysis } = transformStudentData(sheetStudent);

        if (!student.studentCode) {
          console.warn(`⚠️  Skipping student with empty code`);
          continue;
        }

        if (CONFIG.VERBOSE) {
          console.log(`  Processing: ${student.studentCode} - ${student.name}`);
        }

        if (!CONFIG.DRY_RUN) {
          // 1. Create student
          const studentRef = db
            .collection('schools')
            .doc(CONFIG.SCHOOL_ID)
            .collection('students')
            .doc(student.studentCode);

          await studentRef.set(student);
          stats.studentsCreated++;

          // 2. Create response (if exists)
          let responseId = null;
          if (response) {
            const responseRef = await db
              .collection('schools')
              .doc(CONFIG.SCHOOL_ID)
              .collection('responses')
              .add(response);

            responseId = responseRef.id;
            stats.responsesCreated++;

            // Update student with response reference
            await studentRef.update({
              lastResponseId: responseId,
            });
          }

          // 3. Create analysis (if exists)
          if (analysis) {
            if (responseId) {
              analysis.responseId = responseId;
            }

            const analysisRef = await db
              .collection('schools')
              .doc(CONFIG.SCHOOL_ID)
              .collection('analyses')
              .add(analysis);

            stats.analysesCreated++;

            // Update student with analysis reference
            await studentRef.update({
              lastAnalysisId: analysisRef.id,
            });

            // Update response as analyzed
            if (responseId) {
              await db
                .collection('schools')
                .doc(CONFIG.SCHOOL_ID)
                .collection('responses')
                .doc(responseId)
                .update({
                  isAnalyzed: true,
                  analysisId: analysisRef.id,
                });
            }
          }
        } else {
          // Dry run - just count
          stats.studentsCreated++;
          if (response) stats.responsesCreated++;
          if (analysis) stats.analysesCreated++;
        }
      } catch (error) {
        const errorMsg = `Failed to process ${sheetStudent.studentCode}: ${error.message}`;
        console.error(`  ❌ ${errorMsg}`);
        stats.errors.push(errorMsg);
      }
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  return { ...stats, duration: parseFloat(duration) };
}

// ============================================================================
// BACKUP FUNCTIONS
// ============================================================================

async function createBackup() {
  console.log('\n💾 Creating backup of Google Sheets data...');

  try {
    const students = await getAllStudentsFromSheets();

    const backupDir = path.join(__dirname, '../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `google-sheets-backup-${timestamp}.json`);

    fs.writeFileSync(
      backupFile,
      JSON.stringify({ students, timestamp: new Date().toISOString() }, null, 2)
    );

    console.log(`✅ Backup created: ${backupFile}`);
    return backupFile;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateConfig() {
  const errors = [];

  if (!CONFIG.GOOGLE_SCRIPT_URL) {
    errors.push('VITE_GOOGLE_SCRIPT_URL environment variable not set');
  }

  if (!CONFIG.SCHOOL_ID || CONFIG.SCHOOL_ID === 'default_school') {
    errors.push('School ID not provided. Use --school-id=<id>');
  }

  if (errors.length > 0) {
    console.error('\n❌ Configuration Error:\n');
    errors.forEach(error => console.error(`  - ${error}`));
    console.error('\nUsage: node scripts/migrateToFirestore.js --school-id=<id> [--dry-run] [--backup] [--verbose]\n');
    return false;
  }

  return true;
}

async function validateFirestoreConnection() {
  try {
    // Try to read a document to test connection
    await db.collection('schools').doc(CONFIG.SCHOOL_ID).get();
    console.log('✅ Firestore connection validated');
    return true;
  } catch (error) {
    console.error('❌ Firestore connection failed:', error.message);
    return false;
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

async function migrate() {
  console.log('\n🔥 Firebase Migration Tool: Google Sheets → Firestore\n');
  console.log('Configuration:');
  console.log(`  School ID: ${CONFIG.SCHOOL_ID}`);
  console.log(`  Dry Run: ${CONFIG.DRY_RUN ? 'Yes' : 'No'}`);
  console.log(`  Backup: ${CONFIG.BACKUP ? 'Yes' : 'No'}`);
  console.log(`  Verbose: ${CONFIG.VERBOSE ? 'Yes' : 'No'}\n`);

  // Validate configuration
  if (!validateConfig()) {
    process.exit(1);
  }

  // Initialize Firebase
  if (!initializeFirebase()) {
    process.exit(1);
  }

  // Validate Firestore connection
  if (!await validateFirestoreConnection()) {
    process.exit(1);
  }

  try {
    // Create backup if requested
    if (CONFIG.BACKUP) {
      await createBackup();
    }

    // Fetch data from Google Sheets
    const rawStudents = await getAllStudentsFromSheets();

    if (rawStudents.length === 0) {
      console.log('⚠️  No students found in Google Sheets');
      return;
    }

    // Deduplicate
    const students = deduplicateStudents(rawStudents);
    console.log(`✅ Deduplicated: ${rawStudents.length} → ${students.length} unique students`);

    // Write to Firestore
    const result = await writeToFirestore(students);

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary');
    console.log('='.repeat(60));
    console.log(`Students created:  ${result.studentsCreated}`);
    console.log(`Responses created: ${result.responsesCreated}`);
    console.log(`Analyses created:  ${result.analysesCreated}`);
    console.log(`Errors:            ${result.errors.length}`);
    console.log(`Duration:          ${result.duration}s`);
    console.log('='.repeat(60));

    if (result.errors.length > 0) {
      console.log('\n❌ Errors occurred during migration:');
      result.errors.forEach((error, i) => console.log(`  ${i + 1}. ${error}`));
    }

    if (CONFIG.DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. No data was actually written.');
      console.log('Run without --dry-run to perform the migration.\n');
    } else {
      console.log('\n✅ Migration completed successfully!\n');
      console.log('Next steps:');
      console.log('  1. Verify data in Firebase Console');
      console.log('  2. Deploy Firestore rules: firebase deploy --only firestore:rules');
      console.log('  3. Deploy Firestore indexes: firebase deploy --only firestore:indexes');
      console.log('  4. Update your app to use firebaseService instead of googleAppsScriptAPI\n');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================

migrate().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
