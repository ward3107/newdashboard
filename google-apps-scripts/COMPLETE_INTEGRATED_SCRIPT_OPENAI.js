/**
 * ========================================
 * COMPLETE GOOGLE APPS SCRIPT - OPENAI VERSION
 * ========================================
 * This includes:
 * - doGet API endpoints
 * - Google Forms integration
 * - OpenAI GPT-4 API analysis (ISHEBOT Analyzer)
 * - All helper functions
 *
 * SETUP:
 * 1. Update CONFIG section below
 * 2. Add your OpenAI API key to Script Properties
 * 3. Deploy as Web App
 */

// ========================================
// SECURE CONFIGURATION
// ========================================
const CONFIG = {
  // Sheet names
  FORM_RESPONSES_SHEET: "StudentResponses",
  AI_INSIGHTS_SHEET: "AI_Insights",
  STUDENTS_SHEET: "students",

  // OpenAI API - SECURE: Retrieved from Script Properties
  // DO NOT put your API key here!
  // Instead: Go to Project Settings ⚙️ > Script Properties > Add property
  // Name: OPENAI_API_KEY
  get OPENAI_API_KEY() {
    const props = PropertiesService.getScriptProperties();
    const key = props.getProperty("OPENAI_API_KEY");

    if (!key) {
      throw new Error(
        "⚠️ API key not configured! Add OPENAI_API_KEY to Script Properties (Project Settings)",
      );
    }

    return key;
  },

  // Admin token for dashboard actions (set in Script Properties)
  // Name: ADMIN_TOKEN
  get ADMIN_TOKEN() {
    const props = PropertiesService.getScriptProperties();
    const token = props.getProperty("ADMIN_TOKEN");

    if (!token) {
      throw new Error(
        "⚠️ ADMIN_TOKEN missing. Add it in Project Settings → Script Properties.",
      );
    }

    return token;
  },

  // OpenAI Model Configuration
  OPENAI_MODEL: "gpt-4o-mini", // Cheaper and faster model
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,

  // Security settings
  MAX_CALLS_PER_DAY: 200,   // Increased for batch analysis
  MAX_CALLS_PER_HOUR: 50,   // Increased to allow analyzing all students at once

  // Column indexes for Form Responses (0-based)
  // Based on your StudentResponses sheet structure
  COLUMNS: {
    TIMESTAMP: 0, // Column A: חותמת זמן
    SCHOOL_CODE: 1, // Column B: קוד בית הספר
    STUDENT_CODE: 2, // Column C: סיסמת תלמיד (THIS IS THE STUDENT ID!)
    CLASS_ID: 3, // Column D: כיתה
    GENDER: 4, // Column E: מין
    // Questions start from column 5 (F) through 32 (AG)
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
    Q28_DESK_ARRANGEMENT: 32,
  },
};

// ========================================
// SECURITY FUNCTIONS
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
  cache.put(dailyKey, String(dailyCount + 1), 86400); // 24 hours
  cache.put(hourlyKey, String(hourlyCount + 1), 3600); // 1 hour

  return true;
}

