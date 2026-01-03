/**
 * API Service for ISHEBOT Student Dashboard
 * Supports both Google Apps Script and Firebase Firestore
 */

import { firestoreApi } from './firestoreApi';
import logger from '../utils/logger';

// ====================================
// DATA SOURCE CONFIGURATION
// ====================================

// Default to Firestore if explicitly enabled, otherwise use Google Sheets
const USE_FIRESTORE = import.meta.env.VITE_USE_FIRESTORE === 'true';

// ====================================
// TYPE DEFINITIONS
// ====================================

export interface Student {
  studentCode: string;
  quarter: string;
  classId: string;
  date: string;
  name: string;
  learningStyle: string;
  keyNotes: string;
  strengthsCount: number;
  challengesCount: number;
  // Optional detailed data - included when available from Firestore
  student_summary?: {
    learning_style: string;
    key_notes: string;
    strengths: string[];
    challenges: string[];
  };
}

export interface DetailedStudent {
  studentCode: string;
  quarter: string;
  classId: string;
  date: string;
  name: string;
  student_summary: {
    learning_style: string;
    key_notes: string;
    strengths: string[];
    challenges: string[];
  };
  insights: Insight[];
  immediate_actions: ImmediateAction[];
  seating_arrangement: {
    location: string;
    partner_type: string;
    avoid: string;
  };
}

export interface Insight {
  category: string;
  icon: string;
  finding: string;
  recommendations: Recommendation[];
}

export interface Recommendation {
  action: string;
  how_to: string;
  time_needed: string;
  examples: string;
  priority: 'low' | 'medium' | 'high';
}

export interface ImmediateAction {
  what: string;
  how: string;
  when: string;
  time: string;
}

