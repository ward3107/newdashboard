/**
 * Firebase Service Layer
 * Complete CRUD operations for Firestore collections
 * Replaces Google Apps Script API with clean Firebase operations
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Student,
  StudentCreateData,
  FormResponse,
  FormResponseCreateData,
  AIAnalysis,
  AIAnalysisCreateData,
  Classroom,
  QueryFilters,
  PaginationOptions,
  ClassStatistics,
  PerformanceScores,
} from '../types/firestore';

/**
 * ============================================================================
 * STUDENT OPERATIONS
 * ============================================================================
 */

/**
 * Get all students for a school
 */
export async function getAllStudents(schoolId: string, filters?: QueryFilters) {
  try {
    const studentsRef = collection(db, 'schools', schoolId, 'students');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.classId) {
      constraints.push(where('classId', '==', filters.classId));
    }
    if (filters?.isActive !== undefined) {
      constraints.push(where('isActive', '==', filters.isActive));
    }

    // Default ordering
    constraints.push(orderBy('classId', 'asc'));
    constraints.push(orderBy('name', 'asc'));

    const q = query(studentsRef, ...constraints);
    const snapshot = await getDocs(q);

    const students: Student[] = [];
    snapshot.forEach((doc) => {
      students.push({ ...doc.data(), studentCode: doc.id } as Student);
    });

    return { success: true, students };
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return { success: false, error: error.message, students: [] };
  }
}

/**
 * Get a single student by code
 */
export async function getStudent(schoolId: string, studentCode: string) {
  try {
    const studentRef = doc(db, 'schools', schoolId, 'students', studentCode);
    const snapshot = await getDoc(studentRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Student not found', student: null };
    }

    const student = { ...snapshot.data(), studentCode } as Student;
    return { success: true, student };
  } catch (error: any) {
    console.error('Error fetching student:', error);
    return { success: false, error: error.message, student: null };
  }
}

/**
 * Create a new student
 */