// ========================================
// WEB APP ENTRY POINT (doGet)
// ========================================
function doGet(e) {
  const action = e.parameter.action;
  const studentId = e.parameter.studentId || e.parameter.studentCode;

  try {
    // Check rate limit for API-intensive actions
    if (["analyzeOneStudent", "syncStudents", "initialSync"].includes(action)) {
      if (!checkRateLimit()) {
        return createJsonResponse({
          error: "Rate limit exceeded",
          message: "Too many requests. Please try again later.",
        });
      }
    }

    let result;

    switch (action) {
      case "getAllStudents":
        result = getAllStudentsAPI();
        break;

      case "getStudent":
        if (!studentId) {
          return createJsonResponse({
            error: "Missing studentId or studentCode",
          });
        }
        result = getStudentAPI(studentId);
        break;

      case "getStats":
        result = getStatsAPI();
        break;

      case "analyzeOneStudent":
        if (!studentId) {
          return createJsonResponse({
            error: "Missing studentId or studentCode",
          });
        }
        analyzeOneStudent(studentId);
        result = { success: true, message: "Student analyzed successfully" };
        break;

      case "syncStudents":
        result = syncStudentsFromResponses();
        break;

      case "initialSync":
        result = initialSyncAllStudents();
        break;

      case "standardBatch":
        result = standardBatch();
        break;

      // ===== SECURE ADMIN ENDPOINTS =====
      // These require ADMIN_TOKEN for access

      case "deleteAllAnalysed": {
        const token = e.parameter.token;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        result = deleteAllAnalysedStudents();
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "listStudents": {
        const token = e.parameter.token;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        result = getAllStudentsAPI();
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "statsSecure": {
        const token = e.parameter.token;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        result = getStatsAPI();
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "syncStudentsSecure": {
        const token = e.parameter.token;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        result = syncStudentsFromResponses();
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "initialSyncSecure": {
        const token = e.parameter.token;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        result = initialSyncAllStudents();
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "analyzeOneStudentSecure": {
        const token = e.parameter.token;
        const studentIdSecure = e.parameter.studentId || e.parameter.studentCode;
        if (!token || token !== CONFIG.ADMIN_TOKEN) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Unauthorized' }, e.parameter.callback);
        }
        if (!studentIdSecure) {
          return createJsonResponseWithOptionalJsonp_({ error: 'Missing studentId' }, e.parameter.callback);
        }
        analyzeOneStudent(studentIdSecure);
        result = { success: true, message: `Analysis queued for ${studentIdSecure}` };
        return createJsonResponseWithOptionalJsonp_(result, e.parameter.callback);
      }

      case "test":
        result = {
          success: true,
          message: "Connection successful!",
          timestamp: new Date().toISOString(),
          config: {
            formSheet: CONFIG.FORM_RESPONSES_SHEET,
            apiProvider: "OpenAI",
            model: CONFIG.OPENAI_MODEL,
            hasApiKey: !!CONFIG.OPENAI_API_KEY,
          },
        };
        break;

      default:
        result = {
          error: "Invalid action",
          availableActions: [
            "getAllStudents",
            "getStudent",
            "getStats",
            "analyzeOneStudent",
            "syncStudents",
            "initialSync",
            "standardBatch",
            "test",
            "deleteAllAnalysed",
            "listStudents",
            "statsSecure",
            "syncStudentsSecure",
            "initialSyncSecure",
            "analyzeOneStudentSecure",
          ],
        };
    }

    return createJsonResponse(result);
  } catch (error) {
    return createJsonResponse({
      error: error.toString(),
      stack: error.stack,
    });
  }
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Create JSON response with optional JSONP support
 * Supports both JSON and JSONP for cross-origin requests
 */
function createJsonResponseWithOptionalJsonp_(obj, callback) {
  const body = JSON.stringify(obj);
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${body});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

// ========================================
// API FUNCTIONS
// ========================================

function getAllStudentsAPI() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aiSheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);
  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  // Get all students from AI_Insights (analyzed students)
  const analyzedStudents = new Map();

  if (aiSheet && aiSheet.getLastRow() > 1) {
    const data = aiSheet.getDataRange().getValues();
    Logger.log(`📊 AI_Insights has ${data.length - 1} data rows`);

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const studentCode = String(row[0]).trim();
      const quarter = row[1];
      const classId = row[2];
      const date = row[3];
      const name = row[4];
      const learningStyle = row[5];
      const keyNotes = row[6];
      const strengthsText = row[7] || "";
      const challengesText = row[8] || "";

      const strengths = strengthsText.split("\n").filter((s) => s.trim()).length;
      const challenges = challengesText
        .split("\n")
        .filter((s) => s.trim()).length;

      analyzedStudents.set(studentCode, {
        studentCode: studentCode,
        quarter: quarter,
        classId: classId || "Unknown",
        date: formatDate(date),
        name: (name && String(name).trim() !== "701" && String(name).trim().length > 0)
          ? String(name).trim()
          : String(studentCode).trim(),
        learningStyle: learningStyle || "",
        keyNotes: keyNotes || "",
        strengthsCount: strengths,
        challengesCount: challenges,
        needsAnalysis: false, // Already analyzed
      });
    }
  }

  // Get all students from form responses
  const allStudentCodes = getUniqueStudents();
  const students = [];

  for (let studentCode of allStudentCodes) {
    if (analyzedStudents.has(studentCode)) {
      // Student is analyzed - add from analyzedStudents
      students.push(analyzedStudents.get(studentCode));
    } else {
      // Student NOT analyzed yet - get info from form responses
      const info = getStudentInfo(studentCode);
      students.push({
        studentCode: studentCode,
        quarter: "Q1",
        classId: info.classId || "Unknown",
        date: formatDate(new Date()),
        name: info.name || `תלמיד ${studentCode}`,
        learningStyle: "",
        keyNotes: "",
        strengthsCount: 0,
        challengesCount: 0,
        needsAnalysis: true, // Needs analysis!
      });
    }
  }

  return { students: students };
}

function getStudentAPI(studentId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { error: "No students found in AI_Insights" };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == studentId) {
      const row = data[i];

      const jsonColumn = row[row.length - 1];
      let fullData = {};

      try {
        if (jsonColumn && typeof jsonColumn === "string") {
          fullData = JSON.parse(jsonColumn);
        }
      } catch (e) {
        Logger.log("Failed to parse JSON for student " + studentId);
      }

      const student = {
        studentCode: row[0],
        quarter: row[1],
        classId: row[2],
        date: formatDate(row[3]),
        name: row[4] || `תלמיד ${studentId}`,

        // ISHEBOT format
        insights: fullData.insights || [],
        stats: fullData.stats || {},
        seating: fullData.seating || {},
        summary: fullData.summary || "",

        // Legacy format support
        student_summary: {
          learning_style: row[5] || "",
          key_notes: row[6] || "",
          strengths: (row[7] || "").split("\n").filter((s) => s.trim()),
          challenges: (row[8] || "").split("\n").filter((s) => s.trim()),
        },
      };

      return student;
    }
  }

  return { error: "Student not found" };
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
      lastUpdated: new Date().toLocaleDateString("he-IL"),
    };
  }

  const data = sheet.getDataRange().getValues();
  const byClass = {};
  const byLearningStyle = {};
  let totalStrengths = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const classId = row[2] || "Unknown";
    const learningStyle = row[5] || "";
    const strengthsText = row[7] || "";

    byClass[classId] = (byClass[classId] || 0) + 1;

    const styles = learningStyle
      .split("\n")
      .map((s) =>
        s
          .replace(/^[•\s]+/, "")
          .replace(/[\u{1F300}-\u{1F9FF}]/gu, "")
          .trim(),
      )
      .filter((s) => s);

    styles.forEach((style) => {
      const firstWord = style.split(" ")[0];
      if (firstWord) {
        byLearningStyle[firstWord] = (byLearningStyle[firstWord] || 0) + 1;
      }
    });

    const strengthCount = strengthsText
      .split("\n")
      .filter((s) => s.trim()).length;
    totalStrengths += strengthCount;
  }

  const studentCount = data.length - 1;

  return {
    totalStudents: studentCount,
    byClass: byClass,
    byLearningStyle: byLearningStyle,
    averageStrengths:
      studentCount > 0 ? (totalStrengths / studentCount).toFixed(1) : 0,
    lastUpdated: new Date().toLocaleDateString("he-IL"),
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

  // IMPORTANT: Use EXACT string matching to avoid teacher/student code confusion
  // Example: Student "70101" should NOT match teacher "701"
  const normalizedStudentCode = String(studentCode).trim();

  // First, try to get name from students sheet
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);
  let studentName = null;

  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    const studentsData = studentsSheet.getDataRange().getValues();
    for (let i = 1; i < studentsData.length; i++) {
      // EXACT match using === (no type coercion)
      if (String(studentsData[i][0]).trim() === normalizedStudentCode) {
        studentName = studentsData[i][1];
        break;
      }
    }
  }

  // Get class ID from form responses
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet || sheet.getLastRow() <= 1) {
    return { classId: "Unknown", name: studentName || `תלמיד ${studentCode}` };
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    // EXACT match using === (no type coercion)
    if (String(data[i][CONFIG.COLUMNS.STUDENT_CODE]).trim() === normalizedStudentCode) {
      return {
        classId: data[i][CONFIG.COLUMNS.CLASS_ID] || "Unknown",
        name: studentName || `תלמיד ${studentCode}`,
      };
    }
  }

  return { classId: "Unknown", name: studentName || `תלמיד ${studentCode}` };
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

  // EXACT matching to avoid teacher/student code confusion
  const normalizedStudentCode = String(studentCode).trim();

  for (let i = 1; i < data.length; i++) {
    // EXACT match using === (no type coercion)
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
      error: `Missing ${CONFIG.FORM_RESPONSES_SHEET} or ${CONFIG.STUDENTS_SHEET} sheet`,
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
        info.name || `תלמיד ${studentCode}`,
        info.classId || "Unknown",
        "Active",
      ]);

      addedCount++;
    }
  }

  return {
    success: true,
    added: addedCount,
    total: uniqueStudents.length,
    message: `נוספו ${addedCount} תלמידים. סה"כ ${uniqueStudents.length} תלמידים במערכת.`,
  };
}

