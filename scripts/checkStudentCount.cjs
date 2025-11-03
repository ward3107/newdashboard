#!/usr/bin/env node

/**
 * Check actual student count in Google Sheets
 * This verifies your data before migration
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

const GOOGLE_SCRIPT_URL = process.env.VITE_GOOGLE_SCRIPT_URL;

function fetchData(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Failed to parse JSON response'));
        }
      });
    }).on('error', (error) => {
      reject(error);
    });
  });
}

async function checkStudentCount() {
  console.log('🔍 Checking Your Google Sheets Data\n');
  console.log('='.repeat(60));

  if (!GOOGLE_SCRIPT_URL) {
    console.log('❌ Error: VITE_GOOGLE_SCRIPT_URL not found in environment\n');
    console.log('Please set it:');
    console.log('  export VITE_GOOGLE_SCRIPT_URL="https://script.google.com/..."\n');
    console.log('Or add it to your .env file\n');
    process.exit(1);
  }

  console.log('📡 Connecting to Google Sheets API...');
  console.log('URL:', GOOGLE_SCRIPT_URL.substring(0, 50) + '...\n');

  try {
    const data = await fetchData(`${GOOGLE_SCRIPT_URL}?action=getAllStudents`);

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
    console.log('\n📋 Sample Students (showing up to 10):');
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

    console.log('\n✅ Data verified! Ready to migrate!\n');
    console.log('Next steps:');
    console.log('  1. Test migration (dry run):');
    console.log('     npm run migrate:dry-run -- --school-id=school_001\n');
    console.log('  2. Run real migration:');
    console.log('     npm run migrate:backup -- --school-id=school_001\n');

  } catch (error) {
    console.error('❌ Error connecting to Google Sheets:', error.message);
    console.log('\nPossible issues:');
    console.log('  1. Check VITE_GOOGLE_SCRIPT_URL environment variable');
    console.log('  2. Verify Google Apps Script is deployed as web app');
    console.log('  3. Check internet connection');
    console.log('  4. Verify script has correct permissions\n');
    process.exit(1);
  }
}

checkStudentCount();
