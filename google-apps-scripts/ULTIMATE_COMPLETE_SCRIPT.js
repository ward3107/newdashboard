/**
 * ========================================
 * ULTIMATE ISHEBOT COMPLETE SCRIPT
 * ========================================
 *
 * ALL-IN-ONE SOLUTION:
 * ✅ OpenAI GPT-4 ISHEBOT Analyzer
 * ✅ Complete API for React Dashboard
 * ✅ Delete & Cleanup Functions
 * ✅ Batch Analysis
 * ✅ Re-analysis Functions
 * ✅ Backup & Restore
 * ✅ Search & Filter
 * ✅ Export Functions
 * ✅ Admin Controls
 * ✅ Automatic Analysis on Form Submit
 * ✅ Rate Limiting & Security
 *
 * DEPLOY THIS AND CONTROL EVERYTHING FROM YOUR DASHBOARD!
 */

// ========================================
// CONFIGURATION
// ========================================
const CONFIG = {
  // Google Spreadsheet ID - CHANGE THIS TO YOUR SPREADSHEET ID
  SPREADSHEET_ID: "1WV2CBP7JWfs9AgdykpGf7JujXkoIzAyUFyqveCo2l1g",

  // Sheet names
  FORM_RESPONSES_SHEET: "StudentResponses",
  AI_INSIGHTS_SHEET: "AI_Insights",
  STUDENTS_SHEET: "students",

  // OpenAI API - Retrieved from Script Properties (SECURE)
  get OPENAI_API_KEY() {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty("OPENAI_API_KEY");
    if (!key) {
      throw new Error("⚠️ OPENAI_API_KEY not configured in Script Properties");
    }
    return key;
  },

  // Admin token for secure operations
  get ADMIN_TOKEN() {
    const props = PropertiesService.getScriptProperties();
    return props.getProperty("ADMIN_TOKEN") || "change-me-secure-token-123";
  },

  // OpenAI Model Configuration
  OPENAI_MODEL: "gpt-4o-mini",
  MAX_TOKENS: 8000,
  TEMPERATURE: 0.7,

  // Security & Rate Limiting
  MAX_CALLS_PER_DAY: 200,
  MAX_CALLS_PER_HOUR: 50,

  // Column indexes (0-based) - ADJUST BASED ON YOUR FORM
  COLUMNS: {
    TIMESTAMP: 0,
    SCHOOL_CODE: 1,
    STUDENT_CODE: 2,
    CLASS_ID: 3,
    GENDER: 4,
    Q1_SUBJECT: 5,
    // ... add all your question column indexes
  }
};

// ========================================
// WEB APP ENTRY POINT (doGet)
// ========================================
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId || e.parameter.studentCode;
  const token = e.parameter.token;

  try {
    // Check rate limit for intensive operations
    if (["analyzeOneStudent", "analyzeAllUnanalyzed", "standardBatch"].includes(action)) {
      if (!checkRateLimit()) {
        return createJsonResponse({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later."
        });
      }
    }

    let result;

    switch(action) {
      // ===== CORE READ OPERATIONS =====
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

      // ===== ANALYSIS OPERATIONS =====
      case 'analyzeOneStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = analyzeOneStudent(studentId);  // FIXED: Capture the return value
        break;

      case 'analyzeAllUnanalyzed':
        result = analyzeAllUnanalyzedStudents();
        break;

      case 'standardBatch':
        result = standardBatch();
        break;

      case 'reanalyzeStudent':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = reanalyzeStudent(studentId);
        break;

      case 'reanalyzeMultiple':
        const codes = e.parameter.studentCodes ? e.parameter.studentCodes.split(',') : [];
        if (codes.length === 0) {
          return createJsonResponse({ error: 'Missing studentCodes' });
        }
        result = reanalyzeMultiple(codes);
        break;

      // ===== DELETE OPERATIONS =====
      case 'deleteStudentAnalysis':
        if (!studentId) {
          return createJsonResponse({ error: 'Missing studentId' });
        }
        result = deleteStudentAnalysis(studentId);
        break;

      case 'deleteMultipleAnalyses':
        const deleteCodes = e.parameter.studentCodes ? e.parameter.studentCodes.split(',') : [];
        if (deleteCodes.length === 0) {
          return createJsonResponse({ error: 'Missing studentCodes' });
        }
        result = deleteMultipleAnalyses(deleteCodes);
        break;

      case 'deleteByClass':
        const classId = e.parameter.classId;
        if (!classId) {
          return createJsonResponse({ error: 'Missing classId' });
        }
        result = deleteAnalysesByClass(classId);
        break;

      case 'deleteOldAnalyses':
        const days = parseInt(e.parameter.days) || 30;
        result = deleteOldAnalyses(days);
        break;

      case 'deleteAllAnalyses':
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponse({ error: 'Unauthorized - admin token required' });
        }
        result = deleteAllAnalyses();
        break;

      // ===== SYNC OPERATIONS =====
      case 'syncStudents':
        result = syncStudentsFromResponses();
        break;

      case 'initialSync':
        result = initialSyncAllStudents();
        break;

      // ===== UTILITY OPERATIONS =====
      case 'getAnalyzedStudents':
        result = getAnalyzedStudentsAPI();
        break;

      case 'getUnanalyzedStudents':
        result = getUnanalyzedStudentsAPI();
        break;

      case 'searchAnalyses':
        const query = e.parameter.query;
        if (!query) {
          return createJsonResponse({ error: 'Missing query' });
        }
        result = searchAnalyses(query);
        break;

      // ===== BACKUP & RESTORE =====
      case 'backupAnalyses':
        result = backupAnalyses();
        break;

      case 'listBackups':
        result = listBackups();
        break;

      case 'restoreFromBackup':
        const backupId = e.parameter.backupId;
        if (!backupId) {
          return createJsonResponse({ error: 'Missing backupId' });
        }
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponse({ error: 'Unauthorized - admin token required' });
        }
        result = restoreFromBackup(backupId);
        break;

      // ===== EXPORT OPERATIONS =====
      case 'exportAnalyses':
        const format = e.parameter.format || 'json';
        result = exportAnalyses(format);
        break;

      case 'getAuditLog':
        result = getAuditLog();
        break;

      // ===== SYSTEM OPERATIONS =====
      case 'test':
        result = testConnection();
        break;

      case 'healthCheck':
        result = healthCheck();
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: [
            'getAllStudents', 'getStudent', 'getStats',
            'analyzeOneStudent', 'analyzeAllUnanalyzed', 'standardBatch', 'reanalyzeStudent', 'reanalyzeMultiple',
            'deleteStudentAnalysis', 'deleteMultipleAnalyses', 'deleteByClass', 'deleteOldAnalyses', 'deleteAllAnalyses',
            'syncStudents', 'initialSync',
            'getAnalyzedStudents', 'getUnanalyzedStudents', 'searchAnalyses',
            'backupAnalyses', 'listBackups', 'restoreFromBackup',
            'exportAnalyses', 'getAuditLog',
            'test', 'healthCheck'
          ]
        };
    }

    return createJsonResponse(result);

  } catch (error) {
    logAuditEvent('ERROR', action, { error: error.toString() });
    return createJsonResponse({
      error: error.toString(),
      stack: error.stack
    });
  }
}

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// SECURITY & RATE LIMITING
// ========================================

