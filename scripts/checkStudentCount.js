#!/usr/bin/env node

/**
 * Check actual student count in Google Sheets
 * This verifies your data before migration
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const GOOGLE_SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL;

async function checkStudentCount() {
  console.log('🔍 Checking Your Google Sheets Data\n');
  console.log('='.repeat(60));

  if (!GOOGLE_SCRIPT_URL) {
    console.log('❌ Error: VITE_GOOGLE_SCRIPT_URL not found in .env file\n');
    console.log('Please add it to your .env file:');
    console.log('VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/YOUR_ID/exec\n');
    process.exit(1);
  }

  console.log('📡 Connecting to Google Sheets API...');
  console.log('URL:', GOOGLE_SCRIPT_URL.substring(0, 50) + '...\n');

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getAllStudents`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Unknown error from Google Sheets');
    }

    const students = data.students || [];

    console.log('✅ Successfully connected to Google Sheets!\n');
    console.log('='.repeat(60));
    console.log('📊 YOUR ACTUAL DATA:');
    console.log('='.repeat(60));
    console.log(`Total Students: ${students.length}`);

    // Group by class
    const byClass = {};
    students.forEach(s => {
      const classId = s.classId || 'Unknown';
      byClass[classId] = (byClass[classId] || 0) + 1;
    });

    console.log('\n📚 Students by Class:');
    Object.entries(byClass).forEach(([classId, count]) => {
      console.log(`  ${classId}: ${count} students`);
    });

    // Count analyzed vs unanalyzed
    const analyzed = students.filter(s => s.strengthsCount > 0 || s.analysis);
    const unanalyzed = students.length - analyzed.length;

    console.log('\n🤖 AI Analysis Status:');
    console.log(`  Analyzed: ${analyzed.length} students`);
    console.log(`  Not analyzed: ${unanalyzed} students`);

    // Show sample students
    console.log('\n📋 Sample Students (first 10):');
    console.log('='.repeat(60));
    students.slice(0, 10).forEach((s, i) => {
      const hasAnalysis = s.strengthsCount > 0 ? '✅' : '⏳';
      console.log(`${i + 1}. ${hasAnalysis} ${s.studentCode} - ${s.name} (${s.classId})`);
    });

    if (students.length > 10) {
      console.log(`... and ${students.length - 10} more students`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('📝 MIGRATION ESTIMATE:');
    console.log('='.repeat(60));
    console.log(`Students to migrate: ${students.length}`);
    console.log(`Responses to migrate: ~${students.length}`);
    console.log(`Analyses to migrate: ${analyzed.length}`);
    console.log(`Estimated time: ${Math.ceil(students.length / 10)} seconds`);
    console.log('='.repeat(60));

    console.log('\n✅ Ready to migrate!\n');
    console.log('Next step:');
    console.log('  npm run migrate:dry-run -- --school-id=school_001\n');

  } catch (error) {
    console.error('❌ Error connecting to Google Sheets:', error.message);
    console.log('\nPossible issues:');
    console.log('  1. Check VITE_GOOGLE_SCRIPT_URL in .env file');
    console.log('  2. Verify Google Apps Script is deployed as web app');
    console.log('  3. Check internet connection');
    console.log('  4. Verify script has correct permissions\n');
    process.exit(1);
  }
}

checkStudentCount();