function syncStudentsFromResponses() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responsesSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);
  const studentsSheet = ss.getSheetByName(CONFIG.STUDENTS_SHEET);

  if (!responsesSheet || !studentsSheet) {
    return {
      success: false,
      error: "Missing sheets",
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
        info.name || `תלמיד ${studentCode}`,
        info.classId || "Unknown",
        "Active",
      ]);

      addedCount++;
    }
  }

  return {
    success: true,
    added: addedCount,
    message:
      addedCount > 0
        ? `נוספו ${addedCount} תלמידים חדשים`
        : "אין תלמידים חדשים",
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

function getAlreadyAnalyzedStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  const codes = new Set();

  if (!sheet || sheet.getLastRow() <= 1) {
    return codes;
  }

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    codes.add(String(data[i][0])); // Column A has student code
  }

  return codes;
}

// ========================================
// OPENAI API ANALYSIS (ISHEBOT Analyzer)
// ========================================

function analyzeOneStudent(studentCode) {
  const formResponses = getStudentFormResponses(studentCode);

  if (formResponses.length === 0) {
    Logger.log(`No form responses found for student ${studentCode}`);
    return;
  }

  // Build ISHEBOT prompt with all form responses
  const prompt = buildISHEBOTPrompt(studentCode, formResponses);

  // Call OpenAI API
  const analysis = callOpenAIAPI(prompt);

  if (analysis) {
    writeAnalysisToSheet(studentCode, analysis);
  }
}

/**
 * Build ISHEBOT Analyzer prompt for OpenAI
 * Structured JSON output with evidence-based insights
 */
function buildISHEBOTPrompt(studentCode, responses) {
  const studentInfo = getStudentInfo(studentCode);

  // Format answers for prompt
  const answersArray = formatAnswersForISHEBOT(responses);
  const answersJSON = JSON.stringify(answersArray, null, 2);

  const prompt = `You are ISHEBOT Analyzer — an advanced pedagogical analysis engine for K-12 education.

🎯 GOAL:
Analyze a single student's questionnaire answers and produce a comprehensive, structured JSON report.
The analysis must be based *only* on the student's answers and reflect patterns, strengths, difficulties, motivations, emotional and cognitive factors.

📋 STUDENT INFO:
- Student ID: ${studentCode}
- Name: ${studentInfo.name}
- Class: ${studentInfo.classId}
- Analysis Date: ${new Date().toISOString().split("T")[0]}

📝 STUDENT ANSWERS:
${answersJSON}

📊 REQUIRED OUTPUT STRUCTURE (JSON ONLY):

{
  "student_id": "${studentCode}",
  "class_id": "${studentInfo.classId}",
  "analysis_date": "${new Date().toISOString().split("T")[0]}",
  "language": "he",
  "answers_used": ${answersJSON},
  "insights": [
    {
      "id": "insight_1",
      "domain": "cognitive | emotional | environmental | social | motivation | self-regulation",
      "title": "כותרת תמציתית של התובנה",
      "summary": "הסבר ברור של משמעות התובנה לגבי למידת התלמיד או התנהגותו.",
      "evidence": {
        "from_questions": [1, 4, 7],
        "patterns": ["מילות מפתח קצרות המתארות דפוסי תשובות או מגמות"]
      },
      "confidence": 0.85,
      "recommendations": [
        {
          "audience": "teacher",
          "category": "instruction | motivation | behavior | environment | social | executive-skills",
          "action": "תיאור הפעולה המומלצת במשפט אחד.",
          "how_to": "הסבר שלב-אחר-שלב כיצד המורה צריך ליישם פעולה זו בכיתה.",
          "when": "מתי או במהלך איזו פעילות יש להחיל פעולה זו.",
          "duration": "משך זמן צפוי או תדירות.",
          "materials": ["רשימה אופציונלית של חומרים או כלים נדרשים"],
          "follow_up_metric": "כיצד למדוד שיפור או הצלחה.",
          "priority": "low | medium | high",
          "rationale": "הסבר קצר מדוע המלצה זו מטפלת בתובנה ובראיות."
        }
        // MUST BE 3–6 recommendations per insight
      ]
    }
    // MUST BE 4–6 insights total
  ],
  "stats": {
    "scores": {
      "focus": 0.7,
      "motivation": 0.8,
      "collaboration": 0.6,
      "emotional_regulation": 0.75
    },
    "risk_flags": ["רשימה אופציונלית של תחומי סיכון עיקריים"],
    "comparison_to_class": {
      "focus_percentile": 65,
      "motivation_percentile": 78
    }
  },
  "seating": {
    "recommended_seat": "A1/B3/וכו׳",
    "rationale": "הסבר קצר מדוע מיקום זה הוא הטוב ביותר עבור תלמיד זה."
  },
  "summary": "2–3 משפטים המסכמים את הפרופיל הכללי וההמלצות העיקריות."
}

✅ RULES:
- Output must be **valid JSON only** (no extra text, no explanations outside the JSON).
- Each insight MUST be directly supported by the student's answers.
- Each insight MUST include 3–6 **teacher-ready recommendations** that are specific, actionable, and measurable.
- Keep all texts concise, concrete, and free of repetition.
- Output language is Hebrew (language field = "he").
- Do not include visuals, images, or base64 data — only text and structured fields.
- Prioritize pedagogy, SEL, and classroom applicability over generic advice.
- Base scores (0.0-1.0) on actual answer patterns, not assumptions.
- Evidence must cite specific question numbers from the answers_used array.

**IMPORTANT**: Return ONLY the JSON object, with no additional text before or after.`;

  return prompt;
}

