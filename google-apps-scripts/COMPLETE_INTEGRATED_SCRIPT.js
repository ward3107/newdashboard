/**
 * ========================================
 * COMPLETE GOOGLE APPS SCRIPT
 * ========================================
 * This includes:
 * - doGet API endpoints
 * - Google Forms integration
 * - Claude API analysis
 * - All helper functions
 *
 * SETUP:
 * 1. Update CONFIG section below
 * 2. Add your Claude API key
 * 3. Deploy as Web App
 */

// ========================================
// SECURE CONFIGURATION
// ========================================
const CONFIG = {
  // Sheet names
  FORM_RESPONSES_SHEET: 'StudentResponses',
  AI_INSIGHTS_SHEET: 'AI_Insights',
  STUDENTS_SHEET: 'students',

  // Claude API - SECURE: Retrieved from Script Properties
  // DO NOT put your API key here!
  // Instead: Go to Project Settings ⚙️ > Script Properties > Add property
  // Name: CLAUDE_API_KEY
  // Value: your-actual-api-key
  get CLAUDE_API_KEY() {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty('CLAUDE_API_KEY');

    if (!key) {
      throw new Error('⚠️ API key not configured! Add CLAUDE_API_KEY to Script Properties (Project Settings)');
    }

    return key;
  },

  CLAUDE_MODEL: 'claude-3-5-sonnet-20241022',

  // Security settings
  MAX_CALLS_PER_DAY: 100,
  MAX_CALLS_PER_HOUR: 20,

  // Column indexes for Form Responses (0-based)
  // Based on your StudentResponses sheet structure
  COLUMNS: {
    TIMESTAMP: 0,           // Column A: חותמת זמן
    SCHOOL_CODE: 1,         // Column B: קוד בית הספר
    STUDENT_CODE: 2,        // Column C: סיסמת תלמיד (THIS IS THE STUDENT ID!)
    CLASS_ID: 3,            // Column D: כיתה
    GENDER: 4,              // Column E: מין
    // Questions start from column 5 (F) through 32 (a)
    Q1_SUBJECT: 5,
    Q2_LEARNING_METHOD: 6,
    Q3_DIFFICULTY: 7,
    Q4_FOCUS: 8,
    Q5_TESTS: 9,
    Q6_NEW_TOPIC: 10,
    Q7_TASK_APPROACH: 11,
    Q8_LESSON_TYPE: 12,
    Q9_GROUP_WORK: 13,
    Q10_FRUSTRATION: 14,
    Q11_MEMORY: 15,
    Q12_DIFFICULT_TASK: 16,
    Q13_MOTIVATION: 17,
    Q14_HOMEWORK: 18,
    Q15_MULTIPLE_TASKS: 19,
    Q16_ACTIVITY: 20,
    Q17_TECHNOLOGY: 21,
    Q18_SKILL_IMPROVE: 22,
    Q19_READING: 23,
    Q20_PRESENTATION: 24,
    Q21_CHALLENGING_SUBJECT: 25,
    Q22_CRITICISM: 26,
    Q23_LONG_PROJECTS: 27,
    Q24_ENVIRONMENT: 28,
    Q25_PRIDE: 29,
    Q26_TEST_PREP: 30,
    Q27_STUDY_TIME: 31,
    Q28_DESK_ARRANGEMENT: 32
  }
};

// ========================================
// SECURITY FUNCTIONS
// ========================================

function checkRateLimit() {
  const cache = CacheService.getScriptCache();
  const now = new Date();

  // Daily limit
  const dailyKey = 'daily_' + now.toDateString();
  const dailyCount = parseInt(cache.get(dailyKey) || '0');

  if (dailyCount >= CONFIG.MAX_CALLS_PER_DAY) {
    Logger.log('Daily rate limit exceeded: ' + dailyCount);
    return false;
  }

  // Hourly limit
  const hourlyKey = 'hourly_' + now.toDateString() + '_' + now.getHours();
  const hourlyCount = parseInt(cache.get(hourlyKey) || '0');

  if (hourlyCount >= CONFIG.MAX_CALLS_PER_HOUR) {
    Logger.log('Hourly rate limit exceeded: ' + hourlyCount);
    return false;
  }

  // Increment counters
  cache.put(dailyKey, String(dailyCount + 1), 86400); // 24 hours
  cache.put(hourlyKey, String(hourlyCount + 1), 3600); // 1 hour

  return true;
}

