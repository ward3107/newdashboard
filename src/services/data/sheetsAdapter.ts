/**
 * Google Sheets Data Source Adapter
 *
 * Implements DataSourceAdapter for Google Sheets via Apps Script
 */

import type {
  DataSourceAdapter,
  Student,
  DashboardStats,
  OptimizationRequest,
  OptimizationResult,
  ApiResponse
} from './DataSourceAdapter';

export class SheetsAdapter implements DataSourceAdapter {
  private apiUrl: string;
  private timeout: number;

  constructor(config: { apiKey?: string; spreadsheetId?: string; apiUrl?: string }) {
    this.apiUrl = config.apiUrl || import.meta.env.VITE_API_URL || '';
    this.timeout = 30000; // 30 seconds
  }

  async getStudents(): Promise<ApiResponse<Student[]>> {
    try {
      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return {
          success: false,
          error: 'Google Sheets API URL not configured'
        };
      }

      const url = this.buildUrl('getAllStudents');
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform Google Sheets data to Student interface
      const students: Student[] = (data.students || []).map((s: any) => ({
        id: s.studentCode,
        studentCode: s.studentCode,
        classId: s.classId || 'Unknown',
        quarter: s.quarter || 'רבעון 1',
        learningStyle: s.learningStyle || 'unknown',
        strengthsCount: s.strengths?.length || 0,
        challengesCount: s.challenges?.length || 0,
        keyNotes: s.keyNotes || '',
        ...s
      }));

      return { success: true, data: students };
    } catch (error: any) {
      console.error('SheetsAdapter: Error fetching students:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to fetch students from Google Sheets')
      };
    }
  }

  async getStudent(studentId: string): Promise<ApiResponse<Student>> {
    try {
      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return {
          success: false,
          error: 'Google Sheets API URL not configured'
        };
      }

      const url = this.buildUrl('getStudent', { studentId });
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const student: Student = {
        id: data.studentCode,
        studentCode: data.studentCode,
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
      console.error('SheetsAdapter: Error fetching student:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to fetch student from Google Sheets')
      };
    }
  }

  async saveStudent(student: Student): Promise<ApiResponse<Student>> {
    try {
      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return {
          success: false,
          error: 'Google Sheets API URL not configured'
        };
      }

      // Google Sheets Apps Script typically doesn't support individual updates
      // This would require a custom Apps Script function
      return {
        success: false,
        error: 'Save operation not supported in Google Sheets mode. Use Firestore for full CRUD operations.'
      };
    } catch (error: any) {
      console.error('SheetsAdapter: Error saving student:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to save student to Google Sheets')
      };
    }
  }

  async deleteStudent(studentId: string): Promise<ApiResponse<void>> {
    try {
      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return {
          success: false,
          error: 'Google Sheets API URL not configured'
        };
      }

      // Google Sheets doesn't support deletion via Apps Script
      return {
        success: false,
        error: 'Delete operation not supported in Google Sheets mode. Use Firestore for full CRUD operations.'
      };
    } catch (error: any) {
      console.error('SheetsAdapter: Error deleting student:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to delete student from Google Sheets')
      };
    }
  }

  async getStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return {
          success: false,
          error: 'Google Sheets API URL not configured'
        };
      }

      const url = this.buildUrl('getStats');
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform Google Sheets stats to DashboardStats interface
      const stats: DashboardStats = {
        totalStudents: data.totalStudents || 0,
        totalClasses: Object.keys(data.byClass || {}).length,
        totalStrengths: 0, // Not available in Sheets mode
        totalChallenges: 0, // Not available in Sheets mode
        averageLearningStyle: this.calculateAverageLearningStyle(data.byLearningStyle || {})
      };

      return { success: true, data: stats };
    } catch (error: any) {
      console.error('SheetsAdapter: Error fetching stats:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to fetch stats from Google Sheets')
      };
    }
  }

  async getStudentsByClass(classId: string): Promise<ApiResponse<Student[]>> {
    try {
      // Google Sheets doesn't have filtering - fetch all and filter client-side
      const result = await this.getStudents();

      if (!result.success || !result.data) {
        return result;
      }

      const filtered = result.data.filter(s => s.classId === classId);
      return { success: true, data: filtered };
    } catch (error: any) {
      console.error('SheetsAdapter: Error fetching students by class:', error);
      return {
        success: false,
        error: this.sanitizeError(error.message || 'Failed to fetch students by class from Google Sheets')
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
      console.error('SheetsAdapter: Error optimizing classroom:', error);
      return {
        success: false,
        error: error.message || 'Failed to optimize classroom'
      };
    }
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'down'; latency?: number }> {
    try {
      const start = performance.now();

      if (!this.apiUrl || this.apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
        return { status: 'down' };
      }

      const url = this.buildUrl('getStats');
      const response = await this.fetchWithTimeout(url, 10000); // 10 second timeout

      const latency = performance.now() - start;

      if (!response.ok) {
        return { status: 'down' };
      }

      // Check if latency is acceptable (< 1 second)
      if (latency > 1000) {
        return { status: 'degraded', latency };
      }

      return { status: 'healthy', latency };
    } catch (error) {
      console.error('SheetsAdapter: Health check failed:', error);
      return { status: 'down' };
    }
  }

  // ====================================
  // PRIVATE HELPER METHODS
  // ====================================

  private buildUrl(action: string, params?: Record<string, string>): string {
    const url = new URL(this.apiUrl);
    url.searchParams.set('action', action);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return url.toString();
  }

  private async fetchWithTimeout(url: string, timeout: number = this.timeout): Promise<Response> {
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

  private calculateAverageLearningStyle(styleCounts: Record<string, number>): string {
    let maxStyle = '';
    let maxCount = 0;

    Object.entries(styleCounts).forEach(([style, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxStyle = style;
      }
    });

    return maxStyle || 'unknown';
  }

  private sanitizeError(message: string): string {
    // Remove IP addresses
    let sanitized = message.replace(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g, '[IP_REMOVED]');
    sanitized = sanitized.replace(/(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}/g, '[IP_REMOVED]');

    // Remove file paths
    sanitized = sanitized.replace(/([A-Z]:)?[\\/][\w\s\\/.-]+/gi, '[PATH_REMOVED]');

    // Remove port numbers
    sanitized = sanitized.replace(/:\d{2,5}/g, ':[PORT]');

    return sanitized;
  }
}
