// Comprehensive Analytics Types for Student Dashboard

// ====================================================================
// 1. ACADEMIC PERFORMANCE TYPES
// ====================================================================

export interface GradeDistribution {
  subject: string;
  grades: {
    excellent: number;  // 90-100
    good: number;       // 80-89
    average: number;    // 70-79
    belowAverage: number; // 60-69
    failing: number;    // <60
  };
  averageGrade: number;
  medianGrade: number;
  standardDeviation: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  improvementRate: number;
  strengthLevel: 'מצוין' | 'טוב' | 'בינוני' | 'דורש שיפור';
  trendDirection: 'up' | 'down' | 'stable';
  monthlyProgress: Array<{
    month: string;
    score: number;
  }>;
}

export interface AttendanceMetrics {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendanceRate: number;
  punctualityRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface HomeworkMetrics {
  totalAssigned: number;
  completed: number;
  completionRate: number;
  averageQuality: number; // 1-5 scale
  onTimeSubmission: number;
  lateSubmission: number;
  missing: number;
  subjectBreakdown: Array<{
    subject: string;
    completionRate: number;
  }>;
}

export interface ExamPerformance {
  examType: string;
  date: string;
  subjects: Array<{
    subject: string;
    score: number;
    classAverage: number;
    percentile: number;
  }>;
  overallAverage: number;
  improvement: number;
}

// ====================================================================
// 2. LEARNING ANALYTICS TYPES
// ====================================================================

export interface LearningStyleEffectiveness {
  style: 'חזותי' | 'שמיעתי' | 'קינסתטי' | 'חברתי' | 'עצמאי';
  effectiveness: number; // 0-100
  subjects: Array<{
    subject: string;
    performance: number;
  }>;
  recommendations: string[];
}

export interface StudyTimeAnalysis {
  totalHours: number;
  averagePerDay: number;
  peakStudyTime: string; // e.g., "14:00-16:00"
  subjectDistribution: Array<{
    subject: string;
    hours: number;
    effectiveness: number;
  }>;
  optimalDuration: number; // minutes per session
}

export interface EngagementScore {
  overall: number;
  classParticipation: number;
  homeworkEngagement: number;
  extracurricularActivity: number;
  peerInteraction: number;
  teacherFeedback: string;
}

export interface KnowledgeGapAnalysis {
  gaps: Array<{
    subject: string;
    topic: string;
    severity: 'critical' | 'moderate' | 'minor';
    prerequisitesMissing: string[];
    recommendedResources: string[];
  }>;
}

export interface MasteryLevel {
  subject: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progress: number; // 0-100
  skills: Array<{
    skill: string;
    proficiency: number;
  }>;
  nextMilestone: string;
}

// ====================================================================
// 3. BEHAVIORAL & EMOTIONAL INSIGHTS
// ====================================================================

export interface MotivationIndex {
  overall: number;
  intrinsicMotivation: number;
  extrinsicMotivation: number;
  factors: {
    achievement: number;
    recognition: number;
    growth: number;
    autonomy: number;
  };
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface StressLevel {
  current: 'low' | 'medium' | 'high';
  score: number;
  sources: Array<{
    source: string;
    impact: number;
  }>;
  copingStrategies: string[];
  recommendations: string[];
}

export interface ConfidenceScore {
  overall: number;
  bySubject: Array<{
    subject: string;
    confidence: number;
  }>;
  socialConfidence: number;
  academicConfidence: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface CollaborationPreference {
  preferredStyle: 'solo' | 'pair' | 'smallGroup' | 'largeGroup';
  effectiveness: {
    solo: number;
    pair: number;
    smallGroup: number;
    largeGroup: number;
  };
  bestPartners: string[];
}

export interface PeakPerformanceTimes {
  morning: number;    // 6:00-12:00
  afternoon: number;  // 12:00-18:00
  evening: number;    // 18:00-24:00
  optimalStudyTime: string;
  optimalExamTime: string;
}

// ====================================================================
// 4. PROGRESS & GROWTH METRICS
// ====================================================================

export interface MonthlyProgress {
  month: string;
  overallImprovement: number;
  subjects: Array<{
    subject: string;
    startScore: number;
    endScore: number;
    improvement: number;
  }>;
  goalsAchieved: number;
  goalsTotal: number;
}

export interface GoalAchievement {
  goalId: string;
  title: string;
  category: 'academic' | 'behavioral' | 'skill' | 'personal';
  targetDate: string;
  progress: number;
  status: 'completed' | 'onTrack' | 'atRisk' | 'overdue';
  milestones: Array<{
    description: string;
    completed: boolean;
  }>;
}

export interface StrengthDevelopment {
  strength: string;
  initialLevel: number;
  currentLevel: number;
  growthRate: number;
  timeline: Array<{
    date: string;
    level: number;
    milestone?: string;
  }>;
}

export interface ChallengeResolution {
  challenge: string;
  identifiedDate: string;
  resolvedDate?: string;
  status: 'resolved' | 'improving' | 'ongoing' | 'new';
  interventions: Array<{
    type: string;
    effectiveness: number;
  }>;
  timeToResolve?: number; // days
}

export interface LearningVelocity {
  overall: number; // concepts per week
  bySubject: Array<{
    subject: string;
    velocity: number;
    acceleration: number; // change in velocity
  }>;
  comparedToAverage: number; // percentage
}

// ====================================================================
// 5. COMPARATIVE ANALYTICS
// ====================================================================

export interface ClassComparison {
  subject: string;
  studentScore: number;
  classAverage: number;
  classMedian: number;
  percentile: number;
  rank: number;
  totalStudents: number;
}

export interface GenderAnalysis {
  metric: string;
  maleAverage: number;
  femaleAverage: number;
  difference: number;
  significantDifference: boolean;
}

export interface AgeGroupComparison {
  ageGroup: string;
  count: number;
  averagePerformance: number;
  topPerformers: number;
  strugglingStudents: number;
}

export interface YearOverYearComparison {
  metric: string;
  currentYear: number;
  previousYear: number;
  change: number;
  percentageChange: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface BenchmarkComparison {
  benchmark: 'district' | 'national' | 'international';
  metric: string;
  studentScore: number;
  benchmarkScore: number;
  difference: number;
  percentile: number;
}

// ====================================================================
// 6. PREDICTIVE STATISTICS
// ====================================================================

export interface RiskIndicator {
  type: 'dropout' | 'failure' | 'behavioral' | 'emotional';
  riskLevel: 'high' | 'medium' | 'low';
  probability: number;
  contributingFactors: Array<{
    factor: string;
    weight: number;
  }>;
  recommendedInterventions: string[];
}

export interface SuccessPrediction {
  goalType: string;
  probability: number;
  timeframe: string;
  keyFactors: Array<{
    factor: string;
    impact: 'positive' | 'negative';
    weight: number;
  }>;
  recommendations: string[];
}

export interface DropoutRisk {
  score: number; // 0-100
  riskLevel: 'high' | 'medium' | 'low';
  warningSignals: Array<{
    signal: string;
    severity: number;
    detected: boolean;
  }>;
  preventionStrategies: string[];
}

export interface CollegeReadiness {
  overallScore: number;
  academicPreparedness: number;
  standardizedTestReadiness: number;
  extracurricularProfile: number;
  recommendedCollegeTypes: string[];
  areasForImprovement: string[];
}

export interface CareerPathAlignment {
  suggestedPaths: Array<{
    career: string;
    alignmentScore: number;
    requiredSkills: string[];
    currentSkillMatch: number;
  }>;
  strengthAlignment: Array<{
    strength: string;
    applicableCareers: string[];
  }>;
}

// ====================================================================
// 7. TEACHER SUPPORT METRICS
// ====================================================================

export interface InterventionSuccess {
  interventionType: string;
  startDate: string;
  duration: number; // days
  effectiveness: number; // 0-100
  studentImprovement: number;
  completed: boolean;
  followUpNeeded: boolean;
}

export interface ResponseTime {
  issueType: string;
  reportedDate: string;
  addressedDate: string;
  responseTime: number; // hours
  resolution: string;
  effectiveness: number;
}

export interface PersonalizationIndex {
  overall: number;
  learningPlanCustomization: number;
  assessmentAdaptation: number;
  feedbackPersonalization: number;
  resourceCustomization: number;
}

export interface ParentEngagement {
  engagementLevel: 'high' | 'medium' | 'low';
  communicationFrequency: number; // per month
  meetingsAttended: number;
  meetingsTotal: number;
  responseRate: number;
  involvementAreas: string[];
}

export interface ResourceUtilization {
  resources: Array<{
    name: string;
    type: 'digital' | 'physical' | 'human';
    usageFrequency: number;
    effectiveness: number;
    studentFeedback: number;
  }>;
  mostEffective: string[];
  leastEffective: string[];
  recommendations: string[];
}

// ====================================================================
// AGGREGATE ANALYTICS INTERFACE
// ====================================================================

export interface StudentAnalytics {
  studentId: string;
  studentCode: string;
  lastUpdated: string;

