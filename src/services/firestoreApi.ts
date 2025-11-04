/**
 * Firestore API Service
 * Reads student data from Firebase Firestore
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import db, { isFirebaseConfigured } from './firebase';
import type {
  Student,
  DetailedStudent,
  DashboardStats,
  ApiResponse,
} from './api';

const SCHOOL_ID = import.meta.env.VITE_SCHOOL_ID || 'ishebott';

/**
 * Get dashboard statistics from Firestore
 */
export async function getStatsFromFirestore(): Promise<ApiResponse<DashboardStats>> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      error: 'Firebase not configured',
    };
  }

  try {
    const studentsRef = collection(db, `schools/${SCHOOL_ID}/students`);
    const snapshot = await getDocs(studentsRef);

    const students = snapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const byClass: Record<string, number> = {};
    const byLearningStyle: Record<string, number> = {};
    let totalStrengths = 0;

    students.forEach((student: any) => {
      // Count by class
      const classId = student.classId || 'Unknown';
      byClass[classId] = (byClass[classId] || 0) + 1;

      // Count by learning style (use first 50 chars as summary)
      const styleKey = student.learningStyle?.substring(0, 50) || 'Unknown';
      byLearningStyle[styleKey] = (byLearningStyle[styleKey] || 0) + 1;

      // Sum strengths
      totalStrengths += student.strengthsCount || 0;
    });

    const stats: DashboardStats = {
      totalStudents: students.length,
      byClass,
      byLearningStyle,
      averageStrengths: students.length > 0
        ? (totalStrengths / students.length).toFixed(1)
        : '0',
      lastUpdated: new Date().toLocaleDateString('he-IL'),
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Firestore error:', error);
    return {
      success: false,
      error: `Failed to fetch stats: ${errorMessage}`,
    };
  }
}

/**
 * Get all students from Firestore
 */
export async function getAllStudentsFromFirestore(): Promise<ApiResponse<{ students: Student[] }>> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      error: 'Firebase not configured',
    };
  }

  try {
    const studentsRef = collection(db, `schools/${SCHOOL_ID}/students`);
    const q = query(studentsRef, orderBy('studentCode'));
    const snapshot = await getDocs(q);

    const students: Student[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        studentCode: data.studentCode || doc.id,
        quarter: data.quarter || 'Q1',
        classId: data.classId || '',
        date: data.date || '',
        name: data.name?.toString() || '',
        learningStyle: data.learningStyle || '',
        keyNotes: data.keyNotes || '',
        strengthsCount: data.strengthsCount || 0,
        challengesCount: data.challengesCount || 0,
      };
    });

    return {
      success: true,
      data: { students },
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Firestore error:', error);
    return {
      success: false,
      error: `Failed to fetch students: ${errorMessage}`,
    };
  }
}

/**
 * Get detailed student information from Firestore
 */
export async function getStudentFromFirestore(studentId: string): Promise<ApiResponse<DetailedStudent>> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      error: 'Firebase not configured',
    };
  }

  try {
    const studentRef = doc(db, `schools/${SCHOOL_ID}/students`, studentId);
    const snapshot = await getDoc(studentRef);

    if (!snapshot.exists()) {
      return {
        success: false,
        error: 'Student not found',
      };
    }

    const data = snapshot.data();

    const detailedStudent: DetailedStudent = {
      studentCode: data.studentCode || studentId,
      quarter: data.quarter || 'Q1',
      classId: data.classId || '',
      date: data.date || '',
      name: data.name?.toString() || '',
      student_summary: data.studentSummary || {
        learning_style: data.learningStyle || '',
        key_notes: data.keyNotes || '',
        strengths: [],
        challenges: [],
      },
      insights: data.insights || [],
      immediate_actions: data.immediateActions || [],
      seating_arrangement: data.seatingArrangement || {
        location: '',
        partner_type: '',
        avoid: '',
      },
    };

    return {
      success: true,
      data: detailedStudent,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Firestore error:', error);
    return {
      success: false,
      error: `Failed to fetch student: ${errorMessage}`,
    };
  }
}

/**
 * Test Firestore connection
 */
export async function testFirestoreConnection(): Promise<ApiResponse<{
  message: string;
  mode: string;
  stats?: DashboardStats;
}>> {
  if (!isFirebaseConfigured || !db) {
    return {
      success: false,
      error: 'Firebase not configured',
    };
  }

  try {
    const statsResponse = await getStatsFromFirestore();

    if (statsResponse.success) {
      return {
        success: true,
        data: {
          message: 'Firestore connected successfully',
          mode: 'FIRESTORE',
          stats: statsResponse.data,
        },
      };
    } else {
      throw new Error(statsResponse.error || 'Failed to fetch stats');
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Connection failed: ${errorMessage}`,
    };
  }
}

export const firestoreApi = {
  getStats: getStatsFromFirestore,
  getAllStudents: getAllStudentsFromFirestore,
  getStudent: getStudentFromFirestore,
  testConnection: testFirestoreConnection,
};