/**
 * Format student responses for ISHEBOT prompt
 */
function formatAnswersForISHEBOT(responses) {
  if (!responses || responses.length === 0) {
    return [];
  }

  const answersArray = [];
  const response = responses[0]; // Take the most recent response

  let questionNumber = 1;
  Object.keys(response).forEach((key) => {
    // Skip metadata columns
    if (
      key !== "חותמת זמן" &&
      key !== "קוד בית הספר" &&
      key !== "סיסמת תלמיד" &&
      key !== "כיתה" &&
      key !== "מין" &&
      response[key]
    ) {
      answersArray.push({
        q: questionNumber++,
        a: String(response[key]),
      });
    }
  });

  return answersArray;
}

/**
 * Call OpenAI API (GPT-4)
 */
function callOpenAIAPI(prompt) {
  // Securely retrieve API key
  let apiKey;
  try {
    apiKey = CONFIG.OPENAI_API_KEY;
  } catch (error) {
    Logger.log("ERROR: " + error.toString());
    Logger.log(
      "HINT: Add your API key to Script Properties (Project Settings ⚙️)",
    );
    return null;
  }

  const url = "https://api.openai.com/v1/chat/completions";

  const payload = {
    model: CONFIG.OPENAI_MODEL,
    messages: [
      {
        role: "system",
        content:
          "You are an advanced pedagogical analysis engine for K-12 education. You produce structured JSON reports based on student questionnaire data. Always output valid JSON only.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    max_tokens: CONFIG.MAX_TOKENS,
    temperature: CONFIG.TEMPERATURE,
    response_format: { type: "json_object" }, // Ensures JSON output
  };

  const options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "Bearer " + apiKey,
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log("OpenAI API Error: " + statusCode);
      Logger.log("Response: " + response.getContentText());
      return null;
    }

    const result = JSON.parse(response.getContentText());

    if (result.choices && result.choices[0] && result.choices[0].message) {
      return result.choices[0].message.content;
    }

    Logger.log("Unexpected API response format");
    return null;
  } catch (error) {
    Logger.log("OpenAI API Error: " + error.toString());
    return null;
  }
}

/**
 * Write ISHEBOT analysis to sheet
 */
function writeAnalysisToSheet(studentCode, analysisText) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!sheet) {
    Logger.log("AI_Insights sheet not found");
    return;
  }

  const studentInfo = getStudentInfo(studentCode);

  try {
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);

    // Extract summary information for quick view
    const insightsSummary = analysis.insights.map((i) => i.title).join(" | ");
    const domains = [...new Set(analysis.insights.map((i) => i.domain))].join(
      ", ",
    );

    // Format scores
    const scoresText =
      analysis.stats && analysis.stats.scores
        ? `ריכוז: ${(analysis.stats.scores.focus * 100).toFixed(0)}%, מוטיבציה: ${(analysis.stats.scores.motivation * 100).toFixed(0)}%, שיתוף פעולה: ${(analysis.stats.scores.collaboration * 100).toFixed(0)}%`
        : "";

    // Format seating info
    const seatingInfo = analysis.seating
      ? `${analysis.seating.recommended_seat} - ${analysis.seating.rationale}`
      : "";

    // Write to sheet (simplified structure for ISHEBOT)
    sheet.appendRow([
      studentCode, // A: Student Code
      "Q1", // B: Quarter
      studentInfo.classId, // C: Class ID
      new Date(), // D: Analysis Date
      studentInfo.name, // E: Student Name
      domains, // F: Domains analyzed
      analysis.summary || "", // G: Summary
      scoresText, // H: Scores
      seatingInfo, // I: Seating
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "", // J-R: Reserved for future use
      "",
      "",
      "",
      "",
      "",
      "",
      "", // S-Y: Reserved
      "",
      "",
      "", // Z-AB: Reserved
      JSON.stringify(analysis, null, 2), // AC: Full JSON for detailed view
    ]);

    Logger.log(`✅ ISHEBOT Analysis written for student ${studentCode}`);
    Logger.log(`   - ${analysis.insights.length} insights generated`);
    Logger.log(`   - Summary: ${analysis.summary}`);
  } catch (error) {
    Logger.log(
      `⚠️ Error parsing JSON for student ${studentCode}: ${error.toString()}`,
    );
    Logger.log(`Raw text: ${analysisText.substring(0, 500)}...`);

    // Fallback: write raw text
    sheet.appendRow([
      studentCode,
      "Q1",
      studentInfo.classId,
      new Date(),
      studentInfo.name,
      "שגיאה בעיבוד",
      "לא ניתן לעבד את התוצאות",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      analysisText,
    ]);
  }
}

// ========================================
// HELPER FUNCTIONS
// ========================================

function formatDate(date) {
  if (!date) return new Date().toLocaleDateString("he-IL");

  if (date instanceof Date) {
    return date.toLocaleDateString("he-IL");
  }

  try {
    return new Date(date).toLocaleDateString("he-IL");
  } catch (e) {
    return date.toString();
  }
}

// ========================================
// DEBUG FUNCTIONS
// ========================================

