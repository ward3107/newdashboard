// Google Apps Script API Service
// Complete integration with all available functions

import logger from '../utils/logger.js';

const API_URL =
  import.meta.env.VITE_GOOGLE_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbxSawbi4f370i94rPA2EpVZh3LlfMisq7uu6r3pS0Q3rQU8nW5qTk_Witm1FVd5kQtb/exec";

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

export const getAllStudents = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getAllStudents`);
    const data = await response.json();

    // Remove duplicates based on studentCode
    const uniqueStudentsMap = new Map();

    (data.students || []).forEach(student => {
      // Only add if we haven't seen this studentCode before, or if this one has more complete data
      const existingStudent = uniqueStudentsMap.get(student.studentCode);

      // Keep the student record with more data
      if (!existingStudent ||
          (student.strengthsCount > 0 && (!existingStudent.strengthsCount || existingStudent.strengthsCount === 0)) ||
          (student.keyNotes && !existingStudent.keyNotes) ||
          (student.analysis && !existingStudent.analysis)) {
        uniqueStudentsMap.set(student.studentCode, {
          ...student,
          name: typeof student.name === 'number'
            ? `תלמיד ${student.studentCode}`
            : student.name || `תלמיד ${student.studentCode}`,
          // Use consistent avatar based on student code
          avatar: (parseInt(student.studentCode) % 4) + 1
        });
      }
    });

    // Convert map back to array
    const students = Array.from(uniqueStudentsMap.values());


    return { success: true, students };
  } catch (error) {
    logger.error("Error fetching students:", error);
    return { success: false, error: error.message };
  }
};

export const getStudent = async (studentCode) => {
  try {
    // NOTE: Using 'studentId' instead of 'studentCode' because the deployed Google Apps Script
    // expects 'studentId' parameter. Update this to 'studentCode' after redeploying the script.
    const url = `${API_URL}?action=getStudent&studentId=${studentCode}`;

    const response = await fetch(url);
    const data = await response.json();


    // Check if the API returned an error
    if (data.error) {
      logger.error("❌ API returned error:", data.error);
      return { success: false, error: data.error };
    }

    return { success: true, student: data };
  } catch (error) {
    logger.error("❌ Error fetching student:", error);
    return { success: false, error: error.message };
  }
};

export const getStats = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getStats`);
    const data = await response.json();
    return { success: true, stats: data };
  } catch (error) {
    logger.error("Error fetching stats:", error);
    return { success: false, error: error.message };
  }
};

