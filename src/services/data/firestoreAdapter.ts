/**
 * Firestore Data Source Adapter
 *
 * Implements DataSourceAdapter for Firebase Firestore
 */

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';

import { db, isFirebaseAvailable } from '../../config/firebase';
import type {
  DataSourceAdapter,
  Student,
  DashboardStats,
  OptimizationRequest,
  OptimizationResult,
  ApiResponse
} from './DataSourceAdapter';

export class FirestoreAdapter implements DataSourceAdapter {
  private schoolId: string;
  private getDb(): import('firebase/firestore').Firestore {
    if (!db || !isFirebaseAvailable()) {
      throw new Error('Firebase Firestore is not available. Check your configuration.');
    }
    return db;
  }

  constructor(config: any) {
    this.schoolId = config.schoolId || import.meta.env.VITE_SCHOOL_ID || 'default';
  }

  async getStudents(): Promise<ApiResponse<Student[]>> {
    try {
      const db = this.getDb();
      const studentsRef = collection(db, `schools/${this.schoolId}/students`);
      const snapshot = await getDocs(studentsRef);

      const students: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        students.push({
          id: doc.id,
          studentCode: data.studentCode || doc.id,
          classId: data.classId || 'Unknown',
          quarter: data.quarter || 'רבעון 1',
          learningStyle: data.learningStyle || 'unknown',
          strengthsCount: data.strengths?.length || 0,
          challengesCount: data.challenges?.length || 0,
          keyNotes: data.keyNotes || '',
          ...data
        });
      });

