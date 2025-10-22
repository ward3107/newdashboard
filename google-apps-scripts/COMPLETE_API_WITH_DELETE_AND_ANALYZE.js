/**
 * ========================================
 * COMPLETE GOOGLE APPS SCRIPT API
 * WITH DELETE AND ANALYSIS FUNCTIONS
 * ========================================
 */

/**
 * Web App entry point - handles ALL requests from React app
 */
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId;
  const token = e.parameter.token;

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
        result = analyzeOneStudent(studentId);
        break;

      case 'syncStudents':
        result = syncStudentsFromResponses();
        break;

      case 'initialSync':
        result = initialSyncAllStudents();
        break;

      // ===== DELETE FUNCTIONS =====
      case 'deleteStudentAnalysis':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = deleteStudentAnalysis(studentId);
        break;

      case 'deleteAllAnalyses':
        // Security: require admin token for destructive operations
        if (!token || token !== getAdminToken()) {
          return createJsonResponse({ error: 'Unauthorized - admin token required' });
        }
        result = deleteAllAnalyses();
        break;

      case 'deleteOldAnalyses':
        const days = parseInt(e.parameter.days) || 30;
        result = deleteOldAnalyses(days);
        break;

      case 'deleteByClass':
        const classId = e.parameter.classId;
        if (!classId) {
          return createJsonResponse({ error: 'Missing classId' });
        }
        result = deleteAnalysesByClass(classId);
        break;

      // ===== BATCH ANALYSIS =====
      case 'analyzeAllUnanalyzed':
        result = analyzeAllUnanalyzedStudents();
        break;

      case 'reanalyzeStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = reanalyzeStudent(studentId);
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: [
            'getAllStudents', 'getStudent', 'getStats',
            'analyzeOneStudent', 'syncStudents', 'initialSync',
            'deleteStudentAnalysis', 'deleteAllAnalyses', 'deleteOldAnalyses', 'deleteByClass',
            'analyzeAllUnanalyzed', 'reanalyzeStudent'
          ]
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
 * Get admin token from Script Properties
 * Setup: Go to Project Settings > Script Properties > Add property "ADMIN_TOKEN"
 */
function getAdminToken() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('ADMIN_TOKEN') || 'default-admin-token-change-me';
}

// ========================================
// API FUNCTIONS (from your previous script)
// ========================================

function getAllStudentsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { students: [] };
  }

  const data = sheet.getDataRange().getValues();
  const students = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const studentCode = row[0];
    const quarter = row[1];
    const classId = row[2];
    const date = row[3];
    const name = row[4];
    const learningStyle = row[5];
    const keyNotes = row[6];
    const strengthsText = row[7] || '';
    const challengesText = row[8] || '';

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

function getStudentAPI(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { error: 'No students found in AI_Insights' };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      const row = data[i];

      const jsonColumn = row[row.length - 1];
      let fullData = {};

      try {
        if (jsonColumn && typeof jsonColumn === 'string') {
          fullData = JSON.parse(jsonColumn);
        }
      } catch (e) {
        Logger.log('Failed to parse JSON for student ' + studentId);
      }

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

function extractInsights(row) {
  const insights = [];

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

function extractImmediateActions(row) {
  const actions = [];

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

function extractEmoji(text) {
  if (!text) return '📌';
  const match = text.match(/[\u{1F300}-\u{1F9FF}]/u);
  return match ? match[0] : '📌';
}

function getStatsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      totalStudents: 0,
      byClass: {},
      byLearningStyle: {},
      averageStrengths: 0,
      averageChallenges: 0,
      lastUpdated: new Date().toLocaleDateString('he-IL')
    };
  }

  const data = sheet.getDataRange().getValues();
  const byClass = {};
  const byLearningStyle = {};
  let totalStrengths = 0;
  let totalChallenges = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const classId = row[2] || 'Unknown';
    const learningStyle = row[5] || '';
    const strengthsText = row[7] || '';
    const challengesText = row[8] || '';

    byClass[classId] = (byClass[classId] || 0) + 1;

    const styles = learningStyle.split('\n')
      .map(s => s.replace(/^[•\s]+/, '').replace(/[\u{1F300}-\u{1F9FF}]/gu, '').trim())
      .filter(s => s);

    styles.forEach(style => {
      const firstWord = style.split(' ')[0];
      if (firstWord) {
        byLearningStyle[firstWord] = (byLearningStyle[firstWord] || 0) + 1;
      }
    });

    const strengthCount = strengthsText.split('\n').filter(s => s.trim()).length;
    totalStrengths += strengthCount;

    const challengeCount = challengesText.split('\n').filter(s => s.trim()).length;
    totalChallenges += challengeCount;
  }

  const studentCount = data.length - 1;

  return {
    totalStudents: studentCount,
    byClass: byClass,
    byLearningStyle: byLearningStyle,
    averageStrengths: studentCount > 0 ? (totalStrengths / studentCount).toFixed(1) : 0,
    averageChallenges: studentCount > 0 ? (totalChallenges / studentCount).toFixed(1) : 0,
    lastUpdated: new Date().toLocaleDateString('he-IL')
  };
}

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