export interface DashboardStats {
  totalStudents: number;
  byClass: Record<string, number>;
  byLearningStyle: Record<string, number>;
  averageStrengths: string;
  lastUpdated: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ====================================
// API CONFIGURATION
// ====================================

const API_URL = import.meta.env.VITE_API_URL || '';
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
const API_TIMEOUT = 30000; // 30 seconds

// ====================================
// MOCK DATA (for development/testing)
// ====================================

const MOCK_STATS: DashboardStats = {
  totalStudents: 349,
  byClass: {
    'ז1': 45,
    'ז2': 43,
    'ז3': 41,
    'ח1': 47,
    'ח2': 44,
    'ח3': 42,
    'ט1': 46,
    'ט2': 41,
  },
  byLearningStyle: {
    'חזותי': 125,
    'שמיעתי': 98,
    'קינסתטי': 89,
    'משולב': 37,
  },
  averageStrengths: '5.2',
  lastUpdated: new Date().toLocaleDateString('he-IL'),
};

const MOCK_STUDENTS: Student[] = [
  // Class י1
  {
    studentCode: '10101',
    quarter: 'Q1',
    classId: 'י1',
    date: '15/10/2025',
    name: 'דני כהן',
    learningStyle: 'חזותי',
    keyNotes: 'תלמיד מצטיין בלימודים חזותיים',
    strengthsCount: 6,
    challengesCount: 2,
  },
  {
    studentCode: '10102',
    quarter: 'Q1',
    classId: 'י1',
    date: '15/10/2025',
    name: 'שרה לוי',
    learningStyle: 'שמיעתי',
    keyNotes: 'מעדיפה הסברים בעל פה',
    strengthsCount: 5,
    challengesCount: 3,
  },
  {
    studentCode: '10103',
    quarter: 'Q1',
    classId: 'י1',
    date: '15/10/2025',
    name: 'יוסי מזרחי',
    learningStyle: 'קינסתטי',
    keyNotes: 'מצטיין בפעילויות מעשיות',
    strengthsCount: 7,
    challengesCount: 1,
  },
  {
    studentCode: '10104',
    quarter: 'Q1',
    classId: 'י1',
    date: '15/10/2025',
    name: 'רחל אברהם',
    learningStyle: 'משולב',
    keyNotes: 'תלמידה מצוינת עם יכולות גבוהות',
    strengthsCount: 8,
    challengesCount: 1,
  },
  {
    studentCode: '10105',
    quarter: 'Q1',
    classId: 'י1',
    date: '15/10/2025',
    name: 'אלי גבאי',
    learningStyle: 'חזותי',
    keyNotes: 'זקוק לתמיכה נוספת בקריאה',
    strengthsCount: 3,
    challengesCount: 5,
  },
  // Class י2
  {
    studentCode: '10201',
    quarter: 'Q1',
    classId: 'י2',
    date: '15/10/2025',
    name: 'מיכל דוד',
    learningStyle: 'שמיעתי',
    keyNotes: 'תלמידה פעילה ומשתפת פעולה',
    strengthsCount: 6,
    challengesCount: 2,
  },
  {
    studentCode: '10202',
    quarter: 'Q1',
    classId: 'י2',
    date: '15/10/2025',
    name: 'אבי שלום',
    learningStyle: 'קינסתטי',
    keyNotes: 'מצטיין בספורט ופעילויות גופניות',
    strengthsCount: 5,
    challengesCount: 3,
  },
  {
    studentCode: '10203',
    quarter: 'Q1',
    classId: 'י2',
    date: '15/10/2025',
    name: 'נועה פרץ',
    learningStyle: 'חזותי',
    keyNotes: 'יכולות אמנותיות גבוהות',
    strengthsCount: 7,
    challengesCount: 2,
  },
  // Class י3
  {
    studentCode: '10301',
    quarter: 'Q1',
    classId: 'י3',
    date: '15/10/2025',
    name: 'עידן חיים',
    learningStyle: 'שמיעתי',
    keyNotes: 'זקוק להתמדה בהקשבה',
    strengthsCount: 4,
    challengesCount: 4,
  },
  {
    studentCode: '10302',
    quarter: 'Q1',
    classId: 'י3',
    date: '15/10/2025',
    name: 'תמר בן דוד',
    learningStyle: 'משולב',
    keyNotes: 'תלמידה מעולה עם מוטיבציה גבוהה',
    strengthsCount: 8,
    challengesCount: 1,
  },
  {
    studentCode: '10303',
    quarter: 'Q1',
    classId: 'י3',
    date: '15/10/2025',
    name: 'רון ביטון',
    learningStyle: 'קינסתטי',
    keyNotes: 'זקוק לפעילויות אינטראקטיביות',
    strengthsCount: 5,
    challengesCount: 3,
  },
  // Class י4
  {
    studentCode: '10401',
    quarter: 'Q1',
    classId: 'י4',
    date: '15/10/2025',
    name: 'גל סבן',
    learningStyle: 'חזותי',
    keyNotes: 'מצטיין במתמטיקה ומדעים',
    strengthsCount: 7,
    challengesCount: 2,
  },
  {
    studentCode: '10402',
    quarter: 'Q1',
    classId: 'י4',
    date: '15/10/2025',
    name: 'ליאת עמר',
    learningStyle: 'שמיעתי',
    keyNotes: 'יכולות מנהיגות מפותחות',
    strengthsCount: 6,
    challengesCount: 2,
  },
  {
    studentCode: '10403',
    quarter: 'Q1',
    classId: 'י4',
    date: '15/10/2025',
    name: 'אורי נחמני',
    learningStyle: 'משולב',
    keyNotes: 'זקוק לתמיכה רגשית',
    strengthsCount: 4,
    challengesCount: 4,
  },
  // Class י5
  {
    studentCode: '10501',
    quarter: 'Q1',
    classId: 'י5',
    date: '15/10/2025',
    name: 'שירה מלכה',
    learningStyle: 'חזותי',
    keyNotes: 'תלמידה יצירתית עם דמיון עשיר',
    strengthsCount: 7,
    challengesCount: 1,
  },
  {
    studentCode: '10502',
    quarter: 'Q1',
    classId: 'י5',
    date: '15/10/2025',
    name: 'דן רוזן',
    learningStyle: 'קינסתטי',
    keyNotes: 'זקוק לתנועה במהלך הלמידה',
    strengthsCount: 5,
    challengesCount: 3,
  },
  {
    studentCode: '10503',
    quarter: 'Q1',
    classId: 'י5',
    date: '15/10/2025',
    name: 'מאיה שטרן',
    learningStyle: 'שמיעתי',
    keyNotes: 'מתקשה בריכוז בכיתה רועשת',
    strengthsCount: 4,
    challengesCount: 5,
  },
];

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Build full API URL with parameters
 */
function buildUrl(action: string, params?: Record<string, string>): string {
  if (!API_URL) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ VITE_API_URL not set in .env.local');
    }
    return '';
  }

  const url = new URL(API_URL);
  url.searchParams.set('action', action);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Fetch with timeout and custom options (for POST, DELETE, etc.)
 */
