import type {
  APIConfig,
  MockData,
  Features,
  GoogleAppsScriptConfig,
  Theme,
  ExportConfig
} from './types/config';

// API Configuration
export const API_CONFIG: APIConfig = {
  // Replace with your actual Google Apps Script Web App URL
  BASE_URL: import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // API Endpoints
  ENDPOINTS: {
    GET_ALL_STUDENTS: '?action=getAllStudents',
    GET_STUDENT: '?action=getStudent&studentId=',
    GET_STATS: '?action=getStats',
    ANALYZE_STUDENT: '?action=analyzeOneStudent&studentId=',
    SYNC_STUDENTS: '?action=syncStudents',
    INITIAL_SYNC: '?action=initialSync'
  },

  // Request timeout
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,

  // Retry configuration
  RETRY_ATTEMPTS: Number(import.meta.env.VITE_RETRY_ATTEMPTS) || 3,
  RETRY_DELAY: Number(import.meta.env.VITE_RETRY_DELAY) || 1000
};

// Mock data for development (remove when connecting to real API)
export const MOCK_DATA: MockData = {
  students: [
    {
      studentCode: "70132",
      quarter: "Q1",
      classId: "10A",
      date: "2025-01-15",
      learningStyle: "• 👁️ ויזואלי\n• 📖 מילולי",
      keyNotes: "תלמיד מוכשר עם יכולות גבוהות בחשיבה ויזואלית",
      strengthsCount: 5,
      challengesCount: 3
    },
    {
      studentCode: "70133",
      quarter: "Q1",
      classId: "10A",
      date: "2025-01-15",
      learningStyle: "• 👂 אודיטורי\n• 🤝 חברתי",
      keyNotes: "תלמיד מעולה עם יכולות חברתיות מפותחות",
      strengthsCount: 6,
      challengesCount: 2
    },
    {
      studentCode: "70134",
      quarter: "Q1",
      classId: "10B",
      date: "2025-01-15",
      learningStyle: "• ✋ קינסטטי\n• 🔢 לוגי",
      keyNotes: "זקוק לפעילות גופנית ולמידה מעשית",
      strengthsCount: 4,
      challengesCount: 5
    },
    {
      studentCode: "70135",
      quarter: "Q1",
      classId: "10B",
      date: "2025-01-14",
      learningStyle: "• 👁️ ויזואלי\n• 🎨 יצירתי",
      keyNotes: "תלמיד יצירתי עם חזון אמנותי מפותח",
      strengthsCount: 5,
      challengesCount: 3
    },
    {
      studentCode: "70136",
      quarter: "Q1",
      classId: "10A",
      date: "2025-01-14",
      learningStyle: "• 🔢 לוגי\n• 🧠 אנליטי",
      keyNotes: "מצטיין במתמטיקה ובמדעים מדויקים",
      strengthsCount: 6,
      challengesCount: 2
    },
    {
      studentCode: "70137",
      quarter: "Q1",
      classId: "10C",
      date: "2025-01-13",
      learningStyle: "• 👂 אודיטורי\n• 📝 מילולי",
      keyNotes: "כישורי כתיבה מעולים וביטוי עשיר",
      strengthsCount: 5,
      challengesCount: 4
    }
  ],

  stats: {
    totalStudents: 125,
    byClass: {
      "10A": 42,
      "10B": 38,
      "10C": 45
    },
    byLearningStyle: {
      "ויזואלי": 45,
      "אודיטורי": 35,
      "קינסטטי": 25,
      "לוגי": 20
    },
    averageStrengths: 5.2,
    lastUpdated: "2 ימים"
  },

  studentDetail: {
    studentCode: "70132",
    quarter: "Q1",
    classId: "10A",
    date: "2025-01-15",
    student_summary: {
      learning_style: "• 👁️ ויזואלי - מעדיף תמונות ודיאגרמות\n• 📖 מילולי - יכולות קריאה וכתיבה מפותחות\n• 🎯 ממוקד - מתרכז היטב במשימות",
      strengths: [
        "💪 יכולת ריכוז גבוהה",
        "🎨 חשיבה יצירתית מפותחת",
        "📚 אוצר מילים עשיר",
        "🤝 יכולות חברתיות טובות",
        "🧠 זיכרון ויזואלי מעולה"
      ],
      challenges: [
        "⏰ קושי בניהול זמן",
        "🔊 רגישות לרעש בכיתה",
        "📝 כתיבה איטית יחסית"
      ],
      key_notes: "תלמיד מוכשר עם פוטנציאל גבוה. זקוק לסביבה שקטה ומסודרת. מגיב טוב להוראה ויזואלית."
    },
    insights: [
      {
        category: "🏫 ארגון מקום הלמידה",
        finding: "התלמיד מגיב טוב לסביבה מסודרת וחזותית. זקוק לתאורה טובה ולמינימום הפרעות.",
        recommendations: [
          {
            action: "💡 הושב ליד חלון עם תאורה טבעית",
            how_to: "בחר מקום ליד החלון, ודא שאין בוהק. הוסף מנורת שולחן אם נדרש.",
            time_needed: "5 דקות",
            examples: "שורה ראשונה או שנייה, צד ימין של הכיתה",
            priority: "high"
          },
          {
            action: "📚 ארגן את השולחן בצורה חזותית",
            how_to: "השתמש בקופסאות צבעוניות לארגון, תוויות ברורות, מקום קבוע לכל חפץ.",
            time_needed: "10 דקות",
            examples: "קופסה כחולה לעטים, אדומה למחקים, ירוקה לדבק",
            priority: "medium"
          }
        ]
      }
    ],
    immediate_actions: [
      {
        what: "💡 הושב ליד החלון עם תאורה טובה",
        how: "בחר מקום בשורה הראשונה או השנייה, צד ימין של הכיתה. ודא שאין בוהק מהשמש. הוסף מנורת שולחן אם נדרש.",
        when: "מיד בשיעור הבא",
        time: "5 דקות"
      },
      {
        what: "🎨 התחל שיעור עם דוגמה ויזואלית",
        how: "הכן דיאגרמה או תמונה הקשורה לנושא. הצג במשך 2-3 דקות ראשונות. שאל שאלות על מה שהם רואים.",
        when: "בכל התחלת שיעור",
        time: "3 דקות"
      }
    ],
    seating_arrangement: {
      location: "🪑 שורה ראשונה, צד ימין ליד החלון",
      partner_type: "🤝 תלמיד שקט וממוקד, רמה אקדמית דומה",
      avoid: "🚫 הימנע מישיבה ליד מקורות רעש או תלמידים מפריעים"
    }
  }
};

