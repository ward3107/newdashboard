/**
 * Firestore Data Type Definitions
 * Complete type definitions for all Firestore collections and documents
 */

import { Timestamp } from 'firebase/firestore';

/**
 * ============================================================================
 * STUDENT TYPES
 * ============================================================================
 */

/**
 * Student document stored in Firestore
 * Collection: /schools/{schoolId}/students/{studentCode}
 */
export interface Student {
  studentCode: string;              // Unique student identifier (5 chars)
  name: string;                     // Student name
  classId: string;                  // Class ID (e.g., "7א", "8ב")
  schoolId: string;                 // School ID reference
  quarter?: string;                 // Current quarter (Q1, Q2, Q3, Q4)
  email?: string;                   // Optional email
  gender?: 'male' | 'female' | 'other';  // Optional gender
  avatar?: number;                  // Avatar number (1-4)
  grade?: string;                   // Grade level
  hasCompletedQuestionnaire: boolean; // Has filled out form
  lastResponseId?: string;          // Reference to last response
  lastAnalysisId?: string;          // Reference to last analysis
  createdAt: Timestamp;             // Document creation time
  updatedAt: Timestamp;             // Last update time
  isActive: boolean;                // Student status
}

/**
 * Student creation data (before Firestore timestamps)
 */
export interface StudentCreateData extends Omit<Student, 'createdAt' | 'updatedAt'> {
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * ============================================================================
 * QUESTIONNAIRE RESPONSE TYPES
 * ============================================================================
 */

/**
 * Questionnaire response answers (28 questions)
 */
export interface QuestionnaireAnswers {
  // Basic info
  studentCode: string;
  classId: string;
  schoolCode?: string;
  gender?: string;

  // Cognitive Domain (5 questions)
  q1_subject?: string;              // Favorite subject
  q2_learning_method?: string;      // Learning method (visual/auditory/kinesthetic)
  q3_difficulty?: string;           // Difficulty preference
  q11_memory?: string;              // Memory ability
  q19_reading?: string;             // Reading preference

  // Executive Function (6 questions)
  q4_focus?: string | number;       // Focus ability (1-5 scale)
  q7_task_approach?: string;        // Task approach
  q15_multiple_tasks?: string;      // Multi-tasking
  q18_skill_improve?: string;       // Skills to improve
  q23_long_projects?: string;       // Long project management
  q27_study_time?: string;          // Study duration

  // Motivation (4 questions)
  q5_tests?: string | number;       // Test motivation
  q13_motivation?: string | number; // General motivation (1-5 scale)
  q17_technology?: string;          // Technology use
  q26_test_prep?: string;           // Test prep strategy

  // Emotional (4 questions)
  q10_frustration?: string | number; // Frustration response (1-5 scale)
  q14_homework?: string | number;    // Homework feelings
  q22_criticism?: string | number;   // Response to criticism
  q25_pride?: string | number;       // Pride in work

  // Social (4 questions)
  q9_group_work?: string;           // Group vs individual
  q20_presentation?: string | number; // Presentation comfort
  q24_environment?: string;         // Classroom environment
  q28_desk_arrangement?: string;    // Seating preference

  // Environmental (5 questions)
  q6_new_topic?: string;            // Learning new topics
  q8_lesson_type?: string;          // Lesson type preference
  q12_difficult_task?: string;      // Difficult task approach
  q16_activity?: string;            // Favorite activity
  q21_challenging_subject?: string; // Challenging subject