async function fetchWithOptions(
  url: string,
  timeout: number,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Generic API call handler
 */
async function apiCall<T>(action: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  // Use mock data in development
  if (USE_MOCK_DATA) {
    logger.log(`🔧 Using MOCK data for action: ${action}`);
    // Mock data enabled - bypassing API calls for development
    const response = handleMockResponse<T>(action, params);
    logger.log(`📊 Mock data response:`, response);
    return response;
  }

  // Check if API URL is configured - if not, fallback to mock data
  if (!API_URL || API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ API URL not configured. Using mock data as fallback.');
    }
    // Return mock data instead of error for better UX
    return handleMockResponse<T>(action, params);
  }

  try {
    const url = buildUrl(action, params);
    // Development logging removed - monitor network tab for API calls

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if response has error
    if (data.error) {
      throw new Error(data.error);
    }

    // API call successful - returning data
    return {
      success: true,
      data: data as T,
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    if (process.env.NODE_ENV === 'development') {
      logger.error(`❌ API Error: ${action}`, error);
    }

    // Handle specific errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout. Please check your internet connection.',
      };
    }

    // Sanitize error messages to prevent exposing sensitive information
    let sanitizedError = errorMessage;

    // Remove IP addresses (IPv4 and IPv6)
    sanitizedError = sanitizedError.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REMOVED]');
    sanitizedError = sanitizedError.replace(/(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g, '[IP_REMOVED]');

    // Remove potential file paths
    sanitizedError = sanitizedError.replace(/([A-Z]:)?[\\/][\w\s\\/.-]+/gi, '[PATH_REMOVED]');

    // Remove port numbers
    sanitizedError = sanitizedError.replace(/:\d{2,5}/g, ':[PORT]');

    return {
      success: false,
      error: sanitizedError,
    };
  }
}

/**
 * Handle mock responses for development
 */
function handleMockResponse<T>(action: string, params?: Record<string, string>): ApiResponse<T> {
  switch (action) {
    case 'getStats':
      return { success: true, data: MOCK_STATS as T };

    case 'getAllStudents':
      return { success: true, data: { students: MOCK_STUDENTS } as T };

    case 'getStudent': {
      const studentId = params?.studentId;
      const mockStudent = MOCK_STUDENTS.find(s => s.studentCode === studentId);
      if (mockStudent) {
        return { success: true, data: mockStudent as T };
      }
      return { success: false, error: 'Student not found' };
    }

    default:
      return { success: false, error: 'Mock data not available for this action' };
  }
}

// ====================================
// PUBLIC API METHODS
// ====================================

/**
 * Get dashboard statistics
 * Routes to Firestore or Google Sheets based on configuration
 */
export async function getStats(): Promise<ApiResponse<DashboardStats>> {
  if (USE_FIRESTORE) {
    if (process.env.NODE_ENV === 'development') {
      logger.log('📊 Fetching stats from Firestore');
    }
    return firestoreApi.getStats();
  }
  return apiCall<DashboardStats>('getStats');
}

/**
 * Get all students (summary data)
 * Routes to Firestore or Google Sheets based on configuration
 */
export async function getAllStudents(): Promise<ApiResponse<{ students: Student[] }>> {
  logger.log(`🎓 getAllStudents called - USE_FIRESTORE: ${USE_FIRESTORE}, USE_MOCK_DATA: ${USE_MOCK_DATA}`);

  if (USE_FIRESTORE) {
    logger.log('👥 Fetching students from Firestore');
    return firestoreApi.getAllStudents();
  }

  const result = await apiCall<{ students: Student[] }>('getAllStudents');
  logger.log(`✅ getAllStudents result - success: ${result.success}, student count: ${result.data?.students?.length || 0}`);
  return result;
}

/**
 * Get detailed student information
 * Routes to Firestore or Google Sheets based on configuration
 */
export async function getStudent(studentId: string): Promise<ApiResponse<DetailedStudent>> {
  if (USE_FIRESTORE) {
    if (process.env.NODE_ENV === 'development') {
      logger.log(`🔍 Fetching student ${studentId} from Firestore`);
    }
    return firestoreApi.getStudent(studentId);
  }
  return apiCall<DetailedStudent>('getStudent', { studentId });
}

/**
 * Sync new students from Google Form responses
 */
