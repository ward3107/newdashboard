/**
 * ========================================
 * BATCH ANALYSIS - COST OPTIMIZATION
 * ========================================
 *
 * Instead of 1 API call per student (expensive):
 * - Analyze 3-5 students per API call
 * - Reduces cost by 70-80%!
 *
 * Example:
 * - Old way: 29 students = 29 API calls = $0.58
 * - New way: 29 students = 6 API calls = $0.12
 *
 * SAVINGS: ~$0.46 per analysis run!
 */

/**
 * Analyze multiple students in one API call
 * @param {number} batchSize - Number of students per API call (recommended: 3-5)
 */
function analyzeBatchOptimized(batchSize = 3) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const studentsToAnalyze = uniqueStudents.filter(code => !analyzedStudents.has(code));

  if (studentsToAnalyze.length === 0) {
    Logger.log('✅ All students already analyzed!');
    return { success: true, message: 'All students analyzed' };
  }

  Logger.log(`📊 Total students to analyze: ${studentsToAnalyze.length}`);
  Logger.log(`📦 Batch size: ${batchSize} students per API call`);
  Logger.log(`💰 Estimated API calls: ${Math.ceil(studentsToAnalyze.length / batchSize)}`);

  let totalAnalyzed = 0;
  let totalApiCalls = 0;

  // Process students in batches
  for (let i = 0; i < studentsToAnalyze.length; i += batchSize) {
    const batch = studentsToAnalyze.slice(i, i + batchSize);

    Logger.log(`\n[Batch ${Math.floor(i / batchSize) + 1}] Analyzing ${batch.length} students: ${batch.join(', ')}`);

    try {
      // Build combined prompt for all students in batch
      const batchPrompt = buildBatchAnalysisPrompt(batch);

      // Single API call for entire batch
      const batchResults = callClaudeAPI(batchPrompt);
      totalApiCalls++;

      if (batchResults) {
        // Parse results and write each student
        const analyses = parseBatchResults(batchResults, batch);

        analyses.forEach((analysis, index) => {
          if (analysis) {
            writeAnalysisToSheet(batch[index], analysis);
            totalAnalyzed++;
            Logger.log(`  ✅ ${batch[index]} analyzed`);
          }
        });
      }

      // Pause between batches (rate limiting)
      if (i + batchSize < studentsToAnalyze.length) {
        Logger.log('⏸️ Waiting 2 seconds...');
        Utilities.sleep(2000);
      }

    } catch (error) {
      Logger.log(`❌ Batch error: ${error.toString()}`);
    }
  }

  Logger.log('\n' + '='.repeat(50));
  Logger.log(`✅ Analysis complete!`);
  Logger.log(`📊 Students analyzed: ${totalAnalyzed}/${studentsToAnalyze.length}`);
  Logger.log(`💰 API calls used: ${totalApiCalls} (saved ${(studentsToAnalyze.length - totalApiCalls)} calls!)`);
  Logger.log(`💵 Estimated cost: $${(totalApiCalls * 0.02).toFixed(2)}`);
  Logger.log('='.repeat(50));

  return {
    success: true,
    analyzed: totalAnalyzed,
    apiCalls: totalApiCalls,
    saved: studentsToAnalyze.length - totalApiCalls,
    message: `Analyzed ${totalAnalyzed} students with ${totalApiCalls} API calls`
  };
}

/**
 * Build a prompt that analyzes multiple students at once
 */