// ========================================
// DELETE FUNCTIONS
// ========================================

/**
 * Delete analysis for a single student
 */
function deleteStudentAnalysis(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      success: false,
      error: 'No analyses found'
    };
  }

  const data = sheet.getDataRange().getValues();

  // Find the row to delete
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      // Delete the row (i+1 because sheet rows are 1-indexed)
      sheet.deleteRow(i + 1);

      Logger.log(`✅ Deleted analysis for student ${studentId}`);

      return {
        success: true,
        message: `Analysis deleted for student ${studentId}`,
        studentId: studentId
      };
    }
  }

  return {
    success: false,
    error: `Student ${studentId} not found in analyses`
  };
}

/**
 * Delete ALL analyses (DANGEROUS - requires admin token)
 * Creates a backup before deleting
 */
function deleteAllAnalyses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet) {
    return {
      success: false,
      error: 'AI_Insights sheet not found'
    };
  }

  const lastRow = sheet.getLastRow();
  const dataRows = lastRow - 1; // Exclude header

  if (dataRows <= 0) {
    return {
      success: true,
      message: 'No analyses to delete',
      deleted: 0
    };
  }

  // Create backup first
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const backupName = `AI_Insights_BACKUP_${timestamp}`;
  const backup = sheet.copyTo(ss);
  backup.setName(backupName);

  Logger.log(`📦 Backup created: ${backupName}`);

  // Delete all data rows (keep header)
  if (dataRows > 0) {
    sheet.deleteRows(2, dataRows);
  }

  Logger.log(`🗑️ Deleted ${dataRows} analyses`);

  return {
    success: true,
    message: `Deleted ${dataRows} analyses. Backup: ${backupName}`,
    deleted: dataRows,
    backup: backupName
  };
}

/**
 * Delete analyses older than X days
 */
function deleteOldAnalyses(days = 30) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      success: true,
      message: 'No analyses found',
      deleted: 0
    };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const data = sheet.getDataRange().getValues();
  let deletedCount = 0;

  // Loop backwards to avoid index shifting issues when deleting rows
  for (let i = data.length - 1; i >= 1; i--) {
    const dateValue = data[i][3]; // Column D - date
    let rowDate;

    try {
      rowDate = new Date(dateValue);
    } catch (e) {
      Logger.log(`⚠️ Invalid date for row ${i + 1}: ${dateValue}`);
      continue;
    }

    if (rowDate < cutoffDate) {
      sheet.deleteRow(i + 1);
      deletedCount++;
      Logger.log(`🗑️ Deleted old analysis: student ${data[i][0]}, date ${dateValue}`);
    }
  }

  return {
    success: true,
    message: `Deleted ${deletedCount} analyses older than ${days} days`,
    deleted: deletedCount,
    cutoffDate: cutoffDate.toLocaleDateString('he-IL')
  };
}

/**
 * Delete all analyses for a specific class
 */
