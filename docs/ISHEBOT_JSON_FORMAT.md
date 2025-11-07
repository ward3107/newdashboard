# 📊 ISHEBOT Analysis JSON Format

## Overview

After analyzing a student with OpenAI GPT-4, the system generates a comprehensive JSON report that contains:

- **Pedagogical insights** across multiple domains
- **Actionable recommendations** for teachers
- **Performance statistics** (focus, motivation, collaboration, etc.)
- **Seating recommendations** based on learning needs
- **Summary** of the student's profile

This JSON is stored in **Column AC** (the last column) of the `AI_Insights` sheet.

---

## Complete JSON Structure

```json
{
  "student_id": "70101",
  "class_id": "ז1",
  "analysis_date": "2025-01-20",
  "language": "he",

  "insights": [
    {
      "id": "insight_1",
      "domain": "cognitive",
      "title": "כותרת תמציתית של התובנה",
      "summary": "הסבר ברור של משמעות התובנה - למשל: התלמיד מציג חוזקות בחשיבה ויזואלית אך מתקשה בתהליכים מילוליים",
      "evidence": {
        "from_questions": [1, 4, 7],
        "patterns": [
          "העדפה ברורה לתרשימים וצבעים",
          "קושי בהבעה בכתב",
          "תגובות קצרות לשאלות פתוחות"
        ]
      },
      "confidence": 0.85,
      "recommendations": [
        {
          "audience": "teacher",
          "category": "instruction",
          "action": "שילוב חומרים ויזואליים בהוראה",
          "how_to": "1. השתמש במצגות עם תמונות ותרשימים\n2. הוסף אינפוגרפיקות לסיכומי שיעור\n3. אפשר ציור או מיפוי חשיבה במקום כתיבה",
          "when": "בכל שיעור, במיוחד בהסברת חומר חדש",
          "duration": "קבוע לאורך השנה",
          "materials": [
            "מצגות PowerPoint עם תמונות",
            "דפי עבודה עם איורים",
            "לוח מחיק ייעודי לציור"
          ],
          "follow_up_metric": "שיפור בציונים בבחנים עם חומר ויזואלי",
          "priority": "high",
          "confidence_score": {
            "value": 0.85,
            "impact": "high",
            "effort": "medium"
          }
        },
        {
          "audience": "teacher",
          "category": "motivation",
          "action": "הצגת אתגרים ויזואליים",
          "how_to": "1. הכן חידות ויזואליות קצרות\n2. השתמש במשחקי הרכבה דיגיטליים\n3. עודד הצגה גרפית של פתרונות",
          "when": "פעם בשבוע, בשיעור העשרה",
          "duration": "15-20 דקות לפעילות",
          "materials": [
            "משחקי פאזל דיגיטליים",
            "חידות ויזואליות מודפסות",
            "אפליקציות ציור דיגיטלי"
          ],
          "follow_up_metric": "רמת מעורבות ומוטיבציה בפעילויות",
          "priority": "medium",
          "confidence_score": {
            "value": 0.75,
            "impact": "medium",
            "effort": "low"
          }
        },
        {
          "audience": "teacher",
          "category": "environment",
          "action": "סידור מקום ישיבה קרוב למסך/לוח",
          "how_to": "1. הצב את התלמיד בשורות הקדמיות\n2. ודא שיש קו ראייה ישיר ללוח\n3. שקול מושב עם זווית טובה למצגות",
          "when": "החל מהשבוע הבא",
          "duration": "קבוע",
          "materials": [
            "סימון מקום ישיבה בתרשים כיתה"
          ],
          "follow_up_metric": "שיפור בתשומת לב והשתתפות בשיעור",
          "priority": "high",
          "confidence_score": {
            "value": 0.90,
            "impact": "high",
            "effort": "low"
          }
        }
      ]
    },
    {
      "id": "insight_2",
      "domain": "emotional",
      "title": "רגישות רגשית גבוהה וצורך בחיזוק חיובי",
      "summary": "התלמיד מציג רגישות רגשית מוגברת ומגיב באופן אינטנסיבי לביקורת או לכישלון. זקוק לחיזוק חיובי תכוף.",
      "evidence": {
        "from_questions": [2, 8, 12],
        "patterns": [
          "ציון חוסר ביטחון בתשובות",
          "פחד מטעויות",
          "צורך באישור מהמורה"
        ]
      },
      "confidence": 0.78,
      "recommendations": [
        {
          "audience": "teacher",
          "category": "behavior",
          "action": "מתן משובים חיוביים ומעודדים באופן עקבי",
          "how_to": "1. הדגש הצלחות קטנות מיד\n2. השתמש במשוב בונה במקום ביקורת\n3. תן 'חיזוק כוכבים' (מדבקות/ציונים חיוביים)",
          "when": "בכל אינטראקציה עם התלמיד",
          "duration": "לאורך כל השנה",
          "materials": [
            "מדבקות חיוביות",
            "טופס משוב מעודד",
            "מערכת תגמול (כוכבים/נקודות)"
          ],
          "follow_up_metric": "עלייה בביטחון עצמי ונכונות לקחת סיכונים",
          "priority": "high",
          "confidence_score": {
            "value": 0.88,
            "impact": "high",
            "effort": "low"
          }
        }
      ]
    },
    {
      "id": "insight_3",
      "domain": "social",
      "title": "העדפה לעבודה עצמאית על פני עבודה קבוצתית",
      "summary": "התלמיד מעדיף עבודה עצמאית ומתקשה בעבודה קבוצתית. זקוק להדרכה בכישורי שיתוף פעולה.",
      "evidence": {
        "from_questions": [3, 9, 15],
        "patterns": [
          "ציון העדפה ברורה לעבודה לבד",
          "קושי בהתמודדות עם דעות שונות",
          "נטייה לדומיננטיות או נסיגה בקבוצות"
        ]
      },
      "confidence": 0.82,
      "recommendations": [
        {
          "audience": "teacher",
          "category": "instruction",
          "action": "אימון הדרגתי בעבודה קבוצתית",
          "how_to": "1. התחל בזוגות (לא קבוצות גדולות)\n2. הגדר תפקידים ברורים לכל חבר קבוצה\n3. הדרך בכישורי הקשבה ושיתוף\n4. תן משוב חיובי על שיתוף פעולה",
          "when": "פעם בשבועיים בתחילה, ואז הגבר",
          "duration": "10-15 דקות בכל פעילות",
          "materials": [
            "כרטיסי תפקידים (מנהיג, רושם, דובר)",
            "הנחיות ברורות לעבודה קבוצתית",
            "טופס משוב עצמי על שיתוף פעולה"
          ],
          "follow_up_metric": "שיפור בשיתוף פעולה ופחות קונפליקטים",
          "priority": "medium",
          "confidence_score": {
            "value": 0.80,
            "impact": "medium",
            "effort": "medium"
          }
        }
      ]
    }
  ],

  "stats": {
    "scores": {
      "focus": 0.70,
      "motivation": 0.82,
      "collaboration": 0.45,
      "emotional_regulation": 0.60,
      "self_efficacy": 0.55,
      "time_management": 0.68
    },
    "risk_flags": [
      "רגישות רגשית גבוהה - זקוק למעקב",
      "קושי בעבודה קבוצתית - שקול התערבות"
    ]
  },

  "seating": {
    "recommended_seat": "A2",
    "rationale": "שורה קדמית (A) קרובה ללוח בגלל צורך בגירוי ויזואלי, אך לא במרכז (2 ולא 1) כדי להימנע מחרדת ביצועים. רצוי לשבת ליד תלמיד שקט ומרכז כדי להימנע מהסחות דעת.",
    "avoid_near": [
      "תלמידים רועשים",
      "אזורים עם הסחות דעת גבוהות"
    ],
    "prefer_near": [
      "תלמידים רגועים ומרכזים",
      "אזור עם נגישות טובה למורה"
    ]
  },

  "summary": "התלמיד הוא לומד ויזואלי בעל רגישות רגשית גבוהה. מציג חוזקות בחשיבה ויזואלית ומוטיבציה פנימית טובה, אך מתקשה בהבעה מילולית ובעבודה קבוצתית. זקוק לחיזוק חיובי תכוף, חומרי הוראה ויזואליים, וליווי הדרגתי בפיתוח כישורי שיתוף פעולה. מומלץ לשבת בשורות הקדמיות עם נגישות טובה ללוח וסביבה שקטה."
}
```

