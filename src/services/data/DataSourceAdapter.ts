/**
 * Data Source Adapter Pattern
 *
 * This abstraction layer allows the application to work with different
 * data sources (Firestore, Google Sheets, Mock, etc.) without changing
 * the business logic throughout the codebase.
 *
 * Benefits:
 * - Single source of truth for data operations
 * - Easy to add new data sources
 * - Simplified testing with mock adapters
 * - Consistent error handling across all data sources
 */

/**
 * Student data interface
 */
export interface Student {
  id: string;
  studentCode: string;
  classId: string;
  quarter: string;
  learningStyle: string;
  strengthsCount: number;
  challengesCount: number;
  keyNotes: string;
  firstName?: string;
  lastName?: string;
  [key: string]: any;
}

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalStrengths: number;
  totalChallenges: number;
  averageLearningStyle: string;
  recentActivity?: Array<{
    timestamp: number;
    action: string;
    details: any;
  }>;
}

/**
 * Classroom optimization request/response
 */
export interface OptimizationRequest {
  students: Student[];
  constraints?: {
    avoidNeighbors?: string[];
    preferFront?: string[];
    preferBack?: string[];
  };
}

export interface OptimizationResult {
  seatingArrangement: Array<{
    studentId: string;
    position: { row: number; col: number };
  }>;
  score: number;
  improvements: string[];
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Data Source Adapter Interface
 *
 * All data sources must implement these methods.
 * This ensures consistency across different backends.
 */
export interface DataSourceAdapter {
  /**
   * Get all students
   */
  getStudents(): Promise<ApiResponse<Student[]>>;

  /**
   * Get a single student by ID
   */
  getStudent(studentId: string): Promise<ApiResponse<Student>>;

  /**
   * Create or update a student
   */
  saveStudent(student: Student): Promise<ApiResponse<Student>>;

  /**
   * Delete a student
   */
  deleteStudent(studentId: string): Promise<ApiResponse<void>>;

  /**
   * Get dashboard statistics
   */
  getStats(): Promise<ApiResponse<DashboardStats>>;

  /**
   * Get students by class
   */
  getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>>;

  /**
   * Optimize classroom seating arrangement
   */
  optimizeClassroom(request: OptimizationRequest): Promise<ApiResponse<OptimizationResult>>;

  /**
   * Health check for the data source
   */
  healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latency?: number }>;
}

/**
 * Configuration for data source
 */
export interface DataSourceConfig {
  type: 'firestore' | 'sheets' | 'mock';
  apiKey?: string;
  spreadsheetId?: string;
  projectId?: string;
  schoolId?: string;
}

/**
 * Factory function to create the appropriate data source adapter
 * Note: This is a synchronous factory. For async initialization, use getDataSource() from index.ts
 */
export function createDataSource(config: DataSourceConfig): DataSourceAdapter {
  // Direct imports to avoid lazy loading issues in factory pattern
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const FirestoreAdapter = require('./firestoreAdapter').FirestoreAdapter;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const SheetsAdapter = require('./sheetsAdapter').SheetsAdapter;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const MockAdapter = require('./mockAdapter').MockAdapter;

  switch (config.type) {
    case 'firestore':
      return new FirestoreAdapter(config);

    case 'sheets':
      return new SheetsAdapter(config);

    case 'mock':
      return new MockAdapter();

    default:
      throw new Error(`Unknown data source type: ${config.type}`);
  }
}
