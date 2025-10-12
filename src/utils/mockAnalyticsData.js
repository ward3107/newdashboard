// Mock Analytics Data Generator
// This generates comprehensive analytics data for testing and demonstration

export const generateMockAnalytics = (students = []) => {
  return {
    summary: {
      overallAverage: Math.floor(Math.random() * 20) + 75,
      attendanceRate: Math.floor(Math.random() * 10) + 85,
      homeworkCompletion: Math.floor(Math.random() * 15) + 70,
      engagementScore: Math.floor(Math.random() * 15) + 75,
      riskLevel: Math.floor(Math.random() * 20) + 10,
    },

    academic: {
      grades: {
        excellent: 25,
        good: 35,
        average: 25,
        belowAverage: 10,
        failing: 5
      },
      subjects: generateSubjectPerformance(),
      attendance: {
        present: 165,
        absent: 8,
        late: 12,
        rate: 92
      },
      homework: {
        completed: 45,
        late: 8,
        missing: 3,
        quality: 4.2
      },
      exams: generateExamPerformance()
    },

    learning: {
      styles: [
        { name: 'חזותי', effectiveness: 85, icon: 'Eye' },
        { name: 'שמיעתי', effectiveness: 72, icon: 'MessageSquare' },
        { name: 'קינסתטי', effectiveness: 78, icon: 'Activity' },
        { name: 'חברתי', effectiveness: 90, icon: 'Users' }
      ],
      studyTime: {
        totalHours: 42,
        avgPerDay: 2.5,
        peakTime: '16:00-18:00',
        optimalDuration: 45
      },
      engagement: {
        overall: 85,
        participation: 90,
        homework: 78,
        extracurricular: 82,
        peer: 88
      },
      gaps: [
        { subject: 'מתמטיקה', topic: 'אלגברה', severity: 'critical' },
        { subject: 'אנגלית', topic: 'דקדוק', severity: 'moderate' },
        { subject: 'מדעים', topic: 'פיזיקה', severity: 'minor' }
      ]
    },

    behavioral: {
      motivation: {
        overall: 78,
        intrinsic: 82,
        extrinsic: 75,
        trend: 'increasing'
      },
      stress: {
        level: 'medium',
        score: 45,
        mainSources: ['מבחנים', 'עומס מטלות', 'לחץ חברתי']
      },
      confidence: {
        overall: 72,
        academic: 68,
        social: 85,
        trend: 'improving'
      },
      collaboration: {
        preferred: 'smallGroup',
        effectiveness: {
          solo: 70,
          pair: 85,
          smallGroup: 92,
          largeGroup: 65
        }
      },
      peakTimes: {
        morning: 65,
        afternoon: 85,
        evening: 70,
        optimal: '14:00-16:00'
      },
      emotionalTrend: {
        current: 'positive',
        score: 78,
        weeklyTrend: [65, 70, 68, 75, 72, 78, 78]
      }
    },

    progress: {
      monthly: generateMonthlyProgress(),
      goals: {
        completed: 8,
        onTrack: 5,
        atRisk: 2,
        total: 15,
        completionRate: 53
      },
      strengths: [
        { name: 'חשיבה ביקורתית', initial: 60, current: 85, growth: 25 },
        { name: 'יצירתיות', initial: 70, current: 88, growth: 18 },
        { name: 'עבודת צוות', initial: 55, current: 78, growth: 23 }
      ],
      challenges: [
        { name: 'ריכוז בשיעור', status: 'resolved', days: 21 },
        { name: 'הגשת מטלות בזמן', status: 'improving', days: 14 },
        { name: 'השתתפות בכיתה', status: 'ongoing', days: 7 }
      ],
      velocity: {
        overall: 3.5,
        trend: 'accelerating',
        subjects: [
          { name: 'מתמטיקה', velocity: 4.2 },
          { name: 'מדעים', velocity: 3.8 },
          { name: 'שפות', velocity: 2.9 }
        ]
      },
      summary: {
        overallGrowth: 22,
        topArea: 'מתמטיקה',
        topGrowth: 35,
        improvementAreas: 2
      }
    },

    comparative: {
      class: {
        studentAvg: 85,
        classAvg: 78,
        percentile: 82,
        rank: 5,
        total: 30
      },
      gender: {
        metrics: [
          { name: 'ממוצע כללי', male: 82, female: 86 },
          { name: 'נוכחות', male: 90, female: 94 },
          { name: 'מטלות', male: 78, female: 85 }
        ]
      },
      ageGroups: [
        { age: '15-16', count: 45, avg: 82 },
        { age: '16-17', count: 52, avg: 85 },
        { age: '17-18', count: 38, avg: 88 }
      ],
      yearOverYear: {
        metrics: [
          { name: 'ממוצע כללי', current: 85, previous: 78, change: 7 },
          { name: 'נוכחות', current: 92, previous: 88, change: 4 },
          { name: 'השלמת מטלות', current: 78, previous: 82, change: -4 }
        ]
      },
      benchmarks: [
        { type: 'מחוזי', student: 85, benchmark: 78, percentile: 75 },
        { type: 'ארצי', student: 85, benchmark: 80, percentile: 68 },
        { type: 'בינלאומי', student: 85, benchmark: 82, percentile: 62 }
      ],
      peers: [
        { name: 'תלמיד א', score: 88 },
        { name: 'תלמיד נוכחי', score: 85, isCurrentStudent: true },
        { name: 'תלמיד ב', score: 82 },
        { name: 'תלמיד ג', score: 79 },
        { name: 'תלמיד ד', score: 76 }
      ]
    },

    predictive: {
      risks: generateRiskIndicators(),
      success: [
        { goal: 'סיום שנה בהצלחה', probability: 88 },
        { goal: 'שיפור ב-10%', probability: 75 },
        { goal: 'הצטיינות', probability: 62 }
      ],
      dropout: {
        score: 25,
        level: 'low',
        signals: [
          { signal: 'נוכחות נמוכה', detected: false },
          { signal: 'ירידה בציונים', detected: true },
          { signal: 'חוסר מעורבות', detected: false }
        ]
      },
      college: {
        overall: 72,
        academic: 78,
        standardized: 68,
        extracurricular: 70
      },
      career: [
        { career: 'הנדסה', alignment: 85 },
        { career: 'רפואה', alignment: 72 },
        { career: 'חינוך', alignment: 68 },
        { career: 'עסקים', alignment: 78 }
      ],
      future: {
        nextQuarter: 87,
        nextYear: 90,
        graduation: 92,
        confidence: 78
      }
    },

    support: {
      interventions: [
        { type: 'תמיכה אישית', success: 85, count: 12 },
        { type: 'קבוצת למידה', success: 78, count: 8 },
        { type: 'שיעורי עזר', success: 92, count: 15 }
      ],
      responseTimes: {
        average: 2.5,
        fastest: 0.5,
        slowest: 8,
        onTime: 92
      },
      personalization: {
        overall: 82,
        learningPlan: 88,
        assessment: 76,
        feedback: 85,
        resources: 79
      },
      parentEngagement: {
        level: 'medium',
        meetings: { attended: 3, total: 4 },
        communication: 8,
        responseRate: 75
      },
      resources: [
        { name: 'מערכת דיגיטלית', usage: 85, effectiveness: 92 },
        { name: 'ספרי לימוד', usage: 78, effectiveness: 70 },
        { name: 'חונכות אישית', usage: 45, effectiveness: 88 }
      ],
      effectiveness: {
        overall: 88,
        engagement: 92,
        clarity: 85,
        support: 90,
        innovation: 78
      }
    }
  };
};

