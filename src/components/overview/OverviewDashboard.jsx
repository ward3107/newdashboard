import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BookOpen,
  BarChart3,
  Zap,
  ArrowRight,
  ChevronRight,
  Activity,
  Target,
  Award,
  Grid3x3
} from 'lucide-react';

/**
 * OverviewDashboard - DEFAULT VIEW
 * Shows class statistics, student counts, analysis status, and quick actions
 */
const OverviewDashboard = ({ students, darkMode, theme, onNavigate }) => {
  // Calculate statistics
  const stats = useMemo(() => {
    const total = students?.length || 0;
    const analyzed = students?.filter(s => !s.needsAnalysis).length || 0;
    const pending = students?.filter(s => s.needsAnalysis).length || 0;
    const completionRate = total > 0 ? Math.round((analyzed / total) * 100) : 0;

    // Calculate insights
    const analyzedStudents = students?.filter(s => !s.needsAnalysis) || [];

    return {
      total,
      analyzed,
      pending,
      completionRate,
      analyzedStudents
    };
  }, [students]);

  // Get recent activity (most recently analyzed students)
  const recentActivity = useMemo(() => {
    const analyzed = students?.filter(s => !s.needsAnalysis) || [];
    return analyzed
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(student => ({
        studentCode: student.studentCode,
        name: student.name || `תלמיד ${student.studentCode}`,
        date: student.date,
        action: 'analyzed'
      }));
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            סקירה כללית
          </h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            מבט מהיר על מצב הכיתה
          </p>
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <Calendar size={16} className="inline ml-2" />
          {new Date().toLocaleDateString('he-IL')}
        </div>
      </motion.div>

      {/* Class Information Card */}
      <ClassInfoCard darkMode={darkMode} theme={theme} />

      {/* Statistics Cards - Row of 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="סך הכל תלמידים"
          value={stats.total}
          color="from-blue-500 to-cyan-500"
          darkMode={darkMode}
          delay={0}
        />
        <StatCard
          icon={CheckCircle}
          label="תלמידים מנותחים"
          value={stats.analyzed}
          color="from-green-500 to-emerald-500"
          darkMode={darkMode}
          delay={0.1}
        />
        <StatCard
          icon={Clock}
          label="ממתינים לניתוח"
          value={stats.pending}
          color="from-yellow-500 to-orange-500"
          darkMode={darkMode}
          delay={0.2}
        />
        <StatCard
          icon={BarChart3}
          label="אחוז השלמה"
          value={`${stats.completionRate}%`}
          color="from-purple-500 to-pink-500"
          darkMode={darkMode}
          delay={0.3}
        />
      </div>

      {/* Analysis Progress Bar */}
      <AnalysisProgressBar
        analyzed={stats.analyzed}
        pending={stats.pending}
        total={stats.total}
        completionRate={stats.completionRate}
        darkMode={darkMode}
        theme={theme}
      />

      {/* Quick Actions - 3 Large Buttons */}
      <QuickActionsSection
        onNavigate={onNavigate}
        pendingCount={stats.pending}
        darkMode={darkMode}
        theme={theme}
      />

      {/* Two Column Layout: Key Insights + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KeyInsightsCard
          students={stats.analyzedStudents}
          total={stats.total}
          darkMode={darkMode}
          theme={theme}
        />
        <RecentActivityCard
          activities={recentActivity}
          darkMode={darkMode}
          theme={theme}
        />
      </div>

      {/* Next Steps Checklist */}
      <NextStepsCard
        pendingCount={stats.pending}
        analyzedCount={stats.analyzed}
        onNavigate={onNavigate}
        darkMode={darkMode}
        theme={theme}
      />
    </div>
  );
};

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({ icon: Icon, label, value, color, darkMode, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105`}
    >
      <div className={`w-12 h-12 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="text-white" size={24} />
      </div>
      <div className={`text-4xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </div>
    </motion.div>
  );
};

// ============================================================================
// CLASS INFO CARD
// ============================================================================

const ClassInfoCard = ({ darkMode, theme }) => {
  const currentQuarter = 'רבעון ב׳ (Q2)';
  const academicYear = '2024-2025';
  const lastUpdated = new Date().toLocaleString('he-IL');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center`}>
            <BookOpen className="text-white" size={24} />
          </div>
          <div>
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              מידע על הכיתה
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              פרטים כלליים
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <InfoItem
          icon={Calendar}
          label="רבעון"
          value={currentQuarter}
          darkMode={darkMode}
        />
        <InfoItem
          icon={BookOpen}
          label="שנת לימודים"
          value={academicYear}
          darkMode={darkMode}
        />
        <InfoItem
          icon={Clock}
          label="עדכון אחרון"
          value={lastUpdated}
          darkMode={darkMode}
        />
      </div>
    </motion.div>
  );
};

const InfoItem = ({ icon: Icon, label, value, darkMode }) => (
  <div className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
    <div className="flex items-center gap-2 mb-1">
      <Icon size={14} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {label}
      </span>
    </div>
    <div className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
      {value}
    </div>
  </div>
);

// ============================================================================
// ANALYSIS PROGRESS BAR
// ============================================================================

const AnalysisProgressBar = ({ analyzed, pending, total, completionRate, darkMode, theme }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          סטטוס ניתוחים
        </h3>
        <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {analyzed}/{total}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${completionRate}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full bg-gradient-to-r ${theme.primary} rounded-full`}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${theme.primary}`} />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            מנותחים: {analyzed} ({completionRate}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/30" />
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ממתינים: {pending} ({100 - completionRate}%)
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// QUICK ACTIONS SECTION
// ============================================================================

const QuickActionsSection = ({ onNavigate, pendingCount, darkMode, theme }) => {
  const actions = [
    {
      id: 'seating',
      icon: Grid3x3,
      label: 'סידור ישיבה',
      description: 'צפה במפת כיתה',
      color: 'from-purple-500 to-pink-500',
      onClick: () => onNavigate('seating')
    },
    {
      id: 'students',
      icon: Users,
      label: 'רשימת תלמידים',
      description: 'צפה בכל התלמידים',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => onNavigate('students')
    },
    {
      id: 'analyze',
      icon: Zap,
      label: 'ניתוח AI',
      description: `נתח ${pendingCount} תלמידים`,
      color: 'from-green-500 to-emerald-500',
      onClick: () => onNavigate('analyze'),
      disabled: pendingCount === 0
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        פעולות מהירות
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action, index) => (
          <QuickActionButton
            key={action.id}
            action={action}
            darkMode={darkMode}
            delay={0.6 + index * 0.1}
          />
        ))}
      </div>
    </motion.div>
  );
};