function deleteAnalysesByClass(classId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      success: true,
      message: 'No analyses found',
      deleted: 0
    };
  }

  const data = sheet.getDataRange().getValues();
  let deletedCount = 0;

  // Loop backwards to avoid index shifting
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][2] == classId) { // Column C - class ID
      sheet.deleteRow(i + 1);
      deletedCount++;
      Logger.log(`🗑️ Deleted analysis for student ${data[i][0]} in class ${classId}`);
    }
  }

  return {
    success: true,
    message: `Deleted ${deletedCount} analyses for class ${classId}`,
    deleted: deletedCount,
    classId: classId
  };
}

// ========================================
// ANALYSIS FUNCTIONS
// ========================================

/**
 * Analyze one student using OpenAI GPT-4
 * This is a placeholder - you'll need to add your OpenAI API integration
 */
function analyzeOneStudent(studentId) {
  Logger.log(`🔍 Starting analysis for student: ${studentId}`);

  // Get student responses from your form data
  const responses = getStudentResponses(studentId);

  if (!responses || responses.length === 0) {
    return {
      success: false,
      error: `No form responses found for student ${studentId}`
    };
  }

  // Check if already analyzed
  const existingAnalysis = getStudentAPI(studentId);
  if (existingAnalysis && !existingAnalysis.error) {
    return {
      success: false,
      error: `Student ${studentId} already analyzed. Use reanalyzeStudent to re-analyze.`,
      existingAnalysis: existingAnalysis
    };
  }

  // TODO: Add your OpenAI API call here
  // Example structure:
  /*
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');
  const prompt = buildAnalysisPrompt(studentId, responses);
  const analysis = callOpenAI(apiKey, prompt);
  writeAnalysisToSheet(studentId, analysis);
  */

  // For now, return a placeholder
  Logger.log(`⚠️ Analysis function needs OpenAI integration`);

  return {
    success: false,
    error: 'Analysis function not yet implemented - add OpenAI API integration',
    studentId: studentId,
    responsesFound: responses.length,
    message: 'To implement: Add OpenAI API key to Script Properties and integrate API call'
  };
}

/**
 * Re-analyze a student (delete old analysis and create new)
 */
function reanalyzeStudent(studentId) {
  Logger.log(`🔄 Re-analyzing student: ${studentId}`);

  // Delete existing analysis
  const deleteResult = deleteStudentAnalysis(studentId);

  if (!deleteResult.success && deleteResult.error.indexOf('not found') === -1) {
    return deleteResult; // Return error if deletion failed for reasons other than "not found"
  }

  // Analyze the student
  return analyzeOneStudent(studentId);
}

/**
 * Analyze all unanalyzed students
 */
function analyzeAllUnanalyzedStudents() {
  const allStudents = getUniqueStudents();
  const analyzedStudents = getAnalyzedStudentCodes();

  const unanalyzed = allStudents.filter(code => !analyzedStudents.has(code));

  if (unanalyzed.length === 0) {
    return {
      success: true,
      message: 'All students already analyzed',
      analyzed: 0,
      total: allStudents.length
    };
  }

  Logger.log(`📊 Found ${unanalyzed.length} unanalyzed students`);

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < unanalyzed.length; i++) {
    const studentId = unanalyzed[i];

    try {
      Logger.log(`[${i + 1}/${unanalyzed.length}] Analyzing ${studentId}...`);

      const result = analyzeOneStudent(studentId);

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        errors.push({ studentId, error: result.error });
      }

      // Rate limiting: pause between analyses
      if (i < unanalyzed.length - 1) {
        Utilities.sleep(2000); // 2 second pause
      }

    } catch (error) {
      failCount++;
      errors.push({ studentId, error: error.toString() });
      Logger.log(`❌ Error analyzing ${studentId}: ${error}`);
    }
  }

  return {
    success: true,
    message: `Analyzed ${successCount} students successfully`,
    analyzed: successCount,
    failed: failCount,
    total: unanalyzed.length,
    errors: errors
  };
}

/**
 * Get analyzed student codes
 */
function getAnalyzedStudentCodes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

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
 * Get student responses from form data
 * ⚠️ ADJUST COLUMN INDEXES BASED ON YOUR SHEET STRUCTURE
 */
