/**
 * ========================================
 * COMPLETE doGet FUNCTION FOR YOUR SCRIPT
 * ========================================
 *
 * ADD THIS TO YOUR Google Apps Script
 * This handles ALL API calls from the React dashboard
 */

/**
 * Web App entry point - handles ALL requests from React app
 */
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId;

  try {
    let result;

    switch(action) {
      case 'getAllStudents':
        result = getAllStudentsAPI();
        break;

      case 'getStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = getStudentAPI(studentId);
        break;

      case 'getStats':
        result = getStatsAPI();
        break;

      case 'analyzeOneStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        analyzeOneStudent(studentId);
        result = { success: true, message: 'Student analyzed successfully' };
        break;

      case 'syncStudents':
        result = syncStudentsFromResponses();
        break;

      case 'initialSync':
        result = initialSyncAllStudents();
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: ['getAllStudents', 'getStudent', 'getStats', 'analyzeOneStudent', 'syncStudents', 'initialSync']
        };
    }

    return createJsonResponse(result);

  } catch (error) {
    return createJsonResponse({
      error: error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Helper function to create JSON response
 */
function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ========================================
 * API FUNCTIONS
 * ========================================
 */

/**
 * Get all students from AI_Insights
 */
function getAllStudentsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { students: [] };
  }

  const data = sheet.getDataRange().getValues();
  const students = [];

  // Skip header row (index 0)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];

    // Extract data from columns
    const studentCode = row[0];
    const quarter = row[1];
    const classId = row[2];
    const date = row[3];
    const name = row[4];
    const learningStyle = row[5];
    const keyNotes = row[6];
    const strengthsText = row[7] || '';
    const challengesText = row[8] || '';

    // Count strengths and challenges
    const strengths = strengthsText.split('\n').filter(s => s.trim()).length;
    const challenges = challengesText.split('\n').filter(s => s.trim()).length;

    students.push({
      studentCode: studentCode,
      quarter: quarter,
      classId: classId || 'Unknown',
      date: formatDate(date),
      name: name || `תלמיד ${studentCode}`,
      learningStyle: learningStyle || '',
      keyNotes: keyNotes || '',
      strengthsCount: strengths,
      challengesCount: challenges
    });
  }

  return { students: students };
}

/**
 * Get detailed student data
 */
function getStudentAPI(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { error: 'No students found in AI_Insights' };
  }

  const data = sheet.getDataRange().getValues();

  // Find student row
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      const row = data[i];

      // Parse JSON from last column if available
      const jsonColumn = row[row.length - 1];
      let fullData = {};

      try {
        if (jsonColumn && typeof jsonColumn === 'string') {
          fullData = JSON.parse(jsonColumn);
        }
      } catch (e) {
        Logger.log('Failed to parse JSON for student ' + studentId);
      }

      // Build student object
      const student = {
        studentCode: row[0],
        quarter: row[1],
        classId: row[2],
        date: formatDate(row[3]),
        name: row[4] || `תלמיד ${studentId}`,

        student_summary: fullData.student_summary || {
          learning_style: row[5] || '',
          key_notes: row[6] || '',
          strengths: (row[7] || '').split('\n').filter(s => s.trim()),
          challenges: (row[8] || '').split('\n').filter(s => s.trim())
        },

        insights: fullData.insights || extractInsights(row),

        immediate_actions: fullData.immediate_actions || extractImmediateActions(row),

        seating_arrangement: fullData.seating_arrangement || {
          location: row[row.length - 4] || '',
          partner_type: row[row.length - 3] || '',
          avoid: row[row.length - 2] || ''
        }
      };

      return student;
    }
  }

  return { error: 'Student not found' };
}

/**
 * Extract insights from row data (columns 9-26)
 */
