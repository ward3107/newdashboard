/**
 * API Service for ISHEBOT Student Dashboard
 * Connects to Google Apps Script Web App
 */

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
  {
    studentCode: '70101',
    quarter: 'Q1',
    classId: 'ז1',
    date: '15/10/2025',
    name: 'דני כהן',
    learningStyle: 'חזותי',
    keyNotes: 'תלמיד מצטיין בלימודים חזותיים',
    strengthsCount: 6,
    challengesCount: 2,
  },
  {
    studentCode: '70102',
    quarter: 'Q1',
    classId: 'ז1',
    date: '15/10/2025',
    name: 'שרה לוי',
    learningStyle: 'שמיעתי',
    keyNotes: 'מעדיפה הסברים בעל פה',
    strengthsCount: 5,
    challengesCount: 3,
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
    console.warn('⚠️ VITE_API_URL not set in .env.local');
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
 * Generic API call handler
 */
async function apiCall<T>(action: string, params?: Record<string, string>): Promise<ApiResponse<T>> {
  // Use mock data in development
  if (USE_MOCK_DATA) {
    console.log(`🔧 Using mock data for action: ${action}`);
    return handleMockResponse<T>(action, params);
  }

  // Check if API URL is configured
  if (!API_URL || API_URL.includes('YOUR_DEPLOYMENT_ID')) {
    console.error('❌ API URL not configured. Please update .env.local');
    return {
      success: false,
      error: 'API not configured. Please deploy Google Apps Script and update .env.local',
    };
  }

  try {
    const url = buildUrl(action, params);
    console.log(`📡 API Call: ${action}`, params);

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if response has error
    if (data.error) {
      throw new Error(data.error);
    }

    console.log(`✅ API Success: ${action}`, data);

    return {
      success: true,
      data: data as T,
    };

  } catch (error: any) {
    console.error(`❌ API Error: ${action}`, error);

    // Handle specific errors
    if (error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout. Please check your internet connection.',
      };
    }

    // Sanitize error messages to prevent exposing sensitive information
    let sanitizedError = error.message || 'Unknown error occurred';

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

    case 'getStudent':
      const studentId = params?.studentId;
      const mockStudent = MOCK_STUDENTS.find(s => s.studentCode === studentId);
      if (mockStudent) {
        return { success: true, data: mockStudent as T };
      }
      return { success: false, error: 'Student not found' };

    default:
      return { success: false, error: 'Mock data not available for this action' };
  }
}

// ====================================
// PUBLIC API METHODS
// ====================================

/**
 * Get dashboard statistics
 */
export async function getStats(): Promise<ApiResponse<DashboardStats>> {
  return apiCall<DashboardStats>('getStats');
}

/**
 * Get all students (summary data)
 */
export async function getAllStudents(): Promise<ApiResponse<{ students: Student[] }>> {
  return apiCall<{ students: Student[] }>('getAllStudents');
}

/**
 * Get detailed student information
 */
export async function getStudent(studentId: string): Promise<ApiResponse<DetailedStudent>> {
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
 */
export async function testConnection(): Promise<ApiResponse<any>> {
  if (USE_MOCK_DATA) {
    return {
      success: true,
      data: {
        message: 'Using mock data (development mode)',
        mode: 'MOCK',
      },
    };
  }

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
        mode: 'LIVE',
        stats: data,
      },
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Connection failed: ${error.message}`,
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
  getStats,
  getAllStudents,
  getStudent,
  syncStudents,
  initialSync,
  analyzeStudent,
  testConnection,
};

export default api;