---

## Field Descriptions

### Top-Level Fields

| Field | Type | Description |
|-------|------|-------------|
| `student_id` | String | Student code from the form (e.g., "70101") |
| `class_id` | String | Class ID (e.g., "ז1", "ח2") |
| `analysis_date` | String | Date of analysis in ISO format (YYYY-MM-DD) |
| `language` | String | Language of the report (always "he" for Hebrew) |
| `insights` | Array | Array of pedagogical insights (3-6 insights per student) |
| `stats` | Object | Performance scores across different dimensions |
| `seating` | Object | Seating recommendations based on learning needs |
| `summary` | String | Overall summary of the student's profile |

---

### Insights Array

Each insight contains:

| Field | Type | Description |
|-------|------|-------------|
| `id` | String | Unique identifier (e.g., "insight_1") |
| `domain` | String | Learning domain: `cognitive`, `emotional`, `environmental`, `social`, `motivation`, `self-regulation` |
| `title` | String (Hebrew) | Short, descriptive title of the insight |
| `summary` | String (Hebrew) | Clear explanation of what this insight means |
| `evidence` | Object | Supporting evidence from questionnaire |
| `evidence.from_questions` | Array | Question numbers that support this insight |
| `evidence.patterns` | Array | Observed patterns in the student's answers |
| `confidence` | Number (0-1) | AI confidence in this insight (0.0 to 1.0) |
| `recommendations` | Array | 3-6 actionable recommendations for teachers |

