/**
 * ISHEBOT Analysis Service
 * Connects to the ISHEBOT Analysis Engine backend to generate
 * pedagogically sound, MOE-compliant student reports
 */

import logger from '../utils/logger.js';

const ISHEBOT_API_URL = import.meta.env.VITE_ISHEBOT_API_URL || 'http://localhost:3000';

/**
 * Analyze a student using the ISHEBOT engine
 * @param {Object} studentData - Student questionnaire data
 * @returns {Promise<Object>} Complete analysis report
 */
export const analyzeStudentWithISHEBOT = async (studentData) => {
  try {
    const { studentCode, classId, answers } = studentData;

    if (!studentCode || !classId || !answers || answers.length === 0) {
      throw new Error('חסרים נתוני תלמיד חובה');
    }

    // Format the request for ISHEBOT API
    const requestBody = {
      student_id: studentCode,
      class_id: classId,
      language: 'he', // Hebrew by default
      answers: answers.map(a => ({ q: a.q, a: a.a })),
      premium: false // Use gpt-4o-mini by default
    };


    const response = await fetch(`${ISHEBOT_API_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'שגיאה בניתוח ISHEBOT');
    }

    const result = await response.json();

    if (!result.ok || !result.report) {
      throw new Error('פורמט תשובה לא תקין מ-ISHEBOT');
    }


    return {
      success: true,
      report: result.report,
      model: result.model,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    logger.error('❌ ISHEBOT Analysis Error:', error);
    return {
      success: false,
      error: error.message || 'שגיאה לא ידועה בניתוח'
    };
  }
};

/**
 * Check ISHEBOT backend health
 * @returns {Promise<boolean>} True if backend is available
 */
export const checkISHEBOTHealth = async () => {
  try {
    const response = await fetch(`${ISHEBOT_API_URL}/healthz`, {
      method: 'GET',
    });
    const data = await response.json();
    return data.ok === true;
  } catch (error) {
    logger.error('ISHEBOT Health Check Failed:', error);
    return false;
  }
};

/**
 * Convert Google Forms response to ISHEBOT format
 * @param {Object} googleFormsData - Raw Google Forms response
 * @returns {Object} Formatted data for ISHEBOT
 */
export const convertGoogleFormsToISHEBOT = (googleFormsData) => {
  // Map Google Forms responses (Q1-Q28) to ISHEBOT format
  const answers = [];

  // Extract question responses from columns F (index 5) through AG (index 32)
  // Based on COMPLETE_INTEGRATED_SCRIPT_OPENAI.js column mapping
  const questionMapping = {
    5: 1,   // Q1: מה המקצוע האהוב עליך?
    6: 2,   // Q2: איך אתה אוהב ללמוד?
    7: 3,   // Q3: מה קשה לך בלימודים?
    8: 4,   // Q4: איך אתה מרכז?
    9: 5,   // Q5: איך אתה מתכונן למבחנים?
    10: 6,  // Q6: מה אתה עושה כשלומדים נושא חדש?
    11: 7,  // Q7: איך אתה ניגש למשימה?
    12: 8,  // Q8: באיזה סוג שיעור אתה מצליח?
    13: 9,  // Q9: איך אתה בעבודות קבוצה?
    14: 10, // Q10: מה עוזר לך להבין?
    15: 11, // Q11: מה אתה עושה כשלא מבין?
    16: 12, // Q12: איזה מורה אתה אוהב?
    17: 13, // Q13: מה המצב-רוח שלך בכיתה?
    18: 14, // Q14: איך אתה מרגיש לפני מבחן?
    19: 15, // Q15: מה עוזר לך להירגע?
    20: 16, // Q16: עם מי אתה אוהב לשבת?
    21: 17, // Q17: איך אתה מרגיש כשצריך לדבר בכיתה?
    22: 18, // Q18: מה גורם לך להיות עצוב?
    23: 19, // Q19: איך אתה מגיב כשמישהו מרגיז אותך?
    24: 20, // Q20: מה עוזר לך להתרכז?
    25: 21, // Q21: מה מפריע לך בשיעור?
    26: 22, // Q22: איזה מקום בכיתה אתה אוהב?
    27: 23, // Q23: מה אתה עושה כשמשעמם?
    28: 24, // Q24: איך אתה בזמן הפסקה?
    29: 25, // Q25: מה הכי חשוב לך בלמידה?
    30: 26, // Q26: מה תרצה שהמורה יעשה?
    31: 27, // Q27: איך אתה מעדיף לקבל שיעורי בית?
    32: 28  // Q28: איך אתה מעדיף להיבחן?
  };

  // Convert the raw response array
  if (Array.isArray(googleFormsData)) {
    Object.entries(questionMapping).forEach(([colIndex, questionNum]) => {
      const answer = googleFormsData[parseInt(colIndex)];
      if (answer && typeof answer === 'string' && answer.trim()) {
        answers.push({
          q: questionNum,
          a: answer.trim()
        });
      }
    });
  }
  // Or handle object format
  else if (typeof googleFormsData === 'object') {
    for (let i = 1; i <= 28; i++) {
      const answer = googleFormsData[`Q${i}`] || googleFormsData[`q${i}`];
      if (answer) {
        answers.push({ q: i, a: String(answer).trim() });
      }
    }
  }

  return {
    studentCode: googleFormsData.studentCode || googleFormsData[2], // Column C
    classId: googleFormsData.classId || googleFormsData[3],         // Column D
    answers
  };
};

/**
 * Transform ISHEBOT report to dashboard format
 * @param {Object} ishebotReport - Report from ISHEBOT API
 * @returns {Object} Dashboard-compatible student detail
 */
export const transformISHEBOTReport = (ishebotReport) => {
  const {
    student_id,
    class_id,
    analysis_date,
    insights,
    stats,
    seating,
    summary
  } = ishebotReport;

  // Transform insights to dashboard format
  const transformedInsights = insights.map((insight, index) => ({
    id: insight.id || `insight_${index}`,
    domain: insight.domain,
    title: insight.title,
    summary: insight.summary,
    evidence: insight.evidence,
    confidence: insight.confidence,
    recommendations: insight.recommendations.map(rec => ({
      audience: rec.audience,
      category: rec.category,
      action: rec.action,
      how_to: rec.how_to,
      when: rec.when,
      duration: rec.duration,
      materials: rec.materials || [],
      follow_up_metric: rec.follow_up_metric,
      priority: rec.priority,
      rationale: rec.rationale
    }))
  }));

  // Create immediate actions from high-priority recommendations
  const immediate_actions = [];
  insights.forEach(insight => {
    insight.recommendations
      .filter(rec => rec.priority === 'high' || rec.priority === 'critical')
      .forEach(rec => {
        immediate_actions.push({
          what: rec.action,
          how: rec.how_to,
          when: rec.when,
          time: rec.duration
        });
      });
  });

  return {
    studentCode: student_id,
    classId: class_id,
    date: analysis_date,
    quarter: 'Q1', // Can be determined from date

    // Student Summary
    student_summary: {
      learning_style: insights.find(i => i.domain === 'cognitive')?.summary || summary,
      strengths: insights
        .filter(i => i.confidence > 0.7)
        .map(i => i.title)
        .slice(0, 5),
      challenges: insights
        .filter(i => i.confidence < 0.5 || i.domain === 'emotional')
        .map(i => i.title)
        .slice(0, 5),
      key_notes: summary
    },

    // Stats
    strengthsCount: stats.scores.motivation * 10, // Scale to 0-10
    challengesCount: stats.risk_flags.length,

    // Insights with full pedagogical data
    insights: transformedInsights,

    // Immediate actions
    immediate_actions: immediate_actions.slice(0, 6), // Top 6

    // Seating arrangement
    seating_arrangement: {
      location: seating.recommended_seat,
      partner_type: 'תלמיד עם יכולות משלימות',
      avoid: 'מקומות עם הסחות דעת גבוהות',
      rationale: seating.rationale
    },

    // Additional stats
    stats: {
      focus: stats.scores.focus,
      motivation: stats.scores.motivation,
      collaboration: stats.scores.collaboration,
      emotional_regulation: stats.scores.emotional_regulation,
      risk_flags: stats.risk_flags,
      percentiles: stats.comparison_to_class
    },

    // Metadata
    analysis_engine: 'ISHEBOT',
    model_used: 'gpt-4o-mini',
    generated_at: new Date().toISOString()
  };
};

export default {
  analyzeStudentWithISHEBOT,
  checkISHEBOTHealth,
  convertGoogleFormsToISHEBOT,
  transformISHEBOTReport
};