function debugFormStructure() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  Logger.log("📚 AVAILABLE SHEETS:");
  Logger.log("================================");
  ss.getSheets().forEach((sheet, index) => {
    Logger.log(
      `${index + 1}. "${sheet.getName()}" - ${sheet.getLastRow()} rows`,
    );
  });

  Logger.log("\n");

  const formSheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!formSheet) {
    Logger.log(`❌ Sheet "${CONFIG.FORM_RESPONSES_SHEET}" not found!`);
    return;
  }

  const data = formSheet.getDataRange().getValues();

  if (data.length === 0) {
    Logger.log("❌ Sheet is empty");
    return;
  }

  Logger.log("📋 COLUMN HEADERS:");
  Logger.log("================================");
  for (let i = 0; i < data[0].length; i++) {
    const columnLetter = i < 26
      ? String.fromCharCode(65 + i)
      : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
    Logger.log(`Column ${columnLetter} [${i}]: ${data[0][i]}`);
  }

  if (data.length > 1) {
    Logger.log("\n📝 SAMPLE DATA (Row 1):");
    Logger.log("================================");
    for (let i = 0; i < data[1].length; i++) {
      const columnLetter = i < 26
        ? String.fromCharCode(65 + i)
        : String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
      Logger.log(`Column ${columnLetter} [${i}]: ${data[1][i]}`);
    }
  }

  Logger.log("\n🔍 LOOKING FOR STUDENT CODE:");
  Logger.log("================================");
  Logger.log(`Currently set to: CONFIG.COLUMNS.STUDENT_CODE = ${CONFIG.COLUMNS.STUDENT_CODE}`);
  Logger.log(`That's reading from column: ${data[0][CONFIG.COLUMNS.STUDENT_CODE]}`);
  Logger.log(`Sample value: ${data.length > 1 ? data[1][CONFIG.COLUMNS.STUDENT_CODE] : 'N/A'}`);

  // Try to automatically detect student code column
  Logger.log("\n💡 AUTO-DETECTION:");
  Logger.log("================================");
  for (let i = 0; i < data[0].length && i < 10; i++) {
    const header = String(data[0][i]).toLowerCase();
    if (header.includes('תלמיד') || header.includes('סיסמ') || header.includes('student') || header.includes('code')) {
      Logger.log(`✨ Possible student code column: [${i}] "${data[0][i]}"`);
      if (data.length > 1) {
        Logger.log(`   Sample value: "${data[1][i]}"`);
      }
    }
  }

  Logger.log("\n✅ Update CONFIG.COLUMNS with correct indexes");
}

function testConnection() {
  Logger.log("🧪 Testing Connection (OpenAI Version)...\n");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

  if (!sheet) {
    Logger.log("❌ Sheet not found: " + CONFIG.FORM_RESPONSES_SHEET);
    return;
  }

  Logger.log("✅ Sheet found: " + CONFIG.FORM_RESPONSES_SHEET);
  Logger.log(`✅ Found ${sheet.getLastRow() - 1} responses`);

  // Test getUniqueStudents()
  Logger.log("\n🔍 Testing getUniqueStudents()...");
  const students = getUniqueStudents();
  Logger.log(`✅ Found ${students.length} unique students`);
  if (students.length > 0) {
    Logger.log("   Students: " + students.join(", "));
    Logger.log(`   First student: "${students[0]}" (type: ${typeof students[0]})`);
  } else {
    Logger.log("   ⚠️ No students found! Check CONFIG.COLUMNS.STUDENT_CODE");
  }

  if (students.length > 0) {
    const testStudent = students[0];
    Logger.log(`\n🔍 Testing with student: ${testStudent}`);

    const info = getStudentInfo(testStudent);
    Logger.log(`✅ Student info: ${info.name} (${info.classId})`);

    const responses = getStudentFormResponses(testStudent);
    Logger.log(`✅ Found ${responses.length} responses for ${testStudent}`);

    if (responses.length > 0) {
      Logger.log("   Sample response keys: " + Object.keys(responses[0]).slice(0, 5).join(", ") + "...");
    }
  }

  // Test API key
  try {
    const key = CONFIG.OPENAI_API_KEY;
    Logger.log("\n✅ OpenAI API key configured");
    Logger.log(`   Model: ${CONFIG.OPENAI_MODEL}`);
  } catch (error) {
    Logger.log("\n❌ OpenAI API key not configured");
    Logger.log("   Add OPENAI_API_KEY to Script Properties");
  }

  // Test getAllStudentsAPI()
  Logger.log("\n🔍 Testing getAllStudentsAPI()...");
  const apiResult = getAllStudentsAPI();
  Logger.log(`✅ getAllStudentsAPI returned ${apiResult.students.length} students`);
  if (apiResult.students.length > 0) {
    const first = apiResult.students[0];
    Logger.log(`   First student: ${first.studentCode}`);
    Logger.log(`   Name: ${first.name}`);
    Logger.log(`   Class: ${first.classId}`);
    Logger.log(`   Needs Analysis: ${first.needsAnalysis}`);
  }

  Logger.log("\n🎉 Connection test complete!");
}

/**
 * Test getAllStudentsAPI specifically
 */
function testGetAllStudentsAPI() {
  Logger.log("🧪 Testing getAllStudentsAPI()...\n");

  const result = getAllStudentsAPI();

  Logger.log(`✅ Total students returned: ${result.students.length}`);
  Logger.log("");

  // Count students by analysis status
  const needsAnalysis = result.students.filter(s => s.needsAnalysis === true);
  const alreadyAnalyzed = result.students.filter(s => s.needsAnalysis === false);

  Logger.log("📊 ANALYSIS STATUS:");
  Logger.log(`   ✅ Already analyzed: ${alreadyAnalyzed.length}`);
  Logger.log(`   📝 Needs analysis: ${needsAnalysis.length}`);
  Logger.log("");

  if (needsAnalysis.length > 0) {
    Logger.log("📝 STUDENTS NEEDING ANALYSIS:");
    needsAnalysis.slice(0, 10).forEach(s => {
      Logger.log(`   - ${s.studentCode} (${s.name}) - Class: ${s.classId}`);
    });
    if (needsAnalysis.length > 10) {
      Logger.log(`   ... and ${needsAnalysis.length - 10} more`);
    }
  }

  Logger.log("");

  if (alreadyAnalyzed.length > 0) {
    Logger.log("✅ ALREADY ANALYZED STUDENTS:");
    alreadyAnalyzed.slice(0, 5).forEach(s => {
      Logger.log(`   - ${s.studentCode} (${s.name}) - Class: ${s.classId}`);
    });
    if (alreadyAnalyzed.length > 5) {
      Logger.log(`   ... and ${alreadyAnalyzed.length - 5} more`);
    }
  }

  Logger.log("");
  Logger.log("🎉 Test complete!");
  Logger.log("");
  Logger.log("📋 SUMMARY:");
  Logger.log(`   Total: ${result.students.length}`);
  Logger.log(`   Analyzed: ${alreadyAnalyzed.length}`);
  Logger.log(`   Need Analysis: ${needsAnalysis.length}`);
}

/**
 * Debug AI_Insights sheet to check what's actually there
 */