      return { success: true, data: students };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error fetching students:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch students from Firestore'
      };
    }
  }

  async getStudent(studentId: string): Promise<ApiResponse<Student>> {
    try {
      const db = this.getDb();
      const studentRef = doc(db, `schools/${this.schoolId}/students`, studentId);
      const snapshot = await getDoc(studentRef);

      if (!snapshot.exists()) {
        return {
          success: false,
          error: `Student not found: ${studentId}`
        };
      }

      const data = snapshot.data() as any;
      const student: Student = {
        id: snapshot.id,
        studentCode: data.studentCode || snapshot.id,
        classId: data.classId || 'Unknown',
        quarter: data.quarter || 'רבעון 1',
        learningStyle: data.learningStyle || 'unknown',
        strengthsCount: data.strengths?.length || 0,
        challengesCount: data.challenges?.length || 0,
        keyNotes: data.keyNotes || '',
        ...data
      };

      return { success: true, data: student };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error fetching student:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch student from Firestore'
      };
    }
  }

  async saveStudent(student: Student): Promise<ApiResponse<Student>> {
    try {
      const db = this.getDb();
      const studentData = {
        studentCode: student.studentCode,
        classId: student.classId,
        quarter: student.quarter,
        learningStyle: student.learningStyle,
        strengths: student.strengths || [],
        challenges: student.challenges || [],
        keyNotes: student.keyNotes,
        updatedAt: new Date().toISOString()
      };

      if (student.id && student.id !== student.studentCode) {
        // Update existing student
        const studentRef = doc(db!, `schools/${this.schoolId}/students`, student.id);
        await updateDoc(studentRef, studentData);
        return { success: true, data: { ...student, ...studentData } };
      } else {
        // Create new student
        const studentsRef = collection(db!, `schools/${this.schoolId}/students`);
        const docRef = await addDoc(studentsRef, studentData);
        return { success: true, data: { ...student, id: docRef.id } };
      }
    } catch (error: any) {
      console.error('FirestoreAdapter: Error saving student:', error);
      return {
        success: false,
        error: error.message || 'Failed to save student to Firestore'
      };
    }
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    try {
      const db = this.getDb();
      const studentRef = doc(db, `schools/${this.schoolId}/students`, studentId);
      await deleteDoc(studentRef);
      return { success: true };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error deleting student:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete student from Firestore'
      };
    }
  }

  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const db = this.getDb();
      const studentsRef = collection(db, `schools/${this.schoolId}/students`);
      const snapshot = await getDocs(studentsRef);

      const students: Student[] = [];
      const classCounts = new Map<string, number>();
      const styleCounts = new Map<string, number>();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const student: Student = {
          id: doc.id,
          studentCode: data.studentCode || doc.id,
          classId: data.classId || 'Unknown',
          quarter: data.quarter || 'רבעון 1',
          learningStyle: data.learningStyle || 'unknown',
          strengthsCount: data.strengths?.length || 0,
          challengesCount: data.challenges?.length || 0,
          keyNotes: data.keyNotes || '',
          ...data
        };
        students.push(student);

        // Count classes
        const count = classCounts.get(student.classId) || 0;
        classCounts.set(student.classId, count + 1);

        // Count learning styles
        const styleCount = styleCounts.get(student.learningStyle) || 0;
        styleCounts.set(student.learningStyle, styleCount + 1);
      });

      // Find most common learning style
      let maxStyle = '';
      let maxCount = 0;
      styleCounts.forEach((count, style) => {
        if (count > maxCount) {
          maxCount = count;
          maxStyle = style;
        }
      });

      const stats: DashboardStats = {
        totalStudents: students.length,
        totalClasses: classCounts.size,
        totalStrengths: students.reduce((sum, s) => sum + s.strengthsCount, 0),
        totalChallenges: students.reduce((sum, s) => sum + s.challengesCount, 0),
        averageLearningStyle: maxStyle || 'unknown'
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error fetching stats:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch stats from Firestore'
      };
    }
  }

  async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    try {
      const db = this.getDb();
      const studentsRef = collection(db, `schools/${this.schoolId}/students`);
      const q = query(studentsRef, where('classId', '==', classId));
      const snapshot = await getDocs(q);

      const students: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        students.push({
          id: doc.id,
          studentCode: data.studentCode || doc.id,
          classId: data.classId || 'Unknown',
          quarter: data.quarter || 'רבעון 1',
          learningStyle: data.learningStyle || 'unknown',
          strengthsCount: data.strengths?.length || 0,
          challengesCount: data.challenges?.length || 0,
          keyNotes: data.keyNotes || '',
          ...data
        });
      });

      return { success: true, data: students };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error fetching students by class:', error);
      return {
        success: false,
        error: error.message || 'Failed to fetch students by class from Firestore'
      };
    }
  }

  async optimizeClassroom(request: OptimizationRequest): Promise<ApiResponse<OptimizationResult>> {
    try {
      // Call the optimization API (if configured)
      const apiUrl = import.meta.env.VITE_OPTIMIZATION_API_URL;

      if (!apiUrl) {
        // Return mock result if no API configured
        return {
          success: true,
          data: {
            seatingArrangement: request.students.map((s, i) => ({
              studentId: s.id,
              position: { row: Math.floor(i / 5), col: i % 5 }
            })),
            score: 0.5,
            improvements: ['Mock: No optimization API configured']
          }
        };
      }

      const response = await fetch(`${apiUrl}/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`Optimization API returned ${response.status}`);
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error: any) {
      console.error('FirestoreAdapter: Error optimizing classroom:', error);
      return {
        success: false,
        error: error.message || 'Failed to optimize classroom'
      };
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latency?: number }> {
    try {
      const db = this.getDb();
      const start = performance.now();

      // Try to fetch one document to verify connection
      const testRef = doc(db, `schools/${this.schoolId}/students`);
      await getDoc(testRef);

      const latency = performance.now() - start;

      // Check if latency is acceptable (< 1 second)
      if (latency > 1000) {
        return { status: 'degraded', latency };
      }

      return { status: 'healthy', latency };
    } catch (error) {
      console.error('FirestoreAdapter: Health check failed:', error);
      return { status: 'down' };
    }
  }
}
