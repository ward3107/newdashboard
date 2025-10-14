import React from 'react';
import AnalyticsDashboard from './AnalyticsDashboard';

// Simple test component to verify analytics work
const TestAnalytics = () => {
  // Mock students data
  const mockStudents = [
    { studentCode: '001', name: 'תלמיד א', classId: 'י1', strengthsCount: 4, challengesCount: 2 },
    { studentCode: '002', name: 'תלמיד ב', classId: 'י1', strengthsCount: 5, challengesCount: 1 },
    { studentCode: '003', name: 'תלמיד ג', classId: 'י2', strengthsCount: 3, challengesCount: 3 },
  ];

  // Default theme for testing
  const theme = {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-purple-500 to-pink-500',
    accent: 'from-green-500 to-emerald-500',
    stat1: 'from-blue-500 to-cyan-500',
    stat2: 'from-purple-500 to-pink-500',
    stat3: 'from-green-500 to-emerald-500',
    stat4: 'from-orange-500 to-amber-500',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Analytics Test Page</h1>
        <p className="mb-4">If you can see the analytics dashboard below, it's working!</p>

        <AnalyticsDashboard
          students={mockStudents}
          darkMode={false}
          theme={theme}
        />
      </div>
    </div>
  );
};

export default TestAnalytics;