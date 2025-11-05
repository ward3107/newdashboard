/**
 * Firebase Cloud Functions for Student Analysis
 * Securely processes student assessments using OpenAI API
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const OpenAI = require('openai');

// Initialize Firebase Admin
admin.initializeApp();

// Initialize OpenAI client
// API key is stored securely in Firebase config
const openai = new OpenAI({
  apiKey: functions.config().openai.key,
});

/**
 * Process Student Assessment with AI
 *
 * Callable Cloud Function that:
 * 1. Validates input data
 * 2. Calls OpenAI API for student analysis
 * 3. Saves results to Firestore
 * 4. Returns analysis to client
 *
 * Security: Only authenticated users can call this function
 */
exports.processStudentAssessment = functions.https.onCall(async (data, context) => {

  // ========================================
  // SECURITY CHECK 1: Authentication
  // ========================================

  // Require authentication for all assessment submissions
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to submit assessments'
    );
  }

  // ========================================
  // SECURITY CHECK 2: Input Validation
  // ========================================

  const { studentCode, classId, name, answers, schoolId, language } = data;

  if (!studentCode || typeof studentCode !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid student code');
  }

  if (!classId || typeof classId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid class ID');
  }

  if (!name || typeof name !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid student name');
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No questionnaire answers provided');
  }

  if (!schoolId || typeof schoolId !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid school ID');
  }

  // Validate answers format
  for (const answer of answers) {
    if (!answer.q || !answer.a || typeof answer.q !== 'number' || typeof answer.a !== 'string') {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid answer format');
    }
  }

  // ========================================
  // RATE LIMITING
  // ========================================

  const userId = context.auth?.uid || 'anonymous';
  const rateLimitOk = await checkRateLimit(userId);

  if (!rateLimitOk) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Too many requests. Please wait before submitting again.'
    );
  }

  // ========================================
  // CALL OPENAI API
  // ========================================

  try {
    console.log(`Processing student ${studentCode} from class ${classId}`);

    // Generate the analysis prompt
    const prompt = generateStudentAnalysisPrompt(studentCode, classId, name, answers);

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the model from your ISHEBOT service
      messages: [
        {
          role: 'system',
          content: `אתה מנתח פדגוגי מומחה המתמחה בניתוח תלמידים בבתי ספר בישראל.
תפקידך להפיק דוח מקצועי ומעמיק על בסיס שאלון תלמיד, הכולל:
1. ניתוח סגנון למידה
2. זיהוי חוזקות ואתגרים
3. המלצות פדגוגיות מעשיות
4. תובנות לשיפור חווית הלמידה

הפק את הניתוח בעברית, בפורמט JSON מובנה.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const analysisText = completion.choices[0].message.content;
    const analysis = JSON.parse(analysisText);

    // ========================================
    // TRANSFORM TO DASHBOARD FORMAT
    // ========================================

    const transformedData = transformAnalysisToFirestore(
      studentCode,
      classId,
      name,
      answers,
      analysis,
      userId,
      language
    );

    // ========================================
    // SAVE TO FIRESTORE
    // ========================================

    const studentRef = admin.firestore()
      .collection('schools')
      .doc(schoolId)
      .collection('students')
      .doc(studentCode);

    await studentRef.set(transformedData, { merge: true });

    console.log(`✅ Successfully processed student ${studentCode}`);

    // ========================================
    // RETURN RESULT
    // ========================================

    return {
      success: true,
      studentCode: studentCode,
      analysis: analysis,
      message: 'Student assessment processed successfully'
    };

  } catch (error) {
    console.error('Error processing student assessment:', error);

    if (error.code === 'insufficient_quota') {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'OpenAI API quota exceeded. Please contact administrator.'
      );
    }

    throw new functions.https.HttpsError(
      'internal',
      'Failed to process student assessment'
    );
  }
});

/**
 * Generate OpenAI prompt for student analysis
 */
function generateStudentAnalysisPrompt(studentCode, classId, name, answers) {
  const answersText = answers.map(a => `שאלה ${a.q}: ${a.a}`).join('\n');

  return `נתח את התלמיד הבא בצורה מעמיקה ומקצועית:

קוד תלמיד: ${studentCode}
כיתה: ${classId}
שם: ${name}

תשובות לשאלון (28 שאלות):
${answersText}

הפק ניתוח מקצועי בפורמט JSON המדויק הבא:
{
  "learning_style": "תיאור מפורט של סגנון הלמידה (ויזואלי/אודיטורי/קינסטטי וכו')",
  "key_notes": "נקודות מפתח חשובות על התלמיד",
  "strengths": ["חוזקה 1", "חוזקה 2", "חוזקה 3", ...],
  "challenges": ["אתגר 1", "אתגר 2", ...],
  "insights": [
    {
      "id": "insight_1",
      "title": "כותרת קצרה של התובנה",
      "summary": "סיכום מפורט של התובנה",
      "domain": "cognitive|emotional|social|self-regulation|environmental",
      "confidence": 0.85,
      "evidence": {
        "from_questions": [4, 9, 24],
        "patterns": ["דפוס שזוהה בתשובות", "דפוס נוסף"]
      },
      "recommendations": [
        {
          "action": "פעולה ספציפית למורה",
          "how_to": "איך לבצע את הפעולה בפועל",
          "when": "מתי לבצע (במהלך השיעורים/שבועי/מתמשך)",
          "duration": "משך זמן משוער",
          "audience": "teacher",
          "category": "instruction|motivation|behavior|environment|collaboration",
          "priority": "high|medium|low",
          "materials": ["חומר 1", "חומר 2"],
          "follow_up_metric": "איך למדוד הצלחה",
          "confidence_score": {
            "value": 0.9,
            "impact": "high|medium|low",
            "effort": "low|medium|high"
          }
        }
      ]
    }
  ],
  "immediate_actions": [],
  "seating_arrangement": null
}

חשוב:
- צור 4-5 תובנות (insights) מפורטות
- כל תובנה צריכה להיות מבוססת על שאלות ספציפיות מהשאלון
- תן confidence score מציאותי (0.7-0.95)
- כל recommendation צריכה להיות מעשית וברורה
- domain חייב להיות אחד מהערכים: cognitive, emotional, social, self-regulation, environmental
- category חייב להיות אחד מהערכים: instruction, motivation, behavior, environment, collaboration`;
}

/**
 * Transform AI analysis to Firestore format
 */
function transformAnalysisToFirestore(studentCode, classId, name, answers, analysis, userId, language) {
  return {
    studentCode: studentCode,
    name: name,
    classId: classId,
    quarter: 'Q1',
    date: new Date().toLocaleDateString('he-IL'),

    // Learning summary
    learningStyle: analysis.learning_style || '',
    keyNotes: analysis.key_notes || '',

    // Counts
    strengthsCount: analysis.strengths?.length || 0,
    challengesCount: analysis.challenges?.length || 0,

    // Detailed data - using exact structure from Firestore
    student_summary: {
      learning_style: analysis.learning_style || '',
      key_notes: analysis.key_notes || '',
      strengths: analysis.strengths || [],
      challenges: analysis.challenges || []
    },

    // Insights - full detailed structure with evidence, recommendations, etc.
    insights: analysis.insights || [],

    // Additional fields
    immediateActions: analysis.immediate_actions || [],
    seatingArrangement: analysis.seating_arrangement || null,

    // Metadata
    createdBy: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),

    // Raw data
    rawAnswers: answers,
    analysisEngine: 'OpenAI',
    model: 'gpt-4o-mini',
    language: language || 'he'
  };
}

/**
 * Rate limiting: Max 10 requests per minute per user
 */
async function checkRateLimit(userId) {
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  const rateLimitRef = admin.firestore()
    .collection('rateLimits')
    .doc(userId);

  const doc = await rateLimitRef.get();
  const data = doc.data();

  const recentRequests = (data?.requests || [])
    .filter(timestamp => timestamp > oneMinuteAgo);

  if (recentRequests.length >= 10) {
    return false;
  }

  await rateLimitRef.set({
    requests: [...recentRequests, now]
  });

  return true;
}

/**
 * Health check endpoint
 */
exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Student Analysis Cloud Functions'
  });
});