function checkRateLimit() {
  const cache = CacheService.getScriptCache();
  const now = new Date();

  // Daily limit
  const dailyKey = "daily_" + now.toDateString();
  const dailyCount = parseInt(cache.get(dailyKey) || "0");

  if (dailyCount >= CONFIG.MAX_CALLS_PER_DAY) {
    Logger.log("Daily rate limit exceeded: " + dailyCount);
    return false;
  }

  // Hourly limit
  const hourlyKey = "hourly_" + now.toDateString() + "_" + now.getHours();
  const hourlyCount = parseInt(cache.get(hourlyKey) || "0");

  if (hourlyCount >= CONFIG.MAX_CALLS_PER_HOUR) {
    Logger.log("Hourly rate limit exceeded: " + hourlyCount);
    return false;
  }

  // Increment counters
  cache.put(dailyKey, String(dailyCount + 1), 86400);
  cache.put(hourlyKey, String(hourlyCount + 1), 3600);

  return true;
}

// ========================================
// CORE API FUNCTIONS
// ========================================

function getAllStudentsAPI() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const aiSheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);
  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  const analyzedStudents = new Map();

  // Get analyzed students
  if (aiSheet && aiSheet.getLastRow() > 1) {
    const data = aiSheet.getDataRange().getValues();

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentCode = String(row[0]).trim();

      // With hybrid scoring, row[7] is insightTitles (not strengths list)
      // row[27] = insightsCount, row[28] = recommendationsCount
      analyzedStudents.set(studentCode, {
        studentCode: studentCode,
        quarter: row[1],
        classId: row[2] || 'Unknown',
        date: formatDate(row[3]),
        name: row[4] || `תלמיד ${studentCode}`,
        learningStyle: row[5] || '',
        keyNotes: row[6] || '',
        strengthsCount: row[27] || 0,  // AB: insightsCount
        challengesCount: row[28] || 0, // AC: recommendationsCount
        needsAnalysis: false,
        // Add hybrid scores for student cards
        scores: {
          focus: {
            stars: row[8] || 0,
            label: row[9] || '',
            percentage: row[10] || 0
          },
          motivation: {
            stars: row[11] || 0,
            label: row[12] || '',
            percentage: row[13] || 0
          },
          collaboration: {
            stars: row[14] || 0,
            label: row[15] || '',
            percentage: row[16] || 0
          }
        }
      });
    }
  }

  // Get all students from form responses
  const allStudentCodes = getUniqueStudents();
  const students = [];

  for (let studentCode of allStudentCodes) {
    if (analyzedStudents.has(studentCode)) {
      students.push(analyzedStudents.get(studentCode));
    } else {
      const info = getStudentInfo(studentCode);
      students.push({
        studentCode: studentCode,
        quarter: 'Q1',
        classId: info.classId || 'Unknown',
        date: formatDate(new Date()),
        name: info.name || `תלמיד ${studentCode}`,
        learningStyle: '',
        keyNotes: '',
        strengthsCount: 0,
        challengesCount: 0,
        needsAnalysis: true
      });
    }
  }

  return { students: students };
}