// ========================================
// WEB APP ENTRY POINT (doGet)
// ========================================
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId;

  try {
    // Check rate limit for API-intensive actions
    if (['analyzeOneStudent', 'syncStudents', 'initialSync'].includes(action)) {
      if (!checkRateLimit()) {
        return createJsonResponse({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.'
        });
      }
    }

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

      case 'test':
        result = {
          success: true,
          message: 'Connection successful!',
          timestamp: new Date().toISOString(),
          config: {
            formSheet: CONFIG.FORM_RESPONSES_SHEET,
            hasApiKey: !!CONFIG.CLAUDE_API_KEY && CONFIG.CLAUDE_API_KEY !== 'YOUR_CLAUDE_API_KEY_HERE'
          }
        };
        break;

      default:
        result = {
          error: 'Invalid action',
          availableActions: ['getAllStudents', 'getStudent', 'getStats', 'analyzeOneStudent', 'syncStudents', 'initialSync', 'test']
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

function createJsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// API FUNCTIONS
// ========================================

function getAllStudentsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

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
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

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

function getStatsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

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

  const studentCount = data.length - 1;

  return {
    totalStudents: studentCount,
    byClass: byClass,
    byLearningStyle: byLearningStyle,
    averageStrengths: studentCount > 0 ? (totalStrengths / studentCount).toFixed(1) : 0,
    lastUpdated: new Date().toLocaleDateString('he-IL')
  };
}

// ========================================
// FORM RESPONSES FUNCTIONS
// ========================================

function getUniqueStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const uniqueCodes = new Set();

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

  // First, try to get name from students sheet
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);
  let studentName = null;

  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    const studentsData = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < studentsData.length; i++) {
      if (String(studentsData[i][0]).trim() == String(studentCode).trim()) {
        studentName = studentsData[i][1]; // Column B in students sheet (index 1) - assuming name is in column B
        break;
      }
    }
  }

  // Get class ID from form responses
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: 'Unknown', name: studentName || `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() == String(studentCode).trim()) {
      return {
        classId: data[i][CONFIG.COLUMNS.CLASS_ID] || 'Unknown',
        name: studentName || `תלמיד ${studentCode}`
      };
    }
  }

  return { classId: 'Unknown', name: studentName || `תלמיד ${studentCode}` };
}

function getStudentFormResponses(studentCode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return [];
  }

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const responses = [];

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() == String(studentCode).trim()) {
      const response = {};

      for (let j = 0; j < headers.length; j++) {
        response[headers[j]] = data[i][j];
      }

      responses.push(response);
    }
  }

  return responses;
}

// Alias for batch analysis compatibility
function getStudentResponses(studentCode) {
  return getStudentFormResponses(studentCode);
}

// ========================================
// SYNC FUNCTIONS
// ========================================

function initialSyncAllStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: `Missing ${CONFIG.FORM_RESPONSES_SHEET} or ${CONFIG.STUDENTS_SHEET} sheet`
    };
  }

  const uniqueStudents = getUniqueStudents();
  const existingStudents = getExistingStudentCodes();

  let addedCount = 0;

  for (let studentCode of uniqueStudents) {
    if (!existingStudents.has(studentCode)) {
      const info = getStudentInfo(studentCode);

      studentsSheet.appendRow([
        studentCode,                            // Column A: Student Code
        info.name || `תלמיד ${studentCode}`,   // Column B: Name (if you have it elsewhere)
        info.classId || 'Unknown',             // Column C: Class ID
        'Active'                                // Column D: Status
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
  const responsesSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

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
        studentCode,                            // Column A: Student Code
        info.name || `תלמיד ${studentCode}`,   // Column B: Name (if you have it elsewhere)
        info.classId || 'Unknown',             // Column C: Class ID
        'Active'                                // Column D: Status
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
  const sheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

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

// ========================================
// CLAUDE API ANALYSIS
// ========================================

function analyzeOneStudent(studentCode) {
  const formResponses = getStudentFormResponses(studentCode);

  if (formResponses.length === 0) {
    Logger.log(`No form responses found for student ${studentCode}`);
    return;
  }

  // Build prompt with all form responses
  const prompt = buildAnalysisPrompt(studentCode, formResponses);

  // Call Claude API
  const analysis = callClaudeAPI(prompt);

  if (analysis) {
    writeAnalysisToSheet(studentCode, analysis);
  }
}

/**
 * Build comprehensive Hebrew analysis prompt
 * Based on Israeli Ministry of Education and educational psychology theories
 */
function buildAnalysisPrompt(studentCode, responses) {
  const studentInfo = getStudentInfo(studentCode);

  // Get all form questions and answers
  const formData = formatFormResponses(responses);

  const prompt = `