function buildBatchAnalysisPrompt(studentCodes) {
  let prompt = `
אתה פסיכולוג חינוכי מומחה ויועץ פדגוגי בכיר במשרד החינוך הישראלי.
תפקידך לנתח ${studentCodes.length} תלמידים במקביל ולספק תובנות מעמיקות והמלצות מעשיות למורה.

# תלמידים לניתוח
`;

  // Add each student's data
  studentCodes.forEach((studentCode, index) => {
    const studentInfo = getStudentInfo(studentCode);
    const responses = getStudentResponses(studentCode);
    const formData = formatFormResponses(responses);

    prompt += `
${'='.repeat(60)}
## תלמיד #${index + 1}
- קוד תלמיד: ${studentCode}
- שם: ${studentInfo.name}
- כיתה: ${studentInfo.classId}

### תשובות השאלון
${formData}
`;
  });

  prompt += `
${'='.repeat(60)}

# הנחיות לניתוח

בצע ניתוח מקיף לכל אחד מ-${studentCodes.length} התלמידים בנפרד.

## בסיס תיאורטי
בצע את הניתוח על פי התיאוריות החינוכיות והפסיכולוגיות הבאות:

**תיאוריית האינטליגנציות המרובות (הווארד גרדנר):**
- אינטליגנציה לשונית-מילולית, לוגית-מתמטית, חזותית-מרחבית, מוזיקלית-קצבית
- אינטליגנציה גופנית-קינסתטית, בין-אישית (חברתית), תוך-אישית (רפלקטיבית), טבעית

**תיאוריות נוספות:**
- אזור ההתפתחות הקרוב (ויגוצקי)
- המוטיבציה העצמית (דצ'י וראיין) - SDT
- חשיבה גמישה (קרול דוואק) - Growth Mindset
- חינוך רגשי-חברתי (SEL)
- עקרונות משרד החינוך הישראלי

## מבנה הניתוח הנדרש

החזר JSON array עם ניתוח לכל תלמיד:

\`\`\`json
[
  {
    "studentCode": "${studentCodes[0]}",
    "student_summary": {
      "learning_style": "תיאור מפורט של סגנון הלמידה (3-4 שורות)",
      "key_notes": "תובנות מפתח על התלמיד (3-4 שורות)",
      "strengths": [
        "חוזקה ראשונה - ספציפית ומפורטת",
        "חוזקה שנייה",
        "חוזקה שלישית",
        "חוזקה רביעית",
        "חוזקה חמישית"
      ],
      "challenges": [
        "אתגר ראשון - ספציפי ומפורט",
        "אתגר שני",
        "אתגר שלישי",
        "אתגר רביעי"
      ]
    },
    "insights": [
      {
        "category": "🧠 למידה קוגניטיבית",
        "finding": "ממצא מפורט - 2-3 משפטים",
        "theory_basis": "התיאוריה החינוכית",
        "recommendations": [
          {
            "action": "פעולה ספציפית",
            "how_to": "הסבר מפורט איך ליישם",
            "rationale": "למה זה עובד",
            "time_needed": "זמן נדרש",
            "difficulty": "קל/בינוני/מאתגר",
            "expected_impact": "תוצאה צפויה"
          }
        ]
      },
      {
        "category": "💪 מוטיבציה ומעורבות",
        "finding": "...",
        "theory_basis": "Self-Determination Theory",
        "recommendations": [...]
      },
      {
        "category": "👥 למידה חברתית ושיתופית",
        "finding": "...",
        "recommendations": [...]
      },
      {
        "category": "🎯 ריכוז וקשב",
        "finding": "...",
        "recommendations": [...]
      },
      {
        "category": "😊 רגשות ותחושות",
        "finding": "...",
        "theory_basis": "Social-Emotional Learning (SEL)",
        "recommendations": [...]
      },
      {
        "category": "⏰ ניהול זמן וארגון",
        "finding": "...",
        "theory_basis": "Executive Functions Theory",
        "recommendations": [...]
      },
      {
        "category": "🌱 חשיבה גמישה וגישה לאתגרים",
        "finding": "...",
        "theory_basis": "Growth Mindset Theory",
        "recommendations": [...]
      },
      {
        "category": "🎨 יצירתיות וחשיבה יצירתית",
        "finding": "...",
        "theory_basis": "Creativity in Education",
        "recommendations": [...]
      }
    ],
    "immediate_actions": [...],
    "seating_arrangement": {...},
    "parental_communication": {...},
    "differentiation_strategies": {...},
    "long_term_development": {...}
  }${studentCodes.length > 1 ? `,
  {
    "studentCode": "${studentCodes[1]}",
    ... (same structure for student #2)
  }` : ''}
]
\`\`\`

## דרישות חשובות

1. **עברית תקנית**: כל הטקסט בעברית ברורה
2. **ספציפיות**: כל המלצה ספציפית ומעשית
3. **בסיס תיאורטי**: כל ממצא מבוסס על תיאוריה חינוכית
4. **התאמה לגיל**: התאם את ההמלצות לגיל ורמת הכיתה
5. **יישומיות**: המורה צריך לדעת מה לעשות, איך, ומתי
6. **חיוביות**: התחל תמיד מהחיובי

**חשוב**:
- החזר JSON array עם ${studentCodes.length} אובייקטים
- כל אובייקט עם studentCode מתאים
- ללא טקסט נוסף לפני או אחרי
`;

  return prompt;
}

/**
 * Parse batch results from Claude API
 */
function parseBatchResults(resultText, studentCodes) {
  try {
    // Clean markdown code blocks
    let cleanedText = resultText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Parse JSON array
    const analyses = JSON.parse(cleanedText);

    if (!Array.isArray(analyses)) {
      Logger.log('⚠️ Expected array, got object. Wrapping...');
      return [analyses];
    }

    // Convert each analysis to JSON string for writeAnalysisToSheet
    return analyses.map(analysis => JSON.stringify(analysis, null, 2));

  } catch (error) {
    Logger.log(`❌ Error parsing batch results: ${error.toString()}`);
    Logger.log(`Raw text (first 500 chars): ${resultText.substring(0, 500)}...`);

    // Return empty array on error
    return studentCodes.map(() => null);
  }
}

/**
 * ========================================
 * USAGE EXAMPLES
 * ========================================
 */

/**
 * Test batch analysis with 2 students
 */
function testBatchAnalysis() {
  const students = getUniqueStudents();

  if (students.length < 2) {
    Logger.log('❌ Need at least 2 students to test batch');
    return;
  }

  const testBatch = students.slice(0, 2);
  Logger.log(`🧪 Testing batch analysis with: ${testBatch.join(', ')}`);

  const prompt = buildBatchAnalysisPrompt(testBatch);
  const results = callClaudeAPI(prompt);

  if (results) {
    const analyses = parseBatchResults(results, testBatch);

    analyses.forEach((analysis, index) => {
      if (analysis) {
        Logger.log(`✅ Student ${testBatch[index]} analyzed successfully`);
        // Uncomment to write to sheet:
        // writeAnalysisToSheet(testBatch[index], analysis);
      }
    });
  }
}

/**
 * Quick batch - 5 students per call
 */
function quickBatch() {
  return analyzeBatchOptimized(5);
}

/**
 * Standard batch - 3 students per call (more detailed)
 */
function standardBatch() {
  return analyzeBatchOptimized(3);
}

/**
 * Small batch - 2 students per call (most detailed, higher quality)
 */
function smallBatch() {
  return analyzeBatchOptimized(2);
}

/**
 * ========================================
 * COST COMPARISON
 * ========================================
 *
 * For 29 students:
 *
 * Individual (1 student/call):
 * - API Calls: 29
 * - Cost: ~$0.58
 * - Time: ~145 seconds
 *
 * Batch 2 (2 students/call):
 * - API Calls: 15
 * - Cost: ~$0.30 (48% savings!)
 * - Time: ~75 seconds
 *
 * Batch 3 (3 students/call):
 * - API Calls: 10
 * - Cost: ~$0.20 (66% savings!)
 * - Time: ~50 seconds
 *
 * Batch 5 (5 students/call):
 * - API Calls: 6
 * - Cost: ~$0.12 (79% savings!)
 * - Time: ~30 seconds
 * - Note: Quality may decrease with too many students
 *
 * RECOMMENDATION: Use batch size 3 for best balance
 */
