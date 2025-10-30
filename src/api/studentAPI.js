import axios from 'axios';
import { API_CONFIG, MOCK_DATA, FEATURES, GOOGLE_APPS_SCRIPT_CONFIG } from '../config';

// Create axios instance with default config
const api = axios.create({
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    throw new Error(
      error.response?.data?.message ||
      error.message ||
      'שגיאה בטעינת הנתונים'
    );
  }
);

// Retry function for failed requests
const retryRequest = async (fn, retries = API_CONFIG.RETRY_ATTEMPTS) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// Mock API delay for development
const mockDelay = (ms = 800) =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Normalize student data from Google Forms to our expected format
 * @param {Object} rawStudent - Raw student data from Google Forms
 * @returns {Object} Normalized student data
 */
const normalizeStudentData = (rawStudent) => {
  // Direct field access - simpler and safer
  const studentCode = rawStudent.studentCode || rawStudent.ID || rawStudent.id || '';
  const classId = rawStudent.classId || rawStudent.class || rawStudent.grade || 'Unknown';

  return {
    ...rawStudent,
    studentCode: String(studentCode),
    classId: String(classId),
    learningStyle: String(rawStudent.learningStyle || rawStudent.learning_style || ''),
    keyNotes: String(rawStudent.keyNotes || rawStudent.key_notes || rawStudent.notes || ''),
    strengthsCount: parseInt(rawStudent.strengthsCount || rawStudent.strengths_count || 0) || 0,
    challengesCount: parseInt(rawStudent.challengesCount || rawStudent.challenges_count || 0) || 0,
    quarter: String(rawStudent.quarter || rawStudent.Quarter || 'Q1'),
    date: String(rawStudent.date || rawStudent.Date || new Date().toISOString().split('T')[0])
  };
};

/**
 * Get all students data
 * @returns {Promise<Array>} Array of student objects
 */
export const getAllStudents = async () => {
  console.log('🔍 getAllStudents called');
  console.log('📊 ENABLE_MOCK_DATA:', FEATURES.ENABLE_MOCK_DATA);

  if (FEATURES.ENABLE_MOCK_DATA) {
    console.log('📦 Using mock data');
    await mockDelay();
    return MOCK_DATA.students;
  }

  console.log('🌐 Fetching from API:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_STUDENTS}`);

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_ALL_STUDENTS}`
    );

    console.log('✅ API Response:', response.data);
    console.log('🔍 Response structure:', {
      hasStudents: !!response.data?.students,
      hasData: !!response.data?.data,
      isArray: Array.isArray(response.data),
      keys: Object.keys(response.data || {})
    });

    // Handle different API response formats
    let studentsArray = null;

    if (response.data?.students) {
      // Format 1: { students: [...] }
      studentsArray = response.data.students;
    } else if (response.data?.data) {
      // Format 2: { data: [...] }
      studentsArray = response.data.data;
    } else if (Array.isArray(response.data)) {
      // Format 3: Direct array
      studentsArray = response.data;
    }

    if (studentsArray && Array.isArray(studentsArray)) {
      console.log(`📊 Found ${studentsArray.length} students`);
      // Normalize the data from Google Forms format
      return studentsArray.map(normalizeStudentData);
    }

    console.error('❌ No students array found in response. Response:', response.data);
    // Return empty array instead of throwing error when there are 0 students
    return [];
  });
};

/**
 * Get specific student details
 * @param {string} studentId - Student code/ID
 * @returns {Promise<Object>} Student detail object
 */
export const getStudent = async (studentId) => {
  if (!studentId) {
    throw new Error('קוד תלמיד חסר');
  }

  if (FEATURES.ENABLE_MOCK_DATA) {
    await mockDelay();

    // Simulate student not found
    if (studentId === '99999') {
      throw new Error('תלמיד לא נמצא');
    }

    return MOCK_DATA.studentDetail;
  }

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_STUDENT}${studentId}`
    );

    if (response.data) {
      // Normalize the student data if it's a basic student object
      if (response.data.studentCode || response.data.ID) {
        response.data = normalizeStudentData(response.data);
      }
      return response.data;
    }

    throw new Error('תלמיד לא נמצא');
  });
};

/**
 * Get statistics data
 * @returns {Promise<Object>} Statistics object
 */
export const getStats = async () => {
  if (FEATURES.ENABLE_MOCK_DATA) {
    await mockDelay(300);
    return MOCK_DATA.stats;
  }

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.GET_STATS}`
    );

    if (response.data) {
      return response.data;
    }

    throw new Error('שגיאה בטעינת סטטיסטיקות');
  });
};

/**
 * Trigger analysis for a specific student
 * @param {string} studentId - Student code/ID
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeStudent = async (studentId) => {
  if (!studentId) {
    throw new Error('קוד תלמיד חסר');
  }

  if (FEATURES.ENABLE_MOCK_DATA) {
    await mockDelay(3000); // Simulate longer analysis time
    return { success: true, message: 'ניתוח הושלם בהצלחה' };
  }

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYZE_STUDENT}${studentId}`
    );

    if (response.data) {
      return response.data;
    }

    throw new Error('שגיאה בניתוח התלמיד');
  });
};