אתה פסיכולוג חינוכי מומחה ויועץ פדגוגי בכיר במשרד החינוך הישראלי.
תפקידך לנתח את תשובות התלמיד ולספק תובנות מעמיקות והמלצות מעשיות למורה.

# פרטי התלמיד
- קוד תלמיד: ${studentCode}
- שם: ${studentInfo.name}
- כיתה: ${studentInfo.classId}

# תשובות השאלון
${formData}

# הנחיות לניתוח

## 1. בסיס תיאורטי
בצע את הניתוח על פי התיאוריות החינוכיות והפסיכולוגיות הבאות:

**תיאוריית האינטליגנציות המרובות (הווארד גרדנר):**
- אינטליגנציה לשונית-מילולית
- אינטליגנציה לוגית-מתמטית
- אינטליגנציה חזותית-מרחבית
- אינטליגנציה מוזיקלית-קצבית
- אינטליגנציה גופנית-קינסתטית
- אינטליגנציה בין-אישית (חברתית)
- אינטליגנציה תוך-אישית (רפלקטיבית)
- אינטליגנציה טבעית

**תיאוריית אזור ההתפתחות הקרוב (ויגוצקי):**
- מה התלמיד יכול לעשות באופן עצמאי
- מה התלמיד יכול לעשות בעזרת מבוגר/עמית
- איזה פיגום (scaffolding) נדרש