function getStudentAPI(studentId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { error: 'No students found in AI_Insights' };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      const row = data[i];

      // Parse JSON from Column AI (index 34)
      const jsonColumn = row[34]; // Column AI = index 34
      let fullData = {};

      try {
        if (jsonColumn && typeof jsonColumn === 'string') {
          fullData = JSON.parse(jsonColumn);
        }
      } catch (e) {
        Logger.log('Failed to parse JSON for student ' + studentId);
      }

      const student = {
        // BASIC INFO
        studentCode: row[0],           // A
        quarter: row[1],               // B
        classId: row[2],               // C
        date: formatDate(row[3]),      // D
        name: row[4] || `תלמיד ${studentId}`, // E

        // SUMMARY INFO
        summary: row[5] || '',         // F
        domains: row[6] || '',         // G
        insightTitles: row[7] || '',   // H

        // PERFORMANCE SCORES - HYBRID FORMAT
        scores: {
          focus: {
            stars: row[8] || 0,        // I: 1-5 rating
            label: row[9] || '',       // J: ⭐⭐⭐⭐ טוב מאוד
            percentage: row[10] || 0   // K: 70
          },
          motivation: {
            stars: row[11] || 0,       // L
            label: row[12] || '',      // M
            percentage: row[13] || 0   // N
          },
          collaboration: {
            stars: row[14] || 0,       // O
            label: row[15] || '',      // P
            percentage: row[16] || 0   // Q
          },
          emotional_regulation: {
            stars: row[17] || 0,       // R
            label: row[18] || '',      // S
            percentage: row[19] || 0   // T
          },
          self_efficacy: {
            stars: row[20] || 0,       // U
            label: row[21] || '',      // V
            percentage: row[22] || 0   // W
          },
          time_management: {
            stars: row[23] || 0,       // X
            label: row[24] || '',      // Y
            percentage: row[25] || 0   // Z
          }
        },

        // RISK & PRIORITY
        riskFlags: row[26] ? String(row[26]).split('\n') : [], // AA
        insightsCount: row[27] || 0,                   // AB
        recommendationsCount: row[28] || 0,            // AC
        highPriorityActions: row[29] ? String(row[29]).split('\n') : [], // AD

        // SEATING INFO
        seating: {
          recommended_seat: row[30] || '',  // AE
          rationale: row[31] || '',         // AF
          avoid_near: row[32] ? String(row[32]).split(', ') : [], // AG
          prefer_near: row[33] ? String(row[33]).split(', ') : [] // AH
        },

        // FULL JSON DATA (for detailed insights and recommendations)
        insights: fullData.insights || [],
        stats: fullData.stats || {},
        fullSeating: fullData.seating || {}
      };

      return student;
    }
  }

  return { error: 'Student not found' };
}

function getStatsAPI() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      totalStudents: 0,
      analyzedStudents: 0,
      unanalyzedStudents: getUniqueStudents().length,
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
    const learningStyle = String(row[5] || '');
    const strengthsText = String(row[7] || '');

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
  }

  const analyzedCount = data.length - 1;
  const totalStudents = getUniqueStudents().length;

  return {
    totalStudents: totalStudents,
    analyzedStudents: analyzedCount,
    unanalyzedStudents: totalStudents - analyzedCount,
    byClass: byClass,
    byLearningStyle: byLearningStyle,
    averageStrengths: analyzedCount > 0 ? (totalStrengths / analyzedCount).toFixed(1) : 0,
    lastUpdated: new Date().toLocaleDateString('he-IL')
  };
}

function getAnalyzedStudentsAPI() {
  const allStudents = getAllStudentsAPI();
  const analyzed = allStudents.students.filter(s => !s.needsAnalysis);

  return {
    students: analyzed,
    count: analyzed.length
  };
}

function getUnanalyzedStudentsAPI() {
  const allStudents = getAllStudentsAPI();
  const unanalyzed = allStudents.students.filter(s => s.needsAnalysis);

  return {
    students: unanalyzed,
    count: unanalyzed.length
  };
}

// ========================================
// OPENAI ANALYSIS FUNCTIONS
// ========================================

function analyzeOneStudent(studentCode) {
  const formResponses = getStudentFormResponses(studentCode);

  if (formResponses.length === 0) {
    Logger.log(`No form responses found for student ${studentCode}`);
    return { success: false, error: 'No form responses found' };
  }

  const prompt = buildISHEBOTPrompt(studentCode, formResponses);
  const analysis = callOpenAIAPI(prompt);

  if (analysis) {
    writeAnalysisToSheet(studentCode, analysis);
    logAuditEvent('ANALYZE', 'analyzeOneStudent', { studentCode });
    return { success: true, message: `Student ${studentCode} analyzed successfully` };
  }

  return { success: false, error: 'Analysis failed' };
}