---

### Recommendations

Each recommendation contains:

| Field | Type | Description |
|-------|------|-------------|
| `audience` | String | Who should implement this: `teacher`, `parent`, `counselor` |
| `category` | String | Type of recommendation: `instruction`, `motivation`, `behavior`, `environment` |
| `action` | String (Hebrew) | Clear, concise action to take |
| `how_to` | String (Hebrew) | Step-by-step instructions |
| `when` | String (Hebrew) | When to implement (timing/frequency) |
| `duration` | String (Hebrew) | How long to maintain this intervention |
| `materials` | Array (Hebrew) | Required materials or resources |
| `follow_up_metric` | String (Hebrew) | How to measure success |
| `priority` | String | Priority level: `low`, `medium`, `high` |
| `confidence_score` | Object | Detailed confidence scoring |
| `confidence_score.value` | Number (0-1) | Confidence in this specific recommendation |
| `confidence_score.impact` | String | Expected impact: `low`, `medium`, `high` |
| `confidence_score.effort` | String | Required effort: `low`, `medium`, `high` |

---

### Stats Object

Performance scores (0.0 to 1.0):

| Field | Description |
|-------|-------------|
| `focus` | Ability to concentrate and maintain attention |
| `motivation` | Level of internal motivation and engagement |
| `collaboration` | Ability to work with others |
| `emotional_regulation` | Ability to manage emotions |
| `self_efficacy` | Belief in one's own abilities |
| `time_management` | Ability to organize and manage time |

**Risk Flags**: Array of warning messages for issues that need monitoring.

---

### Seating Object

