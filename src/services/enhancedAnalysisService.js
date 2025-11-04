// Enhanced Analysis Service for Deep Student Insights
// Based on Israeli educational standards and modern pedagogical research

export class EnhancedAnalysisService {
  constructor() {
    this.insights = [];
    this.recommendations = [];
  }

  /**
   * Generate comprehensive analysis based on student data
   * @param {Object} studentData - Complete student information
   * @returns {Object} Detailed analysis with insights and recommendations
   */
  generateEnhancedAnalysis(studentData) {
    // Check if we have real AI insights from Google Sheets
    if (studentData.insights && Array.isArray(studentData.insights) && studentData.insights.length > 0) {
      return this.useRealAIInsights(studentData);
    }

    // Fallback to pattern-based insights if no AI analysis available
    const analysis = {
      insights: [],
      recommendations: [],
      academicProfile: {},
      socialEmotionalProfile: {},
      learningProfile: {},
      developmentalNeeds: [],
      interventionPlan: {}
    };

    // Generate 6+ key insights based on data patterns
    analysis.insights = this.generateInsights(studentData);

    // Generate actionable recommendations for each insight
    analysis.recommendations = this.generateRecommendations(analysis.insights, studentData);

    // Create comprehensive profiles
    analysis.academicProfile = this.analyzeAcademicProfile(studentData);
    analysis.socialEmotionalProfile = this.analyzeSocialEmotional(studentData);
    analysis.learningProfile = this.analyzeLearningStyle(studentData);

    // Identify developmental needs
    analysis.developmentalNeeds = this.identifyDevelopmentalNeeds(studentData);

    // Create intervention plan
    analysis.interventionPlan = this.createInterventionPlan(analysis);

    return analysis;
  }

  /**
   * Use real AI insights from ISHEBOT analysis
   * @param {Object} studentData - Student data with AI insights
   * @returns {Object} Formatted analysis
   */
  useRealAIInsights(studentData) {
    const aiInsights = studentData.insights || [];
    const aiStats = studentData.stats || {};
    const aiSeating = studentData.seating || {};

    // Transform AI insights to our display format
    const formattedInsights = aiInsights.map(insight => ({
      id: insight.id || `insight_${Math.random()}`,
      category: this.translateDomain(insight.domain),
      title: insight.title,
      description: insight.summary,
      severity: this.calculateSeverityFromConfidence(insight.confidence),
      scientificBasis: this.getScientificBasis(insight.domain),
      israeliContext: this.getIsraeliContext(insight.domain),
      dataPoints: insight.evidence || {},
      confidence: insight.confidence,
      recommendations: insight.recommendations || []
    }));

    // Extract recommendations grouped by insight
    const recommendationsByInsight = aiInsights.map(insight => ({
      insightId: insight.id,
      category: this.translateDomain(insight.domain),
      recommendations: (insight.recommendations || []).map(rec => ({
        text: rec.action,
        priority: rec.priority,
        implementation: rec.when || rec.duration || 'מיידי',
        tools: rec.materials || [],
        expectedOutcome: rec.follow_up_metric,
        howTo: rec.how_to,
        confidence_score: rec.confidence_score
      }))
    }));

    // Create profiles from AI data
    const academicProfile = this.createProfileFromAIData(aiInsights, 'cognitive', studentData);
    const socialEmotionalProfile = this.createProfileFromAIData(aiInsights, 'emotional', studentData);
    const learningProfile = this.createProfileFromAIData(aiInsights, 'environmental', studentData);

    // Extract developmental needs from risk flags
    const developmentalNeeds = (aiStats.risk_flags || []).map(flag => ({
      area: flag.flag,
      priority: flag.severity,
      description: flag.immediate_action,
      escalation: flag.escalation_protocol,
      parentNotification: flag.parent_notification
    }));

    // Create intervention plan from AI recommendations
    const interventionPlan = this.createInterventionPlanFromAI(aiInsights, developmentalNeeds);

    return {
      insights: formattedInsights,
      recommendations: recommendationsByInsight,
      academicProfile,
      socialEmotionalProfile,
      learningProfile,
      developmentalNeeds,
      interventionPlan,
      aiStats,
      aiSeating
    };
  }

  /**
   * Translate AI domain to Hebrew category
   */
  translateDomain(domain) {
    const translations = {
      'cognitive': 'דפוסי עיבוד קוגניטיבי',
      'emotional': 'התפתחות חברתית-רגשית',
      'environmental': 'סביבת למידה',
      'social': 'יחסים חברתיים',
      'motivation': 'מוטיבציה ומעורבות',
      'self-regulation': 'ויסות עצמי'
    };
    return translations[domain] || domain;
  }

