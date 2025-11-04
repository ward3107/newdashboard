/**
 * Assessment Form Page
 * Test page to view the multi-language student assessment form
 */

import React from 'react';
import StudentAssessmentForm from '../components/forms/StudentAssessmentForm';

export function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Student Assessment Form
          </h1>
          <p className="text-lg text-gray-600">
            Multi-language support: Hebrew | English | Arabic | Russian
          </p>
        </div>

        {/* Form Component */}
        <StudentAssessmentForm />

        {/* Info Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>🌍 Switch languages anytime • 📊 28 questions • ⚡ Instant AI analysis</p>
        </div>
      </div>
    </div>
  );
}

export default AssessmentPage;