function debugAIInsightsSheet() {
  Logger.log("🔍 DEBUGGING AI_INSIGHTS SHEET");
  Logger.log("================================\n");

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aiSheet = ss.getSheetByName(CONFIG.AI_INSIGHTS_SHEET);

  if (!aiSheet) {
    Logger.log(`❌ Sheet "${CONFIG.AI_INSIGHTS_SHEET}" not found!`);
    Logger.log(`\n📚 Available sheets:`);
    ss.getSheets().forEach((sheet, index) => {
      Logger.log(`   ${index + 1}. "${sheet.getName()}" - ${sheet.getLastRow()} rows`);
    });
    return;
  }

  const lastRow = aiSheet.getLastRow();
  const lastCol = aiSheet.getLastColumn();

  Logger.log(`✅ Found sheet: "${CONFIG.AI_INSIGHTS_SHEET}"`);
  Logger.log(`📊 Rows: ${lastRow} (including header)`);
  Logger.log(`📊 Columns: ${lastCol}`);
  Logger.log(`📝 Data rows: ${Math.max(0, lastRow - 1)}\n`);

  if (lastRow <= 1) {
    Logger.log("⚠️ SHEET IS EMPTY (only header row)");
    Logger.log("\n💡 This means NO students have been analyzed yet!");
    Logger.log("📋 TO ANALYZE STUDENTS:");
    Logger.log("   1. Run: standardBatch() - analyze all unanalyzed students");
    Logger.log("   2. OR: Click 'AI חכם' button in dashboard");
    Logger.log("   3. OR: Submit a new form response (if automatic trigger is set up)");
    return;
  }

  // Show header row
  const headers = aiSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  Logger.log("📋 HEADER ROW:");
  headers.forEach((header, index) => {
    const columnLetter = index < 26
      ? String.fromCharCode(65 + index)
      : String.fromCharCode(65 + Math.floor(index / 26) - 1) + String.fromCharCode(65 + (index % 26));
    Logger.log(`   Column ${columnLetter} [${index}]: ${header || '(empty)'}`);
  });

  // Show first few data rows
  Logger.log(`\n📝 FIRST ${Math.min(3, lastRow - 1)} DATA ROW(S):`);
  for (let i = 2; i <= Math.min(4, lastRow); i++) {
    const row = aiSheet.getRange(i, 1, 1, lastCol).getValues()[0];
    Logger.log(`\n   Row ${i}:`);
    Logger.log(`      Student Code: ${row[0]}`);
    Logger.log(`      Quarter: ${row[1]}`);
    Logger.log(`      Class: ${row[2]}`);
    Logger.log(`      Date: ${row[3]}`);
    Logger.log(`      Name: ${row[4]}`);
    Logger.log(`      Learning Style: ${row[5] ? row[5].substring(0, 50) + '...' : '(empty)'}`);
    Logger.log(`      Has JSON: ${row[lastCol - 1] && row[lastCol - 1].length > 0 ? 'YES' : 'NO'}`);
  }

  // List all analyzed student codes
  Logger.log(`\n✅ ALL ANALYZED STUDENT CODES:`);
  const analyzedCodes = [];
  for (let i = 2; i <= lastRow; i++) {
    const studentCode = aiSheet.getRange(i, 1).getValue();
    if (studentCode) {
      analyzedCodes.push(String(studentCode).trim());
    }
  }
  Logger.log(`   ${analyzedCodes.join(', ')}`);
  Logger.log(`\n📊 Total analyzed: ${analyzedCodes.length}`);

  // Compare with form responses
  const formStudents = getUniqueStudents();
  Logger.log(`\n🔍 COMPARISON WITH FORM RESPONSES:`);
  Logger.log(`   Students in form: ${formStudents.length}`);
  Logger.log(`   Students analyzed: ${analyzedCodes.length}`);
  Logger.log(`   Students needing analysis: ${formStudents.length - analyzedCodes.length}`);

  if (formStudents.length > analyzedCodes.length) {
    const needsAnalysis = formStudents.filter(code => !analyzedCodes.includes(code));
    Logger.log(`\n📝 STUDENTS NEEDING ANALYSIS (first 10):`);
    needsAnalysis.slice(0, 10).forEach(code => {
      Logger.log(`   - ${code}`);
    });
    if (needsAnalysis.length > 10) {
      Logger.log(`   ... and ${needsAnalysis.length - 10} more`);
    }
  }

  Logger.log("\n================================");
  Logger.log("🎉 Debug complete!");
}

/**
 * Test ISHEBOT analysis with one student
 */
function testISHEBOTAnalysis() {
  const students = getUniqueStudents();

  if (students.length === 0) {
    Logger.log("❌ No students found to test");
    return;
  }

  const testStudent = students[0];
  Logger.log(`🧪 Testing ISHEBOT analysis with student: ${testStudent}`);

  const responses = getStudentFormResponses(testStudent);
  if (responses.length === 0) {
    Logger.log("❌ No responses found for this student");
    return;
  }

  const prompt = buildISHEBOTPrompt(testStudent, responses);
  Logger.log("📝 Prompt length: " + prompt.length + " characters\n");

  const analysis = callOpenAIAPI(prompt);

  if (analysis) {
    Logger.log("✅ Analysis received from OpenAI");
    Logger.log("📊 Analysis preview (first 500 chars):");
    Logger.log(analysis.substring(0, 500) + "...\n");

    writeAnalysisToSheet(testStudent, analysis);
    Logger.log("✅ Test complete! Check AI_Insights sheet.");
  } else {
    Logger.log("❌ Failed to get analysis from OpenAI");
  }
}

// ========================================
// AUTOMATIC ANALYSIS ON FORM SUBMISSION
// ========================================

/**
 * AUTOMATIC TRIGGER: Runs when a student submits the Google Form
 * This is the KEY function that makes analysis automatic!
 *
 * SETUP:
 * 1. Go to: Extensions > Apps Script
 * 2. Click: Triggers (clock icon on left)
 * 3. Click: + Add Trigger (bottom right)
 * 4. Settings:
 *    - Function: onFormSubmit
 *    - Deployment: Head
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 *    - Click: Save
 *
 * Now every time a student submits the form, ISHEBOT analysis runs automatically!
 */