// Helper functions to generate specific data

function generateSubjectPerformance() {
  const subjects = ['מתמטיקה', 'עברית', 'אנגלית', 'מדעים', 'היסטוריה'];
  const trends = ['up', 'down', 'stable'];

  return subjects.map(name => ({
    name,
    score: Math.floor(Math.random() * 30) + 70,
    trend: trends[Math.floor(Math.random() * trends.length)]
  }));
}

function generateExamPerformance() {
  return [
    { name: 'מבחן אמצע', score: Math.floor(Math.random() * 20) + 70, classAvg: Math.floor(Math.random() * 15) + 70 },
    { name: 'מבחן סוף', score: Math.floor(Math.random() * 20) + 75, classAvg: Math.floor(Math.random() * 15) + 73 },
    { name: 'בוחן 1', score: Math.floor(Math.random() * 15) + 80, classAvg: Math.floor(Math.random() * 12) + 78 },
    { name: 'בוחן 2', score: Math.floor(Math.random() * 18) + 72, classAvg: Math.floor(Math.random() * 15) + 70 }
  ];
}

function generateMonthlyProgress() {
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל'];
  return months.map(month => ({
    month,
    improvement: Math.floor(Math.random() * 15) + 5
  }));
}

function generateRiskIndicators() {
  return [
    { type: 'נשירה', level: 'low', probability: Math.floor(Math.random() * 20) + 5 },
    { type: 'כישלון אקדמי', level: 'medium', probability: Math.floor(Math.random() * 30) + 20 },
    { type: 'התנהגות', level: 'low', probability: Math.floor(Math.random() * 15) + 5 },
    { type: 'רגשי', level: 'medium', probability: Math.floor(Math.random() * 35) + 25 }
  ];
}

// Generate individual student analytics
export const generateStudentAnalytics = (studentId) => {
  const baseAnalytics = generateMockAnalytics();

  // Customize for individual student
  return {
    ...baseAnalytics,
    studentId,
    lastUpdated: new Date().toISOString()
  };
};

// Generate class-wide analytics
export const generateClassAnalytics = (classId, studentCount = 30) => {
  return {
    classId,
    totalStudents: studentCount,
    averageGrade: Math.floor(Math.random() * 15) + 75,
    gradeDistribution: {
      excellent: Math.floor(studentCount * 0.2),
      good: Math.floor(studentCount * 0.35),
      average: Math.floor(studentCount * 0.25),
      belowAverage: Math.floor(studentCount * 0.15),
      failing: Math.floor(studentCount * 0.05)
    },
    attendanceRate: Math.floor(Math.random() * 10) + 85,
    homeworkCompletionRate: Math.floor(Math.random() * 15) + 70,
    monthlyTrends: generateMonthlyTrends(),
    atRiskStudents: Math.floor(studentCount * 0.15),
    excellingStudents: Math.floor(studentCount * 0.25),
    averageInterventionSuccess: Math.floor(Math.random() * 15) + 75,
    parentEngagementRate: Math.floor(Math.random() * 20) + 65
  };
};

function generateMonthlyTrends() {
  const months = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני'];
  return months.map(month => ({
    month,
    avgGrade: Math.floor(Math.random() * 10) + 75,
    attendance: Math.floor(Math.random() * 8) + 87,
    engagement: Math.floor(Math.random() * 12) + 73
  }));
}