const QuickActionButton = ({ action, darkMode, delay }) => {
  const Icon = action.icon;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={action.onClick}
      disabled={action.disabled}
      className={`group backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105 ${
        action.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
    >
      <div className={`w-16 h-16 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        <Icon className="text-white" size={32} />
      </div>
      <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {action.label}
      </h4>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {action.description}
      </p>
      <div className="mt-4 flex items-center justify-end">
        <ChevronRight className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={20} />
      </div>
    </motion.button>
  );
};

// ============================================================================
// KEY INSIGHTS CARD
// ============================================================================

const KeyInsightsCard = ({ students, total, darkMode, theme }) => {
  // Calculate insights (mock for now - replace with real calculations)
  const highRiskCount = Math.floor(students.length * 0.1); // 10% at risk
  const positiveProgressCount = Math.floor(students.length * 0.6); // 60% positive
  const avgEmotionalBalance = 82;
  const avgFocusLevel = 78;

  const insights = [
    {
      icon: AlertTriangle,
      label: `${highRiskCount} תלמידים דורשים תשומת לב`,
      color: 'text-red-500',
      severity: 'high'
    },
    {
      icon: TrendingUp,
      label: `${positiveProgressCount} תלמידים מראים התקדמות`,
      color: 'text-green-500',
      severity: 'positive'
    },
    {
      icon: Activity,
      label: `איזון רגשי ממוצע: ${avgEmotionalBalance}%`,
      color: 'text-blue-500',
      severity: 'info'
    },
    {
      icon: Target,
      label: `רמת ריכוז ממוצעת: ${avgFocusLevel}%`,
      color: 'text-purple-500',
      severity: 'info'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.7 }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Award className={darkMode ? 'text-yellow-500' : 'text-yellow-600'} size={24} />
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תובנות מרכזיות
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg ${
                darkMode ? 'bg-white/5' : 'bg-white/30'
              }`}
            >
              <Icon className={insight.color} size={20} />
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {insight.label}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ============================================================================
// RECENT ACTIVITY CARD
// ============================================================================

const RecentActivityCard = ({ activities, darkMode, theme }) => {
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'לאחרונה';

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `לפני ${diffDays} ימים`;
    if (diffHours > 0) return `לפני ${diffHours} שעות`;
    return 'לאחרונה';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.8 }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <Activity className={darkMode ? 'text-blue-500' : 'text-blue-600'} size={24} />
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          פעילות אחרונה
        </h3>
      </div>

      <div className="space-y-2">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-3 rounded-lg ${
                darkMode ? 'bg-white/5' : 'bg-white/30'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="text-green-500" size={16} />
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  תלמיד {activity.studentCode} נותח
                </span>
              </div>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {formatTimeAgo(activity.date)}
              </span>
            </div>
          ))
        ) : (
          <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            אין פעילות אחרונה
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================================
// NEXT STEPS CARD
// ============================================================================

const NextStepsCard = ({ pendingCount, analyzedCount, onNavigate, darkMode, theme }) => {
  const steps = [
    {
      id: 'analyze',
      label: `נתח ${pendingCount} תלמידים ממתינים`,
      action: 'analyze',
      completed: pendingCount === 0,
      show: pendingCount > 0
    },
    {
      id: 'seating',
      label: 'בדוק את סידור הישיבה',
      action: 'seating',
      completed: false,
      show: true
    },
    {
      id: 'review',
      label: 'סקור תלמידים בסיכון גבוה',
      action: 'students',
      completed: false,
      show: analyzedCount > 0
    }
  ];

  const visibleSteps = steps.filter(step => step.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20 shadow-xl`}
    >
      <div className="flex items-center gap-3 mb-4">
        <CheckCircle className={darkMode ? 'text-green-500' : 'text-green-600'} size={24} />
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          צעדים הבאים
        </h3>
      </div>

      <div className="space-y-2">
        {visibleSteps.map((step) => (
          <button
            key={step.id}
            onClick={() => !step.completed && onNavigate(step.action)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
              step.completed
                ? darkMode ? 'bg-green-500/20' : 'bg-green-100'
                : darkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white/30 hover:bg-white/50'
            } ${!step.completed && 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              {step.completed ? (
                <CheckCircle className="text-green-500" size={20} />
              ) : (
                <div className={`w-5 h-5 rounded-full border-2 ${
                  darkMode ? 'border-gray-500' : 'border-gray-400'
                }`} />
              )}
              <span className={`text-sm ${
                step.completed
                  ? 'text-green-500 line-through'
                  : darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {step.label}
              </span>
            </div>
            {!step.completed && (
              <ArrowRight className={darkMode ? 'text-gray-500' : 'text-gray-400'} size={16} />
            )}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default OverviewDashboard;