**תיאוריית המוטיבציה העצמית (דצ'י וראיין):**
- אוטונומיה (צורך בבחירה עצמאית)
- מיומנות (צורך להרגיש מסוגל)
- שייכות (צורך להשתייך לקבוצה)

**תיאוריית החשיבה הגמישה (קרול דוואק):**
- חשיבה גמישה (Growth Mindset) מול חשיבה נוקשה
- גישה לטעויות ואתגרים
- תפיסת היכולות והכישורים

**עקרונות משרד החינוך הישראלי:**
- למידה מותאמת אישית
- הוראה מתקנת והעשרה
- חינוך רגשי-חברתי (SEL)
- פיתוח מיומנויות המאה ה-21
- הוראה דיפרנציאלית

## 2. מבנה הניתוח הנדרש

ספק את הניתוח בפורמט JSON המדויק הבא (בעברית):

\`\`\`json
{
  "student_summary": {
    "learning_style": "תיאור מפורט של סגנון הלמידה (3-4 שורות) - כולל האינטליגנציות הדומינטיות לפי גרדנר",
    "key_notes": "תובנות מפתח על התלמיד (3-4 שורות) - כולל מאפייני אישיות, מוטיבציה, וגישה ללמידה",
    "strengths": [
      "חוזקה ראשונה - ספציפית ומפורטת",
      "חוזקה שנייה - ספציפית ומפורטת",
      "חוזקה שלישית - ספציפית ומפורטת",
      "חוזקה רביעית - ספציפית ומפורטת",
      "חוזקה חמישית - ספציפית ומפורטת"
    ],
    "challenges": [
      "אתגר ראשון - ספציפי ומפורט",
      "אתגר שני - ספציפי ומפורט",
      "אתגר שלישי - ספציפי ומפורט",
      "אתגר רביעי - ספציפי ומפורט"
    ]
  },
  "insights": [
    {
      "category": "🧠 למידה קוגניטיבית",
      "finding": "ממצא מפורט על דרך החשיבה והלמידה של התלמיד - 2-3 משפטים",
      "theory_basis": "התיאוריה החינוכית שעליה מבוסס הממצא",
      "recommendations": [
        {
          "action": "פעולה ספציפית ומעשית למורה",
          "how_to": "הסבר מפורט איך ליישם - כולל דוגמאות קונקרטיות",
          "rationale": "למה זה עובד - הבסיס התיאורטי",
          "time_needed": "זמן נדרש ליישום (למשל: 10 דקות בתחילת שיעור)",
          "difficulty": "קל/בינוני/מאתגר",
          "expected_impact": "התוצאה הצפויה - מה ישתפר"
        },
        {
          "action": "פעולה שנייה",
          "how_to": "הסבר מפורט",
          "rationale": "הבסיס התיאורטי",
          "time_needed": "משך זמן",
          "difficulty": "רמת קושי",
          "expected_impact": "תוצאה צפויה"
        },
        {
          "action": "פעולה שלישית",
          "how_to": "הסבר מפורט",
          "rationale": "הבסיס התיאורטי",
          "time_needed": "משך זמן",
          "difficulty": "רמת קושי",
          "expected_impact": "תוצאה צפויה"
        }
      ]
    },
    {
      "category": "💪 מוטיבציה ומעורבות",
      "finding": "ממצא על המוטיבציה של התלמיד - על פי תיאוריית SDT",
      "theory_basis": "Self-Determination Theory",
      "recommendations": [
        "שלוש המלצות מפורטות כמו למעלה..."
      ]
    },
    {
      "category": "👥 למידה חברתית ושיתופית",
      "finding": "ממצא על יכולות חברתיות ועבודת צוות",
      "theory_basis": "תיאוריה רלוונטית",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    },
    {
      "category": "🎯 ריכוז וקשב",
      "finding": "ממצא על יכולת הריכוז והתמקדות",
      "theory_basis": "תיאוריה רלוונטית",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    },
    {
      "category": "😊 רגשות ותחושות",
      "finding": "ממצא על המצב הרגשי והביטחון העצמי - על פי חינוך רגשי-חברתי",
      "theory_basis": "Social-Emotional Learning (SEL)",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    },
    {
      "category": "⏰ ניהול זמן וארגון",
      "finding": "ממצא על כישורי ארגון וניהול זמן",
      "theory_basis": "Executive Functions Theory",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    },
    {
      "category": "🌱 חשיבה גמישה וגישה לאתגרים",
      "finding": "ממצא על גישת התלמיד לקשיים וכישלונות - על פי קרול דוואק",
      "theory_basis": "Growth Mindset Theory",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    },
    {
      "category": "🎨 יצירתיות וחשיבה יצירתית",
      "finding": "ממצא על יכולות יצירתיות ופתרון בעיות",
      "theory_basis": "Creativity in Education",
      "recommendations": [
        "שלוש המלצות מפורטות..."
      ]
    }
  ],
  "immediate_actions": [
    {
      "priority": "גבוהה/בינונית/נמוכה",
      "what": "פעולה דחופה ומעשית - מה לעשות עכשיו",
      "why": "למה זה חשוב - הצדקה פסיכולוגית/פדגוגית",
      "how": "איך ליישם - צעדים קונקרטיים מפורטים",
      "when": "מתי - באיזה שלב בשיעור/שבוע",
      "time": "כמה זמן זה לוקח",
      "materials_needed": "חומרים/כלים נדרשים (אם יש)",
      "expected_outcome": "תוצאה צפויה תוך כמה זמן"
    }
  ],
  "seating_arrangement": {
    "recommended_location": "מיקום מומלץ בכיתה - עם הסבר מפורט למה",
    "partner_characteristics": "מאפיינים של שותף מומלץ לישיבה - סוג אישיות, רמה אקדמית, וכו'",
    "avoid_sitting_with": "סוגי תלמידים שכדאי להימנע מישיבה לידם - עם הסבר",
    "group_work_role": "תפקיד מומלץ בעבודה קבוצתית",
    "environmental_needs": "צרכים סביבתיים - תאורה, רעש, קרבה ללוח, וכו'"
  },
  "parental_communication": {
    "key_messages": [
      "מסר ראשון להורים - חיובי ומעצים",
      "מסר שני - תחום לשיתוף פעולה",
      "מסר שלישי - המלצה מעשית לבית"
    ],
    "collaboration_areas": [
      "תחום שיתוף פעולה בית-ספר ראשון",
      "תחום שיתוף פעולה שני"
    ]
  },
  "differentiation_strategies": {
    "for_enrichment": "אסטרטגיות העשרה - אם התלמיד מצטיין",
    "for_support": "אסטרטגיות תמיכה - אם התלמיד נתקל בקשיים",
    "assessment_methods": "שיטות הערכה מומלצות המתאימות לסגנון הלמידה"
  },
  "long_term_development": {
    "goals": [
      "מטרה ארוכת טווח ראשונה - ספציפית ומדידה",
      "מטרה שנייה",
      "מטרה שלישית"
    ],
    "milestones": "אבני דרך לבדיקת התקדמות - מתי ואיך לבדוק",
    "potential_concerns": "נקודות לתשומת לב ומעקב לאורך זמן"
  }
}
\`\`\`

## 3. דרישות חשובות

1. **עברית תקנית**: כל הטקסט בעברית ברורה ותקנית
2. **ספציפיות**: כל המלצה חייבת להיות ספציפית ומעשית, לא כללית
3. **דוגמאות קונקרטיות**: תן דוגמאות אמיתיות מהכיתה
4. **בסיס תיאורטי**: כל ממצא מבוסס על תיאוריה חינוכית מוכרת
5. **התאמה לגיל**: התאם את ההמלצות לגיל התלמיד ורמת הכיתה
6. **יישומיות**: המורה צריך לדעת בדיוק מה לעשות, איך, ומתי
7. **איזון**: שמור על איזון בין חיזוק חוזקות לטיפול באתגרים
8. **חיוביות**: התחל תמיד מהחיובי, אפילו באתגרים

## 4. הקשר ישראלי

התייחס למאפיינים הייחודיים של מערכת החינוך הישראלית:
- כיתות הטרוגניות עם טווח רחב של יכולות
- דגש על חינוך ערכי ולמידה משמעותית
- הכנה לבחינות בגרות והצלחה אקדמית
- פיתוח חוסן נפשי ומיומנויות חיים
- למידה בעברית וקשיים ייחודיים לשפה

ספק ניתוח מקיף, מעמיק ומעשי שיעזור למורה להבין את התלמיד ולתמוך בו בצורה הטובה ביותר.

**חשוב**: החזר רק את ה-JSON, ללא טקסט נוסף לפניו או אחריו.
`;

  return prompt;
}

