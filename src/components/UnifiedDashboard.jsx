import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Import sidebar
import UnifiedSidebar from './navigation/UnifiedSidebar';

// Import Overview (default view)
import OverviewDashboard from './overview/OverviewDashboard';

// Import existing components
import FuturisticDashboard from './dashboard/FuturisticDashboard';
import ClassroomSeating from './classroom/ClassroomSeating';
import EmotionalBehavioralDashboard from './analytics/EmotionalBehavioralDashboard';
import CoreStatsDashboard from './analytics/CoreStatsDashboard';

/**
 * UnifiedDashboard - Main dashboard container
 * Combines all views with unified sidebar navigation
 * DEFAULT VIEW: Overview (statistics and quick actions)
 */
const UnifiedDashboard = ({ students, darkMode, theme, toggleTheme, onAnalyzeClick, onAdminClick }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [selectedSubView, setSelectedSubView] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Calculate pending count for badge
  const pendingCount = students?.filter(s => s.needsAnalysis).length || 0;

  // Navigation handler
  const handleNavigate = (view, subView = null) => {
    setSelectedView(view);
    setSelectedSubView(subView);
    setSelectedStudent(null); // Clear selected student when changing views

    // Special handling for certain actions
    if (view === 'analyze' || (view === 'settings' && subView === 'analyze')) {
      onAnalyzeClick?.();
    } else if (view === 'settings' && subView === 'admin') {
      onAdminClick?.();
    }
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
  };

  // Filter students based on current view
  const getFilteredStudents = () => {
    if (!students) return [];

    if (selectedView === 'students') {
      if (selectedSubView === 'analyzed') {
        return students.filter(s => !s.needsAnalysis);
      } else if (selectedSubView === 'pending') {
        return students.filter(s => s.needsAnalysis);
      }
    }

    return students;
  };

  const filteredStudents = getFilteredStudents();

  // Render the appropriate view based on selection
  const renderMainContent = () => {
    // If a student is selected, show their detail view
    if (selectedStudent) {
      return (
        <StudentDetailView
          student={selectedStudent}
          onBack={() => setSelectedStudent(null)}
          darkMode={darkMode}
          theme={theme}
        />
      );
    }

    // Overview (DEFAULT)
    if (selectedView === 'overview') {
      return (
        <OverviewDashboard
          students={students}
          darkMode={darkMode}
          theme={theme}
          onNavigate={handleNavigate}
        />
      );
    }

    // Students List
    if (selectedView === 'students') {
      return (
        <FuturisticDashboard
          students={filteredStudents}
          darkMode={darkMode}
          theme={theme}
          onStudentClick={handleStudentSelect}
          showHeader={false} // Hide the header since we have sidebar
        />
      );
    }

    // Seating Arrangement
    if (selectedView === 'seating') {
      return (
        <ClassroomSeating
          students={students?.filter(s => !s.needsAnalysis) || []}
          darkMode={darkMode}
          theme={theme}
        />
      );
    }

    // Emotional-Behavioral Analysis
    if (selectedView === 'emotional') {
      return (
        <EmotionalBehavioralDashboard
          students={students?.filter(s => !s.needsAnalysis) || []}
          darkMode={darkMode}
          theme={theme}
          selectedView={selectedSubView || 'overview'}
        />
      );
    }

    // Cognitive Analysis
    if (selectedView === 'cognitive') {
      return (
        <PlaceholderView
          title="ניתוח קוגניטיבי"
          description="תוכן מפורט לניתוח קוגניטיבי - עיבוד מידע, זיכרון, קשב"
          icon="🧠"
          darkMode={darkMode}
        />
      );
    }

    // Metrics & Statistics
    if (selectedView === 'metrics') {
      return (
        <CoreStatsDashboard
          students={students?.filter(s => !s.needsAnalysis) || []}
          darkMode={darkMode}
          theme={theme}
          selectedSection={selectedSubView || 'trends'}
        />
      );
    }

    // Intervention & Support
    if (selectedView === 'intervention') {
      return (
        <PlaceholderView
          title="התערבות ותמיכה"
          description="המלצות להתערבות, משאבים, אסטרטגיות ומעקב"
          icon="🎯"
          darkMode={darkMode}
        />
      );
    }

    // Settings
    if (selectedView === 'settings') {
      return (
        <SettingsView
          darkMode={darkMode}
          theme={theme}
          onToggleTheme={toggleTheme}
          selectedSubView={selectedSubView}
        />
      );
    }

    // Default fallback
    return (
      <PlaceholderView
        title="בקרוב"
        description="תוכן זה יהיה זמין בקרוב"
        icon="⏳"
        darkMode={darkMode}
      />
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Unified Sidebar */}
      <UnifiedSidebar
        selectedView={selectedView}
        selectedSubView={selectedSubView}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        theme={theme}
        pendingCount={pendingCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-screen p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedView + (selectedSubView || '') + (selectedStudent?.studentCode || '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderMainContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STUDENT DETAIL VIEW
// ============================================================================

const StudentDetailView = ({ student, onBack, darkMode, theme }) => {
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <span>←</span>
        <span>חזרה לרשימה</span>
      </button>

      {/* Student Header */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-6 border border-white/20 shadow-xl`}>
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תלמיד {student.studentCode}
        </h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {student.name || `תלמיד ${student.studentCode}`}
        </p>
      </div>

      {/* Student Analysis Content */}
      <EmotionalBehavioralDashboard
        students={[student]}
        darkMode={darkMode}
        theme={theme}
        selectedView="overview"
        singleStudentMode={true}
      />
    </div>
  );
};

// ============================================================================
// PLACEHOLDER VIEW
// ============================================================================

const PlaceholderView = ({ title, description, icon, darkMode }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-12 border border-white/20 shadow-xl max-w-2xl w-full text-center`}>
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// SETTINGS VIEW
// ============================================================================

const SettingsView = ({ darkMode, theme, onToggleTheme, selectedSubView }) => {
  if (selectedSubView === 'theme') {
    return (
      <div className="space-y-6">
        <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          הגדרות נושא
        </h1>

        <div className={`backdrop-blur-xl ${
          darkMode ? 'bg-white/10' : 'bg-white/40'
        } rounded-3xl p-6 border border-white/20 shadow-xl`}>
          <button
            onClick={onToggleTheme}
            className={`w-full px-6 py-4 rounded-xl transition-all ${
              darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {darkMode ? 'מצב כהה' : 'מצב בהיר'}
              </span>
              <span className="text-2xl">{darkMode ? '🌙' : '☀️'}</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlaceholderView
      title="הגדרות"
      description="הגדרות מערכת וניהול"
      icon="⚙️"
      darkMode={darkMode}
    />
  );
};

export default UnifiedDashboard;