function buildISHEBOTPrompt(studentCode, responses) {
  const studentInfo = getStudentInfo(studentCode);
  const answersArray = formatAnswersForISHEBOT(responses);
  const answersJSON = JSON.stringify(answersArray, null, 2);

  const prompt = `You are ISHEBOT Analyzer — an advanced pedagogical analysis engine for K-12 education.

🎯 GOAL:
Analyze a single student's questionnaire answers and produce a comprehensive, structured JSON report.

📋 STUDENT INFO:
- Student ID: ${studentCode}
- Name: ${studentInfo.name}
- Class: ${studentInfo.classId}
- Analysis Date: ${new Date().toISOString().split('T')[0]}

📝 STUDENT ANSWERS:
${answersJSON}

📊 REQUIRED OUTPUT STRUCTURE (JSON ONLY):

{
  "student_id": "${studentCode}",
  "class_id": "${studentInfo.classId}",
  "analysis_date": "${new Date().toISOString().split('T')[0]}",
  "language": "he",
  "insights": [
    {
      "id": "insight_1",
      "domain": "cognitive | emotional | environmental | social | motivation | self-regulation",
      "title": "כותרת תמציתית של התובנה",
      "summary": "הסבר ברור של משמעות התובנה",
      "evidence": {
        "from_questions": [1, 4, 7],
        "patterns": ["דפוסים שזוהו"]
      },
      "confidence": 0.85,
      "recommendations": [
        {
          "audience": "teacher",
          "category": "instruction | motivation | behavior | environment",
          "action": "פעולה מומלצת",
          "how_to": "הסבר שלב-אחר-שלב",
          "when": "מתי ליישם",
          "duration": "משך זמן",
          "materials": ["חומרים נדרשים"],
          "follow_up_metric": "מדד למעקב",
          "priority": "low | medium | high",
          "confidence_score": {
            "value": 0.85,
            "impact": "high | medium | low",
            "effort": "high | medium | low"
          }
        }
      ]
    }
  ],
  "stats": {
    "scores": {
      "focus": 0.7,
      "motivation": 0.8,
      "collaboration": 0.6,
      "emotional_regulation": 0.75
    },
    "risk_flags": []
  },
  "seating": {
    "recommended_seat": "A1",
    "rationale": "הסבר"
  },
  "summary": "סיכום כללי"
}

✅ RULES:
- Output ONLY valid JSON
- Generate **AT LEAST 4-6 insights** covering different domains (cognitive, emotional, social, motivation, self-regulation, environmental)
- Each insight must have 3-6 recommendations
- All text in Hebrew
- Base on actual answers only
- Include confidence scores
- Provide comprehensive analysis across multiple domains

Return ONLY the JSON object.`;

  return prompt;
}

function formatAnswersForISHEBOT(responses) {
  if (!responses || responses.length === 0) return [];

  const answersArray = [];
  const response = responses[0];

  let questionNumber = 1;
  Object.keys(response).forEach(key => {
    if (key !== 'חותמת זמן' && key !== 'קוד בית הספר' &&
        key !== 'סיסמת תלמיד' && key !== 'כיתה' && key !== 'מין' && response[key]) {
      answersArray.push({
        q: questionNumber++,
        a: String(response[key])
      });
    }
  });

  return answersArray;
}

function callOpenAIAPI(prompt) {
  let apiKey;
  try {
    apiKey = CONFIG.OPENAI_API_KEY;
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    return null;
  }

  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: CONFIG.OPENAI_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an advanced pedagogical analysis engine. You produce structured JSON reports. Always output valid JSON only.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: CONFIG.MAX_TOKENS,
    temperature: CONFIG.TEMPERATURE,
    response_format: { type: 'json_object' }
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log('OpenAI API Error: ' + statusCode);
      Logger.log('Response: ' + response.getContentText());
      return null;
    }

    const result = JSON.parse(response.getContentText());

    if (result.choices && result.choices[0] && result.choices[0].message) {
      return result.choices[0].message.content;
    }

    return null;
  } catch (error) {
    Logger.log('OpenAI API Error: ' + error.toString());
    return null;
  }
}

// Helper function to convert 0-1 score to 5-star rating with Hebrew label
function scoreToStarRating(score) {
  const value = score || 0;

  let stars, label, level;

  if (value <= 0.20) {
    stars = 1;
    level = 'זקוק לתמיכה';
    label = '⭐ זקוק לתמיכה מיידית';
  } else if (value <= 0.40) {
    stars = 2;
    level = 'מתפתח';
    label = '⭐⭐ מתפתח';
  } else if (value <= 0.60) {
    stars = 3;
    level = 'מתקדם';
    label = '⭐⭐⭐ מתקדם';
  } else if (value <= 0.80) {
    stars = 4;
    level = 'טוב מאוד';
    label = '⭐⭐⭐⭐ טוב מאוד';
  } else {
    stars = 5;
    level = 'מצוין';
    label = '⭐⭐⭐⭐⭐ מצוין';
  }

  return {
    stars: stars,           // Numeric (1-5) for sorting
    level: level,           // Short Hebrew label
    label: label,           // Full display with stars
    percentage: Math.round(value * 100), // Original percentage
    raw: value.toFixed(2)   // Raw decimal value
  };
}