export async function syncStudents(): Promise<ApiResponse<{ added: number; message: string }>> {
  return apiCall<{ added: number; message: string }>('syncStudents');
}

/**
 * Initial sync - import all students (first time setup)
 */
export async function initialSync(): Promise<ApiResponse<{ added: number; total: number; message: string }>> {
  return apiCall<{ added: number; total: number; message: string }>('initialSync');
}

/**
 * Analyze one student with AI
 */
export async function analyzeStudent(studentId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
  return apiCall<{ success: boolean; message: string }>('analyzeOneStudent', { studentId });
}

/**
 * Test API connection
 * Tests either Firestore or Google Sheets based on configuration
 */
export async function testConnection(): Promise<ApiResponse<{
  message: string;
  mode: string;
  stats?: DashboardStats;
}>> {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      data: {
        message: 'Using mock data (development mode)',
        mode: 'MOCK',
      },
    };
  }

  // Use Firestore if configured
  if (USE_FIRESTORE) {
    return firestoreApi.testConnection();
  }

  // Fall back to Google Apps Script
  if (!API_URL || API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    return {
      success: false,
      error: 'API URL not configured',
    };
  }

  try {
    const url = buildUrl('getStats');
    const response = await fetchWithTimeout(url, 10000); // 10 second timeout for test

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: {
        message: 'API connected successfully',
        mode: 'GOOGLE_SHEETS',
        stats: data,
      },
    };

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Connection failed: ${errorMessage}`,
    };
  }
}

// ====================================
// ADMIN & ANALYSIS MANAGEMENT FUNCTIONS
// ====================================

/**
 * Analyze a single student (admin function)
 */
export async function analyzeOneStudent(studentCode: string): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // For Firestore, trigger analysis via Cloud Function or direct analysis
    return analyzeStudent(studentCode);
  }

  // Google Apps Script implementation
  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('analyzeOneStudent');
    const response = await fetchWithOptions(url, 30000, {
      method: 'POST',
      body: JSON.stringify({ studentCode }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Re-analyze a student (force new analysis)
 */
export async function reanalyzeStudent(studentCode: string): Promise<ApiResponse<any>> {
  // Same as analyzeOneStudent but forces re-analysis
  return analyzeOneStudent(studentCode);
}

/**
 * Get list of analyzed students
 */
export async function getAnalyzedStudents(): Promise<ApiResponse<{ students: string[] }>> {
  if (USE_FIRESTORE) {
    // Firestore mode - return empty list as analysis tracking not implemented
    return {
      success: true,
      data: { students: [] },
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('getAnalyzedStudents');
    const response = await fetchWithTimeout(url, 15000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get list of unanalyzed students
 */
export async function getUnanalyzedStudents(): Promise<ApiResponse<{ students: string[] }>> {
  if (USE_FIRESTORE) {
    // Firestore mode - return all students as potentially unanalyzed
    return {
      success: true,
      data: { students: [] },
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('getUnanalyzedStudents');
    const response = await fetchWithTimeout(url, 15000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze students in batches
 */
export async function analyzeBatch(batchSize: number): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    return {
      success: false,
      error: 'Batch analysis not available in Firestore mode. Use individual analysis.',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('analyzeBatch');
    const response = await fetchWithOptions(url, 60000, {
      method: 'POST',
      body: JSON.stringify({ batchSize }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Standard batch analysis operation
 */
export async function standardBatch(): Promise<ApiResponse<any>> {
  return analyzeBatch(5);
}

/**
 * Quick batch analysis operation
 */
export async function quickBatch(): Promise<ApiResponse<any>> {
  return analyzeBatch(3);
}

/**
 * Delete student analysis
 */
export async function deleteStudentAnalysis(studentCode: string): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - deletion not available
    return {
      success: false,
      error: 'Delete analysis not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('deleteStudentAnalysis');
    const response = await fetchWithOptions(url, 15000, {
      method: 'DELETE',
      body: JSON.stringify({ studentCode }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete analyses older than specified days
 */
export async function deleteOldAnalyses(daysOld: number): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - deletion not available
    return {
      success: false,
      error: 'Delete old analyses not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('deleteOldAnalyses');
    const response = await fetchWithOptions(url, 15000, {
      method: 'DELETE',
      body: JSON.stringify({ daysOld }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete all analyses (requires admin token)
 */
export async function deleteAllAnalyses(): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - deletion not available
    return {
      success: false,
      error: 'Delete all analyses not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('deleteAllAnalyses');
    const response = await fetchWithOptions(url, 15000, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Backup all analyses
 */
export async function backupAnalyses(): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - backup not available
    return {
      success: false,
      error: 'Backup not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('backupAnalyses');
    const response = await fetchWithOptions(url, 30000, {
      method: 'POST',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Search analyses
 */
export async function searchAnalyses(query: string): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - search not available
    return {
      success: true,
      data: { results: [] },
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('searchAnalyses');
    const response = await fetchWithOptions(url, 15000, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get audit log
 */
export async function getAuditLog(): Promise<ApiResponse<{ events: any[] }>> {
  if (USE_FIRESTORE) {
    // Firestore mode - audit log not available
    return {
      success: true,
      data: { events: [] },
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('getAuditLog');
    const response = await fetchWithTimeout(url, 15000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Health check for admin dashboard
 */
export async function healthCheck(): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - check Firebase connectivity
    const { db } = await import('../config/firebase');
    return {
      success: !!db,
      data: {
        status: db ? 'healthy' : 'unhealthy',
        mode: 'FIRESTORE',
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (!API_URL) {
    return {
      success: false,
      error: 'API URL not configured',
    };
  }

  try {
    const url = buildUrl('healthCheck');
    const response = await fetchWithTimeout(url, 10000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * List available backups
 */
export async function listBackups(): Promise<ApiResponse<{ backups: any[] }>> {
  if (USE_FIRESTORE) {
    // Firestore mode - backups not available
    return {
      success: true,
      data: { backups: [] },
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('listBackups');
    const response = await fetchWithTimeout(url, 15000);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Analyze all unanalyzed students
 */
export async function analyzeAllUnanalyzed(): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - batch analysis not available
    return {
      success: false,
      error: 'Batch analysis not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('analyzeAllUnanalyzed');
    const response = await fetchWithOptions(url, 120000, {
      method: 'POST',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete analyses by class
 */
export async function deleteByClass(classId: string): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - delete by class not available
    return {
      success: false,
      error: 'Delete by class not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('deleteByClass');
    const response = await fetchWithOptions(url, 15000, {
      method: 'DELETE',
      body: JSON.stringify({ classId }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete all analyses with admin token
 */
export async function deleteAllAnalysesWithToken(token: string): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - deletion not available
    return {
      success: false,
      error: 'Delete all not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('deleteAllAnalyses');
    const response = await fetchWithOptions(url, 15000, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Restore from backup with admin token
 */
export async function restoreFromBackupWithToken(
  backupId: string,
  token: string
): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - restore not available
    return {
      success: false,
      error: 'Restore not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('restoreFromBackup');
    const response = await fetchWithOptions(url, 30000, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ backupId }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Export analyses data
 */
export async function exportAnalyses(): Promise<ApiResponse<any>> {
  if (USE_FIRESTORE) {
    // Firestore mode - export not available
    return {
      success: false,
      error: 'Export not available in Firestore mode',
    };
  }

  if (!API_URL) {
    return { success: false, error: 'API URL not configured' };
  }

  try {
    const url = buildUrl('exportAnalyses');
    const response = await fetchWithOptions(url, 60000, {
      method: 'GET',
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ====================================
// REACT QUERY HELPERS
// ====================================

/**
 * Query keys for React Query
 */
export const queryKeys = {
  stats: ['stats'],
  students: ['students'],
  student: (id: string) => ['student', id],
};

/**
 * Default React Query options
 */
export const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  retry: 2,
  refetchOnWindowFocus: false,
};

// ====================================
// EXPORT UTILITIES
// ====================================

export const api = {
  // Core API functions
  getStats,
  getAllStudents,
  getStudent,
  syncStudents,
  initialSync,
  analyzeStudent,
  testConnection,

  // Admin & Analysis Management functions
  analyzeOneStudent,
  reanalyzeStudent,
  getAnalyzedStudents,
  getUnanalyzedStudents,
  analyzeBatch,
  standardBatch,
  quickBatch,
  deleteStudentAnalysis,
  deleteOldAnalyses,
  deleteAllAnalyses,
  backupAnalyses,
  searchAnalyses,
  getAuditLog,
  healthCheck,
  listBackups,
  analyzeAllUnanalyzed,
  deleteByClass,
  deleteAllAnalysesWithToken,
  restoreFromBackupWithToken,
  exportAnalyses,
};

export default api;