  /**
   * Calculate severity from confidence score
   */
  calculateSeverityFromConfidence(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.6) return 'moderate';
    return 'low';
  }

  /**
   * Get scientific basis for domain
   */
  getScientificBasis(domain) {
    const basis = {
      'cognitive': 'מבוסס על תיאוריית העומס הקוגניטיבי (Sweller) ומודל עיבוד המידע',
      'emotional': 'מבוסס על מודל CASEL לאינטליגנציה רגשית-חברתית ותיאוריית ההתקשרות',
      'motivation': 'מבוסס על תיאוריית הזרימה (Flow) של Csikszentmihalyi ומודל SDT',
      'environmental': 'מבוסס על עקרונות ה-UDL (Universal Design for Learning)',
      'social': 'מבוסס על תיאוריית הלמידה החברתית של Bandura'
    };
    return basis[domain] || 'מבוסס על מחקרים פדגוגיים עדכניים';
  }

  /**
   * Get Israeli context for domain
   */
  getIsraeliContext(domain) {
    const context = {
      'cognitive': 'מותאם לדרישות החשיבה מסדר גבוה בבחינות הבגרות',
      'emotional': 'בהתאם לתכנית כישורי חיים ותכנית מיטיבה של משרד החינוך',
      'motivation': 'בהתאם לעקרונות הפדגוגיה החדשנית במערכת החינוך הישראלית',
      'environmental': 'תואם את מדיניות השילוב והכלה של משרד החינוך הישראלי',
      'social': 'בהתאם לתכנית החברתית-רגשית במערכת החינוך'
    };
    return context[domain] || 'מותאם לתכנית הלימודים הישראלית';
  }

  /**
   * Create profile from AI insights filtered by domain
   */
  createProfileFromAIData(insights, domain, studentData) {
    const relevantInsights = insights.filter(i => i.domain === domain);

    if (relevantInsights.length === 0) {
      return this.getDefaultProfile(domain, studentData);
    }

    const profile = {};
    relevantInsights.forEach(insight => {
      if (insight.evidence && insight.evidence.patterns) {
        insight.evidence.patterns.forEach((pattern, idx) => {
          profile[`תובנה ${idx + 1}`] = pattern;
        });
      }
    });

    return Object.keys(profile).length > 0 ? profile : this.getDefaultProfile(domain, studentData);
  }

  /**
   * Get default profile if no AI data
   */
  getDefaultProfile(domain, studentData) {
    if (domain === 'cognitive') return this.analyzeAcademicProfile(studentData);
    if (domain === 'emotional') return this.analyzeSocialEmotional(studentData);
    return this.analyzeLearningStyle(studentData);
  }

  /**
   * Create intervention plan from AI recommendations
   */
  createInterventionPlanFromAI(insights, developmentalNeeds) {
    const allRecommendations = insights.flatMap(i => i.recommendations || []);

    const immediateActions = allRecommendations
      .filter(r => r.priority === 'high' || r.priority === 'critical')
      .map(r => r.action || r.text);

    const shortTermGoals = allRecommendations
      .filter(r => r.priority === 'medium')
      .map(r => r.action || r.text);

    const longTermGoals = allRecommendations
      .filter(r => r.priority === 'low')
      .map(r => r.action || r.text);

    return {
      immediateActions: immediateActions.slice(0, 5),
      shortTermGoals: shortTermGoals.slice(0, 5),
      longTermGoals: longTermGoals.slice(0, 5),
      supportTeam: ['מורה הכיתה', 'יועץ/ת', 'הורים', 'צוות חינוך מיוחד'],
      monitoringSchedule: {
        daily: ['מעקב מעורבות'],
        weekly: ['סקירת התקדמות'],
        monthly: ['הערכה מקיפה']
      },
      successMetrics: this.extractSuccessMetrics(allRecommendations)
    };
  }

  /**
   * Extract success metrics from recommendations
   */
  extractSuccessMetrics(recommendations) {
    const metrics = {};
    recommendations.forEach(rec => {
      if (rec.follow_up_metric) {
        metrics[rec.category || 'כללי'] = rec.follow_up_metric;
      }
    });
    return Object.keys(metrics).length > 0 ? metrics : {
      academic: 'שיפור של 10% בציונים',
      behavioral: 'הפחתת אתגרים ב-50%',
      social: 'שיפור ביחסים עם עמיתים',
      emotional: 'ויסות עצמי טוב יותר'
    };
  }

  /**
   * Generate at least 6 key insights from student data
   */
  generateInsights(studentData) {
    const insights = [];

    // 1. Learning Style Insight
    insights.push({
      id: 'learning_style',
      category: 'סגנון למידה',
      title: 'פרופיל סגנון הלמידה המועדף',
      description: this.analyzeLearningPreferences(studentData),
      severity: this.calculateSeverity(studentData.learningStyle),
      scientificBasis: 'מבוסס על תיאוריית האינטליגנציות המרובות של גרדנר (Gardner, 1983) ומודל VARK של Fleming',
      israeliContext: 'מותאם לתכנית הלימודים הישראלית ודרישות משרד החינוך',
      dataPoints: this.extractLearningDataPoints(studentData)
    });

    // 2. Academic Strengths Insight
    insights.push({
      id: 'academic_strengths',
      category: 'חוזקות אקדמיות',
      title: 'תחומי חוזק אקדמיים מובהקים',
      description: this.analyzeAcademicStrengths(studentData),
      severity: 'positive',
      scientificBasis: 'מבוסס על תיאוריית המוטיבציה הפנימית (Deci & Ryan, 2000) ומחקרי Mindset של Dweck',
      israeliContext: 'בהתאם למיומנויות המאה ה-21 כפי שהוגדרו במסמך משרד החינוך',
      dataPoints: this.extractStrengthDataPoints(studentData)
    });

    // 3. Challenge Areas Insight
    insights.push({
      id: 'challenge_areas',
      category: 'אתגרים להתמודדות',
      title: 'תחומים הדורשים תמיכה ממוקדת',
      description: this.analyzeChallenges(studentData),
      severity: this.calculateChallengeSeverity(studentData),
      scientificBasis: 'מבוסס על מודל RTI (Response to Intervention) ועקרונות ה-UDL',
      israeliContext: 'תואם את מדיניות השילוב והכלה של משרד החינוך הישראלי',
      dataPoints: this.extractChallengeDataPoints(studentData)
    });

    // 4. Social-Emotional Development
    insights.push({
      id: 'social_emotional',
      category: 'התפתחות חברתית-רגשית',
      title: 'פרופיל חברתי-רגשי והתפתחותי',
      description: this.analyzeSocialEmotionalDevelopment(studentData),
      severity: 'moderate',
      scientificBasis: 'מבוסס על מודל CASEL לאינטליגנציה רגשית-חברתית ותיאוריית ההתקשרות',
      israeliContext: 'בהתאם לתכנית כישורי חיים ותכנית מיטיבה של משרד החינוך',
      dataPoints: this.extractSocialEmotionalDataPoints(studentData)
    });

    // 5. Cognitive Processing Pattern
    insights.push({
      id: 'cognitive_processing',
      category: 'דפוסי עיבוד קוגניטיבי',
      title: 'אופן עיבוד מידע ופתרון בעיות',
      description: this.analyzeCognitiveProcessing(studentData),
      severity: 'neutral',
      scientificBasis: 'מבוסס על תיאוריית העומס הקוגניטיבי (Sweller) ומודל עיבוד המידע',
      israeliContext: 'מותאם לדרישות החשיבה מסדר גבוה בבחינות הבגרות',
      dataPoints: this.extractCognitiveDataPoints(studentData)
    });

    // 6. Motivation and Engagement
    insights.push({
      id: 'motivation_engagement',
      category: 'מוטיבציה ומעורבות',
      title: 'רמת מוטיבציה ומעורבות בלמידה',
      description: this.analyzeMotivation(studentData),
      severity: this.calculateMotivationLevel(studentData),
      scientificBasis: 'מבוסס על תיאוריית הזרימה (Flow) של Csikszentmihalyi ומודל SDT',
      israeliContext: 'בהתאם לעקרונות הפדגוגיה החדשנית במערכת החינוך הישראלית',
      dataPoints: this.extractMotivationDataPoints(studentData)
    });

    // 7. Future Readiness (Additional insight)
    if (studentData.grade >= 10) {
      insights.push({
        id: 'future_readiness',
        category: 'מוכנות לעתיד',
        title: 'מוכנות לבגרות ולימודים גבוהים',
        description: this.analyzeFutureReadiness(studentData),
        severity: 'important',
        scientificBasis: 'מבוסס על מחקרי מוכנות אקדמית ומיומנויות המאה ה-21',
        israeliContext: 'בהתאם לרפורמה בבחינות הבגרות ודרישות הפסיכומטרי',
        dataPoints: this.extractFutureReadinessDataPoints(studentData)
      });
    }

    return insights;
  }

  /**
   * Generate 3-6 actionable recommendations for each insight
   */
  generateRecommendations(insights, studentData) {
    const allRecommendations = [];

    insights.forEach(insight => {
      const recommendations = [];

      switch(insight.id) {
        case 'learning_style':
          recommendations.push(...this.getLearningStyleRecommendations(studentData));
          break;
        case 'academic_strengths':
          recommendations.push(...this.getStrengthRecommendations(studentData));
          break;
        case 'challenge_areas':
          recommendations.push(...this.getChallengeRecommendations(studentData));
          break;
        case 'social_emotional':
          recommendations.push(...this.getSocialEmotionalRecommendations(studentData));
          break;
        case 'cognitive_processing':
          recommendations.push(...this.getCognitiveRecommendations(studentData));
          break;
        case 'motivation_engagement':
          recommendations.push(...this.getMotivationRecommendations(studentData));
          break;
        case 'future_readiness':
          recommendations.push(...this.getFutureReadinessRecommendations(studentData));
          break;
      }

      allRecommendations.push({
        insightId: insight.id,
        category: insight.category,
        recommendations: recommendations.slice(0, 6) // Ensure 3-6 recommendations
      });
    });

    return allRecommendations;
  }

  // Learning Style Recommendations
  getLearningStyleRecommendations(studentData) {
    const recommendations = [];
    const style = studentData.learningStyle || 'mixed';

    if (style.includes('חזותי') || style.includes('visual')) {
      recommendations.push({
        text: 'שימוש במפות מושגים ודיאגרמות להמחשת קשרים בין נושאים',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['MindMeister', 'Canva', 'Draw.io'],
        expectedOutcome: 'שיפור של 20-30% בהבנת החומר המורכב'
      });
      recommendations.push({
        text: 'יצירת כרטיסיות למידה צבעוניות עם איורים וסמלים',
        priority: 'medium',
        implementation: 'תוך שבוע',
        tools: ['Anki', 'Quizlet'],
        expectedOutcome: 'שיפור בזכירה לטווח ארוך'
      });
      recommendations.push({
        text: 'צפייה בסרטוני הסבר ואנימציות לימודיות',
        priority: 'medium',
        implementation: 'שוטף',
        tools: ['Khan Academy', 'מרחב פדגוגי'],
        expectedOutcome: 'הבנה מעמיקה של תהליכים מורכבים'
      });
    }

    if (style.includes('שמיעתי') || style.includes('auditory')) {
      recommendations.push({
        text: 'הקלטת שיעורים וחזרה על החומר בהאזנה',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['Otter.ai', 'מקליט קול'],
        expectedOutcome: 'שיפור בקליטת מידע בשיעורים'
      });
      recommendations.push({
        text: 'השתתפות בקבוצות דיון ולמידה קולית',
        priority: 'high',
        implementation: 'שבועי',
        tools: ['Discord', 'Zoom'],
        expectedOutcome: 'העמקת הבנה דרך דיאלוג'
      });
      recommendations.push({
        text: 'יצירת שירים או חרוזים לזכירת מידע',
        priority: 'low',
        implementation: 'לפי הצורך',
        tools: ['מחולל חרוזים'],
        expectedOutcome: 'שיפור בזכירת עובדות ונוסחאות'
      });
    }

    if (style.includes('קינסתטי') || style.includes('kinesthetic')) {
      recommendations.push({
        text: 'שילוב תנועה בזמן למידה - הליכה או עמידה',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['שולחן עמידה', 'כדור ישיבה'],
        expectedOutcome: 'שיפור בריכוז ובקשב'
      });
      recommendations.push({
        text: 'ביצוע ניסויים מעשיים וסימולציות',
        priority: 'high',
        implementation: 'שבועי',
        tools: ['PhET', 'מעבדות וירטואליות'],
        expectedOutcome: 'הבנה מעמיקה דרך התנסות'
      });
      recommendations.push({
        text: 'שימוש בחומרי למידה מוחשיים ומודלים תלת-מימדיים',
        priority: 'medium',
        implementation: 'חודשי',
        tools: ['מודלים פיזיים', 'הדפסת תלת-מימד'],
        expectedOutcome: 'שיפור בהבנה מרחבית'
      });
    }

    // Add general recommendations
    recommendations.push({
      text: 'יצירת סביבת למידה מותאמת אישית עם גירויים מתאימים',
      priority: 'high',
      implementation: 'מיידי',
      tools: ['ארגון חדר', 'תאורה מתאימה'],
      expectedOutcome: 'שיפור כללי בתנאי הלמידה'
    });
    recommendations.push({
      text: 'פיתוח מערכת ניהול זמן מותאמת לסגנון האישי',
      priority: 'medium',
      implementation: 'תוך שבועיים',
      tools: ['Google Calendar', 'Notion'],
      expectedOutcome: 'שיפור ביעילות הלמידה'
    });

    return recommendations;
  }

  // Academic Strength Recommendations
  getStrengthRecommendations(studentData) {
    return [
      {
        text: 'הרחבת הלמידה בתחומי החוזק דרך פרויקטים מתקדמים',
        priority: 'high',
        implementation: 'חודשי',
        tools: ['GitHub', 'Google Workspace'],
        expectedOutcome: 'פיתוח מומחיות ובידול אקדמי'
      },
      {
        text: 'חניכת תלמידים צעירים בתחומי החוזק',
        priority: 'medium',
        implementation: 'דו-שבועי',
        tools: ['מערכת חונכות בית ספרית'],
        expectedOutcome: 'חיזוק הביטחון העצמי והעמקת הידע'
      },
      {
        text: 'השתתפות בתחרויות ואולימפיאדות בתחומי החוזק',
        priority: 'high',
        implementation: 'לפי לוח תחרויות',
        tools: ['אתרי תחרויות', 'מועדוני מצוינות'],
        expectedOutcome: 'אתגר אינטלקטואלי ופיתוח כישורים'
      },
      {
        text: 'יצירת פורטפוליו דיגיטלי להצגת הישגים',
        priority: 'medium',
        implementation: 'תוך חודש',
        tools: ['Wix', 'WordPress', 'Behance'],
        expectedOutcome: 'הכנה לקבלה ללימודים גבוהים'
      },
      {
        text: 'חיבור לקהילות מקצועיות בתחומי העניין',
        priority: 'low',
        implementation: 'מיידי',
        tools: ['LinkedIn', 'פורומים מקצועיים'],
        expectedOutcome: 'הרחבת אופקים ויצירת קשרים'
      }
    ];
  }

  // Challenge Area Recommendations
  getChallengeRecommendations(studentData) {
    return [
      {
        text: 'תכנית התערבות ממוקדת עם יעדים מדידים',
        priority: 'critical',
        implementation: 'מיידי',
        tools: ['תכנית אישית', 'מעקב שבועי'],
        expectedOutcome: 'שיפור של 30% תוך רבעון'
      },
      {
        text: 'שיעורי תגבור פרטניים או קבוצתיים קטנים',
        priority: 'high',
        implementation: 'פעמיים בשבוע',
        tools: ['Zoom', 'ClassIn'],
        expectedOutcome: 'סגירת פערים תוך 3 חודשים'
      },
      {
        text: 'שימוש בכלי למידה מסייעים וטכנולוגיה תומכת',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['Read&Write', 'מחשבון גרפי'],
        expectedOutcome: 'הקלה בהתמודדות עם קשיים'
      },
      {
        text: 'פיתוח אסטרטגיות למידה ספציפיות לכל אתגר',
        priority: 'medium',
        implementation: 'תוך שבועיים',
        tools: ['טכניקות זיכרון', 'מפות חשיבה'],
        expectedOutcome: 'שיפור ביכולת ההתמודדות העצמאית'
      },
      {
        text: 'תיאום ציפיות והתאמות עם צוות ההוראה',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['תיק התאמות', 'ישיבות צוות'],
        expectedOutcome: 'יצירת סביבה תומכת'
      },
      {
        text: 'בניית תכנית חיזוקים ומוטיבציה',
        priority: 'medium',
        implementation: 'שבועי',
        tools: ['מערכת נקודות', 'יעדים אישיים'],
        expectedOutcome: 'שיפור במוטיבציה להתמודד עם קשיים'
      }
    ];
  }

  // Social-Emotional Recommendations
  getSocialEmotionalRecommendations(studentData) {
    return [
      {
        text: 'השתתפות בסדנאות כישורים חברתיים',
        priority: 'high',
        implementation: 'שבועי',
        tools: ['קבוצות כישורי חיים'],
        expectedOutcome: 'שיפור ביחסים בין-אישיים'
      },
      {
        text: 'פיתוח מיומנויות ויסות רגשי',
        priority: 'high',
        implementation: 'מיידי',
        tools: ['Mindfulness', 'נשימות'],
        expectedOutcome: 'שיפור בניהול רגשות'
      },
      {
        text: 'יצירת מעגלי תמיכה חברתיים',
        priority: 'medium',
        implementation: 'חודשי',
        tools: ['קבוצות עמיתים'],
        expectedOutcome: 'תחושת שייכות מוגברת'
      },
      {
        text: 'תרגול מיומנויות תקשורת אסרטיבית',
        priority: 'medium',
        implementation: 'דו-שבועי',
        tools: ['משחקי תפקידים'],
        expectedOutcome: 'שיפור בביטוי עצמי'
      },
      {
        text: 'פעילויות לבניית חוסן נפשי',
        priority: 'low',
        implementation: 'שוטף',
        tools: ['ספורט', 'אומנות'],
        expectedOutcome: 'חיזוק החוסן הנפשי'
      }
    ];
  }

  // Cognitive Processing Recommendations
  getCognitiveRecommendations(studentData) {
    return [
      {
        text: 'תרגול טכניקות לשיפור זיכרון עבודה',
        priority: 'high',
        implementation: 'יומי',
        tools: ['Lumosity', 'CogniFit'],
        expectedOutcome: 'שיפור בעיבוד מידע'
      },
      {
        text: 'פיתוח מיומנויות חשיבה מסדר גבוה',
        priority: 'high',
        implementation: 'שבועי',
        tools: ['פתרון בעיות', 'חשיבה ביקורתית'],
        expectedOutcome: 'שיפור ביכולות אנליטיות'
      },
      {
        text: 'אימון בניהול עומס קוגניטיבי',
        priority: 'medium',
        implementation: 'מיידי',
        tools: ['חלוקת משימות', 'Pomodoro'],
        expectedOutcome: 'יעילות מוגברת בלמידה'
      },
      {
        text: 'תרגול מעבר בין סגנונות חשיבה',
        priority: 'low',
        implementation: 'חודשי',
        tools: ['Six Thinking Hats'],
        expectedOutcome: 'גמישות מחשבתית'
      }
    ];
  }

  // Motivation Recommendations
  getMotivationRecommendations(studentData) {
    return [
      {
        text: 'הצבת יעדים אישיים מאתגרים אך ברי-השגה',
        priority: 'high',
        implementation: 'שבועי',
        tools: ['SMART Goals', 'Trello'],
        expectedOutcome: 'עלייה במוטיבציה פנימית'
      },
      {
        text: 'יצירת מערכת תגמולים אישית',
        priority: 'medium',
        implementation: 'מיידי',
        tools: ['Habitica', 'ClassDojo'],
        expectedOutcome: 'חיזוק הרגלי למידה'
      },
      {
        text: 'חיבור הלמידה לתחומי עניין אישיים',
        priority: 'high',
        implementation: 'שוטף',
        tools: ['פרויקטים אישיים'],
        expectedOutcome: 'משמעות ורלוונטיות מוגברת'
      },
      {
        text: 'יצירת קבוצת למידה תומכת',
        priority: 'medium',
        implementation: 'שבועי',
        tools: ['Study Groups', 'Discord'],
        expectedOutcome: 'מוטיבציה חברתית'
      },
      {
        text: 'חשיפה להשראה ומודלים לחיקוי',
        priority: 'low',
        implementation: 'חודשי',
        tools: ['TED Talks', 'מנטורים'],
        expectedOutcome: 'השראה והנעה לפעולה'
      }
    ];
  }

  // Future Readiness Recommendations
  getFutureReadinessRecommendations(studentData) {
    return [
      {
        text: 'הכנה ממוקדת לבחינות בגרות',
        priority: 'critical',
        implementation: 'מיידי',
        tools: ['מרתונים', 'בגרויות קודמות'],
        expectedOutcome: 'ציונים משופרים בבגרות'
      },
      {
        text: 'פיתוח מיומנויות למידה עצמאית',
        priority: 'high',
        implementation: 'שוטף',
        tools: ['Coursera', 'edX'],
        expectedOutcome: 'מוכנות ללימודים אקדמיים'
      },
      {
        text: 'הכנה לפסיכומטרי',
        priority: 'high',
        implementation: 'שנה לפני',
        tools: ['קורסים', 'סימולציות'],
        expectedOutcome: 'ציון פסיכומטרי גבוה'
      },
      {
        text: 'חקר מסלולי לימוד וקריירה',
        priority: 'medium',
        implementation: 'סמסטריאלי',
        tools: ['ימי פתוחים', 'ייעוץ'],
        expectedOutcome: 'בחירה מושכלת של מסלול'
      },
      {
        text: 'פיתוח כישורים רכים',
        priority: 'medium',
        implementation: 'שוטף',
        tools: ['מנהיגות', 'עבודת צוות'],
        expectedOutcome: 'מוכנות לשוק העבודה'
      }
    ];
  }

  // Analysis Helper Methods
  analyzeLearningPreferences(studentData) {
    const style = studentData.learningStyle || 'לא זוהה';
    const analysis = `התלמיד/ה מגלה העדפה ברורה לסגנון למידה ${style}. `;

    if (style.includes('חזותי')) {
      return analysis + 'נטייה חזקה ללמידה באמצעות גירויים חזותיים, תרשימים ודימויים. יכולת מצוינת לזכור מידע שמוצג באופן ויזואלי.';
    } else if (style.includes('שמיעתי')) {
      return analysis + 'למידה אופטימלית דרך הקשבה, דיונים והסברים מילוליים. זיכרון חזק למידע שנשמע.';
    } else if (style.includes('קינסתטי')) {
      return analysis + 'צורך בהתנסות מעשית ותנועה פיזית ללמידה אפקטיבית. למידה מיטבית דרך עשייה והתנסות.';
    }
    return analysis + 'מומלץ לבצע אבחון מעמיק יותר לזיהוי סגנון הלמידה המועדף.';
  }

  analyzeAcademicStrengths(studentData) {
    const strengths = studentData.strengths || '';
    const count = studentData.strengthsCount || 0;

    if (count > 5) {
      return `התלמיד/ה מפגין/ה חוזקות אקדמיות מרשימות במגוון תחומים (${count} תחומי חוזק). יכולות גבוהות במיוחד ופוטנציאל למצוינות אקדמית. ${strengths}`;
    } else if (count > 2) {
      return `נמצאו ${count} תחומי חוזק משמעותיים המעידים על יכולות אקדמיות טובות. ${strengths}`;
    }
    return 'יש לזהות ולטפח חוזקות אקדמיות. מומלץ להתמקד בגילוי כישרונות חבויים.';
  }

  analyzeChallenges(studentData) {
    const challenges = studentData.challenges || '';
    const count = studentData.challengesCount || 0;

    if (count > 5) {
      return `זוהו ${count} אתגרים משמעותיים הדורשים התערבות מיידית ומקיפה. ${challenges}`;
    } else if (count > 2) {
      return `נמצאו ${count} תחומים הדורשים תמיכה ממוקדת. ${challenges}`;
    }
    return 'אתגרים מינוריים שניתן להתמודד איתם באמצעות תמיכה נקודתית.';
  }

  analyzeSocialEmotionalDevelopment(studentData) {
    const keyNotes = studentData.keyNotes || '';

    if (keyNotes.includes('חברתי') || keyNotes.includes('רגש')) {
      return 'התלמיד/ה מגלה מודעות חברתית-רגשית. ' + keyNotes;
    }
    return 'נדרשת הערכה מעמיקה יותר של ההיבטים החברתיים-רגשיים. חשוב לפתח כישורי חיים ואינטליגנציה רגשית.';
  }

  analyzeCognitiveProcessing(studentData) {
    const analysis = studentData.analysis || '';

    return 'פרופיל קוגניטיבי מגוון עם יכולות עיבוד מידע ברמות שונות. ' +
           'חשוב להתאים את קצב וסגנון ההוראה ליכולות העיבוד האישיות.';
  }

  analyzeMotivation(studentData) {
    if (studentData.needsAnalysis) {
      return 'רמת מוטיבציה משתנה. נדרשת עבודה על הגברת המוטיבציה הפנימית ויצירת חוויות הצלחה.';
    }
    return 'מוטיבציה טובה ללמידה. חשוב לשמור על רמת האתגר המתאימה למניעת שעמום או תסכול.';
  }

  analyzeFutureReadiness(studentData) {
    const grade = studentData.grade || 10;

    if (grade >= 11) {
      return 'בשלב קריטי של הכנה לבגרות ומעבר ללימודים גבוהים. נדרשת התמקדות בהכנה לבחינות ופיתוח מיומנויות למידה עצמאית.';
    }
    return 'תקופה חשובה לבניית בסיס אקדמי חזק. מומלץ להתחיל בחשיפה הדרגתית לדרישות הבגרות.';
  }

  // Helper methods for data extraction
  extractLearningDataPoints(studentData) {
    return {
      preferredStyle: studentData.learningStyle || 'unknown',
      strengthInVisual: this.assessVisualStrength(studentData),
      strengthInAuditory: this.assessAuditoryStrength(studentData),
      strengthInKinesthetic: this.assessKinestheticStrength(studentData)
    };
  }

  extractStrengthDataPoints(studentData) {
    return {
      count: studentData.strengthsCount || 0,
      areas: studentData.strengths || '',
      percentile: this.calculatePercentile(studentData)
    };
  }

  extractChallengeDataPoints(studentData) {
    return {
      count: studentData.challengesCount || 0,
      areas: studentData.challenges || '',
      severity: this.calculateChallengeSeverity(studentData)
    };
  }

  extractSocialEmotionalDataPoints(studentData) {
    return {
      socialSkills: this.assessSocialSkills(studentData),
      emotionalRegulation: this.assessEmotionalRegulation(studentData),
      peerRelations: this.assessPeerRelations(studentData)
    };
  }

  extractCognitiveDataPoints(studentData) {
    return {
      processingSpeed: 'average',
      workingMemory: 'average',
      executiveFunction: 'developing'
    };
  }

  extractMotivationDataPoints(studentData) {
    return {
      intrinsicMotivation: this.assessIntrinsicMotivation(studentData),
      extrinsicMotivation: 'moderate',
      engagementLevel: this.assessEngagement(studentData)
    };
  }

  extractFutureReadinessDataPoints(studentData) {
    return {
      academicReadiness: this.assessAcademicReadiness(studentData),
      careerAwareness: 'developing',
      selfDirectedLearning: this.assessSelfDirectedLearning(studentData)
    };
  }

  // Assessment methods
  assessVisualStrength(studentData) {
    const style = studentData.learningStyle || '';
    return style.includes('חזותי') ? 'high' : 'moderate';
  }

  assessAuditoryStrength(studentData) {
    const style = studentData.learningStyle || '';
    return style.includes('שמיעתי') ? 'high' : 'moderate';
  }

  assessKinestheticStrength(studentData) {
    const style = studentData.learningStyle || '';
    return style.includes('קינסתטי') ? 'high' : 'moderate';
  }

  assessSocialSkills(studentData) {
    const notes = studentData.keyNotes || '';
    if (notes.includes('חברתי') && notes.includes('חיובי')) return 'strong';
    if (notes.includes('קושי') && notes.includes('חברתי')) return 'developing';
    return 'moderate';
  }

  assessEmotionalRegulation(studentData) {
    const notes = studentData.keyNotes || '';
    if (notes.includes('רגש') && notes.includes('ויסות')) return 'strong';
    if (notes.includes('קושי') && notes.includes('רגש')) return 'developing';
    return 'moderate';
  }

  assessPeerRelations(studentData) {
    return 'moderate'; // Default assessment
  }

  assessIntrinsicMotivation(studentData) {
    return studentData.needsAnalysis ? 'developing' : 'strong';
  }

  assessEngagement(studentData) {
    return studentData.strengthsCount > 3 ? 'high' : 'moderate';
  }

  assessAcademicReadiness(studentData) {
    const grade = studentData.grade || 10;
    const strengths = studentData.strengthsCount || 0;

    if (grade >= 11 && strengths > 3) return 'high';
    if (grade >= 10 && strengths > 2) return 'moderate';
    return 'developing';
  }

  assessSelfDirectedLearning(studentData) {
    return studentData.learningStyle ? 'developing' : 'emerging';
  }

  // Severity calculations
  calculateSeverity(data) {
    if (!data) return 'unknown';
    return 'moderate';
  }

  calculateChallengeSeverity(studentData) {
    const count = studentData.challengesCount || 0;
    if (count > 5) return 'high';
    if (count > 2) return 'moderate';
    return 'low';
  }

  calculateMotivationLevel(studentData) {
    return studentData.needsAnalysis ? 'moderate' : 'high';
  }

  calculatePercentile(studentData) {
    const strengths = studentData.strengthsCount || 0;
    if (strengths > 5) return 90;
    if (strengths > 3) return 70;
    if (strengths > 1) return 50;
    return 30;
  }

  // Profile Analysis Methods
  analyzeAcademicProfile(studentData) {
    return {
      overallPerformance: this.calculateOverallPerformance(studentData),
      subjectStrengths: this.identifySubjectStrengths(studentData),
      subjectChallenges: this.identifySubjectChallenges(studentData),
      learningGaps: this.identifyLearningGaps(studentData),
      progressTrajectory: this.calculateProgressTrajectory(studentData)
    };
  }

  analyzeSocialEmotional(studentData) {
    return {
      emotionalIntelligence: this.assessEmotionalIntelligence(studentData),
      socialCompetence: this.assessSocialCompetence(studentData),
      selfAwareness: this.assessSelfAwareness(studentData),
      relationshipSkills: this.assessRelationshipSkills(studentData),
      responsibleDecisionMaking: this.assessDecisionMaking(studentData)
    };
  }

  analyzeLearningStyle(studentData) {
    return {
      primaryStyle: studentData.learningStyle || 'mixed',
      secondaryStyle: this.identifySecondaryStyle(studentData),
      preferredModalities: this.identifyPreferredModalities(studentData),
      optimalConditions: this.identifyOptimalConditions(studentData),
      challengingConditions: this.identifyChallengingConditions(studentData)
    };
  }

  identifyDevelopmentalNeeds(studentData) {
    const needs = [];

    if (studentData.challengesCount > 3) {
      needs.push({
        area: 'Academic Support',
        priority: 'high',
        description: 'תמיכה אקדמית אינטנסיבית נדרשת'
      });
    }

    if (!studentData.learningStyle) {
      needs.push({
        area: 'Learning Style Assessment',
        priority: 'medium',
        description: 'נדרש אבחון סגנון למידה'
      });
    }

    needs.push({
      area: 'Social-Emotional Development',
      priority: 'medium',
      description: 'פיתוח כישורים חברתיים-רגשיים'
    });

    return needs;
  }

  createInterventionPlan(analysis) {
    return {
      immediateActions: this.defineImmediateActions(analysis),
      shortTermGoals: this.defineShortTermGoals(analysis),
      longTermGoals: this.defineLongTermGoals(analysis),
      supportTeam: this.defineSupportTeam(analysis),
      monitoringSchedule: this.defineMonitoringSchedule(analysis),
      successMetrics: this.defineSuccessMetrics(analysis)
    };
  }

  // Additional helper methods for profile analysis
  calculateOverallPerformance(studentData) {
    const strengths = studentData.strengthsCount || 0;
    const challenges = studentData.challengesCount || 0;
    const ratio = strengths / (challenges + 1); // Avoid division by zero

    if (ratio > 2) return 'מצוין';
    if (ratio > 1) return 'טוב';
    if (ratio > 0.5) return 'סביר';
    return 'דורש שיפור';
  }

  identifySubjectStrengths(studentData) {
    // Parse strengths to identify specific subjects
    const strengths = studentData.strengths || '';
    const subjects = [];

    if (strengths.includes('מתמטיקה')) subjects.push('מתמטיקה');
    if (strengths.includes('שפה') || strengths.includes('עברית')) subjects.push('אומנויות השפה');
    if (strengths.includes('מדע')) subjects.push('מדעים');
    if (strengths.includes('היסטוריה')) subjects.push('היסטוריה');

    return subjects.length > 0 ? subjects : ['לא זוהו'];
  }

  identifySubjectChallenges(studentData) {
    const challenges = studentData.challenges || '';
    const subjects = [];

    if (challenges.includes('מתמטיקה')) subjects.push('מתמטיקה');
    if (challenges.includes('קריאה') || challenges.includes('כתיבה')) subjects.push('אומנויות השפה');
    if (challenges.includes('מדע')) subjects.push('מדעים');

    return subjects.length > 0 ? subjects : ['לא זוהו'];
  }

  identifyLearningGaps(studentData) {
    return ['כישורי יסוד', 'חשיבה ביקורתית', 'כישורי יישום'];
  }

  calculateProgressTrajectory(studentData) {
    return studentData.needsAnalysis ? 'דורש האצה' : 'על המסלול';
  }

  assessEmotionalIntelligence(studentData) {
    return 'מתפתח';
  }

  assessSocialCompetence(studentData) {
    return 'בינוני';
  }

  assessSelfAwareness(studentData) {
    return 'מתעורר';
  }

  assessRelationshipSkills(studentData) {
    return 'מתפתח';
  }

  assessDecisionMaking(studentData) {
    return 'מתפתח';
  }

  identifySecondaryStyle(studentData) {
    return 'מעורב';
  }

  identifyPreferredModalities(studentData) {
    return ['חזותי', 'אינטראקטיבי'];
  }

  identifyOptimalConditions(studentData) {
    return ['סביבה שקטה', 'משימות מובנות', 'הוראות ברורות'];
  }

  identifyChallengingConditions(studentData) {
    return ['רעש', 'לחץ זמן', 'הוראות מעורפלות'];
  }

  defineImmediateActions(analysis) {
    return analysis.insights.filter(i => i.severity === 'critical' || i.severity === 'high')
      .map(i => ({
        action: `Address ${i.category}`,
        timeline: 'Within 1 week'
      }));
  }

  defineShortTermGoals(analysis) {
    return ['Improve engagement', 'Address primary challenges', 'Strengthen core skills'];
  }

  defineLongTermGoals(analysis) {
    return ['Academic excellence', 'Social-emotional development', 'Future readiness'];
  }

  defineSupportTeam(analysis) {
    return ['Class teacher', 'School counselor', 'Parents', 'Special education staff'];
  }

  defineMonitoringSchedule(analysis) {
    return {
      daily: ['Engagement tracking'],
      weekly: ['Progress review'],
      monthly: ['Comprehensive assessment'],
      quarterly: ['Full evaluation']
    };
  }

  defineSuccessMetrics(analysis) {
    return {
      academic: 'Grade improvement by 10%',
      behavioral: 'Reduced challenges by 50%',
      social: 'Improved peer relationships',
      emotional: 'Better self-regulation'
    };
  }
}

export default new EnhancedAnalysisService();