function writeAnalysisToSheet(studentCode, analysisText) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet) {
    Logger.log('AI_Insights sheet not found');
    return;
  }

  const studentInfo = getStudentInfo(studentCode);

  try {
    const analysis = JSON.parse(analysisText);

    // Extract organized data from JSON
    const domains = [...new Set(analysis.insights.map(i => i.domain))].join(', ');

    // Performance Scores - HYBRID SYSTEM
    const scores = analysis.stats && analysis.stats.scores ? analysis.stats.scores : {};

    // Convert each score to hybrid format (stars + label + percentage)
    const focusRating = scoreToStarRating(scores.focus);
    const motivationRating = scoreToStarRating(scores.motivation);
    const collaborationRating = scoreToStarRating(scores.collaboration);
    const emotionalRating = scoreToStarRating(scores.emotional_regulation);
    const selfEfficacyRating = scoreToStarRating(scores.self_efficacy);
    const timeManagementRating = scoreToStarRating(scores.time_management);

    // Risk Flags
    const riskFlags = analysis.stats && analysis.stats.risk_flags
      ? analysis.stats.risk_flags.join('\n')
      : '';

    // Seating Info
    const seatingPosition = analysis.seating && analysis.seating.recommended_seat
      ? analysis.seating.recommended_seat
      : '';
    const seatingRationale = analysis.seating && analysis.seating.rationale
      ? analysis.seating.rationale
      : '';
    const avoidNear = analysis.seating && analysis.seating.avoid_near
      ? analysis.seating.avoid_near.join(', ')
      : '';
    const preferNear = analysis.seating && analysis.seating.prefer_near
      ? analysis.seating.prefer_near.join(', ')
      : '';

    // Insights summary (titles and domains)
    const insightTitles = analysis.insights
      ? analysis.insights.map(i => `${i.domain}: ${i.title}`).join('\n\n')
      : '';

    // Count insights and recommendations
    const insightsCount = analysis.insights ? analysis.insights.length : 0;
    const recommendationsCount = analysis.insights
      ? analysis.insights.reduce((sum, i) => sum + (i.recommendations ? i.recommendations.length : 0), 0)
      : 0;

    // High priority recommendations summary
    const highPriorityRecs = [];
    if (analysis.insights) {
      analysis.insights.forEach(insight => {
        if (insight.recommendations) {
          insight.recommendations
            .filter(r => r.priority === 'high')
            .forEach(r => highPriorityRecs.push(`• ${r.action}`));
        }
      });
    }
    const highPriorityText = highPriorityRecs.join('\n');

    // NEW HYBRID ORGANIZED STRUCTURE
    sheet.appendRow([
      // BASIC INFO (A-E)
      studentCode,                    // A: Student Code
      'Q1',                           // B: Quarter
      studentInfo.classId,            // C: Class ID
      new Date(),                     // D: Analysis Date
      studentInfo.name,               // E: Student Name

      // SUMMARY INFO (F-H)
      analysis.summary || '',         // F: Overall Summary
      domains,                        // G: Domains Covered
      insightTitles,                  // H: Insight Titles

      // PERFORMANCE SCORES - HYBRID FORMAT (I-Z then AA-AC)
      // Each metric gets 3 columns: Stars (sortable), Label (readable), Percentage (numeric)

      // Focus (I-K)
      focusRating.stars,              // I: Focus Stars (1-5)
      focusRating.label,              // J: Focus Label (⭐⭐⭐⭐ טוב מאוד)
      focusRating.percentage,         // K: Focus % (70)

      // Motivation (L-N)
      motivationRating.stars,         // L: Motivation Stars (1-5)
      motivationRating.label,         // M: Motivation Label
      motivationRating.percentage,    // N: Motivation %

      // Collaboration (O-Q)
      collaborationRating.stars,      // O: Collaboration Stars (1-5)
      collaborationRating.label,      // P: Collaboration Label
      collaborationRating.percentage, // Q: Collaboration %

      // Emotional Regulation (R-T)
      emotionalRating.stars,          // R: Emotional Stars (1-5)
      emotionalRating.label,          // S: Emotional Label
      emotionalRating.percentage,     // T: Emotional %

      // Self-Efficacy (U-W)
      selfEfficacyRating.stars,       // U: Self-Efficacy Stars (1-5)
      selfEfficacyRating.label,       // V: Self-Efficacy Label
      selfEfficacyRating.percentage,  // W: Self-Efficacy %

      // Time Management (X-Z)
      timeManagementRating.stars,     // X: Time Mgmt Stars (1-5)
      timeManagementRating.label,     // Y: Time Mgmt Label
      timeManagementRating.percentage,// Z: Time Mgmt %

      // RISK & PRIORITY (AA-AD)
      riskFlags,                      // AA: Risk Flags
      insightsCount,                  // AB: Number of Insights
      recommendationsCount,           // AC: Number of Recommendations
      highPriorityText,               // AD: High Priority Actions

      // SEATING INFO (AE-AH)
      seatingPosition,                // AE: Recommended Seat
      seatingRationale,               // AF: Seating Rationale
      avoidNear,                      // AG: Avoid Seating Near
      preferNear,                     // AH: Prefer Seating Near

      // FULL JSON (AI) - Complete data for dashboard
      JSON.stringify(analysis, null, 2) // AI: Full JSON Data
    ]);

    Logger.log(`✅ Analysis written for student ${studentCode} with organized columns`);
  } catch (error) {
    Logger.log(`⚠️ Error parsing JSON for student ${studentCode}: ${error.toString()}`);
  }
}

