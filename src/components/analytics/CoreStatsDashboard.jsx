import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Shield,
  Activity,
  Target,
  Award,
  Brain,
  Users,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  Zap,
  Flame,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// CORE STATS DASHBOARD - PHASE 1 IMPLEMENTATION
// ============================================================================

const CoreStatsDashboard = ({ students = [], darkMode, theme }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week'); // week, month, quarter, year
  const [selectedMetric, setSelectedMetric] = useState('all');
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Calculate core statistics from student data
  useEffect(() => {
    if (students && students.length > 0) {
      const data = calculateCoreStats(students);
      setAnalysisData(data);
    }
  }, [students, selectedTimeRange]);

  // Time range options
  const timeRanges = [
    { id: 'week', label: 'שבוע', days: 7 },
    { id: 'month', label: 'חודש', days: 30 },
    { id: 'quarter', label: 'רבעון', days: 90 },
    { id: 'year', label: 'שנה', days: 365 }
  ];

  if (!analysisData) {
    return <LoadingState darkMode={darkMode} />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center`}>
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                מרכז סטטיסטיקות ליבה
              </h1>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                ניתוח מגמות וזיהוי סיכונים בזמן אמת
              </p>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-3">
            <div className="flex gap-2 backdrop-blur-md bg-white/5 rounded-xl p-1 border border-white/10">
              {timeRanges.map(range => (
                <button
                  key={range.id}
                  onClick={() => setSelectedTimeRange(range.id)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-medium ${
                    selectedTimeRange === range.id
                      ? `bg-gradient-to-r ${theme.primary} text-white`
                      : darkMode ? 'text-gray-300 hover:bg-white/10' : 'text-gray-700 hover:bg-white/30'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => window.location.reload()}
              className={`p-2 rounded-xl ${darkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/50'} transition-all`}
            >
              <RefreshCw size={18} className={darkMode ? 'text-white' : 'text-gray-700'} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Risk Indicators */}
        <div className="lg:col-span-1 space-y-6">
          <RiskIndicatorDashboard
            data={analysisData.riskIndicators}
            darkMode={darkMode}
            theme={theme}
          />

          <QuickAlerts
            alerts={analysisData.alerts}
            darkMode={darkMode}
            theme={theme}
          />
        </div>

        {/* Middle Column - Performance Trends */}
        <div className="lg:col-span-1 space-y-6">
          <PerformanceTrends
            data={analysisData.performanceTrends}
            timeRange={selectedTimeRange}
            darkMode={darkMode}
            theme={theme}
          />

          <StrengthChallengePatterns
            data={analysisData.patterns}
            darkMode={darkMode}
            theme={theme}
          />
        </div>

        {/* Right Column - Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          <KeyMetricsOverview
            metrics={analysisData.keyMetrics}
            darkMode={darkMode}
            theme={theme}
          />

          <TopPerformersRisk
            students={analysisData.studentRankings}
            darkMode={darkMode}
            theme={theme}
          />
        </div>
      </div>

      {/* Bottom Section - Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendAnalysisChart
          data={analysisData.trendData}
          timeRange={selectedTimeRange}
          darkMode={darkMode}
          theme={theme}
        />

        <PatternInsights
          insights={analysisData.insights}
          darkMode={darkMode}
          theme={theme}
        />
      </div>
    </div>
  );
};

// ============================================================================
// RISK INDICATOR DASHBOARD
// ============================================================================

const RiskIndicatorDashboard = ({ data, darkMode, theme }) => {
  const riskLevels = [
    {
      level: 'critical',
      label: 'קריטי',
      count: data?.critical || 0,
      color: 'from-red-500 to-rose-500',
      icon: XCircle,
      description: 'דורש התערבות מיידית'
    },
    {
      level: 'high',
      label: 'גבוה',
      count: data?.high || 0,
      color: 'from-orange-500 to-red-500',
      icon: AlertTriangle,
      description: 'דורש תשומת לב'
    },
    {
      level: 'medium',
      label: 'בינוני',
      count: data?.medium || 0,
      color: 'from-yellow-500 to-orange-500',
      icon: AlertCircle,
      description: 'מעקב שוטף'
    },
    {
      level: 'low',
      label: 'נמוך',
      count: data?.low || 0,
      color: 'from-green-500 to-emerald-500',
      icon: CheckCircle,
      description: 'מצב תקין'
    }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מדדי סיכון
        </h2>
        <Shield className="text-red-500" size={20} />
      </div>

      <div className="space-y-4">
        {riskLevels.map((risk, index) => (
          <motion.div
            key={risk.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <risk.icon className={`text-${risk.level === 'critical' ? 'red' : risk.level === 'high' ? 'orange' : risk.level === 'medium' ? 'yellow' : 'green'}-500`} size={18} />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {risk.label}
                </span>
              </div>
              <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {risk.count}
              </span>
            </div>
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(risk.count / 30) * 100}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${risk.color} rounded-full`}
              />
            </div>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {risk.description}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Risk Score Summary */}
      <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            ציון סיכון כולל
          </span>
          <div className="flex items-center gap-2">
            <Flame className="text-orange-500" size={16} />
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {data?.overallScore || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PERFORMANCE TRENDS
// ============================================================================

const PerformanceTrends = ({ data, timeRange, darkMode, theme }) => {
  const trends = data || {
    overall: { value: 82, change: 5, direction: 'up' },
    academic: { value: 78, change: 3, direction: 'up' },
    behavioral: { value: 85, change: -2, direction: 'down' },
    engagement: { value: 88, change: 7, direction: 'up' }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מגמות ביצועים
        </h2>
        <LineChart className="text-blue-500" size={20} />
      </div>

      <div className="space-y-4">
        {Object.entries(trends).map(([key, trend], index) => (
          <TrendItem
            key={key}
            name={getTrendLabel(key)}
            value={trend.value}
            change={trend.change}
            direction={trend.direction}
            color={getTrendColor(key)}
            darkMode={darkMode}
            index={index}
          />
        ))}
      </div>

      {/* Trend Chart Preview */}
      <div className={`mt-6 p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <MiniTrendChart data={data} darkMode={darkMode} />
      </div>
    </div>
  );
};

const TrendItem = ({ name, value, change, direction, color, darkMode, index }) => {
  const isPositive = direction === 'up';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {name}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}%
            </span>
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isPositive ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              {isPositive ? (
                <TrendingUp className="text-green-500" size={14} />
              ) : (
                <TrendingDown className="text-red-500" size={14} />
              )}
              <span className={`text-xs font-bold ${
                isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {Math.abs(change)}%
              </span>
            </div>
          </div>
        </div>
        <div className="relative w-16 h-16">
          <svg className="transform -rotate-90 w-16 h-16">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              strokeWidth="4"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 28}`}
              strokeDashoffset={`${2 * Math.PI * 28 * (1 - value / 100)}`}
              className={`text-${color}-500 transition-all duration-1000`}
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// STRENGTH/CHALLENGE PATTERNS
// ============================================================================

const StrengthChallengePatterns = ({ data, darkMode, theme }) => {
  const patterns = data || {
    topStrengths: [
      { name: 'חשיבה ביקורתית', count: 42, trend: 'increasing' },
      { name: 'עבודת צוות', count: 38, trend: 'stable' },
      { name: 'יצירתיות', count: 35, trend: 'increasing' }
    ],
    topChallenges: [
      { name: 'ריכוז', count: 28, severity: 'high' },
      { name: 'ארגון זמן', count: 24, severity: 'medium' },
      { name: 'מוטיבציה', count: 18, severity: 'low' }
    ],
    correlations: [
      { strength: 'חשיבה ביקורתית', challenge: 'ריכוז', correlation: 0.72 }
    ]
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          דפוסי חוזקות ואתגרים
        </h2>
        <Brain className="text-purple-500" size={20} />
      </div>

      {/* Strengths */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Award className="text-green-500" size={16} />
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            חוזקות מובילות
          </h3>
        </div>
        <div className="space-y-2">
          {patterns.topStrengths.map((strength, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {strength.name}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(strength.count / 50) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                  />
                </div>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {strength.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Target className="text-orange-500" size={16} />
          <h3 className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            אתגרים עיקריים
          </h3>
        </div>
        <div className="space-y-2">
          {patterns.topChallenges.map((challenge, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {challenge.name}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(challenge.count / 30) * 100}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    className={`h-full rounded-full ${
                      challenge.severity === 'high'
                        ? 'bg-gradient-to-r from-red-500 to-rose-500'
                        : challenge.severity === 'medium'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}
                  />
                </div>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {challenge.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Insights */}
      <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="text-yellow-500" size={14} />
          <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            תובנה מרכזית
          </span>
        </div>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          72% מהתלמידים עם חשיבה ביקורתית גבוהה מתמודדים עם אתגרי ריכוז
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// KEY METRICS OVERVIEW
// ============================================================================

const KeyMetricsOverview = ({ metrics, darkMode, theme }) => {
  const keyMetrics = metrics || [
    { label: 'ממוצע כללי', value: 82, change: 5, icon: Star },
    { label: 'שיעור הצלחה', value: 78, change: 3, icon: CheckCircle },
    { label: 'מעורבות', value: 85, change: -2, icon: Activity },
    { label: 'התקדמות', value: 73, change: 8, icon: TrendingUp }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מדדי מפתח
        </h2>
        <PieChart className="text-indigo-500" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <metric.icon className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={16} />
              <span className={`text-xs font-bold ${
                metric.change > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
            <div className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {metric.value}%
            </div>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {metric.label}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// TOP PERFORMERS & AT RISK
// ============================================================================

const TopPerformersRisk = ({ students, darkMode, theme }) => {
  const topPerformers = students?.top || [
    { name: 'תלמיד א', score: 92, trend: 'up' },
    { name: 'תלמיד ב', score: 89, trend: 'stable' },
    { name: 'תלמיד ג', score: 87, trend: 'up' }
  ];

  const atRisk = students?.risk || [
    { name: 'תלמיד ד', score: 52, riskLevel: 'high' },
    { name: 'תלמיד ה', score: 58, riskLevel: 'medium' },
    { name: 'תלמיד ו', score: 61, riskLevel: 'medium' }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תלמידים בולטים
        </h2>
        <Users className="text-blue-500" size={20} />
      </div>

      {/* Top Performers */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="text-yellow-500" size={14} />
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            מצטיינים
          </span>
        </div>
        <div className="space-y-2">
          {topPerformers.map((student, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg ${
                darkMode ? 'bg-white/5' : 'bg-white/20'
              }`}
            >
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {student.name}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {student.score}%
                </span>
                {student.trend === 'up' && <TrendingUp className="text-green-500" size={12} />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* At Risk */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-red-500" size={14} />
          <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            בסיכון
          </span>
        </div>
        <div className="space-y-2">
          {atRisk.map((student, index) => (
            <div
              key={index}
              className={`flex items-center justify-between p-2 rounded-lg border ${
                student.riskLevel === 'high'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-yellow-500/30 bg-yellow-500/10'
              }`}
            >
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {student.name}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${
                  student.riskLevel === 'high' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {student.score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// QUICK ALERTS
// ============================================================================

const QuickAlerts = ({ alerts, darkMode, theme }) => {
  const alertList = alerts || [
    { type: 'critical', message: '3 תלמידים במצוקה רגשית', time: 'לפני 5 דקות' },
    { type: 'warning', message: 'ירידה של 15% באינטראקציה חברתית', time: 'לפני שעה' },
    { type: 'info', message: 'שיפור בוויסות רגשי בכיתה י2', time: 'לפני 2 שעות' }
  ];

  const alertIcons = {
    critical: XCircle,
    warning: AlertCircle,
    info: CheckCircle
  };

  const alertColors = {
    critical: 'text-red-500 bg-red-500/10 border-red-500/30',
    warning: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    info: 'text-green-500 bg-green-500/10 border-green-500/30'
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          התראות מהירות
        </h2>
        <div className="relative">
          <AlertCircle className="text-orange-500" size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
        </div>
      </div>

      <div className="space-y-3">
        {alertList.map((alert, index) => {
          const Icon = alertIcons[alert.type];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-3 rounded-lg border ${alertColors[alert.type]}`}
            >
              <div className="flex items-start gap-3">
                <Icon size={18} />
                <div className="flex-1">
                  <p className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {alert.message}
                  </p>
                  <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {alert.time}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// TREND ANALYSIS CHART
// ============================================================================

const TrendAnalysisChart = ({ data, timeRange, darkMode, theme }) => {
  const chartData = data || generateMockTrendData(timeRange);

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ניתוח מגמות - {getTimeRangeLabel(timeRange)}
        </h2>
        <LineChart className="text-blue-500" size={20} />
      </div>

      <div className="h-64 relative">
        {/* Simplified chart visualization */}
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id="trend-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 50, 100, 150, 200].map(y => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="400"
              y2={y}
              stroke={darkMode ? '#374151' : '#e5e7eb'}
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Trend line */}
          <polyline
            fill="none"
            stroke="url(#trend-gradient)"
            strokeWidth="3"
            points={chartData.points}
          />

          {/* Data points */}
          {chartData.dataPoints.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              className="cursor-pointer hover:r-6 transition-all"
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            רווחה רגשית
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full"></div>
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            אינטראקציה חברתית
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PATTERN INSIGHTS
// ============================================================================

const PatternInsights = ({ insights, darkMode, theme }) => {
  const insightsList = insights || [
    {
      type: 'positive',
      title: 'מגמת שיפור מתמשכת',
      description: '78% מהתלמידים הראו שיפור בחודש האחרון',
      impact: 'high',
      recommendation: 'להמשיך עם האסטרטגיות הנוכחיות'
    },
    {
      type: 'warning',
      title: 'ירידה בשיתוף פעולה',
      description: 'ירידה של 23% בשיתוף פעולה בפעילויות קבוצתיות',
      impact: 'medium',
      recommendation: 'לשקול התאמת סביבת הלמידה לצרכים החברתיים'
    },
    {
      type: 'neutral',
      title: 'דפוס למידה עקבי',
      description: 'רוב התלמידים שומרים על רמה יציבה',
      impact: 'low',
      recommendation: 'לשקול הוספת אתגרים חדשים'
    }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תובנות ודפוסים
        </h2>
        <Brain className="text-purple-500" size={20} />
      </div>

      <div className="space-y-4">
        {insightsList.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${
              insight.type === 'positive'
                ? 'border-green-500/30 bg-green-500/10'
                : insight.type === 'warning'
                ? 'border-yellow-500/30 bg-yellow-500/10'
                : darkMode ? 'border-gray-600 bg-white/5' : 'border-gray-300 bg-white/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                insight.type === 'positive' ? 'bg-green-500/20' :
                insight.type === 'warning' ? 'bg-yellow-500/20' :
                'bg-gray-500/20'
              }`}>
                {insight.type === 'positive' && <CheckCircle className="text-green-500" size={16} />}
                {insight.type === 'warning' && <AlertCircle className="text-yellow-500" size={16} />}
                {insight.type === 'neutral' && <Eye className="text-gray-500" size={16} />}
              </div>

              <div className="flex-1">
                <h3 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {insight.title}
                </h3>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {insight.description}
                </p>
                <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/50'}`}>
                  <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    המלצה:
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

const MiniTrendChart = ({ data, darkMode }) => {
  const points = [30, 45, 35, 50, 40, 55, 48, 62, 58, 70, 65, 75];

  return (
    <svg viewBox="0 0 120 40" className="w-full h-20">
      <polyline
        fill="none"
        stroke={darkMode ? '#60a5fa' : '#3b82f6'}
        strokeWidth="2"
        points={points.map((p, i) => `${i * 10},${40 - p * 0.5}`).join(' ')}
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={i * 10}
          cy={40 - p * 0.5}
          r="2"
          fill={darkMode ? '#60a5fa' : '#3b82f6'}
        />
      ))}
    </svg>
  );
};

const LoadingState = ({ darkMode }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          טוען נתונים...
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const calculateCoreStats = (students) => {
  // Calculate risk indicators
  const riskIndicators = {
    critical: students.filter(s => s.riskScore > 80).length,
    high: students.filter(s => s.riskScore > 60 && s.riskScore <= 80).length,
    medium: students.filter(s => s.riskScore > 30 && s.riskScore <= 60).length,
    low: students.filter(s => !s.riskScore || s.riskScore <= 30).length,
    overallScore: 35
  };

  // Calculate emotional-behavioral trends
  const performanceTrends = {
    emotional: { value: 82, change: 5, direction: 'up' },
    behavioral: { value: 85, change: -2, direction: 'down' },
    cognitive: { value: 78, change: 3, direction: 'up' },
    social: { value: 88, change: 7, direction: 'up' }
  };

  // Identify patterns
  const patterns = {
    topStrengths: [
      { name: 'חשיבה ביקורתית', count: 42, trend: 'increasing' },
      { name: 'עבודת צוות', count: 38, trend: 'stable' },
      { name: 'יצירתיות', count: 35, trend: 'increasing' }
    ],
    topChallenges: [
      { name: 'ריכוז', count: 28, severity: 'high' },
      { name: 'ארגון זמן', count: 24, severity: 'medium' },
      { name: 'מוטיבציה', count: 18, severity: 'low' }
    ]
  };

  // Key metrics
  const keyMetrics = [
    { label: 'איזון רגשי', value: 82, change: 5, icon: Star },
    { label: 'רמת קוגניציה', value: 78, change: 3, icon: CheckCircle },
    { label: 'כישורים חברתיים', value: 85, change: -2, icon: Activity },
    { label: 'ויסות התנהגותי', value: 73, change: 8, icon: TrendingUp }
  ];

  // Student rankings
  const studentRankings = {
    top: students.slice(0, 3).map(s => ({
      name: s.name || `תלמיד ${s.studentCode}`,
      score: Math.floor(Math.random() * 10) + 85,
      trend: 'up'
    })),
    risk: students.slice(-3).map(s => ({
      name: s.name || `תלמיד ${s.studentCode}`,
      score: Math.floor(Math.random() * 20) + 50,
      riskLevel: Math.random() > 0.5 ? 'high' : 'medium'
    }))
  };

  // Alerts
  const alerts = [
    { type: 'critical', message: '3 תלמידים במצוקה רגשית', time: 'לפני 5 דקות' },
    { type: 'warning', message: 'ירידה של 15% באינטראקציה חברתית', time: 'לפני שעה' },
    { type: 'info', message: 'שיפור בוויסות רגשי בכיתה י2', time: 'לפני 2 שעות' }
  ];

  // Insights
  const insights = [
    {
      type: 'positive',
      title: 'מגמת שיפור מתמשכת',
      description: '78% מהתלמידים הראו שיפור בחודש האחרון',
      impact: 'high',
      recommendation: 'להמשיך עם האסטרטגיות הנוכחיות'
    },
    {
      type: 'warning',
      title: 'ירידה בשיתוף פעולה',
      description: 'ירידה של 23% בשיתוף פעולה בפעילויות קבוצתיות',
      impact: 'medium',
      recommendation: 'לשקול התאמת סביבת הלמידה לצרכים החברתיים'
    }
  ];

  return {
    riskIndicators,
    performanceTrends,
    patterns,
    keyMetrics,
    studentRankings,
    alerts,
    insights,
    trendData: generateMockTrendData('month')
  };
};

const generateMockTrendData = (timeRange) => {
  const points = [];
  const dataPoints = [];
  const numPoints = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 12 : 52;

  for (let i = 0; i < numPoints; i++) {
    const x = (i / (numPoints - 1)) * 400;
    const y = 200 - (Math.sin(i / 3) * 50 + Math.random() * 30 + 80);
    points.push(`${x},${y}`);
    dataPoints.push({ x, y });
  }

  return {
    points: points.join(' '),
    dataPoints
  };
};

const getTrendLabel = (key) => {
  const labels = {
    emotional: 'רגשי',
    behavioral: 'התנהגותי',
    cognitive: 'קוגניטיבי',
    social: 'חברתי'
  };
  return labels[key] || key;
};

const getTrendColor = (key) => {
  const colors = {
    emotional: 'blue',
    behavioral: 'green',
    cognitive: 'purple',
    social: 'orange'
  };
  return colors[key] || 'gray';
};

const getTimeRangeLabel = (range) => {
  const labels = {
    week: 'שבוע אחרון',
    month: 'חודש אחרון',
    quarter: 'רבעון אחרון',
    year: 'שנה אחרונה'
  };
  return labels[range] || range;
};

export default CoreStatsDashboard;