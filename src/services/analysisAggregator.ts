/**
 * Analysis Data Aggregator Service
 * Processes student analysis data to generate meaningful insights for charts
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
}

interface AggregatedAnalysis {
  // Core Statistics
  totalStudents: number;
  analyzedStudents: number;
  unanalyzedStudents: number;
  analysisCompletionRate: number;

  // Learning Styles Distribution
  learningStyles: Record<string, number>;
  learningStylePercentages: Record<string, number>;

  // Class Distribution
  classSizes: Record<string, number>;
  classPerformance: Record<string, { average: number; trend: string }>;

  // Emotional States
  emotionalStates: Record<string, number>;
  emotionalHealth: { positive: number; neutral: number; concerning: number };

  // Academic Performance
  performanceDistribution: { excellent: number; good: number; average: number; needsSupport: number };
  averageGrade: number;
  gradeDistribution: Record<string, number>;
  performanceTrends: { improving: number; stable: number; declining: number };

  // Strengths & Challenges
  topStrengths: Array<{ strength: string; count: number; percentage: number }>;
  commonChallenges: Array<{ challenge: string; count: number; percentage: number }>;
  strengthsDistribution: Record<number, number>; // Number of strengths -> count of students

  // Behavioral Insights
  behavioralPatterns: Record<string, number>;
  participationLevels: { high: number; medium: number; low: number };
  collaborationDistribution: Record<string, number>;

  // Risk Assessment
  riskDistribution: { low: number; medium: number; high: number };
  studentsAtRisk: Array<{ code: string; name: string; riskFactors: string[] }>;

  // Intervention Effectiveness
  interventionTypes: Record<string, number>;
  interventionSuccess: Record<string, number>;

  // Time-based Analysis
  recentAnalyses: number; // Last 7 days
  monthlyAnalyses: number; // Last 30 days
  analysisFrequency: Record<string, number>; // By month

  // Advanced Metrics
  engagementScore: number;
  wellbeingIndex: number;
  academicReadiness: number;
  socialIntegration: number;

  // Comparative Analysis
  classComparisons: Array<{ class: string; metric: string; value: number }>;
  periodComparisons: Array<{ period: string; metric: string; value: number }>;
}

export class AnalysisAggregator {
  /**
   * Aggregate all student data into meaningful analysis insights
   */
  static aggregateStudentData(students: Student[]): AggregatedAnalysis {
    const analyzed = students.filter(s => !s.needsAnalysis && (s.strengthsCount ?? 0) > 0);
    const unanalyzed = students.filter(s => s.needsAnalysis || (s.strengthsCount ?? 0) === 0);

    return {
      // Core Statistics
      totalStudents: students.length,
      analyzedStudents: analyzed.length,
      unanalyzedStudents: unanalyzed.length,
      analysisCompletionRate: students.length > 0 ? (analyzed.length / students.length) * 100 : 0,

      // Learning Styles Distribution
      learningStyles: this.aggregateLearningStyles(analyzed),
      learningStylePercentages: this.calculatePercentages(this.aggregateLearningStyles(analyzed), analyzed.length),

      // Class Distribution
      classSizes: this.aggregateClassSizes(students),
      classPerformance: this.calculateClassPerformance(students),

      // Emotional States
      emotionalStates: this.aggregateEmotionalStates(analyzed),
      emotionalHealth: this.categorizeEmotionalHealth(analyzed),

      // Academic Performance
      performanceDistribution: this.calculatePerformanceDistribution(analyzed),
      averageGrade: this.calculateAverageGrade(analyzed),
      gradeDistribution: this.aggregateGradeDistribution(analyzed),
      performanceTrends: this.aggregatePerformanceTrends(analyzed),

      // Strengths & Challenges
      topStrengths: this.extractTopStrengths(analyzed),
      commonChallenges: this.extractCommonChallenges(analyzed),
      strengthsDistribution: this.aggregateStrengthsDistribution(analyzed),

      // Behavioral Insights
      behavioralPatterns: this.aggregateBehavioralPatterns(analyzed),
      participationLevels: this.aggregateParticipationLevels(analyzed),
      collaborationDistribution: this.aggregateCollaborationSkills(analyzed),

      // Risk Assessment
      riskDistribution: this.assessRiskDistribution(analyzed),
      studentsAtRisk: this.identifyStudentsAtRisk(analyzed),

      // Intervention Effectiveness
      interventionTypes: this.aggregateInterventionTypes(analyzed),
      interventionSuccess: this.calculateInterventionSuccess(analyzed),

      // Time-based Analysis
      recentAnalyses: this.countRecentAnalyses(analyzed, 7),
      monthlyAnalyses: this.countRecentAnalyses(analyzed, 30),
      analysisFrequency: this.calculateAnalysisFrequency(analyzed),

      // Advanced Metrics
      engagementScore: this.calculateEngagementScore(analyzed),
      wellbeingIndex: this.calculateWellbeingIndex(analyzed),
      academicReadiness: this.calculateAcademicReadiness(analyzed),
      socialIntegration: this.calculateSocialIntegration(analyzed),

      // Comparative Analysis
      classComparisons: this.generateClassComparisons(students),
      periodComparisons: this.generatePeriodComparisons(analyzed)
    };
  }

  /**
   * Aggregate learning styles from analyzed students
   */
  private static aggregateLearningStyles(students: Student[]): Record<string, number> {
    const styles: Record<string, number> = {};

    students.forEach(student => {
      if (student.learningStyle) {
        const style = student.learningStyle.toLowerCase();
        styles[style] = (styles[style] || 0) + 1;
      }
    });

    // Ensure we have all common learning styles
    const commonStyles = ['visual', 'auditory', 'kinesthetic', 'reading/writing'];
    commonStyles.forEach(style => {
      if (!styles[style]) styles[style] = 0;
    });

    return styles;
  }

  /**
   * Calculate percentages for any distribution
   */
  private static calculatePercentages(distribution: Record<string, number>, total: number): Record<string, number> {
    const percentages: Record<string, number> = {};

    if (total === 0) return percentages;

    Object.entries(distribution).forEach(([key, value]) => {
      percentages[key] = Math.round((value / total) * 100);
    });

    return percentages;
  }

  /**
   * Aggregate class sizes
   */
  private static aggregateClassSizes(students: Student[]): Record<string, number> {
    const classes: Record<string, number> = {};

    students.forEach(student => {
      const className = student.className || 'לא מוגדר';
      classes[className] = (classes[className] || 0) + 1;
    });

    return classes;
  }

  /**
   * Calculate performance metrics for each class
   */
  private static calculateClassPerformance(students: Student[]): Record<string, { average: number; trend: string }> {
    const performance: Record<string, { total: number; count: number; trends: string[] }> = {};

    students.forEach(student => {
      const className = student.className || 'לא מוגדר';
      if (!performance[className]) {
        performance[className] = { total: 0, count: 0, trends: [] };
      }

      if (student.grade) {
        performance[className].total += student.grade;
        performance[className].count += 1;
      }

      if (student.performanceTrend) {
        performance[className].trends.push(student.performanceTrend);
      }
    });

    const result: Record<string, { average: number; trend: string }> = {};

    Object.entries(performance).forEach(([className, data]) => {
      const average = data.count > 0 ? Math.round(data.total / data.count) : 0;

      // Determine overall trend
      const trendCounts = data.trends.reduce((acc, trend) => {
        acc[trend] = (acc[trend] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const dominantTrend = Object.entries(trendCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || 'stable';

      result[className] = { average, trend: dominantTrend };
    });

    return result;
  }

  /**
   * Aggregate emotional states
   */
  private static aggregateEmotionalStates(students: Student[]): Record<string, number> {
    const states: Record<string, number> = {};

    students.forEach(student => {
      if (student.emotionalState) {
        const state = student.emotionalState.toLowerCase();
        states[state] = (states[state] || 0) + 1;
      }
    });

    return states;
  }

  /**
   * Categorize emotional health
   */
  private static categorizeEmotionalHealth(students: Student[]): { positive: number; neutral: number; concerning: number } {
    const positiveStates = ['happy', 'confident', 'motivated', 'excited', 'שמח', 'בטוח', 'מוטיבציה'];
    const concerningStates = ['anxious', 'stressed', 'sad', 'frustrated', 'חרד', 'לחוץ', 'עצוב'];

    let positive = 0;
    let concerning = 0;
    let neutral = 0;

    students.forEach(student => {
      if (student.emotionalState) {
        const state = student.emotionalState.toLowerCase();
        if (positiveStates.some(s => state.includes(s))) {
          positive++;
        } else if (concerningStates.some(s => state.includes(s))) {
          concerning++;
        } else {
          neutral++;
        }
      }
    });

    return { positive, neutral, concerning };
  }

  /**
   * Calculate performance distribution
   */
  private static calculatePerformanceDistribution(students: Student[]): { excellent: number; good: number; average: number; needsSupport: number } {
    let excellent = 0;
    let good = 0;
    let average = 0;
    let needsSupport = 0;

    students.forEach(student => {
      const grade = student.grade || student.lastAssessment || 0;

      if (grade >= 90) excellent++;
      else if (grade >= 80) good++;
      else if (grade >= 70) average++;
      else needsSupport++;
    });

    return { excellent, good, average, needsSupport };
  }

  /**
   * Calculate average grade
   */
  private static calculateAverageGrade(students: Student[]): number {
    const grades = students
      .map(s => s.grade || s.lastAssessment || 0)
      .filter(g => g > 0);

    if (grades.length === 0) return 0;

    const sum = grades.reduce((acc, grade) => acc + grade, 0);
    return Math.round(sum / grades.length);
  }

  /**
   * Aggregate grade distribution
   */
  private static aggregateGradeDistribution(students: Student[]): Record<string, number> {
    const distribution: Record<string, number> = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      'Below 60': 0
    };

    students.forEach(student => {
      const grade = student.grade || student.lastAssessment || 0;

      if (grade >= 90) distribution['90-100']++;
      else if (grade >= 80) distribution['80-89']++;
      else if (grade >= 70) distribution['70-79']++;
      else if (grade >= 60) distribution['60-69']++;
      else if (grade > 0) distribution['Below 60']++;
    });

    return distribution;
  }

  /**
   * Aggregate performance trends
   */
  private static aggregatePerformanceTrends(students: Student[]): { improving: number; stable: number; declining: number } {
    let improving = 0;
    let stable = 0;
    let declining = 0;

    students.forEach(student => {
      switch (student.performanceTrend) {
        case 'improving': improving++; break;
        case 'declining': declining++; break;
        default: stable++; break;
      }
    });

    return { improving, stable, declining };
  }

  /**
   * Extract top strengths from all students
   */
  private static extractTopStrengths(students: Student[]): Array<{ strength: string; count: number; percentage: number }> {
    const strengthCounts: Record<string, number> = {};

    students.forEach(student => {
      if (student.keyStrengths) {
        student.keyStrengths.forEach(strength => {
          const normalizedStrength = strength.trim().toLowerCase();
          strengthCounts[normalizedStrength] = (strengthCounts[normalizedStrength] || 0) + 1;
        });
      }
    });

    return Object.entries(strengthCounts)
      .map(([strength, count]) => ({
        strength,
        count,
        percentage: Math.round((count / students.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 strengths
  }

  /**
   * Extract common challenges from all students
   */
  private static extractCommonChallenges(students: Student[]): Array<{ challenge: string; count: number; percentage: number }> {
    const challengeCounts: Record<string, number> = {};

    students.forEach(student => {
      if (student.areasNeedingSupport) {
        student.areasNeedingSupport.forEach(area => {
          const normalizedArea = area.trim().toLowerCase();
          challengeCounts[normalizedArea] = (challengeCounts[normalizedArea] || 0) + 1;
        });
      }

      if (student.challengesBehaviors) {
        student.challengesBehaviors.forEach(challenge => {
          const normalizedChallenge = challenge.trim().toLowerCase();
          challengeCounts[normalizedChallenge] = (challengeCounts[normalizedChallenge] || 0) + 1;
        });
      }
    });

    return Object.entries(challengeCounts)
      .map(([challenge, count]) => ({
        challenge,
        count,
        percentage: Math.round((count / students.length) * 100)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 challenges
  }

  /**
   * Aggregate strengths distribution (how many strengths each student has)
   */
  private static aggregateStrengthsDistribution(students: Student[]): Record<number, number> {
    const distribution: Record<number, number> = {};

    students.forEach(student => {
      const count = student.strengthsCount || 0;
      distribution[count] = (distribution[count] || 0) + 1;
    });

    return distribution;
  }

  /**
   * Aggregate behavioral patterns
   */
  private static aggregateBehavioralPatterns(students: Student[]): Record<string, number> {
    const patterns: Record<string, number> = {};

    students.forEach(student => {
      if (student.challengesBehaviors) {
        student.challengesBehaviors.forEach(behavior => {
          const normalizedBehavior = behavior.trim().toLowerCase();
          patterns[normalizedBehavior] = (patterns[normalizedBehavior] || 0) + 1;
        });
      }
    });

    return patterns;
  }

  /**
   * Aggregate participation levels
   */
  private static aggregateParticipationLevels(students: Student[]): { high: number; medium: number; low: number } {
    let high = 0;
    let medium = 0;
    let low = 0;

    students.forEach(student => {
      const level = student.participationLevel?.toLowerCase();

      if (level?.includes('high') || level?.includes('גבוה')) high++;
      else if (level?.includes('low') || level?.includes('נמוך')) low++;
      else medium++;
    });

    return { high, medium, low };
  }

  /**
   * Aggregate collaboration skills
   */
  private static aggregateCollaborationSkills(students: Student[]): Record<string, number> {
    const skills: Record<string, number> = {
      excellent: 0,
      good: 0,
      developing: 0,
      needsSupport: 0
    };

    students.forEach(student => {
      const skill = student.collaborationSkills?.toLowerCase();

      if (skill?.includes('excellent') || skill?.includes('מצוין')) skills.excellent++;
      else if (skill?.includes('good') || skill?.includes('טוב')) skills.good++;
      else if (skill?.includes('developing') || skill?.includes('מתפתח')) skills.developing++;
      else skills.needsSupport++;
    });

    return skills;
  }

  /**
   * Assess risk distribution
   */
  private static assessRiskDistribution(students: Student[]): { low: number; medium: number; high: number } {
    let low = 0;
    let medium = 0;
    let high = 0;

    students.forEach(student => {
      const riskLevel = this.assessStudentRisk(student);

      switch (riskLevel) {
        case 'high': high++; break;
        case 'medium': medium++; break;
        default: low++; break;
      }
    });

    return { low, medium, high };
  }

  /**
   * Assess individual student risk level
   */
  private static assessStudentRisk(student: Student): 'low' | 'medium' | 'high' {
    const riskFactors = [];

    // Academic risk factors
    if ((student.grade || 100) < 60) riskFactors.push('low grades');
    if (student.performanceTrend === 'declining') riskFactors.push('declining performance');

    // Behavioral risk factors
    if (student.participationLevel?.toLowerCase().includes('low')) riskFactors.push('low participation');
    if (student.attendanceRate && student.attendanceRate < 80) riskFactors.push('low attendance');

    // Emotional risk factors
    const concerningStates = ['anxious', 'stressed', 'sad', 'frustrated'];
    if (student.emotionalState && concerningStates.some(s => student.emotionalState?.toLowerCase().includes(s))) {
      riskFactors.push('emotional concerns');
    }

    // Determine risk level
    if (riskFactors.length >= 3) return 'high';
    if (riskFactors.length >= 1) return 'medium';
    return 'low';
  }

  /**
   * Identify students at risk with specific factors
   */
  private static identifyStudentsAtRisk(students: Student[]): Array<{ code: string; name: string; riskFactors: string[] }> {
    const atRisk: Array<{ code: string; name: string; riskFactors: string[] }> = [];

    students.forEach(student => {
      const riskFactors: string[] = [];

      // Check various risk factors
      if ((student.grade || 100) < 60) riskFactors.push('ציון נמוך');
      if (student.performanceTrend === 'declining') riskFactors.push('ירידה בביצועים');
      if (student.participationLevel?.toLowerCase().includes('low')) riskFactors.push('השתתפות נמוכה');
      if (student.attendanceRate && student.attendanceRate < 80) riskFactors.push('נוכחות נמוכה');

      if (riskFactors.length > 0) {
        atRisk.push({
          code: student.studentCode,
          name: student.name,
          riskFactors
        });
      }
    });

    return atRisk.slice(0, 10); // Return top 10 at-risk students
  }

  /**
   * Aggregate intervention types
   */
  private static aggregateInterventionTypes(students: Student[]): Record<string, number> {
    const types: Record<string, number> = {};

    students.forEach(student => {
      if (student.interventions) {
        student.interventions.forEach(intervention => {
          const type = intervention.trim().toLowerCase();
          types[type] = (types[type] || 0) + 1;
        });
      }
    });

    return types;
  }

  /**
   * Calculate intervention success rates (simplified)
   */
  private static calculateInterventionSuccess(students: Student[]): Record<string, number> {
    // This is a simplified calculation
    // In reality, you'd track before/after metrics
    const success: Record<string, number> = {};

    students.forEach(student => {
      if (student.interventions && student.performanceTrend === 'improving') {
        student.interventions.forEach(intervention => {
          const type = intervention.trim().toLowerCase();
          success[type] = (success[type] || 0) + 1;
        });
      }
    });

    return success;
  }

  /**
   * Count analyses in recent days
   */
  private static countRecentAnalyses(students: Student[], days: number): number {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);

    return students.filter(student => {
      if (!student.lastAnalysisDate) return false;
      const analysisDate = new Date(student.lastAnalysisDate).getTime();
      return analysisDate >= cutoff;
    }).length;
  }

  /**
   * Calculate analysis frequency by month
   */
  private static calculateAnalysisFrequency(students: Student[]): Record<string, number> {
    const frequency: Record<string, number> = {};

    students.forEach(student => {
      if (student.lastAnalysisDate) {
        const date = new Date(student.lastAnalysisDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        frequency[monthKey] = (frequency[monthKey] || 0) + 1;
      }
    });

    return frequency;
  }

  /**
   * Calculate engagement score (0-100)
   */
  private static calculateEngagementScore(students: Student[]): number {
    if (students.length === 0) return 0;

    let totalScore = 0;

    students.forEach(student => {
      let score = 50; // Base score

      // Participation affects engagement
      if (student.participationLevel?.toLowerCase().includes('high')) score += 20;
      else if (student.participationLevel?.toLowerCase().includes('low')) score -= 20;

      // Attendance affects engagement
      if (student.attendanceRate) {
        score += (student.attendanceRate - 80) * 0.5; // +/- based on attendance
      }

      // Collaboration affects engagement
      if (student.collaborationSkills?.toLowerCase().includes('excellent')) score += 15;

      totalScore += Math.max(0, Math.min(100, score)); // Clamp to 0-100
    });

    return Math.round(totalScore / students.length);
  }

  /**
   * Calculate wellbeing index (0-100)
   */
  private static calculateWellbeingIndex(students: Student[]): number {
    if (students.length === 0) return 0;

    const emotionalHealth = this.categorizeEmotionalHealth(students);
    const total = emotionalHealth.positive + emotionalHealth.neutral + emotionalHealth.concerning;

    if (total === 0) return 50;

    const score = (
      (emotionalHealth.positive * 100) +
      (emotionalHealth.neutral * 50) +
      (emotionalHealth.concerning * 0)
    ) / total;

    return Math.round(score);
  }

  /**
   * Calculate academic readiness (0-100)
   */
  private static calculateAcademicReadiness(students: Student[]): number {
    if (students.length === 0) return 0;

    let totalScore = 0;

    students.forEach(student => {
      let score = 0;

      // Grade contribution
      if (student.grade) {
        score += student.grade * 0.6; // 60% weight on grades
      }

      // Critical thinking contribution
      if (student.criticalThinking?.toLowerCase().includes('excellent')) score += 20;
      else if (student.criticalThinking?.toLowerCase().includes('good')) score += 10;

      // Creativity contribution
      if (student.creativityLevel?.toLowerCase().includes('high')) score += 20;
      else if (student.creativityLevel?.toLowerCase().includes('medium')) score += 10;

      totalScore += Math.min(100, score);
    });

    return Math.round(totalScore / students.length);
  }

  /**
   * Calculate social integration score (0-100)
   */
  private static calculateSocialIntegration(students: Student[]): number {
    if (students.length === 0) return 0;

    let totalScore = 0;

    students.forEach(student => {
      let score = 50; // Base score

      // Collaboration skills
      if (student.collaborationSkills?.toLowerCase().includes('excellent')) score += 30;
      else if (student.collaborationSkills?.toLowerCase().includes('good')) score += 15;

      // Participation level
      if (student.participationLevel?.toLowerCase().includes('high')) score += 20;
      else if (student.participationLevel?.toLowerCase().includes('low')) score -= 20;

      totalScore += Math.max(0, Math.min(100, score));
    });

    return Math.round(totalScore / students.length);
  }

  /**
   * Generate class comparisons
   */
  private static generateClassComparisons(students: Student[]): Array<{ class: string; metric: string; value: number }> {
    const comparisons: Array<{ class: string; metric: string; value: number }> = [];
    const classPerformance = this.calculateClassPerformance(students);

    Object.entries(classPerformance).forEach(([className, data]) => {
      comparisons.push({
        class: className,
        metric: 'ממוצע ציונים',
        value: data.average
      });
    });

    return comparisons;
  }

  /**
   * Generate period comparisons (mock data for now)
   */
  private static generatePeriodComparisons(students: Student[]): Array<{ period: string; metric: string; value: number }> {
    // This would typically compare current vs previous periods
    // For now, returning current period data
    return [
      {
        period: 'תקופה נוכחית',
        metric: 'ממוצע כללי',
        value: this.calculateAverageGrade(students)
      },
      {
        period: 'תקופה נוכחית',
        metric: 'רמת מעורבות',
        value: this.calculateEngagementScore(students)
      }
    ];
  }
}

export default AnalysisAggregator;