function extractInsights(row) {
  const insights = [];

  // 6 insights, each taking 3 columns (category, finding, recommendations)
  for (let i = 0; i < 6; i++) {
    const baseIndex = 9 + (i * 3);
    const category = row[baseIndex];

    if (category) {
      insights.push({
        category: category,
        icon: extractEmoji(category),
        finding: row[baseIndex + 1] || '',
        recommendations: parseRecommendations(row[baseIndex + 2])
      });
    }
  }

  return insights;
}

/**
 * Parse recommendations text into structured array
 */
function parseRecommendations(text) {
  if (!text) return [];

  const recs = text.split('━━━━━━━━━').map(r => r.trim()).filter(r => r);

  return recs.map(rec => {
    const lines = rec.split('\n').filter(l => l.trim());
    return {
      action: lines[0] || '',
      how_to: lines[1] || '',
      time_needed: lines[2] || '',
      examples: lines[3] || '',
      priority: 'medium'
    };
  });
}

/**
 * Extract immediate actions from row data (columns 27-33)
 */
function extractImmediateActions(row) {
  const actions = [];

  // 7 immediate actions
  for (let i = 27; i < 34; i++) {
    if (row[i]) {
      const lines = row[i].split('\n').filter(l => l.trim());
      actions.push({
        what: lines[0] || row[i],
        how: lines[1] || '',
        when: lines[2] || '',
        time: lines[3] || ''
      });
    }
  }

  return actions;
}

/**
 * Extract emoji from text
 */
function extractEmoji(text) {
  if (!text) return '📌';
  const match = text.match(/[\u{1F300}-\u{1F9FF}]/u);
  return match ? match[0] : '📌';
}

/**
 * Get statistics
 */
function getStatsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      totalStudents: 0,
      byClass: {},
      byLearningStyle: {},
      averageStrengths: 0,
      lastUpdated: new Date().toLocaleDateString('he-IL')
    };
  }

  const data = sheet.getDataRange().getValues();
  const byClass = {};
  const byLearningStyle = {};
  let totalStrengths = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const classId = row[2] || 'Unknown';
    const learningStyle = row[5] || '';
    const strengthsText = row[7] || '';

    // Count by class
    byClass[classId] = (byClass[classId] || 0) + 1;

    // Count by learning style
    const styles = learningStyle.split('\n')
      .map(s => s.replace(/^[•\s]+/, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim())
      .filter(s => s);

    styles.forEach(style => {
      const firstWord = style.split(' ')[0];
      if (firstWord) {
        byLearningStyle[firstWord] = (byLearningStyle[firstWord] || 0) + 1;
      }
    });

    // Count strengths
    const strengthCount = strengthsText.split('\n').filter(s => s.trim()).length;
    totalStrengths += strengthCount;
  }

  const studentCount = data.length - 1;

  return {
    totalStudents: studentCount,
    byClass: byClass,
    byLearningStyle: byLearningStyle,
    averageStrengths: studentCount > 0 ? (totalStrengths / studentCount).toFixed(1) : 0,
    lastUpdated: new Date().toLocaleDateString('he-IL')
  };
}

/**
 * Format date for display
 */
function formatDate(date) {
  if (!date) return new Date().toLocaleDateString('he-IL');

  if (date instanceof Date) {
    return date.toLocaleDateString('he-IL');
  }

  try {
    return new Date(date).toLocaleDateString('he-IL');
  } catch (e) {
    return date.toString();
  }
}

/**
 * ========================================
 * SYNC FUNCTIONS
 * ========================================
 */

/**
 * Initial sync - import all existing students from responses
 */
function initialSyncAllStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('responsesLong');
  const studentsSheet = ss.getSheetByName('students');

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: 'Missing responsesLong or students sheet'
    };
  }

  const uniqueStudents = getUniqueStudents();
  const existingStudents = getExistingStudentCodes();

  let addedCount = 0;

  for (let studentCode of uniqueStudents) {
    if (!existingStudents.has(studentCode)) {
      const info = getStudentInfo(studentCode);

      studentsSheet.appendRow([
        studentCode,
        info.classId || 'Unknown',
        info.name || `תלמיד ${studentCode}`,
        'Active'
      ]);

      addedCount++;
    }
  }

  return {
    success: true,
    added: addedCount,
    total: uniqueStudents.length,
    message: `נוספו ${addedCount} תלמידים. סה"כ ${uniqueStudents.length} תלמידים במערכת.`
  };
}

