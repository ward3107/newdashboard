/**
 * ========================================
 * ANALYZE ALL EXISTING STUDENTS
 * ========================================
 *
 * This function will:
 * 1. Get all unique students from StudentResponses
 * 2. Analyze each one with Claude AI
 * 3. Write results to AI_Insights
 *
 * RUN THIS ONCE to populate your dashboard!
 */

function analyzeAllExistingStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName('StudentResponses');
  const insightsSheet = ss.getSheetByName('AI_Insights');

  if (!responsesSheet) {
    Logger.log('❌ StudentResponses sheet not found!');
    return { success: false, error: 'StudentResponses sheet not found' };
  }

  if (!insightsSheet) {
    Logger.log('❌ AI_Insights sheet not found!');
    return { success: false, error: 'AI_Insights sheet not found' };
  }

  // Get unique student codes
  const uniqueStudents = getUniqueStudents();

  Logger.log(`📊 Found ${uniqueStudents.length} unique students`);
  Logger.log(`🔍 Students: ${uniqueStudents.join(', ')}`);

  // Get already analyzed students
  const analyzedStudents = getAlreadyAnalyzedStudents();
  Logger.log(`✅ Already analyzed: ${analyzedStudents.size} students`);

  // Filter out already analyzed
  const studentsToAnalyze = uniqueStudents.filter(code => !analyzedStudents.has(code));

  if (studentsToAnalyze.length === 0) {
    Logger.log('✅ All students already analyzed!');
    return {
      success: true,
      total: uniqueStudents.length,
      analyzed: 0,
      skipped: uniqueStudents.length,
      message: 'All students already analyzed'
    };
  }

  Logger.log(`🎯 Need to analyze: ${studentsToAnalyze.length} students`);

  let successCount = 0;
  let errorCount = 0;
  const errors = [];

  // Analyze each student
  for (let i = 0; i < studentsToAnalyze.length; i++) {
    const studentCode = studentsToAnalyze[i];

    try {
      Logger.log(`\n[${i + 1}/${studentsToAnalyze.length}] Analyzing student: ${studentCode}`);

      // Run analysis
      analyzeOneStudent(studentCode);

      successCount++;
      Logger.log(`✅ Success!`);

      // Pause between API calls (avoid rate limits)
      if (i < studentsToAnalyze.length - 1) {
        Logger.log('⏸️ Waiting 2 seconds...');
        Utilities.sleep(2000); // 2 second delay
      }

    } catch (error) {
      errorCount++;
      const errorMsg = `Student ${studentCode}: ${error.toString()}`;
      errors.push(errorMsg);
      Logger.log(`❌ Error: ${errorMsg}`);
    }
  }

  const result = {
    success: true,
    total: uniqueStudents.length,
    analyzed: successCount,
    errors: errorCount,
    skipped: analyzedStudents.size,
    errorMessages: errors,
    message: `Analyzed ${successCount} students. ${errorCount} errors. ${analyzedStudents.size} already existed.`
  };

  Logger.log('\n' + '='.repeat(50));
  Logger.log('📊 ANALYSIS COMPLETE!');
  Logger.log('='.repeat(50));
  Logger.log(`✅ Successfully analyzed: ${successCount}`);
  Logger.log(`❌ Errors: ${errorCount}`);
  Logger.log(`⏭️ Already analyzed (skipped): ${analyzedStudents.size}`);
  Logger.log(`📈 Total students in system: ${uniqueStudents.length}`);

  if (errors.length > 0) {
    Logger.log('\n⚠️ Errors:');
    errors.forEach(err => Logger.log(`  - ${err}`));
  }

  return result;
}

/**
 * Get students already in AI_Insights
 */
function getAlreadyAnalyzedStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('AI_Insights');

  const analyzed = new Set();

  if (!sheet || sheet.getLastRow() <= 1) {
    return analyzed;
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // Column A = studentCode
      analyzed.add(String(data[i][0]));
    }
  }

  return analyzed;
}

/**
 * ========================================
 * BATCH ANALYSIS (Analyze in chunks)
 * ========================================
 * Use this if you have many students and want to analyze them in batches
 */
function analyzeBatch(startIndex = 0, batchSize = 5) {
  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const studentsToAnalyze = uniqueStudents.filter(code => !analyzedStudents.has(code));

  if (studentsToAnalyze.length === 0) {
    Logger.log('✅ All students already analyzed!');
    return { success: true, message: 'All students analyzed' };
  }

  const batch = studentsToAnalyze.slice(startIndex, startIndex + batchSize);

  Logger.log(`📦 Analyzing batch: ${startIndex} to ${startIndex + batchSize}`);
  Logger.log(`📊 Students in this batch: ${batch.join(', ')}`);

  let successCount = 0;

  for (let i = 0; i < batch.length; i++) {
    const studentCode = batch[i];

    try {
      Logger.log(`\n[${i + 1}/${batch.length}] Analyzing: ${studentCode}`);
      analyzeOneStudent(studentCode);
      successCount++;
      Logger.log(`✅ Success!`);

      if (i < batch.length - 1) {
        Utilities.sleep(2000);
      }
    } catch (error) {
      Logger.log(`❌ Error: ${error.toString()}`);
    }
  }

  const remaining = studentsToAnalyze.length - (startIndex + batchSize);

  Logger.log(`\n✅ Batch complete! Analyzed ${successCount}/${batch.length}`);
  Logger.log(`📊 Remaining: ${Math.max(0, remaining)} students`);

  if (remaining > 0) {
    Logger.log(`\n▶️ To analyze next batch, run:`);
    Logger.log(`   analyzeBatch(${startIndex + batchSize}, ${batchSize})`);
  }

  return {
    success: true,
    analyzed: successCount,
    remaining: Math.max(0, remaining),
    nextIndex: remaining > 0 ? startIndex + batchSize : null
  };
}

/**
 * ========================================
 * TEST SINGLE STUDENT
 * ========================================
 * Test analysis on one student first
 */
function testAnalyzeFirstStudent() {
  const students = getUniqueStudents();

  if (students.length === 0) {
    Logger.log('❌ No students found in StudentResponses!');
    return;
  }

  const firstStudent = students[0];
  Logger.log(`🧪 Testing analysis on: ${firstStudent}`);

  try {
    analyzeOneStudent(firstStudent);
    Logger.log('✅ Test successful! Check AI_Insights sheet.');
    Logger.log('📊 You can now run analyzeAllExistingStudents() to analyze all students.');
  } catch (error) {
    Logger.log('❌ Test failed: ' + error.toString());
    Logger.log('⚠️ Check your Claude API key in Script Properties!');
  }
}

/**
 * ========================================
 * USAGE INSTRUCTIONS
 * ========================================
 *
 * Option 1 - Test First (Recommended):
 * Run: testAnalyzeFirstStudent()
 * This analyzes just 1 student to make sure everything works
 *
 * Option 2 - Analyze All:
 * Run: analyzeAllExistingStudents()
 * This analyzes ALL students at once (may take time)
 *
 * Option 3 - Batch Analysis:
 * Run: analyzeBatch(0, 5)  // Start at 0, analyze 5 students
 * Then: analyzeBatch(5, 5)  // Next 5
 * Then: analyzeBatch(10, 5) // Next 5
 * etc.
 *
 * IMPORTANT:
 * - Make sure Claude API key is in Script Properties!
 * - The analysis uses Claude API (costs apply)
 * - Each student takes ~2-5 seconds to analyze
 * - For 29 students, expect ~2-3 minutes total
 */