  // Academic Performance
  gradeDistribution: GradeDistribution[];
  subjectPerformance: SubjectPerformance[];
  attendance: AttendanceMetrics;
  homework: HomeworkMetrics;
  examPerformance: ExamPerformance[];

  // Learning Analytics
  learningStyles: LearningStyleEffectiveness[];
  studyTime: StudyTimeAnalysis;
  engagement: EngagementScore;
  knowledgeGaps: KnowledgeGapAnalysis;
  mastery: MasteryLevel[];

  // Behavioral & Emotional
  motivation: MotivationIndex;
  stress: StressLevel;
  confidence: ConfidenceScore;
  collaboration: CollaborationPreference;
  peakTimes: PeakPerformanceTimes;

  // Progress & Growth
  monthlyProgress: MonthlyProgress[];
  goals: GoalAchievement[];
  strengthDevelopment: StrengthDevelopment[];
  challenges: ChallengeResolution[];
  learningVelocity: LearningVelocity;

  // Comparative
  classComparisons: ClassComparison[];
  yearComparison: YearOverYearComparison[];
  benchmarks: BenchmarkComparison[];

  // Predictive
  riskIndicators: RiskIndicator[];
  successPredictions: SuccessPrediction[];
  dropoutRisk: DropoutRisk;
  collegeReadiness?: CollegeReadiness;
  careerAlignment: CareerPathAlignment;

  // Teacher Support
  interventions: InterventionSuccess[];
  responseTimes: ResponseTime[];
  personalization: PersonalizationIndex;
  parentEngagement: ParentEngagement;
  resourceUtilization: ResourceUtilization;
}

// Class-wide analytics
export interface ClassAnalytics {
  classId: string;
  totalStudents: number;

  // Aggregated metrics
  averageGrade: number;
  gradeDistribution: GradeDistribution;
  attendanceRate: number;
  homeworkCompletionRate: number;

  // Comparative
  genderAnalysis: GenderAnalysis[];
  ageGroups: AgeGroupComparison[];

  // Trends
  monthlyTrends: Array<{
    month: string;
    avgGrade: number;
    attendance: number;
    engagement: number;
  }>;

  // Risk analysis
  atRiskStudents: number;
  excellingStudents: number;

  // Teaching effectiveness
  averageInterventionSuccess: number;
  parentEngagementRate: number;
}