function onFormSubmit(e) {
  Logger.log("🎯 AUTOMATIC ANALYSIS TRIGGERED");
  Logger.log("================================");

  try {
    // Get the sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

    if (!sheet) {
      Logger.log("❌ Error: Form responses sheet not found");
      return;
    }

    // Get the last row (newly submitted)
    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log("❌ Error: No data in sheet");
      return;
    }

    // Extract student info from the newly submitted row
    const studentCode = String(sheet.getRange(lastRow, CONFIG.COLUMNS.STUDENT_CODE + 1).getValue()).trim();
    const classId = String(sheet.getRange(lastRow, CONFIG.COLUMNS.CLASS_ID + 1).getValue()).trim();

    if (!studentCode) {
      Logger.log("❌ Error: No student code in submission");
      return;
    }

    Logger.log(`📝 New submission from student: ${studentCode}`);
    Logger.log(`🏫 Class: ${classId}`);

    // Check if already analyzed (prevent duplicate analysis)
    const alreadyAnalyzed = getAlreadyAnalyzedStudents();
    if (alreadyAnalyzed.has(studentCode)) {
      Logger.log(`⚠️ Student ${studentCode} already analyzed. Skipping.`);
      Logger.log(`   (If you want to re-analyze, delete from AI_Insights sheet first)`);
      return;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      Logger.log("❌ Rate limit exceeded. Analysis skipped.");
      Logger.log("   Try again in an hour or increase limits in CONFIG");
      return;
    }

    Logger.log("🚀 Starting ISHEBOT analysis...");

    // Analyze the student automatically!
    analyzeOneStudent(studentCode);

    Logger.log("✅ AUTOMATIC ANALYSIS COMPLETE");
    Logger.log(`   Student ${studentCode} has been analyzed and saved to AI_Insights sheet`);
    Logger.log(`   Teachers can now view the report in the dashboard!`);

  } catch (error) {
    Logger.log("❌ ERROR in onFormSubmit:");
    Logger.log(error.toString());
    Logger.log(error.stack);
  }
}

/**
 * OPTIONAL: Call ISHEBOT backend directly (if deployed)
 * This is an alternative to using OpenAI directly from Apps Script
 *
 * Use this if:
 * - You have ISHEBOT deployed as a backend service
 * - You want to use the Zod validation from the backend
 * - You want to centralize all analysis logic in one place
 */
function callISHEBOTBackend(studentData) {
  const ISHEBOT_API_URL = 'http://localhost:3000/analyze';
  // For production, use your deployed URL:
  // const ISHEBOT_API_URL = 'https://your-ishebot-backend.com/analyze';

  const payload = {
    student_id: studentData.studentCode,
    class_id: studentData.classId,
    language: 'he',
    answers: studentData.answers,
    premium: false  // Set to true for GPT-4o
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch(ISHEBOT_API_URL, options);
    const statusCode = response.getResponseCode();

    if (statusCode !== 200) {
      Logger.log('ISHEBOT Backend Error: ' + statusCode);
      Logger.log('Response: ' + response.getContentText());
      return null;
    }

    const result = JSON.parse(response.getContentText());

    if (result.success && result.report) {
      return result.report;
    }

    Logger.log('Unexpected response format from ISHEBOT backend');
    return null;
  } catch (error) {
    Logger.log('ISHEBOT Backend Error: ' + error.toString());
    Logger.log('Falling back to direct OpenAI analysis...');
    return null;
  }
}

/**
 * Alternative automatic analysis using ISHEBOT backend
 * Use this if you have ISHEBOT deployed as a separate service
 */
function onFormSubmitWithBackend(e) {
  Logger.log("🎯 AUTOMATIC ANALYSIS TRIGGERED (Backend Mode)");
  Logger.log("================================");

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(CONFIG.FORM_RESPONSES_SHEET);

    if (!sheet) {
      Logger.log("❌ Error: Form responses sheet not found");
      return;
    }

    const lastRow = sheet.getLastRow();

    if (lastRow <= 1) {
      Logger.log("❌ Error: No data in sheet");
      return;
    }

    // Extract student data
    const studentCode = String(sheet.getRange(lastRow, CONFIG.COLUMNS.STUDENT_CODE + 1).getValue()).trim();
    const classId = String(sheet.getRange(lastRow, CONFIG.COLUMNS.CLASS_ID + 1).getValue()).trim();

    if (!studentCode) {
      Logger.log("❌ Error: No student code in submission");
      return;
    }

    // Check if already analyzed
    const alreadyAnalyzed = getAlreadyAnalyzedStudents();
    if (alreadyAnalyzed.has(studentCode)) {
      Logger.log(`⚠️ Student ${studentCode} already analyzed. Skipping.`);
      return;
    }

    Logger.log(`📝 New submission from student: ${studentCode}`);

    // Get student's questionnaire answers
    const responses = getStudentFormResponses(studentCode);
    if (responses.length === 0) {
      Logger.log("❌ Error: No responses found");
      return;
    }

    // Format answers for ISHEBOT backend
    const answersArray = formatAnswersForISHEBOT(responses);

    const studentData = {
      studentCode: studentCode,
      classId: classId,
      answers: answersArray
    };

    Logger.log("🚀 Calling ISHEBOT backend...");

    // Call ISHEBOT backend
    const report = callISHEBOTBackend(studentData);

    if (report) {
      Logger.log("✅ Report received from ISHEBOT backend");

      // Store the report
      const reportJSON = JSON.stringify(report);
      writeAnalysisToSheet(studentCode, reportJSON);

      Logger.log("✅ AUTOMATIC ANALYSIS COMPLETE (Backend Mode)");
      Logger.log(`   Student ${studentCode} analyzed via ISHEBOT backend`);
    } else {
      Logger.log("⚠️ Backend call failed. Falling back to direct OpenAI...");
      analyzeOneStudent(studentCode);
    }

  } catch (error) {
    Logger.log("❌ ERROR in onFormSubmitWithBackend:");
    Logger.log(error.toString());
  }
}