  // Additional fields (flexible for future questions)
  [key: string]: string | number | undefined;
}

/**
 * Form response document
 * Collection: /schools/{schoolId}/responses/{responseId}
 */
export interface FormResponse {
  id: string;                       // Response ID
  studentCode: string;              // Student identifier
  classId: string;                  // Class ID
  schoolId: string;                 // School ID reference
  questionnaireId?: string;         // Questionnaire template ID (for future)
  answers: QuestionnaireAnswers;    // All answers
  submittedAt: Timestamp;           // Submission timestamp
  submittedFrom?: string;           // Source: "google_forms" | "custom_form"
  ipAddress?: string;               // Optional IP (prevent duplicates)
  userAgent?: string;               // Browser info
  status: 'submitted' | 'draft';    // Response status
  isAnalyzed: boolean;              // Has been processed by AI
  analysisId?: string;              // Reference to analysis result
}

/**
 * Form response creation data
 */
export interface FormResponseCreateData extends Omit<FormResponse, 'id' | 'submittedAt'> {
  submittedAt?: Date;
}

/**
 * ============================================================================
 * AI ANALYSIS TYPES
 * ============================================================================
 */

/**
 * Performance scores across 6 dimensions
 */
export interface PerformanceScores {
  focus: number;                    // Focus/Concentration (0.0-1.0)
  motivation: number;               // Motivation/Engagement (0.0-1.0)
  collaboration: number;            // Collaboration/Teamwork (0.0-1.0)
  emotional_regulation: number;     // Emotional Regulation (0.0-1.0)
  self_efficacy: number;            // Self-Efficacy/Confidence (0.0-1.0)
  time_management: number;          // Time Management (0.0-1.0)
}

/**
 * Individual insight/finding
 */
export interface Insight {
  domain: 'cognitive' | 'emotional' | 'social' | 'motivation' | 'executive_function' | 'environmental';
  title: string;                    // Insight title (Hebrew)
  summary: string;                  // 2-3 sentence explanation (Hebrew)
  evidence: string[];               // Supporting evidence from responses
  confidence: number;               // Confidence score (0.0-1.0)
  recommendations: Recommendation[]; // Teacher recommendations (3-6 per insight)
}

/**
 * Teacher recommendation
 */
export interface Recommendation {
  action: string;                   // What to do (Hebrew)
  howTo: string;                    // Implementation steps (Hebrew)
  rationale: string;                // Why it works (Hebrew)
  timeNeeded?: string;              // Time required
  difficulty?: 'easy' | 'medium' | 'hard';
  expectedImpact?: string;          // Expected outcome
  materials?: string;               // Required materials
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Risk flag for at-risk students
 */
export interface RiskFlag {
  severity: 'high' | 'medium' | 'low';
  flag: string;                     // Risk description (Hebrew)
  evidence: string[];               // Supporting evidence
  immediateAction: string;          // What to do now (Hebrew)
  escalationProtocol?: string;      // When to escalate
  parentNotification: boolean;      // Should notify parents
  monitoringFrequency: string;      // How often to check in
}

/**
 * Seating recommendation
 */
export interface SeatingRecommendation {
  recommendedLocation: string;      // Preferred seat position (Hebrew)
  rationale: string;                // Why this position (Hebrew)
  avoidSittingWith: string[];       // Student types to avoid (Hebrew)
  preferSittingWith: string[];      // Compatible student types (Hebrew)
  groupWorkRole?: string;           // Role in group work (Hebrew)
  environmentalNeeds?: string;      // Environmental requirements (Hebrew)
}

/**
 * AI Analysis document
 * Collection: /schools/{schoolId}/analyses/{analysisId}
 */
export interface AIAnalysis {
  id: string;                       // Analysis ID
  studentCode: string;              // Student identifier
  responseId: string;               // Reference to form response
  schoolId: string;                 // School ID reference
  classId: string;                  // Class ID
  quarter?: string;                 // Quarter analyzed

  // Core analysis
  learningStyle: string;            // Learning style description (Hebrew)
  keyNotes: string;                 // Key insights summary (Hebrew)
  strengths: string[];              // Student strengths (Hebrew, 4-6 items)
  challenges: string[];             // Student challenges (Hebrew, 3-5 items)

  // Performance metrics
  scores: PerformanceScores;        // 6-dimensional scores
  strengthsCount: number;           // Number of strengths identified
  challengesCount: number;          // Number of challenges identified

  // Detailed insights
  insights: Insight[];              // 4-6 insights with recommendations

  // Recommendations
  immediateActions: Recommendation[]; // Urgent actions (3-5 items)
  seatingRecommendation?: SeatingRecommendation; // Classroom seating

  // Risk assessment
  riskFlags?: RiskFlag[];           // Risk flags if any

  // Metadata
  analyzedAt: Timestamp;            // Analysis timestamp
  analyzedBy: 'openai_gpt4' | 'openai_gpt4o' | 'manual'; // Analysis source
  analysisVersion?: string;         // Version of analysis algorithm
  confidence?: number;              // Overall confidence score

