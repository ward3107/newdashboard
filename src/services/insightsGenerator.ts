/**
 * Insights and Recommendations Generator
 * Analyzes student data to provide actionable insights and recommendations
 */

interface Student {
  studentCode: string;
  name: string;
  className?: string;
  keyStrengths?: string[];
  areasNeedingSupport?: string[];
  emotionalState?: string;
  learningStyle?: string;
  challengesBehaviors?: string[];
  interventions?: string[];
  personalityTraits?: string[];
  grade?: number;
  lastAssessment?: number;
  attendanceRate?: number;
  participationLevel?: string;
  collaborationSkills?: string;
  criticalThinking?: string;
  creativityLevel?: string;
  needsAnalysis?: boolean;
  strengthsCount?: number;
  lastAnalysisDate?: string;
  performanceTrend?: 'improving' | 'stable' | 'declining';
  riskLevel?: 'low' | 'medium' | 'high';
  keyNotes?: string;
  teacherRecommendations?: string;
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info' | 'recommendation';
  category: 'academic' | 'behavioral' | 'emotional' | 'social' | 'general';
  title: string;
  description: string;
  affectedStudents?: string[];
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  actions?: string[];
}

export interface Recommendation {
  id: string;
  category: 'teaching' | 'seating' | 'grouping' | 'intervention' | 'resources';
  title: string;
  description: string;
  targetStudents?: string[];
  expectedOutcome: string;
  implementation: string[];
  priority: 'immediate' | 'short-term' | 'long-term';
  evidence?: string;
}

export interface StudentRecommendation {
  studentCode: string;
  studentName: string;
  insights: Insight[];
  recommendations: Recommendation[];
  seatingRecommendation?: {
    position: string;
    nearStudents: string[];
    avoidStudents: string[];
    reason: string;
  };
}