/**
 * Search students by name or ID
 * @param {string} query - Search query
 * @param {Array} students - Students array to search in
 * @returns {Array} Filtered students
 */
export const searchStudents = (query, students) => {
  if (!query || !query.trim()) {
    return students;
  }

  const searchTerm = query.trim().toLowerCase();

  return students.filter(student =>
    student.studentCode.toLowerCase().includes(searchTerm) ||
    student.classId.toLowerCase().includes(searchTerm) ||
    student.keyNotes.toLowerCase().includes(searchTerm)
  );
};

/**
 * Filter students by various criteria
 * @param {Array} students - Students array
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered students
 */
export const filterStudents = (students, filters) => {
  let filtered = [...students];

  // Filter by class
  if (filters.classId && filters.classId !== 'all') {
    filtered = filtered.filter(student => student.classId === filters.classId);
  }

  // Filter by quarter
  if (filters.quarter && filters.quarter !== 'all') {
    filtered = filtered.filter(student => student.quarter === filters.quarter);
  }

  // Filter by learning style
  if (filters.learningStyle && filters.learningStyle !== 'all') {
    filtered = filtered.filter(student =>
      student.learningStyle.includes(filters.learningStyle)
    );
  }

  // Filter by strengths count
  if (filters.minStrengths) {
    filtered = filtered.filter(student =>
      student.strengthsCount >= parseInt(filters.minStrengths)
    );
  }

  // Filter by challenges count
  if (filters.maxChallenges) {
    filtered = filtered.filter(student =>
      student.challengesCount <= parseInt(filters.maxChallenges)
    );
  }

  return filtered;
};

/**
 * Sort students by various criteria
 * @param {Array} students - Students array
 * @param {string} sortBy - Sort criteria
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Array} Sorted students
 */
export const sortStudents = (students, sortBy = 'studentCode', sortOrder = 'asc') => {
  const sorted = [...students].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'name':
      case 'studentCode':
        aValue = a.studentCode;
        bValue = b.studentCode;
        break;
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'classId':
        aValue = a.classId;
        bValue = b.classId;
        break;
      case 'strengthsCount':
        aValue = a.strengthsCount;
        bValue = b.strengthsCount;
        break;
      case 'challengesCount':
        aValue = a.challengesCount;
        bValue = b.challengesCount;
        break;
      default:
        aValue = a.studentCode;
        bValue = b.studentCode;
    }

    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue, 'he')
        : bValue.localeCompare(aValue, 'he');
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return sorted;
};

/**
 * Get unique values for filters
 * @param {Array} students - Students array
 * @returns {Object} Unique values for each filter category
 */
export const getFilterOptions = (students) => {
  const classes = [...new Set(students.map(s => s.classId))].sort();
  const quarters = [...new Set(students.map(s => s.quarter))].sort();

  // Extract learning styles from the learning style strings
  const learningStyles = [...new Set(
    students.flatMap(s =>
      s.learningStyle.split('\n')
        .map(style => style.replace(/^• \S+ /, '').trim())
        .filter(style => style.length > 0)
    )
  )].sort();

  return {
    classes,
    quarters,
    learningStyles,
    strengthsRange: {
      min: Math.min(...students.map(s => s.strengthsCount)),
      max: Math.max(...students.map(s => s.strengthsCount))
    },
    challengesRange: {
      min: Math.min(...students.map(s => s.challengesCount)),
      max: Math.max(...students.map(s => s.challengesCount))
    }
  };
};

/**
 * Calculate statistics from students data
 * @param {Array} students - Students array
 * @returns {Object} Calculated statistics
 */
export const calculateStats = (students) => {
  if (!students || students.length === 0) {
    return {
      totalStudents: 0,
      byClass: {},
      byLearningStyle: {},
      averageStrengths: 0,
      averageChallenges: 0
    };
  }

  // Count by class
  const byClass = students.reduce((acc, student) => {
    acc[student.classId] = (acc[student.classId] || 0) + 1;
    return acc;
  }, {});

  // Count by learning style
  const byLearningStyle = students.reduce((acc, student) => {
    const styles = student.learningStyle.split('\n')
      .map(style => style.replace(/^• \S+ /, '').trim())
      .filter(style => style.length > 0);

    styles.forEach(style => {
      acc[style] = (acc[style] || 0) + 1;
    });

    return acc;
  }, {});

  // Calculate averages
  const totalStrengths = students.reduce((sum, s) => sum + s.strengthsCount, 0);
  const totalChallenges = students.reduce((sum, s) => sum + s.challengesCount, 0);

  return {
    totalStudents: students.length,
    byClass,
    byLearningStyle,
    averageStrengths: (totalStrengths / students.length).toFixed(1),
    averageChallenges: (totalChallenges / students.length).toFixed(1)
  };
};