export const analyzeOneStudent = async (studentCode) => {
  try {
    // NOTE: Using 'studentId' for compatibility with deployed Google Apps Script
    const response = await fetch(`${API_URL}?action=analyzeOneStudent&studentId=${studentCode}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error analyzing student:", error);
    return { success: false, error: error.message };
  }
};

export const syncStudents = async () => {
  try {
    const response = await fetch(`${API_URL}?action=syncStudents`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error syncing students:", error);
    return { success: false, error: error.message };
  }
};

export const initialSync = async () => {
  try {
    const response = await fetch(`${API_URL}?action=initialSync`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in initial sync:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// DELETE FUNCTIONS
// ============================================================================

export const deleteStudentAnalysis = async (studentCode) => {
  try {
    const response = await fetch(`${API_URL}?action=deleteStudentAnalysis&studentCode=${studentCode}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting analysis:", error);
    return { success: false, error: error.message };
  }
};

export const deleteMultipleAnalyses = async (studentCodes) => {
  try {
    const response = await fetch(`${API_URL}?action=deleteMultipleAnalyses&studentCodes=${studentCodes.join(',')}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting multiple analyses:", error);
    return { success: false, error: error.message };
  }
};

export const deleteByClass = async (classId) => {
  try {
    const response = await fetch(`${API_URL}?action=deleteByClass&classId=${classId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting by class:", error);
    return { success: false, error: error.message };
  }
};

export const deleteAllAnalyses = async () => {
  try {
    const response = await fetch(`${API_URL}?action=deleteAllAnalyses`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting all analyses:", error);
    return { success: false, error: error.message };
  }
};

export const deleteOldAnalyses = async (days = 30) => {
  try {
    const response = await fetch(`${API_URL}?action=deleteOldAnalyses&days=${days}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting old analyses:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// RE-ANALYZE FUNCTIONS
// ============================================================================

export const reanalyzeStudent = async (studentCode) => {
  try {
    const response = await fetch(`${API_URL}?action=reanalyzeStudent&studentCode=${studentCode}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error re-analyzing student:", error);
    return { success: false, error: error.message };
  }
};

export const reanalyzeMultiple = async (studentCodes) => {
  try {
    const response = await fetch(`${API_URL}?action=reanalyzeMultiple&studentCodes=${studentCodes.join(',')}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error re-analyzing multiple:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// BATCH FUNCTIONS
// ============================================================================

export const analyzeBatch = async (batchSize = 5) => {
  try {
    const response = await fetch(`${API_URL}?action=analyzeBatch&batchSize=${batchSize}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in batch analysis:", error);
    return { success: false, error: error.message };
  }
};

export const standardBatch = async () => {
  try {
    const response = await fetch(`${API_URL}?action=standardBatch`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in standard batch:", error);
    return { success: false, error: error.message };
  }
};

export const quickBatch = async () => {
  try {
    const response = await fetch(`${API_URL}?action=quickBatch`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error in quick batch:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getAnalyzedStudents = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getAnalyzedStudents`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error getting analyzed students:", error);
    return { success: false, error: error.message };
  }
};

export const getUnanalyzedStudents = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getUnanalyzedStudents`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error getting unanalyzed students:", error);
    return { success: false, error: error.message };
  }
};

export const backupAnalyses = async () => {
  try {
    const response = await fetch(`${API_URL}?action=backupAnalyses`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error backing up analyses:", error);
    return { success: false, error: error.message };
  }
};

export const restoreFromBackup = async (backupId) => {
  try {
    const response = await fetch(`${API_URL}?action=restoreFromBackup&backupId=${backupId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error restoring backup:", error);
    return { success: false, error: error.message };
  }
};

export const getAuditLog = async () => {
  try {
    const response = await fetch(`${API_URL}?action=getAuditLog`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error getting audit log:", error);
    return { success: false, error: error.message };
  }
};

export const searchAnalyses = async (query) => {
  try {
    const response = await fetch(`${API_URL}?action=searchAnalyses&query=${encodeURIComponent(query)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error searching analyses:", error);
    return { success: false, error: error.message };
  }
};

export const testConnection = async () => {
  try {
    const response = await fetch(`${API_URL}?action=test`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error testing connection:", error);
    return { success: false, error: error.message };
  }
};

// ============================================================================
// NEW ADMIN FUNCTIONS
// ============================================================================

export const analyzeAllUnanalyzed = async () => {
  try {
    const response = await fetch(`${API_URL}?action=analyzeAllUnanalyzed`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error analyzing all unanalyzed:", error);
    return { success: false, error: error.message };
  }
};

export const listBackups = async () => {
  try {
    const response = await fetch(`${API_URL}?action=listBackups`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error listing backups:", error);
    return { success: false, error: error.message };
  }
};

export const exportAnalyses = async (format = 'json') => {
  try {
    const response = await fetch(`${API_URL}?action=exportAnalyses&format=${format}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error exporting analyses:", error);
    return { success: false, error: error.message };
  }
};

export const healthCheck = async () => {
  try {
    const response = await fetch(`${API_URL}?action=healthCheck`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error checking health:", error);
    return { success: false, error: error.message };
  }
};

export const deleteAllAnalysesWithToken = async (token) => {
  try {
    const response = await fetch(`${API_URL}?action=deleteAllAnalyses&token=${token}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error deleting all analyses:", error);
    return { success: false, error: error.message };
  }
};

export const restoreFromBackupWithToken = async (backupId, token) => {
  try {
    const response = await fetch(`${API_URL}?action=restoreFromBackup&backupId=${backupId}&token=${token}`);
    const data = await response.json();
    return data;
  } catch (error) {
    logger.error("Error restoring backup:", error);
    return { success: false, error: error.message };
  }
};