export class InsightsGenerator {
  /**
   * Generate comprehensive insights for all students
   */
  static generateClassInsights(students: Student[]): Insight[] {
    const insights: Insight[] = [];
    const analyzed = students.filter(s => !s.needsAnalysis && (s.strengthsCount ?? 0) > 0);
    const unanalyzed = students.filter(s => s.needsAnalysis || (s.strengthsCount ?? 0) === 0);

    // Analysis coverage insights
    if (unanalyzed.length > 0) {
      insights.push({
        id: 'coverage-1',
        type: 'warning',
        category: 'general',
        title: `${unanalyzed.length} תלמידים ממתינים לניתוח`,
        description: `יש ${unanalyzed.length} תלמידים שטרם נותחו. ניתוח מלא יספק תמונה מדויקת יותר של הכיתה.`,
        affectedStudents: unanalyzed.map(s => s.studentCode),
        priority: 'high',
        actionable: true,
        actions: ['לחץ על "Smart AI" לניתוח אוטומטי', 'בקש מהתלמידים למלא את הטופס']
      });
    }

    // Learning style insights
    const learningStyles = this.analyzeLearningStyles(analyzed);
    if (learningStyles.dominant) {
      insights.push({
        id: 'learning-1',
        type: 'info',
        category: 'academic',
        title: `רוב התלמידים לומדים בסגנון ${this.translateLearningStyle(learningStyles.dominant.style)}`,
        description: `${learningStyles.dominant.count} תלמידים (${learningStyles.dominant.percentage}%) מעדיפים למידה ${this.translateLearningStyle(learningStyles.dominant.style)}. התאם את שיטות ההוראה בהתאם.`,
        priority: 'medium',
        actionable: true,
        actions: this.getLearningStyleActions(learningStyles.dominant.style)
      });
    }

    // Performance insights
    const performanceInsights = this.analyzePerformance(analyzed);
    performanceInsights.forEach(insight => insights.push(insight));

    // Emotional wellbeing insights
    const emotionalInsights = this.analyzeEmotionalWellbeing(analyzed);
    emotionalInsights.forEach(insight => insights.push(insight));

    // Risk insights
    const riskInsights = this.analyzeRisks(analyzed);
    riskInsights.forEach(insight => insights.push(insight));

    // Collaboration insights
    const collaborationInsights = this.analyzeCollaboration(analyzed);
    collaborationInsights.forEach(insight => insights.push(insight));

    // Strength patterns
    const strengthPatterns = this.analyzeStrengthPatterns(analyzed);
    strengthPatterns.forEach(insight => insights.push(insight));

    return insights.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate recommendations for the entire class
   */
  static generateClassRecommendations(students: Student[]): Recommendation[] {
    const recommendations: Recommendation[] = [];
    const analyzed = students.filter(s => !s.needsAnalysis && (s.strengthsCount ?? 0) > 0);

    // Teaching method recommendations
    const teachingRecs = this.generateTeachingRecommendations(analyzed);
    teachingRecs.forEach(rec => recommendations.push(rec));

    // Grouping recommendations
    const groupingRecs = this.generateGroupingRecommendations(analyzed);
    groupingRecs.forEach(rec => recommendations.push(rec));

    // Intervention recommendations
    const interventionRecs = this.generateInterventionRecommendations(analyzed);
    interventionRecs.forEach(rec => recommendations.push(rec));

    // Resource recommendations
    const resourceRecs = this.generateResourceRecommendations(analyzed);
    resourceRecs.forEach(rec => recommendations.push(rec));

    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, 'short-term': 1, 'long-term': 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  /**
   * Generate personalized recommendations for each student
   */
  static generateStudentRecommendations(student: Student): StudentRecommendation {
    const insights: Insight[] = [];
    const recommendations: Recommendation[] = [];

    // Academic insights
    if (student.grade && student.grade < 60) {
      insights.push({
        id: `${student.studentCode}-academic-1`,
        type: 'danger',
        category: 'academic',
        title: 'ציונים נמוכים',
        description: `הציון הנוכחי (${student.grade}) מצביע על קשיים אקדמיים`,
        priority: 'high',
        actionable: true,
        actions: ['תגבור אישי', 'שיחה עם ההורים', 'התאמת חומר הלימוד']
      });

      recommendations.push({
        id: `${student.studentCode}-rec-1`,
        category: 'intervention',
        title: 'תוכנית תגבור אישית',
        description: 'יש ליצור תוכנית תגבור מותאמת אישית',
        expectedOutcome: 'שיפור של 15-20 נקודות בציון תוך חודשיים',
        implementation: [
          'זיהוי נושאים ספציפיים בהם יש קושי',
          'מפגש תגבור פעמיים בשבוע',
          'מעקב שבועי אחר התקדמות'
        ],
        priority: 'immediate'
      });
    }

    // Learning style recommendation
    if (student.learningStyle) {
      recommendations.push({
        id: `${student.studentCode}-rec-2`,
        category: 'teaching',
        title: `התאמת הוראה לסגנון למידה ${this.translateLearningStyle(student.learningStyle)}`,
        description: `התלמיד/ה לומד/ת בצורה הטובה ביותר דרך ${this.translateLearningStyle(student.learningStyle)}`,
        expectedOutcome: 'שיפור בהבנה ובמוטיבציה',
        implementation: this.getLearningStyleActions(student.learningStyle),
        priority: 'short-term'
      });
    }

    // Emotional support
    if (student.emotionalState && this.isEmotionalStateNegative(student.emotionalState)) {
      insights.push({
        id: `${student.studentCode}-emotional-1`,
        type: 'warning',
        category: 'emotional',
        title: 'מצב רגשי דורש תשומת לב',
        description: `התלמיד/ה במצב רגשי של ${student.emotionalState}`,
        priority: 'high',
        actionable: true,
        actions: ['שיחה אישית', 'הפניה ליועצת', 'יצירת קשר עם ההורים']
      });
    }

    // Behavioral insights
    if (student.challengesBehaviors && student.challengesBehaviors.length > 0) {
      const behaviorInsight = {
        id: `${student.studentCode}-behavior-1`,
        type: 'info' as const,
        category: 'behavioral' as const,
        title: 'אתגרים התנהגותיים',
        description: `זוהו האתגרים הבאים: ${student.challengesBehaviors.join(', ')}`,
        priority: 'medium' as const,
        actionable: true,
        actions: ['הצבת גבולות ברורים', 'חיזוק חיובי', 'שיתוף פעולה עם ההורים']
      };
      insights.push(behaviorInsight);
    }

    // Seating recommendation based on analysis
    const seatingRecommendation = this.generateSeatingRecommendation(student);

    return {
      studentCode: student.studentCode,
      studentName: student.name,
      insights,
      recommendations,
      seatingRecommendation
    };
  }

  /**
   * Generate smart seating recommendations based on student analysis
   */
  static generateSeatingRecommendation(student: Student): any {
    const recommendation = {
      position: 'middle',
      nearStudents: [] as string[],
      avoidStudents: [] as string[],
      reason: ''
    };

    // Students with attention issues should sit in front
    if (student.challengesBehaviors?.some(b => b.includes('ריכוז') || b.includes('קשב'))) {
      recommendation.position = 'front';
      recommendation.reason = 'קשיי קשב וריכוז - ישיבה קדמית תסייע';
    }

    // High achievers can help others
    if (student.grade && student.grade > 85) {
      recommendation.position = 'mixed';
      recommendation.reason = 'תלמיד מצטיין - יכול לסייע לאחרים';
    }

    // Students needing support should be near helpful peers
    if (student.areasNeedingSupport && student.areasNeedingSupport.length > 2) {
      recommendation.position = 'supported';
      recommendation.reason = 'זקוק לתמיכה - למקם ליד תלמידים תומכים';
    }

    // Visual learners near the board
    if (student.learningStyle === 'visual') {
      recommendation.position = 'front-center';
      recommendation.reason = 'לומד ויזואלי - זקוק לראות את הלוח בבירור';
    }

    // Social learners in groups
    if (student.learningStyle === 'social') {
      recommendation.position = 'group';
      recommendation.reason = 'לומד חברתי - עדיף בקבוצה';
    }

    return recommendation;
  }

  /**
   * Analyze learning styles distribution
   */
  private static analyzeLearningStyles(students: Student[]) {
    const styles: Record<string, number> = {};

    students.forEach(student => {
      if (student.learningStyle) {
        styles[student.learningStyle] = (styles[student.learningStyle] || 0) + 1;
      }
    });

    const sortedStyles = Object.entries(styles).sort((a, b) => b[1] - a[1]);

    if (sortedStyles.length === 0) return { dominant: null };

    const dominant = {
      style: sortedStyles[0][0],
      count: sortedStyles[0][1],
      percentage: Math.round((sortedStyles[0][1] / students.length) * 100)
    };

    return { dominant };
  }

  /**
   * Analyze performance patterns
   */
  private static analyzePerformance(students: Student[]): Insight[] {
    const insights: Insight[] = [];

    const declining = students.filter(s => s.performanceTrend === 'declining');
    if (declining.length > 5) {
      insights.push({
        id: 'perf-1',
        type: 'danger',
        category: 'academic',
        title: `${declining.length} תלמידים מראים ירידה בביצועים`,
        description: 'מגמת ירידה משמעותית בביצועים האקדמיים דורשת התערבות מיידית',
        affectedStudents: declining.map(s => s.studentCode),
        priority: 'high',
        actionable: true,
        actions: [
          'בדיקת גורמים לירידה',
          'תוכנית התערבות כיתתית',
          'מפגשי הורים'
        ]
      });
    }

    const excellent = students.filter(s => s.grade && s.grade > 90);
    if (excellent.length > 0) {
      insights.push({
        id: 'perf-2',
        type: 'success',
        category: 'academic',
        title: `${excellent.length} תלמידים מצטיינים בכיתה`,
        description: 'תלמידים אלו יכולים לשמש כחונכים ולסייע לאחרים',
        affectedStudents: excellent.map(s => s.studentCode),
        priority: 'low',
        actionable: true,
        actions: ['מינוי כחונכים', 'העשרה נוספת', 'אתגרים מתקדמים']
      });
    }

    return insights;
  }

  /**
   * Analyze emotional wellbeing
   */
  private static analyzeEmotionalWellbeing(students: Student[]): Insight[] {
    const insights: Insight[] = [];

    const negativeEmotions = students.filter(s =>
      s.emotionalState && this.isEmotionalStateNegative(s.emotionalState)
    );

    if (negativeEmotions.length > 3) {
      insights.push({
        id: 'emotion-1',
        type: 'warning',
        category: 'emotional',
        title: `${negativeEmotions.length} תלמידים במצב רגשי קשה`,
        description: 'מספר גבוה של תלמידים חווים קושי רגשי',
        affectedStudents: negativeEmotions.map(s => s.studentCode),
        priority: 'high',
        actionable: true,
        actions: [
          'סדנת חוסן נפשי',
          'מפגשים עם היועצת',
          'פעילויות לגיבוש כיתתי'
        ]
      });
    }

    return insights;
  }

  /**
   * Analyze risk factors
   */
  private static analyzeRisks(students: Student[]): Insight[] {
    const insights: Insight[] = [];

    const highRisk = students.filter(s => {
      let riskScore = 0;
      if (s.grade && s.grade < 60) riskScore++;
      if (s.attendanceRate && s.attendanceRate < 80) riskScore++;
      if (s.performanceTrend === 'declining') riskScore++;
      if (s.emotionalState && this.isEmotionalStateNegative(s.emotionalState)) riskScore++;
      return riskScore >= 2;
    });

    if (highRisk.length > 0) {
      insights.push({
        id: 'risk-1',
        type: 'danger',
        category: 'general',
        title: `${highRisk.length} תלמידים בסיכון גבוה`,
        description: 'תלמידים אלו דורשים התערבות מיידית ומקיפה',
        affectedStudents: highRisk.map(s => s.studentCode),
        priority: 'high',
        actionable: true,
        actions: [
          'ישיבת צוות דחופה',
          'תוכנית התערבות אישית',
          'שיתוף הורים',
          'מעקב יומי'
        ]
      });
    }

    return insights;
  }

  /**
   * Analyze collaboration patterns
   */
  private static analyzeCollaboration(students: Student[]): Insight[] {
    const insights: Insight[] = [];

    const poorCollaboration = students.filter(s =>
      s.collaborationSkills?.toLowerCase().includes('weak') ||
      s.collaborationSkills?.toLowerCase().includes('poor')
    );

    if (poorCollaboration.length > 5) {
      insights.push({
        id: 'collab-1',
        type: 'info',
        category: 'social',
        title: 'כישורי שיתוף פעולה דורשים חיזוק',
        description: `${poorCollaboration.length} תלמידים מתקשים בעבודה קבוצתית`,
        affectedStudents: poorCollaboration.map(s => s.studentCode),
        priority: 'medium',
        actionable: true,
        actions: [
          'פרויקטים קבוצתיים מובנים',
          'למידת עמיתים',
          'משחקי תפקידים'
        ]
      });
    }

    return insights;
  }

  /**
   * Analyze strength patterns
   */
  private static analyzeStrengthPatterns(students: Student[]): Insight[] {
    const insights: Insight[] = [];
    const strengthMap: Record<string, number> = {};

    students.forEach(student => {
      student.keyStrengths?.forEach(strength => {
        strengthMap[strength] = (strengthMap[strength] || 0) + 1;
      });
    });

    const topStrengths = Object.entries(strengthMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (topStrengths.length > 0) {
      insights.push({
        id: 'strength-1',
        type: 'success',
        category: 'general',
        title: 'חוזקות בולטות בכיתה',
        description: `החוזקות המובילות: ${topStrengths.map(s => s[0]).join(', ')}`,
        priority: 'low',
        actionable: true,
        actions: ['בנייה על חוזקות אלו בהוראה', 'עידוד והדגשה', 'פרויקטים מתאימים']
      });
    }

    return insights;
  }

  /**
   * Generate teaching recommendations
   */
  private static generateTeachingRecommendations(students: Student[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Diverse learning styles recommendation
    const learningStyles = new Set(students.map(s => s.learningStyle).filter(Boolean));
    if (learningStyles.size > 2) {
      recommendations.push({
        id: 'teach-1',
        category: 'teaching',
        title: 'גיוון בשיטות הוראה',
        description: 'הכיתה כוללת סגנונות למידה מגוונים - נדרש גיוון בהוראה',
        expectedOutcome: 'שיפור בהבנה ובמעורבות של כלל התלמידים',
        implementation: [
          'שילוב אמצעים ויזואליים',
          'הסברים מילוליים מפורטים',
          'פעילויות מעשיות',
          'עבודה בקבוצות קטנות'
        ],
        priority: 'immediate'
      });
    }

    return recommendations;
  }

  /**
   * Generate grouping recommendations
   */
  private static generateGroupingRecommendations(students: Student[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    recommendations.push({
      id: 'group-1',
      category: 'grouping',
      title: 'קבוצות למידה הטרוגניות',
      description: 'יצירת קבוצות עם שילוב של רמות ויכולות שונות',
      expectedOutcome: 'למידת עמיתים ושיפור בביצועים הכלליים',
      implementation: [
        'חלוקה לקבוצות של 4-5 תלמידים',
        'שילוב תלמיד מצטיין בכל קבוצה',
        'רוטציה חודשית של הקבוצות'
      ],
      priority: 'short-term'
    });

    return recommendations;
  }

  /**
   * Generate intervention recommendations
   */
  private static generateInterventionRecommendations(students: Student[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const needingSupport = students.filter(s =>
      s.areasNeedingSupport && s.areasNeedingSupport.length > 2
    );

    if (needingSupport.length > 5) {
      recommendations.push({
        id: 'intervention-1',
        category: 'intervention',
        title: 'תוכנית תמיכה כיתתית',
        description: `${needingSupport.length} תלמידים זקוקים לתמיכה נוספת`,
        targetStudents: needingSupport.map(s => s.studentCode),
        expectedOutcome: 'צמצום פערים וחיזוק בסיס הידע',
        implementation: [
          'שעת תגבור שבועית',
          'חומרי עזר מותאמים',
          'מעקב צמוד אחר התקדמות',
          'תקשורת עם הורים'
        ],
        priority: 'immediate',
        evidence: 'מחקרים מראים ש-85% מהתלמידים המקבלים תמיכה מראים שיפור'
      });
    }

    return recommendations;
  }

  /**
   * Generate resource recommendations
   */
  private static generateResourceRecommendations(students: Student[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    const visualLearners = students.filter(s => s.learningStyle === 'visual').length;
    if (visualLearners > students.length * 0.3) {
      recommendations.push({
        id: 'resource-1',
        category: 'resources',
        title: 'הוספת אמצעי המחשה',
        description: `${visualLearners} תלמידים הם לומדים ויזואליים`,
        expectedOutcome: 'שיפור בהבנה ובזכירה של החומר',
        implementation: [
          'מצגות צבעוניות',
          'תרשימים ודיאגרמות',
          'סרטוני הדגמה',
          'לוח אינטראקטיבי'
        ],
        priority: 'short-term'
      });
    }

    return recommendations;
  }

  /**
   * Check if emotional state is negative
   */
  private static isEmotionalStateNegative(state: string): boolean {
    const negativeStates = ['sad', 'anxious', 'stressed', 'angry', 'frustrated',
                           'עצוב', 'חרד', 'לחוץ', 'כועס', 'מתוסכל'];
    return negativeStates.some(s => state.toLowerCase().includes(s));
  }

  /**
   * Translate learning style to Hebrew
   */
  private static translateLearningStyle(style: string): string {
    const translations: Record<string, string> = {
      'visual': 'ויזואלית',
      'auditory': 'שמיעתית',
      'kinesthetic': 'תנועתית',
      'reading/writing': 'קריאה וכתיבה',
      'social': 'חברתית'
    };
    return translations[style] || style;
  }

  /**
   * Get actions for specific learning style
   */
  private static getLearningStyleActions(style: string): string[] {
    const actions: Record<string, string[]> = {
      'visual': [
        'השתמש בתרשימים ודיאגרמות',
        'צבע מידע חשוב',
        'הראה סרטונים',
        'השתמש במפות מחשבה'
      ],
      'auditory': [
        'הסבר בעל פה',
        'עודד דיונים',
        'השתמש במוזיקה',
        'הקלט שיעורים'
      ],
      'kinesthetic': [
        'שלב פעילויות מעשיות',
        'אפשר תנועה',
        'השתמש במודלים',
        'למידה דרך עשייה'
      ],
      'social': [
        'עבודה בקבוצות',
        'למידת עמיתים',
        'פרויקטים משותפים',
        'דיונים כיתתיים'
      ]
    };
    return actions[style] || ['התאם את ההוראה לסגנון הלמידה'];
  }
}

export default InsightsGenerator;