// ========================================
// BATCH ANALYSIS
// ========================================

function standardBatch() {
  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const studentsToAnalyze = uniqueStudents.filter(code => !analyzedStudents.has(code));

  if (studentsToAnalyze.length === 0) {
    return {
      success: true,
      analyzed: 0,
      message: 'All students already analyzed'
    };
  }

  let totalAnalyzed = 0;
  let totalFailed = 0;

  for (let i = 0; i < studentsToAnalyze.length; i++) {
    const studentCode = studentsToAnalyze[i];

    try {
      if (!checkRateLimit()) {
        break;
      }

      analyzeOneStudent(studentCode);
      totalAnalyzed++;

      if (i < studentsToAnalyze.length - 1) {
        Utilities.sleep(3000);
      }
    } catch (error) {
      totalFailed++;
      Logger.log(`Error analyzing ${studentCode}: ${error.toString()}`);
    }
  }

  logAuditEvent('BATCH_ANALYZE', 'standardBatch', { analyzed: totalAnalyzed, failed: totalFailed });

  return {
    success: true,
    analyzed: totalAnalyzed,
    failed: totalFailed,
    total: studentsToAnalyze.length,
    message: `Analyzed ${totalAnalyzed} students successfully`
  };
}

function analyzeAllUnanalyzedStudents() {
  return standardBatch();
}

function reanalyzeStudent(studentId) {
  deleteStudentAnalysis(studentId);
  return analyzeOneStudent(studentId);
}

function reanalyzeMultiple(studentCodes) {
  let successCount = 0;
  let failCount = 0;

  for (let studentCode of studentCodes) {
    try {
      deleteStudentAnalysis(studentCode);
      const result = analyzeOneStudent(studentCode);
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      Utilities.sleep(2000);
    } catch (error) {
      failCount++;
    }
  }

  return {
    success: true,
    analyzed: successCount,
    failed: failCount,
    total: studentCodes.length
  };
}

// ========================================
// DELETE FUNCTIONS
// ========================================

function deleteStudentAnalysis(studentId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, error: 'No analyses found' };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      sheet.deleteRow(i + 1);
      logAuditEvent('DELETE', 'deleteStudentAnalysis', { studentId });
      return {
        success: true,
        message: `Analysis deleted for student ${studentId}`,
        studentId: studentId
      };
    }
  }

  return { success: false, error: `Student ${studentId} not found` };
}

function deleteMultipleAnalyses(studentCodes) {
  let deletedCount = 0;

  for (let studentCode of studentCodes) {
    const result = deleteStudentAnalysis(studentCode);
    if (result.success) {
      deletedCount++;
    }
  }

  logAuditEvent('DELETE_MULTIPLE', 'deleteMultipleAnalyses', { count: deletedCount });

  return {
    success: true,
    deleted: deletedCount,
    total: studentCodes.length,
    message: `Deleted ${deletedCount} analyses`
  };
}

function deleteAnalysesByClass(classId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, deleted: 0 };
  }

  const data = sheet.getDataRange().getValues();
  let deletedCount = 0;

  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][2] == classId) {
      sheet.deleteRow(i + 1);
      deletedCount++;
    }
  }

  logAuditEvent('DELETE_CLASS', 'deleteByClass', { classId, count: deletedCount });

  return {
    success: true,
    deleted: deletedCount,
    classId: classId,
    message: `Deleted ${deletedCount} analyses for class ${classId}`
  };
}

function deleteOldAnalyses(days = 30) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: true, deleted: 0 };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const data = sheet.getDataRange().getValues();
  let deletedCount = 0;

  for (let i = data.length - 1; i >= 1; i--) {
    try {
      const rowDate = new Date(data[i][3]);
      if (rowDate < cutoffDate) {
        sheet.deleteRow(i + 1);
        deletedCount++;
      }
    } catch (e) {
      continue;
    }
  }

  logAuditEvent('DELETE_OLD', 'deleteOldAnalyses', { days, count: deletedCount });

  return {
    success: true,
    deleted: deletedCount,
    cutoffDate: cutoffDate.toLocaleDateString('he-IL'),
    message: `Deleted ${deletedCount} analyses older than ${days} days`
  };
}

function deleteAllAnalyses() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }

  const dataRows = sheet.getLastRow() - 1;

  if (dataRows <= 0) {
    return { success: true, deleted: 0 };
  }

  // Create backup
  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const backupName = `AI_Insights_BACKUP_${timestamp}`;
  const backup = sheet.copyTo(ss);
  backup.setName(backupName);

  // Delete all data rows
  sheet.deleteRows(2, dataRows);

  logAuditEvent('DELETE_ALL', 'deleteAllAnalyses', { count: dataRows, backup: backupName });

  return {
    success: true,
    deleted: dataRows,
    backup: backupName,
    message: `Deleted ${dataRows} analyses. Backup: ${backupName}`
  };
}