export async function createStudent(schoolId: string, studentData: StudentCreateData) {
  try {
    const studentRef = doc(db, 'schools', schoolId, 'students', studentData.studentCode);

    const newStudent: Omit<Student, 'studentCode'> = {
      ...studentData,
      schoolId,
      hasCompletedQuestionnaire: false,
      isActive: true,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(studentRef, newStudent);

    return { success: true, studentCode: studentData.studentCode };
  } catch (error: any) {
    console.error('Error creating student:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a student
 */
export async function updateStudent(
  schoolId: string,
  studentCode: string,
  updates: Partial<Student>
) {
  try {
    const studentRef = doc(db, 'schools', schoolId, 'students', studentCode);

    await updateDoc(studentRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating student:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a student
 */
export async function deleteStudent(schoolId: string, studentCode: string) {
  try {
    const studentRef = doc(db, 'schools', schoolId, 'students', studentCode);
    await deleteDoc(studentRef);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting student:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch create students
 */
export async function batchCreateStudents(schoolId: string, students: StudentCreateData[]) {
  try {
    const batch = writeBatch(db);
    let count = 0;

    for (const studentData of students) {
      const studentRef = doc(db, 'schools', schoolId, 'students', studentData.studentCode);

      const newStudent: Omit<Student, 'studentCode'> = {
        ...studentData,
        schoolId,
        hasCompletedQuestionnaire: false,
        isActive: true,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      batch.set(studentRef, newStudent);
      count++;

      // Firestore batch limit is 500 operations
      if (count % 500 === 0) {
        await batch.commit();
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
    }

    return { success: true, count };
  } catch (error: any) {
    console.error('Error batch creating students:', error);
    return { success: false, error: error.message, count: 0 };
  }
}

/**
 * ============================================================================
 * FORM RESPONSE OPERATIONS
 * ============================================================================
 */

/**
 * Get all responses for a school
 */
export async function getAllResponses(schoolId: string, filters?: QueryFilters) {
  try {
    const responsesRef = collection(db, 'schools', schoolId, 'responses');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.classId) {
      constraints.push(where('classId', '==', filters.classId));
    }
    if (filters?.isAnalyzed !== undefined) {
      constraints.push(where('isAnalyzed', '==', filters.isAnalyzed));
    }

    // Default ordering by submission time (newest first)
    constraints.push(orderBy('submittedAt', 'desc'));

    const q = query(responsesRef, ...constraints);
    const snapshot = await getDocs(q);

    const responses: FormResponse[] = [];
    snapshot.forEach((doc) => {
      responses.push({ ...doc.data(), id: doc.id } as FormResponse);
    });

    return { success: true, responses };
  } catch (error: any) {
    console.error('Error fetching responses:', error);
    return { success: false, error: error.message, responses: [] };
  }
}

/**
 * Get responses for a specific student
 */
export async function getStudentResponses(schoolId: string, studentCode: string) {
  try {
    const responsesRef = collection(db, 'schools', schoolId, 'responses');
    const q = query(
      responsesRef,
      where('studentCode', '==', studentCode),
      orderBy('submittedAt', 'desc')
    );

    const snapshot = await getDocs(q);

    const responses: FormResponse[] = [];
    snapshot.forEach((doc) => {
      responses.push({ ...doc.data(), id: doc.id } as FormResponse);
    });

    return { success: true, responses };
  } catch (error: any) {
    console.error('Error fetching student responses:', error);
    return { success: false, error: error.message, responses: [] };
  }
}

/**
 * Get a single response
 */
export async function getResponse(schoolId: string, responseId: string) {
  try {
    const responseRef = doc(db, 'schools', schoolId, 'responses', responseId);
    const snapshot = await getDoc(responseRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Response not found', response: null };
    }

    const response = { ...snapshot.data(), id: responseId } as FormResponse;
    return { success: true, response };
  } catch (error: any) {
    console.error('Error fetching response:', error);
    return { success: false, error: error.message, response: null };
  }
}

/**
 * Create a new response
 */
export async function createResponse(schoolId: string, responseData: FormResponseCreateData) {
  try {
    const responsesRef = collection(db, 'schools', schoolId, 'responses');

    const newResponse: Omit<FormResponse, 'id'> = {
      ...responseData,
      schoolId,
      submittedAt: serverTimestamp() as Timestamp,
      isAnalyzed: false,
      status: 'submitted',
    };

    const docRef = await addDoc(responsesRef, newResponse);

    // Update student record
    await updateStudent(schoolId, responseData.studentCode, {
      hasCompletedQuestionnaire: true,
      lastResponseId: docRef.id,
    });

    return { success: true, responseId: docRef.id };
  } catch (error: any) {
    console.error('Error creating response:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch create responses (for migration)
 */
export async function batchCreateResponses(schoolId: string, responses: FormResponseCreateData[]) {
  try {
    const batch = writeBatch(db);
    let count = 0;
    const responseIds: string[] = [];

    for (const responseData of responses) {
      const responsesRef = collection(db, 'schools', schoolId, 'responses');
      const docRef = doc(responsesRef); // Generate ID

      const newResponse: Omit<FormResponse, 'id'> = {
        ...responseData,
        schoolId,
        submittedAt: responseData.submittedAt
          ? Timestamp.fromDate(responseData.submittedAt)
          : (serverTimestamp() as Timestamp),
        isAnalyzed: false,
        status: 'submitted',
      };

      batch.set(docRef, newResponse);
      responseIds.push(docRef.id);
      count++;

      if (count % 500 === 0) {
        await batch.commit();
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
    }

    return { success: true, count, responseIds };
  } catch (error: any) {
    console.error('Error batch creating responses:', error);
    return { success: false, error: error.message, count: 0, responseIds: [] };
  }
}

/**
 * ============================================================================
 * AI ANALYSIS OPERATIONS
 * ============================================================================
 */

/**
 * Get all analyses for a school
 */
export async function getAllAnalyses(schoolId: string, filters?: QueryFilters) {
  try {
    const analysesRef = collection(db, 'schools', schoolId, 'analyses');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (filters?.classId) {
      constraints.push(where('classId', '==', filters.classId));
    }
    if (filters?.quarter) {
      constraints.push(where('quarter', '==', filters.quarter));
    }

    // Default ordering by analysis time (newest first)
    constraints.push(orderBy('analyzedAt', 'desc'));

    const q = query(analysesRef, ...constraints);
    const snapshot = await getDocs(q);

    const analyses: AIAnalysis[] = [];
    snapshot.forEach((doc) => {
      analyses.push({ ...doc.data(), id: doc.id } as AIAnalysis);
    });

    return { success: true, analyses };
  } catch (error: any) {
    console.error('Error fetching analyses:', error);
    return { success: false, error: error.message, analyses: [] };
  }
}

/**
 * Get analysis for a specific student
 */
export async function getStudentAnalysis(schoolId: string, studentCode: string) {
  try {
    const analysesRef = collection(db, 'schools', schoolId, 'analyses');
    const q = query(
      analysesRef,
      where('studentCode', '==', studentCode),
      orderBy('analyzedAt', 'desc'),
      limit(1)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, error: 'No analysis found', analysis: null };
    }

    const analysis = {
      ...snapshot.docs[0].data(),
      id: snapshot.docs[0].id,
    } as AIAnalysis;

    return { success: true, analysis };
  } catch (error: any) {
    console.error('Error fetching student analysis:', error);
    return { success: false, error: error.message, analysis: null };
  }
}

/**
 * Get a single analysis
 */
export async function getAnalysis(schoolId: string, analysisId: string) {
  try {
    const analysisRef = doc(db, 'schools', schoolId, 'analyses', analysisId);
    const snapshot = await getDoc(analysisRef);

    if (!snapshot.exists()) {
      return { success: false, error: 'Analysis not found', analysis: null };
    }

    const analysis = { ...snapshot.data(), id: analysisId } as AIAnalysis;
    return { success: true, analysis };
  } catch (error: any) {
    console.error('Error fetching analysis:', error);
    return { success: false, error: error.message, analysis: null };
  }
}

/**
 * Create a new analysis
 */
export async function createAnalysis(schoolId: string, analysisData: AIAnalysisCreateData) {
  try {
    const analysesRef = collection(db, 'schools', schoolId, 'analyses');

    const newAnalysis: Omit<AIAnalysis, 'id'> = {
      ...analysisData,
      schoolId,
      analyzedAt: serverTimestamp() as Timestamp,
    };

    const docRef = await addDoc(analysesRef, newAnalysis);

    // Update student record
    await updateStudent(schoolId, analysisData.studentCode, {
      lastAnalysisId: docRef.id,
    });

    // Update response as analyzed
    if (analysisData.responseId) {
      const responseRef = doc(db, 'schools', schoolId, 'responses', analysisData.responseId);
      await updateDoc(responseRef, {
        isAnalyzed: true,
        analysisId: docRef.id,
      });
    }

    return { success: true, analysisId: docRef.id };
  } catch (error: any) {
    console.error('Error creating analysis:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch create analyses (for migration)
 */
export async function batchCreateAnalyses(schoolId: string, analyses: AIAnalysisCreateData[]) {
  try {
    const batch = writeBatch(db);
    let count = 0;
    const analysisIds: string[] = [];

    for (const analysisData of analyses) {
      const analysesRef = collection(db, 'schools', schoolId, 'analyses');
      const docRef = doc(analysesRef); // Generate ID

      const newAnalysis: Omit<AIAnalysis, 'id'> = {
        ...analysisData,
        schoolId,
        analyzedAt: analysisData.analyzedAt
          ? Timestamp.fromDate(analysisData.analyzedAt)
          : (serverTimestamp() as Timestamp),
      };

      batch.set(docRef, newAnalysis);
      analysisIds.push(docRef.id);
      count++;

      if (count % 500 === 0) {
        await batch.commit();
      }
    }

    if (count % 500 !== 0) {
      await batch.commit();
    }

    return { success: true, count, analysisIds };
  } catch (error: any) {
    console.error('Error batch creating analyses:', error);
    return { success: false, error: error.message, count: 0, analysisIds: [] };
  }
}

/**
 * Delete an analysis
 */
export async function deleteAnalysis(schoolId: string, analysisId: string) {
  try {
    const analysisRef = doc(db, 'schools', schoolId, 'analyses', analysisId);
    await deleteDoc(analysisRef);

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting analysis:', error);
    return { success: false, error: error.message };
  }
}

/**
 * ============================================================================
 * STATISTICS & AGGREGATION
 * ============================================================================
 */

/**
 * Get class statistics
 */
export async function getClassStatistics(schoolId: string, classId: string): Promise<ClassStatistics> {
  try {
    // Get all students in class
    const studentsResult = await getAllStudents(schoolId, { classId });
    const students = studentsResult.students || [];

    // Get all responses for class
    const responsesResult = await getAllResponses(schoolId, { classId });
    const responses = responsesResult.responses || [];

    // Get all analyses for class
    const analysesResult = await getAllAnalyses(schoolId, { classId });
    const analyses = analysesResult.analyses || [];

    // Calculate average scores
    const scoresSum: PerformanceScores = {
      focus: 0,
      motivation: 0,
      collaboration: 0,
      emotional_regulation: 0,
      self_efficacy: 0,
      time_management: 0,
    };

    analyses.forEach((analysis) => {
      scoresSum.focus += analysis.scores.focus || 0;
      scoresSum.motivation += analysis.scores.motivation || 0;
      scoresSum.collaboration += analysis.scores.collaboration || 0;
      scoresSum.emotional_regulation += analysis.scores.emotional_regulation || 0;
      scoresSum.self_efficacy += analysis.scores.self_efficacy || 0;
      scoresSum.time_management += analysis.scores.time_management || 0;
    });

    const analyzedCount = analyses.length;
    const averageScores: PerformanceScores = {
      focus: analyzedCount > 0 ? scoresSum.focus / analyzedCount : 0,
      motivation: analyzedCount > 0 ? scoresSum.motivation / analyzedCount : 0,
      collaboration: analyzedCount > 0 ? scoresSum.collaboration / analyzedCount : 0,
      emotional_regulation: analyzedCount > 0 ? scoresSum.emotional_regulation / analyzedCount : 0,
      self_efficacy: analyzedCount > 0 ? scoresSum.self_efficacy / analyzedCount : 0,
      time_management: analyzedCount > 0 ? scoresSum.time_management / analyzedCount : 0,
    };

    // Count risk flags
    const riskCount = { high: 0, medium: 0, low: 0 };
    analyses.forEach((analysis) => {
      if (analysis.riskFlags) {
        analysis.riskFlags.forEach((flag) => {
          riskCount[flag.severity]++;
        });
      }
    });

    return {
      totalStudents: students.length,
      responsesSubmitted: responses.length,
      responsesAnalyzed: analyzedCount,
      averageScores,
      riskCount,
    };
  } catch (error: any) {
    console.error('Error calculating class statistics:', error);
    return {
      totalStudents: 0,
      responsesSubmitted: 0,
      responsesAnalyzed: 0,
      averageScores: {
        focus: 0,
        motivation: 0,
        collaboration: 0,
        emotional_regulation: 0,
        self_efficacy: 0,
        time_management: 0,
      },
      riskCount: { high: 0, medium: 0, low: 0 },
    };
  }
}

/**
 * ============================================================================
 * REAL-TIME SUBSCRIPTIONS
 * ============================================================================
 */

/**
 * Subscribe to students (real-time updates)
 */
export function subscribeToStudents(
  schoolId: string,
  callback: (students: Student[]) => void,
  filters?: QueryFilters
) {
  const studentsRef = collection(db, 'schools', schoolId, 'students');
  const constraints: QueryConstraint[] = [];

  if (filters?.classId) {
    constraints.push(where('classId', '==', filters.classId));
  }
  if (filters?.isActive !== undefined) {
    constraints.push(where('isActive', '==', filters.isActive));
  }

  constraints.push(orderBy('classId', 'asc'));
  constraints.push(orderBy('name', 'asc'));

  const q = query(studentsRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((doc) => {
        students.push({ ...doc.data(), studentCode: doc.id } as Student);
      });
      callback(students);
    },
    (error) => {
      console.error('Error in students subscription:', error);
    }
  );
}

/**
 * Subscribe to responses (real-time updates)
 */
export function subscribeToResponses(
  schoolId: string,
  callback: (responses: FormResponse[]) => void,
  filters?: QueryFilters
) {
  const responsesRef = collection(db, 'schools', schoolId, 'responses');
  const constraints: QueryConstraint[] = [];

  if (filters?.classId) {
    constraints.push(where('classId', '==', filters.classId));
  }
  if (filters?.isAnalyzed !== undefined) {
    constraints.push(where('isAnalyzed', '==', filters.isAnalyzed));
  }

  constraints.push(orderBy('submittedAt', 'desc'));

  const q = query(responsesRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const responses: FormResponse[] = [];
      snapshot.forEach((doc) => {
        responses.push({ ...doc.data(), id: doc.id } as FormResponse);
      });
      callback(responses);
    },
    (error) => {
      console.error('Error in responses subscription:', error);
    }
  );
}

/**
 * Subscribe to analyses (real-time updates)
 */
export function subscribeToAnalyses(
  schoolId: string,
  callback: (analyses: AIAnalysis[]) => void,
  filters?: QueryFilters
) {
  const analysesRef = collection(db, 'schools', schoolId, 'analyses');
  const constraints: QueryConstraint[] = [];

  if (filters?.classId) {
    constraints.push(where('classId', '==', filters.classId));
  }
  if (filters?.quarter) {
    constraints.push(where('quarter', '==', filters.quarter));
  }

  constraints.push(orderBy('analyzedAt', 'desc'));

  const q = query(analysesRef, ...constraints);

  return onSnapshot(
    q,
    (snapshot) => {
      const analyses: AIAnalysis[] = [];
      snapshot.forEach((doc) => {
        analyses.push({ ...doc.data(), id: doc.id } as AIAnalysis);
      });
      callback(analyses);
    },
    (error) => {
      console.error('Error in analyses subscription:', error);
    }
  );
}

/**
 * ============================================================================
 * UTILITY FUNCTIONS
 * ============================================================================
 */

/**
 * Check if student exists
 */
export async function studentExists(schoolId: string, studentCode: string): Promise<boolean> {
  try {
    const studentRef = doc(db, 'schools', schoolId, 'students', studentCode);
    const snapshot = await getDoc(studentRef);
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking student existence:', error);
    return false;
  }
}

/**
 * Get unanalyzed responses
 */
export async function getUnanalyzedResponses(schoolId: string) {
  return getAllResponses(schoolId, { isAnalyzed: false });
}

/**
 * Search students by name or code
 */
export async function searchStudents(schoolId: string, searchTerm: string) {
  try {
    // Get all students (Firestore doesn't support text search natively)
    const result = await getAllStudents(schoolId);

    if (!result.success) {
      return result;
    }

    // Filter locally
    const term = searchTerm.toLowerCase();
    const filtered = result.students.filter(
      (student) =>
        student.name.toLowerCase().includes(term) ||
        student.studentCode.toLowerCase().includes(term) ||
        student.classId.toLowerCase().includes(term)
    );

    return { success: true, students: filtered };
  } catch (error: any) {
    console.error('Error searching students:', error);
    return { success: false, error: error.message, students: [] };
  }
}

/**
 * Export functions for easy import
 */
export const firebaseService = {
  // Students
  getAllStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  batchCreateStudents,
  studentExists,
  searchStudents,
  subscribeToStudents,

  // Responses
  getAllResponses,
  getStudentResponses,
  getResponse,
  createResponse,
  batchCreateResponses,
  getUnanalyzedResponses,
  subscribeToResponses,

  // Analyses
  getAllAnalyses,
  getStudentAnalysis,
  getAnalysis,
  createAnalysis,
  batchCreateAnalyses,
  deleteAnalysis,
  subscribeToAnalyses,

  // Statistics
  getClassStatistics,
};

export default firebaseService;