/**
 * Format form responses for the prompt
 */
function formatFormResponses(responses) {
  if (!responses || responses.length === 0) {
    return 'אין תשובות זמינות';
  }

  let formatted = '';

  responses.forEach((response, index) => {
    if (index > 0) formatted += '\n\n---\n\n';

    formatted += `תשובה #${index + 1}:\n`;
    formatted += `תאריך: ${response['חותמת זמן'] || 'לא זמין'}\n\n`;

    // Format each question and answer
    Object.keys(response).forEach(key => {
      if (key !== 'חותמת זמן' && key !== 'קוד בית הספר' && response[key]) {
        formatted += `${key}\n`;
        formatted += `תשובה: ${response[key]}\n\n`;
      }
    });
  });

  return formatted;
}

function callClaudeAPI(prompt) {
  // Securely retrieve API key
  let apiKey;
  try {
    apiKey = CONFIG.CLAUDE_API_KEY;
  } catch (error) {
    Logger.log('ERROR: ' + error.toString());
    Logger.log('HINT: Add your API key to Script Properties (Project Settings ⚙️)');
    return null;
  }

  const url = 'https://api.anthropic.com/v1/messages';

  const payload = {
    model: CONFIG.CLAUDE_MODEL,
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: prompt
    }]
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log('API Error: ' + statusCode);
      // Don't log the full response as it might contain sensitive info
      return null;
    }

    const result = JSON.parse(response.getContentText());

    if (result.content && result.content[0]) {
      return result.content[0].text;
    }

    Logger.log('Unexpected API response format');
    return null;

  } catch (error) {
    Logger.log('Claude API Error: ' + error.toString());
    return null;
  }
}