function getStudentResponses(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong'); // Or your form responses sheet name

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const responses = [];

  // Find all responses for this student
  // ⚠️ Adjust column index [1] if student code is in different column
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() == String(studentId).trim()) {
      responses.push(data[i]);
    }
  }

  return responses;
}

// ========================================
// SYNC FUNCTIONS
// ========================================

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

function syncStudentsFromResponses() {
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

function getUniqueStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong');

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const uniqueCodes = new Set();

  // ⚠️ IMPORTANT: Adjust column index [1] if student code is in different column
  for (let i = 1; i < data.length; i++) {
    const studentCode = String(data[i][1]);
    if (studentCode && studentCode.trim()) {
      uniqueCodes.add(studentCode.trim());
    }
  }

  return Array.from(uniqueCodes);
}

function getStudentInfo(studentCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('responsesLong');

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  // ⚠️ IMPORTANT: Adjust column indexes based on your structure
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][1]).trim() == String(studentCode).trim()) {
      return {
        classId: data[i][3] || 'Unknown',  // Column D (index 3)
        name: data[i][2] || `תלמיד ${studentCode}`  // Column C (index 2)
      };
    }
  }

  return { classId: 'Unknown', name: `תלמיד ${studentCode}` };
}

// ========================================
// DEBUG FUNCTIONS
// ========================================

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

  Logger.log('📋 COLUMN HEADERS:');
  Logger.log('================================');
  for (let i = 0; i < data[0].length; i++) {
    Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[0][i]}`);
  }

  if (data.length > 1) {
    Logger.log('\n📝 SAMPLE DATA ROW:');
    Logger.log('================================');
    for (let i = 0; i < data[1].length; i++) {
      Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[1][i]}`);
    }
  }

  Logger.log('\n✅ Update column indexes in functions based on above');
}

/**
 * Test delete functions
 */
function testDeleteFunctions() {
  Logger.log('🧪 Testing delete functions...\n');

  // Test 1: Get current count
  const stats = getStatsAPI();
  Logger.log(`📊 Current analyses: ${stats.totalStudents}`);

  // Test 2: Delete old analyses (older than 60 days)
  const oldResult = deleteOldAnalyses(60);
  Logger.log(`\n🗑️ Delete old analyses result: ${JSON.stringify(oldResult)}`);

  // Test 3: Get student list
  const students = getAllStudentsAPI();
  if (students.students.length > 0) {
    const testStudent = students.students[0].studentCode;
    Logger.log(`\n🔍 Test student: ${testStudent}`);

    // Test 4: Delete single student
    // ⚠️ UNCOMMENT TO TEST (will actually delete!)
    // const deleteResult = deleteStudentAnalysis(testStudent);
    // Logger.log(`🗑️ Delete result: ${JSON.stringify(deleteResult)}`);
  }

  Logger.log('\n✅ Test complete!');
}

/**
 * ========================================
 * SETUP INSTRUCTIONS
 * ========================================
 *
 * 1. Copy this entire script to your Google Apps Script project
 *
 * 2. Set up Script Properties (Project Settings > Script Properties):
 *    - ADMIN_TOKEN: Create a secure token for destructive operations
 *    - OPENAI_API_KEY: Your OpenAI API key (for analysis functions)
 *
 * 3. Deploy as Web App:
 *    - Click Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy
 *    - Copy the Web App URL
 *
 * 4. Update your React app with the new Web App URL
 *
 * 5. Available API endpoints:
 *    - getAllStudents
 *    - getStudent&studentId=XXX
 *    - getStats
 *    - analyzeOneStudent&studentId=XXX
 *    - deleteStudentAnalysis&studentId=XXX
 *    - deleteOldAnalyses&days=30
 *    - deleteByClass&classId=XXX
 *    - deleteAllAnalyses&token=YOUR_ADMIN_TOKEN (DANGEROUS!)
 *    - analyzeAllUnanalyzed
 *    - reanalyzeStudent&studentId=XXX
 *
 * ========================================
 */
