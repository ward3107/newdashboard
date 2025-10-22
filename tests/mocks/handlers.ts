import { http, HttpResponse } from 'msw';
import { mockStudents, mockStats } from '../fixtures/mockData';

const API_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com';

export const handlers = [
  // Get all students
  http.get(`${API_URL}`, ({ request }) => {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');

    if (action === 'getAllStudents') {
      return HttpResponse.json({
        success: true,
        students: mockStudents,
      });
    }

    if (action === 'getStats') {
      return HttpResponse.json({
        success: true,
        ...mockStats,
      });
    }

    if (action === 'analyzeOneStudent') {
      const studentCode = url.searchParams.get('studentCode');
      return HttpResponse.json({
        success: true,
        analyzed: 1,
        studentCode,
        message: 'Student analyzed successfully',
      });
    }

    if (action === 'standardBatch') {
      return HttpResponse.json({
        success: true,
        analyzed: 5,
        message: 'Batch analysis completed',
      });
    }

    return HttpResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  }),

  // Handle CORS preflight
  http.options('*', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }),

  // Default handler for unmatched requests
  http.get('*', ({ request }) => {
    console.error(`Unhandled request: ${request.url}`);
    return HttpResponse.json({ error: 'Not found' }, { status: 404 });
  }),
];