// ========================================
// BACKUP & RESTORE
// ========================================

function backupAnalyses() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet) {
    return { success: false, error: 'Sheet not found' };
  }

  const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const backupName = `AI_Insights_BACKUP_${timestamp}`;
  const backup = sheet.copyTo(ss);
  backup.setName(backupName);

  logAuditEvent('BACKUP', 'backupAnalyses', { backupName });

  return {
    success: true,
    backupName: backupName,
    timestamp: timestamp,
    message: `Backup created: ${backupName}`
  };
}

function listBackups() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheets = ss.getSheets();

  const backups = sheets
    .filter(s => s.getName().startsWith('AI_Insights_BACKUP_'))
    .map(s => ({
      id: s.getSheetId(),
      name: s.getName(),
      created: s.getName().replace('AI_Insights_BACKUP_', ''),
      rowCount: s.getLastRow()
    }));

  return {
    backups: backups,
    count: backups.length
  };
}

function restoreFromBackup(backupId) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const backup = ss.getSheets().find(s => s.getSheetId() == backupId);

  if (!backup) {
    return { success: false, error: 'Backup not found' };
  }

  const currentSheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  // Delete current sheet
  if (currentSheet) {
    ss.deleteSheet(currentSheet);
  }

  // Copy backup
  const restored = backup.copyTo(ss);
  restored.setName(CONFIG.AI_INSIGHTS_SHEET);

  logAuditEvent('RESTORE', 'restoreFromBackup', { backupId, backupName: backup.getName() });

  return {
    success: true,
    message: `Restored from backup: ${backup.getName()}`
  };
}

// ========================================
// SEARCH & EXPORT
// ========================================

function searchAnalyses(query) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { results: [], count: 0 };
  }

  const data = sheet.getDataRange().getValues();
  const results = [];
  const lowerQuery = query.toLowerCase();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const searchText = row.join(' ').toLowerCase();

    if (searchText.includes(lowerQuery)) {
      results.push({
        studentCode: row[0],
        name: row[4],
        classId: row[2],
        date: formatDate(row[3]),
        summary: row[6]
      });
    }
  }

  return {
    results: results,
    count: results.length,
    query: query
  };
}

function exportAnalyses(format = 'json') {
  const allStudents = getAllStudentsAPI();

  if (format === 'csv') {
    // CSV format
    let csv = 'Student Code,Name,Class,Date,Strengths,Challenges\n';
    allStudents.students.forEach(s => {
      csv += `${s.studentCode},${s.name},${s.classId},${s.date},${s.strengthsCount},${s.challengesCount}\n`;
    });
    return { data: csv, format: 'csv' };
  }

  // JSON format (default)
  return {
    data: allStudents,
    format: 'json',
    exported: new Date().toISOString()
  };
}

function getAuditLog() {
  const cache = CacheService.getScriptCache();
  const log = cache.get('audit_log');

  if (!log) {
    return { events: [], count: 0 };
  }

  try {
    const events = JSON.parse(log);
    return {
      events: events.slice(-50), // Last 50 events
      count: events.length
    };
  } catch (e) {
    return { events: [], count: 0 };
  }
}

function logAuditEvent(type, action, details = {}) {
  const cache = CacheService.getScriptCache();
  let log = cache.get('audit_log');

  let events = [];
  if (log) {
    try {
      events = JSON.parse(log);
    } catch (e) {
      events = [];
    }
  }

  events.push({
    type: type,
    action: action,
    details: details,
    timestamp: new Date().toISOString()
  });

  // Keep only last 100 events
  if (events.length > 100) {
    events = events.slice(-100);
  }

  cache.put('audit_log', JSON.stringify(events), 21600); // 6 hours
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function getUniqueStudents() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) return [];

  const data = sheet.getDataRange().getValues();
  const uniqueCodes = new Set();

  for (let i = 1; i < data.length; i++) {
    const studentCode = String(data[i][CONFIG.COLUMNS.STUDENT_CODE]);
    if (studentCode && studentCode.trim() && studentCode.trim() !== 'undefined' && studentCode.trim() !== 'null') {
      uniqueCodes.add(studentCode.trim());
    } else {
      Logger.log(`⚠️ Row ${i + 1} has invalid student code: "${studentCode}" (column index: ${CONFIG.COLUMNS.STUDENT_CODE})`);
    }
  }

  Logger.log(`Found ${uniqueCodes.size} unique valid student codes`);
  return Array.from(uniqueCodes);
}

function getAlreadyAnalyzedStudents() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  const codes = new Set();

  if (!sheet || sheet.getLastRow() <= 1) return codes;

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    codes.add(String(data[i][0]));
  }

  return codes;
}

