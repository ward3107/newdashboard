export const mockStudents = [
  {
    studentCode: "101",
    name: "יעל כהן",
    className: "י1",
    subject: "מתמטיקה",
    strengthsCount: 5,
    grade: "95",
    avatar: 1,
    needsAnalysis: false,
    keyNotes: "תלמידה מצטיינת",
    strengths: ["חשיבה אנליטית", "פתרון בעיות", "יצירתיות"],
    improvements: ["עבודה בצוות"],
    learningStyle: "visual",
  },
  {
    studentCode: "102",
    name: "אדם לוי",
    className: "י1",
    subject: "אנגלית",
    strengthsCount: 3,
    grade: "78",
    avatar: 2,
    needsAnalysis: false,
    keyNotes: "מתקדם יפה",
    strengths: ["הבנת הנקרא", "כתיבה"],
    improvements: ["דיבור", "הגייה"],
    learningStyle: "auditory",
  },
  {
    studentCode: "103",
    name: "נועה ברק",
    className: "י2",
    subject: "מדעים",
    strengthsCount: 0,
    grade: "",
    avatar: 3,
    needsAnalysis: true,
    keyNotes: "",
    strengths: [],
    improvements: [],
    learningStyle: "",
  },
];

export const mockStats = {
  totalStudents: 156,
  analyzedCount: 120,
  needAnalysis: 36,
  averageStrengths: 4.2,
  upToDate: 120,
  completionRate: 77,
  learningStyles: {
    visual: 45,
    auditory: 38,
    kinesthetic: 42,
    social: 31,
  },
  classSizes: {
    י1: 28,
    י2: 32,
    י3: 30,
    י4: 34,
    י5: 32,
  },
};

export const mockAdminPassword = "1234";

export const mockTranslations = {
  he: {
    dashboard: {
      title: "דשבורד ניתוח תלמידים",
      tabs: {
        overview: "סקירה",
        students: "תלמידים",
        analytics: "לוח בקרה",
      },
    },
  },
  en: {
    dashboard: {
      title: "Student Analysis Dashboard",
      tabs: {
        overview: "Overview",
        students: "Students",
        analytics: "Dashboard",
      },
    },
  },
};

export const createMockStudent = (overrides = {}) => ({
  studentCode: Math.random().toString(36).substr(2, 9),
  name: "Test Student",
  className: "י1",
  subject: "Math",
  strengthsCount: 3,
  grade: "85",
  avatar: 1,
  needsAnalysis: false,
  keyNotes: "Test notes",
  strengths: ["Problem solving"],
  improvements: ["Time management"],
  learningStyle: "visual",
  ...overrides,
});