| Field | Type | Description |
|-------|------|-------------|
| `recommended_seat` | String | Recommended seat position (e.g., "A2") |
| `rationale` | String (Hebrew) | Explanation of why this seat is recommended |
| `avoid_near` | Array (Hebrew) | List of students/situations to avoid |
| `prefer_near` | Array (Hebrew) | List of preferred seating conditions |

---

## Where This JSON is Stored

**Location**: AI_Insights sheet, **Column AC** (last column)

**Row Structure in AI_Insights Sheet**:

| Column | Field | Example |
|--------|-------|---------|
| A | Student Code | 70101 |
| B | Quarter | Q1 |
| C | Class ID | ז1 |
| D | Date | 2025-01-20 |
| E | Name | תלמיד 70101 |
| F | Domains (summary) | cognitive, emotional, social |
| G | Summary | סיכום כללי... |
| H | Scores (summary) | ריכוז: 70%, מוטיבציה: 82% |
| I | Seating (summary) | A2 - שורה קדמית... |
| J-AB | (Reserved for future use) | |
| **AC** | **Full JSON** | **Complete JSON object** |

---

## How Your React Dashboard Uses This JSON

### 1. API Fetches the Data

```javascript
// From: src/services/googleAppsScriptAPI.js
const student = await API.getStudent(studentCode);

// Returns:
{
  studentCode: "70101",
  insights: [...],  // ← From Column AC JSON
  stats: {...},     // ← From Column AC JSON
  seating: {...},   // ← From Column AC JSON
  summary: "..."    // ← From Column AC JSON
}
```

### 2. Enhanced Analysis Service Transforms It

```javascript
// From: src/services/enhancedAnalysisService.js
generateEnhancedAnalysis(studentData) {
  if (studentData.insights && studentData.insights.length > 0) {
    // Uses REAL AI insights from Column AC
    return this.useRealAIInsights(studentData);
  }
  // Fallback to pattern-based insights
}
```

### 3. Dashboard Displays It

The insights and recommendations are displayed in:

- **StudentDetail page** (when you click a student)
- **Analysis tabs** showing domains, recommendations, and statistics
- **Seating arrangement** view with AI-recommended positions

---

## Example Real-World Output

Based on actual student questionnaire answers, OpenAI GPT-4 will generate insights like:

**Cognitive Domain**:

- "התלמיד מציג יכולת גבוהה בפתרון בעיות מתמטיות אך מתקשה בהבנת הנקרא"

**Emotional Domain**:

- "נמצא לחץ גבוה לפני בחנים, זקוק לטכניקות הרגעה ולחיזוק ביטחון עצמי"

**Social Domain**:

- "מנהיג טבעי בקבוצה, מסוגל לארגן ולתאם עבודה משותפת"

**Recommendations**:

- "הכן גיליונות סיכום מתמטיים עם נוסחאות" (High priority, High impact)
- "שלב תרגילי הבנת הנקרא קצרים מדי יום" (Medium priority, Low effort)
- "הצע תפקיד מנהיג קבוצה בפרויקטים" (High priority, Medium effort)

---

## Validation Rules

The OpenAI prompt enforces:

✅ **Each insight must have 3-6 recommendations**
✅ **All text in Hebrew**
✅ **Based on actual student answers only** (no generic templates)
✅ **Include confidence scores** for transparency
✅ **Valid JSON format** (enforced by GPT-4's `response_format: { type: 'json_object' }`)

---

## Summary

After analyzing a student, you get a **comprehensive, structured JSON** that includes:

1. **3-6 Insights** across cognitive, emotional, social, and other domains
2. **15-30 Recommendations** (3-6 per insight) with detailed action steps
3. **Performance Scores** (focus, motivation, collaboration, etc.)
4. **Seating Recommendations** based on learning needs
5. **Summary** of the student's overall profile

This JSON is stored in **Column AC** of the AI_Insights sheet and is **automatically displayed** in your React dashboard when you view a student's details.

**All insights and recommendations are in Hebrew and based on the student's actual questionnaire answers.**