function writeAnalysisToSheet(studentCode, analysisText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet) {
    Logger.log('AI_Insights sheet not found');
    return;
  }

  const studentInfo = getStudentInfo(studentCode);

  try {
    // Clean the analysis text - remove markdown code blocks if present
    let cleanedText = analysisText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    // Parse the JSON response
    const analysis = JSON.parse(cleanedText);

    // Format strengths and challenges as bullet points
    const strengthsText = analysis.student_summary.strengths
      .map(s => `• ${s}`)
      .join('\n');

    const challengesText = analysis.student_summary.challenges
      .map(c => `• ${c}`)
      .join('\n');

    // Format learning style with emojis
    const learningStyle = analysis.student_summary.learning_style;

    // Write to sheet
    sheet.appendRow([
      studentCode,
      'Q1',
      studentInfo.classId,
      new Date(),
      studentInfo.name,
      learningStyle,
      analysis.student_summary.key_notes,
      strengthsText,
      challengesText,
      '', '', '', '', '', '', '', '', '', // Insights columns (will be populated separately if needed)
      '', '', '', '', '', '', '', // Actions columns
      '', '', '', // Seating columns
      JSON.stringify(analysis, null, 2) // Full JSON for detailed view
    ]);

    Logger.log(`✅ Analysis written for student ${studentCode}`);
    Logger.log(`   - ${analysis.student_summary.strengths.length} strengths`);
    Logger.log(`   - ${analysis.student_summary.challenges.length} challenges`);
    Logger.log(`   - ${analysis.insights.length} insights`);

  } catch (error) {
    Logger.log(`⚠️ Error parsing JSON for student ${studentCode}: ${error.toString()}`);
    Logger.log(`Raw text: ${analysisText.substring(0, 500)}...`);

    // Fallback: write raw text
    sheet.appendRow([
      studentCode,
      'Q1',
      studentInfo.classId,
      new Date(),
      studentInfo.name,
      'שגיאה בעיבוד',
      'לא ניתן לעבד את התוצאות',
      '',
      '',
      '', '', '', '', '', '', '', '', '',
      '', '', '', '', '', '', '',
      '', '', '',
      analysisText
    ]);
  }
}

function extractSection(text, keyword) {
  const lines = text.split('\n');
  const startIndex = lines.findIndex(line =>
    line.toLowerCase().includes(keyword.toLowerCase())
  );

  if (startIndex === -1) return '';

  let section = '';
  for (let i = startIndex + 1; i < lines.length; i++) {
    if (lines[i].match(/^\d+\./) || lines[i].match(/^[A-Z]/)) break;
    section += lines[i] + '\n';
  }

  return section.trim();
}

// ========================================
// HELPER FUNCTIONS
// ========================================

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
// DEBUG FUNCTIONS
// ========================================

function debugFormStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log('📚 AVAILABLE SHEETS:');
  Logger.log('================================');
  ss.getSheets().forEach((sheet, index) => {
    Logger.log(`${index + 1}. "${sheet.getName()}" - ${sheet.getLastRow()} rows`);
  });

  Logger.log('\n');

  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!formSheet) {
    Logger.log(`❌ Sheet "${CONFIG.FORM_RESPONSES_SHEET}" not found!`);
    return;
  }

  const data = formSheet.getDataRange().getValues();

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
    Logger.log('\n📝 SAMPLE DATA:');
    Logger.log('================================');
    for (let i = 0; i < data[1].length; i++) {
      Logger.log(`Column ${String.fromCharCode(65 + i)} [${i}]: ${data[1][i]}`);
    }
  }

  Logger.log('\n✅ Update CONFIG.COLUMNS with correct indexes');
}

function testConnection() {
  Logger.log('🧪 Testing Connection...\n');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet) {
    Logger.log('❌ Sheet not found: ' + CONFIG.FORM_RESPONSES_SHEET);
    return;
  }

  Logger.log('✅ Sheet found: ' + CONFIG.FORM_RESPONSES_SHEET);
  Logger.log(`✅ Found ${sheet.getLastRow() - 1} responses`);

  const students = getUniqueStudents();
  Logger.log(`✅ Found ${students.length} unique students`);
  Logger.log('   Students: ' + students.join(', '));

  if (students.length > 0) {
    const info = getStudentInfo(students[0]);
    Logger.log(`✅ Student info: ${info.name} (${info.classId})`);

    const responses = getStudentFormResponses(students[0]);
    Logger.log(`✅ Found ${responses.length} responses for ${students[0]}`);
  }

  Logger.log('\n🎉 Connection test complete!');
}