/**
 * Test connection to Google Apps Script
 * @param {string} webAppUrl - Google Apps Script Web App URL
 * @returns {Promise<Object>} Connection test result
 */
export const testConnection = async (webAppUrl) => {
  if (!webAppUrl) {
    throw new Error('URL חסר');
  }

  try {
    const response = await api.get(`${webAppUrl}?action=test&timestamp=${Date.now()}`);
    return response.data;
  } catch (error) {
    console.error('Connection test failed:', error);
    throw new Error(`בדיקת החיבור נכשלה: ${error.message}`);
  }
};

/**
 * Update API configuration to use real data
 * @param {Object} config - Configuration object with webAppUrl and spreadsheetId
 */
export const updateApiConfig = (config) => {
  if (config.webAppUrl) {
    API_CONFIG.BASE_URL = config.webAppUrl;
    GOOGLE_APPS_SCRIPT_CONFIG.WEB_APP_URL = config.webAppUrl;
  }

  if (config.spreadsheetId) {
    GOOGLE_APPS_SCRIPT_CONFIG.SPREADSHEET_ID = config.spreadsheetId;
  }

  // Disable mock data when real connection is established
  FEATURES.ENABLE_MOCK_DATA = false;

  // Store in localStorage for persistence
  localStorage.setItem('connectionConfig', JSON.stringify(config));
};

/**
 * Get saved connection configuration
 * @returns {Object|null} Saved configuration or null
 */
export const getSavedConfig = () => {
  try {
    const saved = localStorage.getItem('connectionConfig');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Error loading saved config:', error);
    return null;
  }
};

/**
 * Check if real data connection is active
 * @returns {boolean} True if connected to real data
 */
export const isConnectedToRealData = () => {
  const savedConfig = getSavedConfig();
  return savedConfig && savedConfig.webAppUrl && !FEATURES.ENABLE_MOCK_DATA;
};

/**
 * Debug function to analyze raw data structure from Google Forms
 * @param {Array} rawData - Raw data from Google Forms
 * @returns {Object} Analysis of field names and data structure
 */
export const analyzeGoogleFormsData = (rawData) => {
  if (!rawData || rawData.length === 0) {
    return { error: 'No data provided' };
  }

  const firstRow = rawData[0];
  const fieldNames = Object.keys(firstRow);

  return {
    totalRows: rawData.length,
    fieldNames,
    sampleData: firstRow,
    nameFieldCandidates: fieldNames.filter(field =>
      /name|שם|student/i.test(field)
    ),
    idFieldCandidates: fieldNames.filter(field =>
      /id|code|קוד|מספר/i.test(field)
    ),
    classFieldCandidates: fieldNames.filter(field =>
      /class|כיתה|grade/i.test(field)
    )
  };
};

/**
 * Sync new students from Google Forms responses
 * Adds only new students that don't already exist in the students sheet
 * @returns {Promise<Object>} Sync result with count of added students
 */
export const syncNewStudents = async () => {
  if (FEATURES.ENABLE_MOCK_DATA) {
    await mockDelay(1500);
    return {
      success: true,
      added: 0,
      message: 'אין תלמידים חדשים (נתוני דמו)'
    };
  }

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SYNC_STUDENTS}`
    );

    if (response.data) {
      return response.data;
    }

    throw new Error('שגיאה בסנכרון תלמידים');
  });
};

/**
 * Perform initial sync of all existing students from responses
 * This is a one-time operation to import all students who have already submitted responses
 * @returns {Promise<Object>} Sync result with count of added students
 */
export const initialSyncAllStudents = async () => {
  if (FEATURES.ENABLE_MOCK_DATA) {
    await mockDelay(2000);
    return {
      success: true,
      added: 6,
      total: 6,
      message: 'סנכרון ראשוני הושלם (נתוני דמו)'
    };
  }

  return retryRequest(async () => {
    const response = await api.get(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INITIAL_SYNC}`
    );

    if (response.data) {
      return response.data;
    }

    throw new Error('שגיאה בסנכרון ראשוני');
  });
};

export default {
  getAllStudents,
  getStudent,
  getStats,
  analyzeStudent,
  searchStudents,
  filterStudents,
  sortStudents,
  getFilterOptions,
  calculateStats,
  testConnection,
  updateApiConfig,
  getSavedConfig,
  isConnectedToRealData,
  analyzeGoogleFormsData,
  syncNewStudents,
  initialSyncAllStudents
};