function getStudentInfo(studentCode) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const normalizedStudentCode = String(studentCode).trim();

  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);
  let studentName = null;

  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    const studentsData = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < studentsData.length; i++) {
      if (String(studentsData[i][0]).trim() === normalizedStudentCode) {
        studentName = studentsData[i][1];
        break;
      }
    }
  }

  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: 'Unknown', name: studentName || `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() === normalizedStudentCode) {
      return {
        classId: data[i][CONFIG.COLUMNS.CLASS_ID] || 'Unknown',
        name: studentName || `תלמיד ${studentCode}`
      };
    }
  }

  return { classId: 'Unknown', name: studentName || `תלמיד ${studentCode}` };
}

function getStudentFormResponses(studentCode) {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) return [];

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const responses = [];
  const normalizedStudentCode = String(studentCode).trim();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() === normalizedStudentCode) {
      const response = {};
      for (let j = 0; j < headers.length; j++) {
        response[headers[j]] = data[i][j];
      }
      responses.push(response);
    }
  }

  return responses;
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
// SYNC FUNCTIONS
// ========================================

function syncStudentsFromResponses() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const responsesSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

  if (!responsesSheet || !studentsSheet) {
    return { success: false, error: 'Missing sheets' };
  }

  const uniqueStudents = getUniqueStudents();
  const existingStudents = getExistingStudentCodes();

  let addedCount = 0;

  for (let studentCode of uniqueStudents) {
    if (!existingStudents.has(studentCode)) {
      const info = getStudentInfo(studentCode);

      studentsSheet.appendRow([
        studentCode,
        info.name || `תלמיד ${studentCode}`,
        info.classId || 'Unknown',
        'Active'
      ]);

      addedCount++;
    }
  }

  logAuditEvent('SYNC', 'syncStudents', { added: addedCount });

  return {
    success: true,
    added: addedCount,
    message: addedCount > 0 ? `נוספו ${addedCount} תלמידים חדשים` : 'אין תלמידים חדשים'
  };
}

function initialSyncAllStudents() {
  return syncStudentsFromResponses();
}

function getExistingStudentCodes() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

  const codes = new Set();

  if (!sheet || sheet.getLastRow() <= 1) return codes;

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    codes.add(String(data[i][0]));
  }

  return codes;
}

// ========================================
// SYSTEM FUNCTIONS
// ========================================

function testConnection() {
  return {
    success: true,
    message: 'Connection successful!',
    timestamp: new Date().toISOString(),
    config: {
      formSheet: CONFIG.FORM_RESPONSES_SHEET,
      aiSheet: CONFIG.AI_INSIGHTS_SHEET,
      model: CONFIG.OPENAI_MODEL,
      hasApiKey: !!CONFIG.OPENAI_API_KEY
    }
  };
}

function healthCheck() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  const sheets = {};

  ['FORM_RESPONSES_SHEET', 'AI_INSIGHTS_SHEET', 'STUDENTS_SHEET'].forEach(sheetName => {
    const sheet = ss.getSheetByName(CONFIG[sheetName]);
    sheets[sheetName] = {
      exists: !!sheet,
      rowCount: sheet ? sheet.getLastRow() : 0
    };
  });

  const stats = getStatsAPI();

  return {
    healthy: true,
    timestamp: new Date().toISOString(),
    sheets: sheets,
    stats: {
      totalStudents: stats.totalStudents,
      analyzedStudents: stats.analyzedStudents,
      unanalyzedStudents: stats.unanalyzedStudents
    },
    rateLimit: {
      hasKey: !!CONFIG.OPENAI_API_KEY
    }
  };
}

// ========================================
// AUTOMATIC FORM SUBMISSION TRIGGER
// ========================================

function onFormSubmit(e) {
  try {
    const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

    if (!sheet) return;

    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    const studentCode = String(sheet.getRange(lastRow, CONFIG.COLUMNS.STUDENT_CODE + 1).getValue()).trim();

    if (!studentCode) return;

    const alreadyAnalyzed = getAlreadyAnalyzedStudents();
    if (alreadyAnalyzed.has(studentCode)) {
      Logger.log(`Student ${studentCode} already analyzed`);
      return;
    }

    if (!checkRateLimit()) {
      Logger.log('Rate limit exceeded');
      return;
    }

    analyzeOneStudent(studentCode);
    Logger.log(`✅ Auto-analyzed student ${studentCode}`);

  } catch (error) {
    Logger.log('Error in onFormSubmit: ' + error.toString());
  }
}

/**
 * ========================================
 * SETUP INSTRUCTIONS
 * ========================================
 *
 * 1. UPDATE CONFIG SECTION (lines 25-66):
 *    - SPREADSHEET_ID: Your Google Sheet ID (from the URL)
 *    - Verify sheet names match your sheets
 *    - Adjust COLUMNS indexes based on your form structure
 *
 * 2. ADD TO SCRIPT PROPERTIES (Project Settings > Script Properties):
 *    - OPENAI_API_KEY: sk-your-api-key
 *    - ADMIN_TOKEN: your-secure-token-123
 *
 * 3. DEPLOY AS WEB APP:
 *    - Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy the Web App URL
 *
 * 4. SET UP AUTOMATIC TRIGGER (Optional):
 *    - Triggers > Add Trigger
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 *
 * 5. UPDATE YOUR REACT APP .env.local:
 *    VITE_GOOGLE_SCRIPT_URL=your-web-app-url
 *    VITE_ADMIN_TOKEN=your-secure-token-123
 *
 * ========================================
 */