/**
 * ========================================
 * SETUP INSTRUCTIONS:
 * ========================================
 *
 * 1. Update CONFIG section (lines 13-30):
 *    - FORM_RESPONSES_SHEET: Your form responses sheet name
 *    - CLAUDE_API_KEY: Your Claude API key
 *    - COLUMNS: Adjust based on debugFormStructure() output
 *
 * 2. Run debugFormStructure() to see your sheet structure
 *
 * 3. Run testConnection() to verify everything works
 *
 * 4. Deploy as Web App:
 *    - Click Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy the Web App URL
 *
 * 5. Update your React dashboard with the Web App URL
 */

// ========================================
// BATCH ANALYSIS - COST OPTIMIZATION
// ========================================

/**
 * Analyze multiple students in one API call
 * Saves 66-79% on API costs!
 * @param {number} batchSize - Number of students per API call (recommended: 3-5)
 */
function analyzeBatchOptimized(batchSize = 3) {
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
- תיאוריית האינטליגנציות המרובות (גרדנר)
- אזור ההתפתחות הקרוב (ויגוצקי)
- המוטיבציה העצמית (דצ'י וראיין) - SDT
- חשיבה גמישה (דוואק) - Growth Mindset
- חינוך רגשי-חברתי (SEL)
- עקרונות משרד החינוך הישראלי

## מבנה הניתוח

החזר JSON array עם ניתוח מפורט לכל תלמיד (8 תובנות, 3+ המלצות לכל תובנה):

\`\`\`json
[
  {
    "studentCode": "${studentCodes[0]}",
    "student_summary": {
      "learning_style": "תיאור מפורט של סגנון הלמידה (3-4 שורות)",
      "key_notes": "תובנות מפתח על התלמיד (3-4 שורות)",
      "strengths": ["חוזקה 1", "חוזקה 2", "חוזקה 3", "חוזקה 4", "חוזקה 5"],
      "challenges": ["אתגר 1", "אתגר 2", "אתגר 3", "אתגר 4"]
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
          },
          {...}, {...}
        ]
      },
      {"category": "💪 מוטיבציה ומעורבות", ...},
      {"category": "👥 למידה חברתית ושיתופית", ...},
      {"category": "🎯 ריכוז וקשב", ...},
      {"category": "😊 רגשות ותחושות", ...},
      {"category": "⏰ ניהול זמן וארגון", ...},
      {"category": "🌱 חשיבה גמישה וגישה לאתגרים", ...},
      {"category": "🎨 יצירתיות וחשיבה יצירתית", ...}
    ],
    "immediate_actions": [...],
    "seating_arrangement": {...},
    "parental_communication": {...},
    "differentiation_strategies": {...},
    "long_term_development": {...}
  }
]
\`\`\`

## דרישות
1. **עברית תקנית**: כל הטקסט בעברית ברורה
2. **ספציפיות**: כל המלצה ספציפית ומעשית
3. **בסיס תיאורטי**: כל ממצא מבוסס על תיאוריה חינוכית
4. **יישומיות**: המורה צריך לדעת מה לעשות, איך, ומתי

**חשוב**: החזר JSON array עם ${studentCodes.length} אובייקטים, ללא טקסט נוסף.
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
        writeAnalysisToSheet(testBatch[index], analysis);
      }
    });

    Logger.log('\n✅ Test complete! Check AI_Insights sheet.');
  }
}

/**
 * Quick functions for common batch sizes
 */
function standardBatch() {
  Logger.log('🎯 Running STANDARD batch (3 students per call)');
  Logger.log('💰 This will save 66% on API costs!\n');
  return analyzeBatchOptimized(3);  // Best balance
}

function quickBatch() {
  Logger.log('⚡ Running QUICK batch (5 students per call)');
  Logger.log('💰 This will save 79% on API costs!\n');
  return analyzeBatchOptimized(5);  // Maximum savings
}

function smallBatch() {
  Logger.log('🔍 Running SMALL batch (2 students per call)');
  Logger.log('💰 This will save 48% on API costs!\n');
  return analyzeBatchOptimized(2);  // Maximum quality
}