// Development mode flag
export const IS_DEVELOPMENT: boolean = import.meta.env.DEV;

// Feature flags
export const FEATURES: Features = {
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true' || false,
  ENABLE_CHARTS: true,
  ENABLE_EXPORT: true,
  ENABLE_ANIMATIONS: true,
  ENABLE_RTL: true
};

// הגדרות להתחברות ל-Google Apps Script
export const GOOGLE_APPS_SCRIPT_CONFIG: GoogleAppsScriptConfig = {
  // הכנס כאן את ה-URL של ה-Google Apps Script Web App שלך
  WEB_APP_URL: import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // הגדרות Google Sheets
  SPREADSHEET_ID: import.meta.env.VITE_SPREADSHEET_ID || 'YOUR_SPREADSHEET_ID',

  // שמות הגיליונות
  SHEETS: {
    STUDENTS: 'students',
    RESPONSES: 'responses',
    AI_INSIGHTS: 'AI_Insights'
  },

  // מיפוי שמות עמודות מגוגל פורמס לשדות במערכת
  FIELD_MAPPING: {
    // אפשרויות שונות לשדה השם בגוגל פורמס
    NAME_FIELDS: ['name', 'studentName', 'שם התלמיד', 'שם מלא', 'Full Name', 'Student Name'],
    STUDENT_CODE_FIELDS: ['studentCode', 'קוד תלמיד', 'ID', 'Student ID', 'מספר תלמיד'],
    CLASS_FIELDS: ['classId', 'class', 'כיתה', 'Class', 'grade'],
  },

  // הגדרות Claude API
  CLAUDE_CONFIG: {
    MODEL: 'claude-sonnet-4-20250514',
    MAX_TOKENS: 16000,
    TEMPERATURE: 1
  }
};

// Theme configuration
export const THEME: Theme = {
  PRIMARY_COLOR: '#4285f4',
  SUCCESS_COLOR: '#34a853',
  WARNING_COLOR: '#fbbc04',
  DANGER_COLOR: '#ea4335',

  FONT_FAMILY: 'Inter, Assistant, -apple-system, BlinkMacSystemFont, sans-serif',

  BREAKPOINTS: {
    SM: '640px',
    MD: '768px',
    LG: '1024px',
    XL: '1280px'
  }
};

// Export format configurations
export const EXPORT_CONFIG: ExportConfig = {
  PDF: {
    FORMAT: 'a4',
    ORIENTATION: 'portrait',
    MARGIN: 20,
    FONT_SIZE: 12
  },
  EXCEL: {
    SHEET_NAME: 'תלמידים',
    FILE_NAME: 'ניתוח_תלמידים.xlsx'
  }
};