/**
 * ========================================
 * SETUP INSTRUCTIONS:
 * ========================================
 *
 * 1. Update CONFIG section:
 *    - FORM_RESPONSES_SHEET: Your form responses sheet name
 *    - COLUMNS: Adjust based on debugFormStructure() output
 *
 * 2. Add OpenAI API key to Script Properties:
 *    - Go to Project Settings ⚙️ > Script Properties
 *    - Add property: OPENAI_API_KEY
 *
 * 3. Run debugFormStructure() to see your sheet structure
 *
 * 4. Run testConnection() to verify everything works
 *
 * 5. Run testISHEBOTAnalysis() to test analysis with one student
 *
 * 6. **SET UP AUTOMATIC TRIGGER** (THIS IS KEY!):
 *    - Go to: Extensions > Apps Script
 *    - Click: Triggers (clock icon on left sidebar)
 *    - Click: + Add Trigger (bottom right)
 *    - Choose function: onFormSubmit
 *    - Deployment: Head
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 *    - Click: Save
 *    - Authorize the script when prompted
 *
 *    ✅ Now analysis runs automatically on every form submission!
 *
 * 7. Deploy as Web App (for dashboard API access):
 *    - Click Deploy > New deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Copy the Web App URL
 *
 * 8. Update your React dashboard with the Web App URL
 *
 * ========================================
 * AUTOMATIC vs MANUAL ANALYSIS:
 * ========================================
 *
 * ✅ AUTOMATIC (Recommended):
 *    - Student fills form → Analysis happens immediately
 *    - Teacher sees ready report in dashboard
 *    - No clicks needed, no waiting
 *    - Set up trigger using instructions in step 6 above
 *
 * ❌ MANUAL (Old way):
 *    - Teacher clicks "Analyze" button
 *    - Waits 5-15 seconds
 *    - Could analyze same student multiple times (wastes $$)
 *    - Not scalable
 */

// ========================================
// BATCH ANALYSIS FOR EXISTING STUDENTS
// ========================================

/**
 * Delete ALL analysed students: clears all data rows in AI_Insights, keeps header.
 * Creates a timestamped backup before clearing.
 *
 * SECURITY: Requires ADMIN_TOKEN for access
 */
function deleteAllAnalysedStudents() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = CONFIG.AI_INSIGHTS_SHEET || 'AI_Insights';
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found.');
  }

  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  const dataRows = Math.max(0, lastRow - 1);

  if (dataRows === 0) {
    return {
      success: true,
      message: 'Nothing to clear. Header only.',
      cleared: 0
    };
  }

  // Backup first - create archive with timestamp
  const stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
  const backupName = sheetName + '_ARCHIVE_' + stamp;
  sheet.copyTo(ss).setName(backupName);

  // Clear data rows (preserve header and formatting)
  sheet.getRange(2, 1, dataRows, lastCol).clearContent();

  Logger.log(`🗑️ Cleared ${dataRows} analysed row(s) from "${sheetName}"`);
  Logger.log(`📦 Backup created: "${backupName}"`);

  return {
    success: true,
    message: `Cleared ${dataRows} analysed row(s) from "${sheetName}". Backup: "${backupName}"`,
    cleared: dataRows,
    backup: backupName
  };
}

/**
 * Analyze ALL students who have form responses but NO analysis yet
 * This is perfect for analyzing existing students in bulk!
 *
 * WHEN TO USE:
 * - You have students who already filled the form
 * - They were never analyzed (before automatic trigger was set up)
 * - You want to analyze them all at once
 *
 * HOW TO USE:
 * 1. Open Google Apps Script
 * 2. Select "standardBatch" from function dropdown
 * 3. Click Run (▶️)
 * 4. Wait for completion (check logs)
 *
 * OR: Click "AI חכם" button in the dashboard!
 */
function standardBatch() {
  Logger.log("🚀 STARTING BATCH ANALYSIS");
  Logger.log("================================");

  const uniqueStudents = getUniqueStudents();
  const analyzedStudents = getAlreadyAnalyzedStudents();
  const studentsToAnalyze = uniqueStudents.filter(code => !analyzedStudents.has(code));

  if (studentsToAnalyze.length === 0) {
    Logger.log('✅ All students already analyzed!');
    return {
      success: true,
      analyzed: 0,
      message: 'All students already analyzed'
    };
  }

  Logger.log(`📊 Total students in form: ${uniqueStudents.length}`);
  Logger.log(`✅ Already analyzed: ${analyzedStudents.size}`);
  Logger.log(`📝 Need analysis: ${studentsToAnalyze.length}`);
  Logger.log(`👥 Students to analyze: ${studentsToAnalyze.join(', ')}`);
  Logger.log("");

  let totalAnalyzed = 0;
  let totalFailed = 0;

  // Analyze each student one by one
  for (let i = 0; i < studentsToAnalyze.length; i++) {
    const studentCode = studentsToAnalyze[i];

    Logger.log(`[${i + 1}/${studentsToAnalyze.length}] Analyzing student: ${studentCode}`);

    try {
      // Check rate limit
      if (!checkRateLimit()) {
        Logger.log(`❌ Rate limit exceeded at student #${i + 1}`);
        Logger.log(`✅ Successfully analyzed: ${totalAnalyzed} students`);
        Logger.log(`❌ Remaining: ${studentsToAnalyze.length - i} students`);
        Logger.log(`⏰ Try again in an hour or increase rate limits in CONFIG`);
        break;
      }

      // Analyze the student
      analyzeOneStudent(studentCode);
      totalAnalyzed++;
      Logger.log(`  ✅ ${studentCode} analyzed successfully`);

      // Pause between analyses (rate limiting + avoid overwhelming OpenAI)
      if (i < studentsToAnalyze.length - 1) {
        Logger.log('  ⏸️ Waiting 3 seconds...');
        Utilities.sleep(3000);
      }

    } catch (error) {
      totalFailed++;
      Logger.log(`  ❌ Error analyzing ${studentCode}: ${error.toString()}`);
    }
  }

  Logger.log('\n' + '='.repeat(50));
  Logger.log(`✅ BATCH ANALYSIS COMPLETE!`);
  Logger.log(`📊 Total analyzed: ${totalAnalyzed}/${studentsToAnalyze.length}`);
  Logger.log(`❌ Failed: ${totalFailed}`);
  Logger.log(`💰 API calls used: ${totalAnalyzed}`);
  Logger.log(`💵 Estimated cost: $${(totalAnalyzed * 0.02).toFixed(2)} (GPT-4 Turbo)`);
  Logger.log('='.repeat(50));

  return {
    success: true,
    analyzed: totalAnalyzed,
    failed: totalFailed,
    total: studentsToAnalyze.length,
    message: `Analyzed ${totalAnalyzed} students successfully`
  };
}