  // Original data (for reference)
  rawAnalysisJson?: string;         // Original AI response (JSON string)
}

/**
 * AI Analysis creation data
 */
export interface AIAnalysisCreateData extends Omit<AIAnalysis, 'id' | 'analyzedAt'> {
  analyzedAt?: Date;
}

/**
 * ============================================================================
 * CLASSROOM TYPES
 * ============================================================================
 */

/**
 * Classroom/Class document
 * Collection: /schools/{schoolId}/classrooms/{classId}
 */
export interface Classroom {
  id: string;                       // Class ID (e.g., "7א", "8ב")
  name: string;                     // Class name
  grade: string;                    // Grade level (7, 8, 9, etc.)
  schoolId: string;                 // School ID reference
  studentCount: number;             // Number of students
  teacherId?: string;               // Primary teacher UID
  teacherName?: string;             // Teacher name
  academicYear: string;             // Academic year (e.g., "2024-2025")
  isActive: boolean;                // Class status
  settings?: ClassroomSettings;     // Class-specific settings
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Classroom settings
 */
export interface ClassroomSettings {
  defaultLayout?: 'rows' | 'pairs' | 'clusters' | 'u-shape' | 'circle' | 'flexible';
  deskCount?: number;
  hasProjector?: boolean;
  hasWhiteboard?: boolean;
  roomNumber?: string;
}

/**
 * ============================================================================
 * QUESTIONNAIRE TEMPLATE TYPES (Future feature)
 * ============================================================================
 */

/**
 * Questionnaire template
 * Collection: /schools/{schoolId}/questionnaires/{questionnaireId}
 */
export interface Questionnaire {
  id: string;                       // Questionnaire ID
  title: string;                    // Title (Hebrew/English)
  description?: string;             // Description
  schoolId: string;                 // School ID reference
  questions: QuestionDefinition[];  // All questions
  createdBy: string;                // Creator UID
  createdAt: Timestamp;
  isActive: boolean;                // Template status
  accessCode?: string;              // Optional access code
  allowAnonymous?: boolean;         // Allow anonymous responses
  allowDrafts?: boolean;            // Allow saving drafts
}

/**
 * Individual question definition
 */
export interface QuestionDefinition {
  id: string;                       // Question ID (e.g., "q1")
  text: string;                     // Question text (Hebrew)
  type: 'text' | 'number' | 'scale' | 'choice' | 'multi-choice' | 'textarea';
  category: 'cognitive' | 'executive_function' | 'motivation' | 'emotional' | 'social' | 'environmental';
  required: boolean;
  options?: string[];               // For choice questions
  min?: number;                     // For scale/number
  max?: number;                     // For scale/number
  placeholder?: string;             // Input placeholder
  helpText?: string;                // Help text
  validation?: ValidationRule;      // Validation rules
}

/**
 * Validation rule
 */
export interface ValidationRule {
  pattern?: string;                 // RegEx pattern
  minLength?: number;
  maxLength?: number;
  errorMessage?: string;
}

/**
 * ============================================================================
 * UTILITY TYPES
 * ============================================================================
 */

/**
 * Pagination options
 */
export interface PaginationOptions {
  limit: number;
  startAfter?: any;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

/**
 * Query filters
 */
export interface QueryFilters {
  classId?: string;
  quarter?: string;
  isAnalyzed?: boolean;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Statistics aggregation
 */
export interface ClassStatistics {
  totalStudents: number;
  responsesSubmitted: number;
  responsesAnalyzed: number;
  averageScores: PerformanceScores;
  riskCount: {
    high: number;
    medium: number;
    low: number;
  };
}

/**
 * ============================================================================
 * MIGRATION TYPES
 * ============================================================================
 */

/**
 * Google Sheets row data (from existing system)
 */
export interface GoogleSheetsStudentRow {
  studentCode: string;
  name: string;
  classId: string;
  quarter: string;
  date: string;
  learningStyle?: string;
  keyNotes?: string;
  strengthsCount?: number;
  challengesCount?: number;
  scores?: {
    focus?: number;
    motivation?: number;
    collaboration?: number;
    emotional_regulation?: number;
    self_efficacy?: number;
    time_management?: number;
  };
  analysis?: any;
  insights?: any[];
  [key: string]: any;
}

/**
 * Migration result
 */
export interface MigrationResult {
  success: boolean;
  studentsProcessed: number;
  studentsCreated: number;
  responsesCreated: number;
  analysesCreated: number;
  errors: string[];
  duration: number;
}

/**
 * ============================================================================
 * TYPE GUARDS
 * ============================================================================
 */

export function isStudent(obj: any): obj is Student {
  return obj && typeof obj.studentCode === 'string' && typeof obj.name === 'string';
}

export function isFormResponse(obj: any): obj is FormResponse {
  return obj && typeof obj.studentCode === 'string' && obj.answers !== undefined;
}

export function isAIAnalysis(obj: any): obj is AIAnalysis {
  return obj && typeof obj.studentCode === 'string' && obj.insights !== undefined;
}

/**
 * ============================================================================
 * CONSTANTS
 * ============================================================================
 */

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  SCHOOLS: 'schools',
  USERS: 'users',
  STUDENTS: 'students',
  RESPONSES: 'responses',
  ANALYSES: 'analyses',
  CLASSROOMS: 'classrooms',
  QUESTIONNAIRES: 'questionnaires',
} as const;

/**
 * Default values
 */
export const DEFAULTS = {
  AVATAR: 1,
  IS_ACTIVE: true,
  HAS_COMPLETED_QUESTIONNAIRE: false,
  IS_ANALYZED: false,
  STATUS: 'submitted' as const,
} as const;
