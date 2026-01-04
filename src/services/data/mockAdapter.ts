/**
 * Mock Data Source Adapter
 *
 * Implements DataSourceAdapter with in-memory mock data for testing
 */

import type {
  DataSourceAdapter,
  Student,
  DashboardStats,
  OptimizationRequest,
  OptimizationResult,
  ApiResponse
} from './DataSourceAdapter';

// Mock student data for development/testing
const MOCK_STUDENTS: Student[] = [
  // Class י1
  {
    id: '10101',
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
    id: '10102',
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
    id: '10103',
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
    id: '10104',
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
    id: '10105',
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
    id: '10201',
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
    id: '10202',
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
    id: '10203',
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
    id: '10301',
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
    id: '10302',
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
    id: '10303',
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
    id: '10401',
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
    id: '10402',
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
    id: '10403',
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
    id: '10501',
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
    id: '10502',
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
    id: '10503',
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

export class MockAdapter implements DataSourceAdapter {
  private students: Student[] = [...MOCK_STUDENTS];

  async getStudents(): Promise<ApiResponse<Student[]>> {
    // Simulate network delay
    await this.delay(100);

    return {
      success: true,
      data: [...this.students]
    };
  }

  async getStudent(studentId: string): Promise<ApiResponse<Student>> {
    await this.delay(50);

    const student = this.students.find(s => s.studentCode === studentId || s.id === studentId);

    if (!student) {
      return {
        success: false,
        error: `Student not found: ${studentId}`
      };
    }

    return {
      success: true,
      data: { ...student }
    };
  }

  async saveStudent(student: Student): Promise<ApiResponse<Student>> {
    await this.delay(100);

    const existingIndex = this.students.findIndex(s => s.id === student.id);

    if (existingIndex >= 0) {
      // Update existing student
      this.students[existingIndex] = { ...student };
      return {
        success: true,
        data: { ...this.students[existingIndex] }
      };
    } else {
      // Create new student
      const newStudent = {
        ...student,
        id: student.id || student.studentCode
      };
      this.students.push(newStudent);
      return {
        success: true,
        data: newStudent
      };
    }
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    await this.delay(50);

    const initialLength = this.students.length;
    this.students = this.students.filter(s => s.id !== studentId && s.studentCode !== studentId);

    if (this.students.length === initialLength) {
      return {
        success: false,
        error: `Student not found: ${studentId}`
      };
    }

    return { success: true };
  }

  async getStats(): Promise<ApiResponse<DashboardStats>> {
    await this.delay(100);

    const classCounts = new Map<string, number>();
    const styleCounts = new Map<string, number>();

    this.students.forEach(student => {
      const count = classCounts.get(student.classId) || 0;
      classCounts.set(student.classId, count + 1);

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
      totalStudents: this.students.length,
      totalClasses: classCounts.size,
      totalStrengths: this.students.reduce((sum, s) => sum + s.strengthsCount, 0),
      totalChallenges: this.students.reduce((sum, s) => sum + s.challengesCount, 0),
      averageLearningStyle: maxStyle || 'unknown'
    };

    return { success: true, data: stats };
  }

  async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    await this.delay(50);

    const filtered = this.students.filter(s => s.classId === classId);

    return {
      success: true,
      data: filtered
    };
  }

  async optimizeClassroom(request: OptimizationRequest): Promise<ApiResponse<OptimizationResult>> {
    await this.delay(200);

    // Generate a simple mock seating arrangement
    const seatingArrangement = request.students.map((s, i) => ({
      studentId: s.id,
      position: { row: Math.floor(i / 5), col: i % 5 }
    }));

    const result: OptimizationResult = {
      seatingArrangement,
      score: 0.75,
      improvements: [
        'Mock: Separated students with similar learning styles',
        'Mock: Placed visual learners near the front',
        'Mock: Balanced kinesthetic learners throughout the room'
      ]
    };

    return { success: true, data: result };
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latency?: number }> {
    const start = performance.now();
    await this.delay(10);
    const latency = performance.now() - start;

    return {
      status: 'healthy',
      latency
    };
  }

  // ====================================
  // PRIVATE HELPER METHODS
  // ====================================

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