/**
 * Sync only new students
 */
function syncStudentsFromResponses() {
  // This function already exists in your script
  // Just make sure it returns the right format

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('responsesLong');
  const studentsSheet = ss.getSheetByName('students');

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: 'Missing sheets'
    };
  }

  const uniqueStudents = getUniqueStudents();
  const existingStudents = getExistingStudentCodes();

  let addedCount = 0;

  for (let studentCode of uniqueStudents) {
    if (!existingStudents.has(studentCode)) {
      const info = getStudentInfo(studentCode);

      studentsSheet.appendRow([
        studentCode,
        info.classId || 'Unknown',
        info.name || `תלמיד ${studentCode}`,
        'Active'
      ]);

      addedCount++;
    }
  }

  return {
    success: true,
    added: addedCount,
    message: addedCount > 0
      ? `נוספו ${addedCount} תלמידים חדשים`
      : 'אין תלמידים חדשים'
  };
}

/**
 * Get existing student codes from students sheet
 */
function getExistingStudentCodes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('students');

  const codes = new Set();

  if (!sheet || sheet.getLastRow() <= 1) {
    return codes;
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    codes.add(String(data[i][0]));
  }

  return codes;
}

/**
 * Get unique student codes from responsesLong
 */
function getUniqueStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong');

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const uniqueCodes = new Set();

  // Skip header row, collect unique student codes
  // ⚠️ IMPORTANT: Adjust column index [1] if your student code is in a different column
  for (let i = 1; i < data.length; i++) {
    const studentCode = String(data[i][1]); // Column B (index 1) - adjust if needed
    if (studentCode && studentCode.trim()) {
      uniqueCodes.add(studentCode.trim());
    }
  }

  return Array.from(uniqueCodes);
}

/**
 * Get student info from responsesLong
 */
function getStudentInfo(studentCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  // Find first occurrence of this student
  // ⚠️ IMPORTANT: Adjust column indexes if your data structure is different
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() == String(studentCode).trim()) {
      return {
        classId: data[i][3] || 'Unknown',  // Column D (index 3) - adjust if needed
        name: data[i][2] || `תלמיד ${studentCode}`  // Column C (index 2) - adjust if needed
      };
    }
  }

  return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
}

/**
 * ========================================
 * DEBUG HELPER - Run this to check your column structure
 * ========================================
 */
function debugResponsesStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong');

  if (!sheet) {
    Logger.log('❌ Sheet "responsesLong" not found!');
    Logger.log('Available sheets: ' + ss.getSheets().map(s => s.getName()).join(', '));
    return;
  }

  const data = sheet.getDataRange().getValues();

  if (data.length === 0) {
    Logger.log('❌ Sheet is empty');
    return;
  }

  // Print header row
  Logger.log('📋 COLUMN HEADERS:');
  Logger.log('================================');
  for (let i = 0; i < data[0].length; i++) {
    Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[0][i]}`);
  }

  // Print sample row
  if (data.length > 1) {
    Logger.log('\n📝 SAMPLE DATA ROW:');
    Logger.log('================================');
    for (let i = 0; i < data[1].length; i++) {
      Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[1][i]}`);
    }
  }

  Logger.log('\n✅ Update the column indexes in getUniqueStudents() and getStudentInfo() based on above');
  Logger.log('   - Student Code column index: currently set to [1]');
  Logger.log('   - Student Name column index: currently set to [2]');
  Logger.log('   - Class ID column index: currently set to [3]');
}

// ========================================
// NOTE: Your other functions (analyzeOneStudent, etc.)
// should remain as they are in your current script.
// This file only adds the complete doGet function.
// ========================================
