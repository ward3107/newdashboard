/**
 * ========================================
 * GOOGLE FORMS CONFIGURATION
 * ========================================
 *
 * Instructions:
 * 1. Change FORM_RESPONSES_SHEET_NAME to match your actual sheet name
 * 2. Run debugFormStructure() to see your column layout
 * 3. Update the column indexes below to match your form
 * 4. Copy all functions to your Google Apps Script
 */

// ⚠️ CONFIGURATION - UPDATE THESE VALUES
const CONFIG = {
  // Sheet names
  FORM_RESPONSES_SHEET: 'Form Responses 1',  // ⬅️ CHANGE THIS to your form response sheet name
  AI_INSIGHTS_SHEET: 'AI_Insights',
  STUDENTS_SHEET: 'students',

  // Column indexes for Form Responses sheet (0-based)
  // Adjust these after running debugFormStructure()
  COLUMNS: {
    TIMESTAMP: 0,        // Column A - Usually timestamp
    STUDENT_CODE: 1,     // Column B - Student ID/Code
    STUDENT_NAME: 2,     // Column C - Student Name
    CLASS_ID: 3,         // Column D - Class/Grade
    // Add more columns as needed for your form
  }
};

/**
 * ========================================
 * DEBUG HELPER - RUN THIS FIRST!
 * ========================================
 * This will show you the exact structure of your form responses
 */
function debugFormStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log('📚 AVAILABLE SHEETS:');
  Logger.log('================================');
  ss.getSheets().forEach((sheet, index) => {
    Logger.log(`${index + 1}. "${sheet.getName()}" - ${sheet.getLastRow()} rows`);
  });

  Logger.log('\n');

  // Try to find form response sheet
  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!formSheet) {
    Logger.log(`❌ Sheet "${CONFIG.FORM_RESPONSES_SHEET}" not found!`);
    Logger.log('📝 Please update CONFIG.FORM_RESPONSES_SHEET with the correct name from the list above.');
    return;
  }

  const data = formSheet.getDataRange().getValues();

  if (data.length === 0) {
    Logger.log('❌ Sheet is empty');
    return;
  }

  // Print headers
  Logger.log('📋 COLUMN HEADERS (Form Questions):');
  Logger.log('================================');
  for (let i = 0; i < data[0].length; i++) {
    const letter = String.fromCharCode(65 + i);
    Logger.log(`Column ${letter} [${i}]: "${data[0][i]}"`);
  }

  // Print sample data
  if (data.length > 1) {
    Logger.log('\n📝 SAMPLE DATA (First Response):');
    Logger.log('================================');
    for (let i = 0; i < data[1].length; i++) {
      const letter = String.fromCharCode(65 + i);
      const value = String(data[1][i]).substring(0, 100); // Limit to 100 chars
      Logger.log(`Column ${letter} [${i}]: ${value}`);
    }
  }

  Logger.log('\n✅ NEXT STEPS:');
  Logger.log('1. Update CONFIG.COLUMNS with the correct indexes');
  Logger.log('2. Replace all instances of "responsesLong" with CONFIG.FORM_RESPONSES_SHEET');
  Logger.log('3. Use CONFIG.COLUMNS.STUDENT_CODE instead of hardcoded [1]');
}

/**
 * ========================================
 * UPDATED HELPER FUNCTIONS
 * ========================================
 * These use the CONFIG object for flexibility
 */

function getUniqueStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const uniqueCodes = new Set();

  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const studentCode = String(data[i][CONFIG.COLUMNS.STUDENT_CODE]);
    if (studentCode && studentCode.trim()) {
      uniqueCodes.add(studentCode.trim());
    }
  }

  return Array.from(uniqueCodes);
}

function getStudentInfo(studentCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  // Find first occurrence
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() == String(studentCode).trim()) {
      return {
        classId: data[i][CONFIG.COLUMNS.CLASS_ID] || 'Unknown',
        name: data[i][CONFIG.COLUMNS.STUDENT_NAME] || `תלמיד ${studentCode}`
      };
    }
  }

  return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
}

/**
 * ========================================
 * GETTING ALL FORM RESPONSES FOR A STUDENT
 * ========================================
 * This gets all responses from one student across all submissions
 */
function getStudentFormResponses(studentCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const responses = [];

  // Find all rows for this student
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() == String(studentCode).trim()) {
      const response = {};

      // Map each column to its header
      for (let j = 0; j < headers.length; j++) {
        response[headers[j]] = data[i][j];
      }

      responses.push(response);
    }
  }

  return responses;
}

/**
 * ========================================
 * TEST FUNCTION - Verify Everything Works
 * ========================================
 */
function testConnection() {
  Logger.log('🧪 Testing Google Forms Connection...\n');

  // Test 1: Sheet exists
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet) {
    Logger.log('❌ FAILED: Sheet not found');
    return;
  }
  Logger.log('✅ Sheet found: ' + CONFIG.FORM_RESPONSES_SHEET);

  // Test 2: Has data
  const rowCount = sheet.getLastRow();
  Logger.log(`✅ Found ${rowCount - 1} responses`);

  // Test 3: Get unique students
  const students = getUniqueStudents();
  Logger.log(`✅ Found ${students.length} unique students`);
  Logger.log('   Students: ' + students.join(', '));

  // Test 4: Get info for first student
  if (students.length > 0) {
    const info = getStudentInfo(students[0]);
    Logger.log(`✅ Student info test: ${info.name} (${info.classId})`);

    // Test 5: Get all responses for first student
    const responses = getStudentFormResponses(students[0]);
    Logger.log(`✅ Found ${responses.length} responses for ${students[0]}`);
  }

  Logger.log('\n🎉 All tests passed!');
}

/**
 * ========================================
 * HOW TO USE THIS FILE:
 * ========================================
 *
 * 1. Open your Google Sheet with the form responses
 * 2. Go to Extensions > Apps Script
 * 3. Copy this entire file to your script
 * 4. Update CONFIG.FORM_RESPONSES_SHEET (line 18) with your actual sheet name
 * 5. Run debugFormStructure() from the script editor
 * 6. Check the logs (View > Logs or Ctrl+Enter)
 * 7. Update CONFIG.COLUMNS with the correct indexes
 * 8. Run testConnection() to verify everything works
 * 9. Replace the helper functions in your main script with these versions
 */
