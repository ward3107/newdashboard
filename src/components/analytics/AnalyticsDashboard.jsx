import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Award,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Users,
  Calendar,
  Clock,
  BookOpen,
  Zap,
  Heart,
  Shield,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Download,
  Grid3x3,
  Bell,
  Home,
  Filter,
  RefreshCw,
  Info,
  Star,
  UserCheck,
  User,
  GraduationCap,
  Briefcase,
  MessageSquare,
  FileText,
  Settings,
  ChartBar,
  ChartLine,
  ChartPie,
  Globe,
  Lightbulb,
  Percent,
  Timer,
  TrendingDown,
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Layers,
  Compass,
  Map,
  Navigation,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Import mock data generator
import { generateMockAnalytics } from '../../utils/mockAnalyticsData';

// Import Core Stats Dashboard for Phase 1
import CoreStatsDashboard from './CoreStatsDashboard';

// Import Emotional-Behavioral-Cognitive Dashboard
import EmotionalBehavioralDashboard from './EmotionalBehavioralDashboard';

// Import extended sections
import {
  ProgressGrowthSection,
  ComparativeAnalyticsSection,
  PredictiveStatisticsSection,
  TeacherSupportSection
} from './AnalyticsSectionsExtended';

// ============================================================================
// MAIN ANALYTICS DASHBOARD
// ============================================================================

const AnalyticsDashboard = ({ students, darkMode, theme }) => {
  const [selectedCategory, setSelectedCategory] = useState('ebc'); // Default to emotional-behavioral-cognitive
  const [selectedSubCategory, setSelectedSubCategory] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedMenus, setExpandedMenus] = useState({ ebc: true }); // EBC expanded by default
  const [viewMode, setViewMode] = useState('overview'); // overview, detailed, comparison

  // Analytics categories with icons, Hebrew names, and submenus (NO ACADEMIC/GRADES)
  const categories = [
    {
      id: 'ebc',
      name: 'רגשי-התנהגותי-קוגניטיבי',
      icon: Heart,
      color: 'from-purple-600 to-pink-600',
      priority: true,
      subItems: [
        { id: 'overview', name: 'סקירה כללית', icon: Eye },
        { id: 'emotional', name: 'ניתוח רגשי', icon: Heart },
        { id: 'behavioral', name: 'ניתוח התנהגותי', icon: Activity },
        { id: 'cognitive', name: 'ניתוח קוגניטיבי', icon: Brain },
        { id: 'seating', name: 'המלצות ישיבה', icon: Grid3x3 }
      ]
    },
    {
      id: 'core',
      name: 'סטטיסטיקות ליבה',
      icon: ChartBar,
      color: 'from-blue-600 to-indigo-600',
      subItems: [
        { id: 'risk', name: 'מדדי סיכון', icon: AlertTriangle },
        { id: 'trends', name: 'מגמות', icon: TrendingUp },
        { id: 'patterns', name: 'דפוסים', icon: Layers },
        { id: 'metrics', name: 'מדדי מפתח', icon: PieChart }
      ]
    },
    {
      id: 'behavioral',
      name: 'דפוסי התנהגות',
      icon: Activity,
      color: 'from-red-500 to-rose-500',
      subItems: [
        { id: 'frequency', name: 'תדירות התנהגויות', icon: BarChart3 },
        { id: 'interactions', name: 'אינטראקציות', icon: Users },
        { id: 'focus', name: 'ריכוז וקשב', icon: Target },
        { id: 'regulation', name: 'ויסות עצמי', icon: Shield }
      ]
    },
    {
      id: 'cognitive',
      name: 'ניתוח קוגניטיבי',
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      subItems: [
        { id: 'processing', name: 'עיבוד מידע', icon: Zap },
        { id: 'memory', name: 'זיכרון', icon: BookOpen },
        { id: 'attention', name: 'קשב', icon: Eye },
        { id: 'flexibility', name: 'גמישות מחשבתית', icon: RefreshCw }
      ]
    },
    {
      id: 'social',
      name: 'אינטראקציה חברתית',
      icon: Users,
      color: 'from-green-500 to-emerald-500',
      subItems: [
        { id: 'dynamics', name: 'דינמיקה חברתית', icon: Users },
        { id: 'relationships', name: 'יחסים בין-אישיים', icon: Heart },
        { id: 'communication', name: 'תקשורת', icon: MessageSquare },
        { id: 'collaboration', name: 'שיתוף פעולה', icon: UserPlus }
      ]
    },
    {
      id: 'environmental',
      name: 'סביבת למידה',
      icon: Map,
      color: 'from-orange-500 to-amber-500',
      subItems: [
        { id: 'preferences', name: 'העדפות סביבתיות', icon: Settings },
        { id: 'optimal', name: 'תנאים מיטביים', icon: Star },
        { id: 'adaptations', name: 'התאמות נדרשות', icon: Compass },
        { id: 'classroom', name: 'סביבת הכיתה', icon: Home }
      ]
    },
    {
      id: 'predictive',
      name: 'חיזוי וסיכונים',
      icon: AlertTriangle,
      color: 'from-indigo-500 to-violet-500',
      subItems: [
        { id: 'risks', name: 'זיהוי סיכונים', icon: AlertTriangle },
        { id: 'predictions', name: 'חיזוי מגמות', icon: TrendingUp },
        { id: 'alerts', name: 'התראות', icon: Bell },
        { id: 'prevention', name: 'מניעה', icon: Shield }
      ]
    },
    {
      id: 'support',
      name: 'תמיכה והתערבות',
      icon: Shield,
      color: 'from-teal-500 to-cyan-500',
      subItems: [
        { id: 'interventions', name: 'התערבויות', icon: Zap },
        { id: 'resources', name: 'משאבים', icon: BookOpen },
        { id: 'strategies', name: 'אסטרטגיות', icon: Target },
        { id: 'tracking', name: 'מעקב', icon: Eye }
      ]
    }
  ];

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // In production, this would fetch real data from API
        const data = generateMockAnalytics(students);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (students && students.length > 0) {
      loadAnalytics();
    }
  }, [students]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return <LoadingState darkMode={darkMode} theme={theme} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Navigation */}
      <CategorySidebar
        categories={categories}
        selectedCategory={selectedCategory}
        selectedSubCategory={selectedSubCategory}
        setSelectedCategory={setSelectedCategory}
        setSelectedSubCategory={setSelectedSubCategory}
        expandedMenus={expandedMenus}
        setExpandedMenus={setExpandedMenus}
        darkMode={darkMode}
        theme={theme}
      />

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {/* Content Grid */}
        <div className="space-y-6">
          {selectedCategory === 'ebc' && (
            <EmotionalBehavioralDashboard
              students={students}
              darkMode={darkMode}
              theme={theme}
              selectedView={selectedSubCategory}
            />
          )}

          {selectedCategory === 'core' && (
            <CoreStatsDashboard
              students={students}
              darkMode={darkMode}
              theme={theme}
              selectedSection={selectedSubCategory}
            />
          )}

          {selectedCategory === 'behavioral' && (
            <BehavioralInsightsSection
              data={analyticsData?.behavioral}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.behavioral}
              onToggle={() => toggleSection('behavioral')}
            />
          )}

          {selectedCategory === 'cognitive' && (
            <CognitiveAnalysisSection
              data={analyticsData?.cognitive}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.cognitive}
              onToggle={() => toggleSection('cognitive')}
            />
          )}

          {selectedCategory === 'social' && (
            <SocialDynamicsSection
              data={analyticsData?.social}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.social}
              onToggle={() => toggleSection('social')}
            />
          )}

          {selectedCategory === 'environmental' && (
            <EnvironmentalSection
              data={analyticsData?.environmental}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.environmental}
              onToggle={() => toggleSection('environmental')}
            />
          )}

          {selectedCategory === 'predictive' && (
            <PredictiveStatisticsSection
              data={analyticsData?.predictive}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.predictive}
              onToggle={() => toggleSection('predictive')}
            />
          )}

          {selectedCategory === 'support' && (
            <TeacherSupportSection
              data={analyticsData?.support}
              darkMode={darkMode}
              theme={theme}
              expanded={expandedSections.support}
              onToggle={() => toggleSection('support')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY SIDEBAR WITH EXPANDABLE SUBMENUS
// ============================================================================

const CategorySidebar = ({
  categories,
  selectedCategory,
  selectedSubCategory,
  setSelectedCategory,
  setSelectedSubCategory,
  expandedMenus,
  setExpandedMenus,
  darkMode,
  theme
}) => {

  const toggleMenu = (categoryId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.id);
    if (category.subItems && category.subItems.length > 0) {
      toggleMenu(category.id);
      setSelectedSubCategory(category.subItems[0].id);
    }
  };

  const handleSubItemClick = (categoryId, subItemId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subItemId);
  };

  return (
    <div className={`w-72 h-screen sticky top-0 ${
      darkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-xl border-r ${
      darkMode ? 'border-gray-800' : 'border-gray-200'
    } flex flex-col`}>

      {/* Sidebar Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center`}>
            <ChartBar className="text-white" size={20} />
          </div>
          <div>
            <h2 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              לוח בקרה
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              תפריט ראשי
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {categories.map(category => {
          const Icon = category.icon;
          const isActive = selectedCategory === category.id;
          const isExpanded = expandedMenus[category.id];

          return (
            <div key={category.id}>
              {/* Main Category Button */}
              <button
                onClick={() => handleCategoryClick(category)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : darkMode
                      ? 'text-gray-300 hover:bg-white/10'
                      : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
                <div className="flex-1 text-right">
                  <span className="font-medium block">{category.name}</span>
                  {category.priority && (
                    <span className={`text-xs ${isActive ? 'text-white/80' : darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      מומלץ
                    </span>
                  )}
                </div>
                {category.subItems && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight size={16} className={isActive ? 'text-white' : ''} />
                  </motion.div>
                )}
              </button>

              {/* Submenu Items */}
              {category.subItems && (
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pr-8 pt-1 space-y-0.5">
                        {category.subItems.map(subItem => {
                          const SubIcon = subItem.icon;
                          const isSubActive = selectedCategory === category.id && selectedSubCategory === subItem.id;

                          return (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubItemClick(category.id, subItem.id)}
                              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-sm ${
                                isSubActive
                                  ? darkMode
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-200 text-gray-900'
                                  : darkMode
                                    ? 'text-gray-400 hover:bg-white/10 hover:text-gray-300'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                              }`}
                            >
                              <SubIcon size={14} />
                              <span>{subItem.name}</span>
                              {isSubActive && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  className="mr-auto w-1.5 h-1.5 bg-current rounded-full"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className={`p-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
        <div className={`p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-gray-100'}`}>
          <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            פלטפורמה לניתוח רגשי-התנהגותי
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// QUICK STATS SIDEBAR
// ============================================================================

const QuickStats = ({ analyticsData, darkMode, theme }) => {
  const stats = [
    {
      label: 'איזון רגשי',
      value: analyticsData?.summary?.emotionalBalance || 85,
      icon: Heart,
      trend: '+5%',
      color: 'from-pink-500 to-rose-500'
    },
    {
      label: 'אינטראקציה חברתית',
      value: analyticsData?.summary?.socialInteraction || 92,
      icon: Users,
      trend: '+2%',
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'רמת ריכוז',
      value: analyticsData?.summary?.focusLevel || 78,
      icon: Brain,
      trend: '-3%',
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'ויסות התנהגותי',
      value: analyticsData?.summary?.behavioralRegulation || 88,
      icon: Activity,
      trend: '+7%',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'רמת תמיכה נדרשת',
      value: analyticsData?.summary?.supportLevel || 15,
      icon: Shield,
      trend: '-4%',
      color: 'from-orange-500 to-amber-500'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        סטטיסטיקות מהירות
      </h3>

      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`backdrop-blur-xl ${
            darkMode ? 'bg-white/10' : 'bg-white/40'
          } rounded-2xl p-4 border border-white/20`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
              <stat.icon className="text-white" size={20} />
            </div>
            <span className={`text-xs font-bold ${
              stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.trend}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {stat.value}
              </span>
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                %
              </span>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.label}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stat.value}%` }}
              transition={{ duration: 1, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// 1. ACADEMIC PERFORMANCE SECTION
// ============================================================================

const AcademicPerformanceSection = ({ data, darkMode, theme, expanded, onToggle }) => {
  const [selectedMetric, setSelectedMetric] = useState('grades');

  const metrics = [
    { id: 'grades', name: 'התפלגות ציונים', icon: BarChart3 },
    { id: 'subjects', name: 'ביצועים לפי מקצוע', icon: BookOpen },
    { id: 'attendance', name: 'נוכחות', icon: Calendar },
    { id: 'homework', name: 'מטלות', icon: FileText },
    { id: 'exams', name: 'מבחנים', icon: GraduationCap }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center`}>
            <GraduationCap className="text-white" size={20} />
          </div>
          <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            ביצועים אקדמיים
          </h2>
        </div>

        <button
          onClick={onToggle}
          className={`p-2 rounded-lg ${darkMode ? 'hover:bg-white/10' : 'hover:bg-white/50'} transition-all`}
        >
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* Metric Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {metrics.map(metric => (
          <button
            key={metric.id}
            onClick={() => setSelectedMetric(metric.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              selectedMetric === metric.id
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                : darkMode ? 'bg-white/5 text-gray-300' : 'bg-white/30 text-gray-700'
            }`}
          >
            <metric.icon size={16} />
            <span className="text-sm">{metric.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {selectedMetric === 'grades' && (
          <GradeDistributionChart data={data?.grades} darkMode={darkMode} />
        )}
        {selectedMetric === 'subjects' && (
          <SubjectPerformanceChart data={data?.subjects} darkMode={darkMode} theme={theme} />
        )}
        {selectedMetric === 'attendance' && (
          <AttendanceMetrics data={data?.attendance} darkMode={darkMode} />
        )}
        {selectedMetric === 'homework' && (
          <HomeworkMetrics data={data?.homework} darkMode={darkMode} />
        )}
        {selectedMetric === 'exams' && (
          <ExamPerformanceChart data={data?.exams} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
};

// Grade Distribution Chart
const GradeDistributionChart = ({ data, darkMode }) => {
  const distribution = data || {
    excellent: 25,
    good: 35,
    average: 25,
    belowAverage: 10,
    failing: 5
  };

  const grades = [
    { label: 'מצוין (90-100)', value: distribution.excellent, color: 'from-green-500 to-emerald-500' },
    { label: 'טוב מאוד (80-89)', value: distribution.good, color: 'from-blue-500 to-cyan-500' },
    { label: 'טוב (70-79)', value: distribution.average, color: 'from-yellow-500 to-amber-500' },
    { label: 'מספיק (60-69)', value: distribution.belowAverage, color: 'from-orange-500 to-red-500' },
    { label: 'נכשל (<60)', value: distribution.failing, color: 'from-red-600 to-rose-600' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {grades.map((grade, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {grade.label}
            </span>
            <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {grade.value}%
            </span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${grade.value}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${grade.color} rounded-full`}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// Subject Performance Chart
const SubjectPerformanceChart = ({ data, darkMode, theme }) => {
  const subjects = data || [
    { name: 'מתמטיקה', score: 85, trend: 'up' },
    { name: 'עברית', score: 78, trend: 'stable' },
    { name: 'אנגלית', score: 92, trend: 'up' },
    { name: 'מדעים', score: 88, trend: 'down' },
    { name: 'היסטוריה', score: 75, trend: 'up' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {subjects.map((subject, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} border border-white/10`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {subject.name}
            </h4>
            {subject.trend === 'up' && <TrendingUp size={16} className="text-green-500" />}
            {subject.trend === 'down' && <TrendingDown size={16} className="text-red-500" />}
            {subject.trend === 'stable' && <Activity size={16} className="text-yellow-500" />}
          </div>

          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {subject.score}
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              / 100
            </span>
          </div>

          <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${subject.score}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`h-full bg-gradient-to-r ${theme.primary} rounded-full`}
            />
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Attendance Metrics
const AttendanceMetrics = ({ data, darkMode }) => {
  const metrics = data || {
    present: 165,
    absent: 8,
    late: 12,
    rate: 92
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <UserCheck className="text-green-500 mb-2" size={24} />
        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {metrics.present}
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ימי נוכחות
        </div>
      </div>

      <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <UserMinus className="text-red-500 mb-2" size={24} />
        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {metrics.absent}
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ימי היעדרות
        </div>
      </div>

      <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <Clock className="text-yellow-500 mb-2" size={24} />
        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {metrics.late}
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          איחורים
        </div>
      </div>

      <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <Percent className="text-blue-500 mb-2" size={24} />
        <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {metrics.rate}%
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          שיעור נוכחות
        </div>
      </div>
    </motion.div>
  );
};

// Homework Metrics
const HomeworkMetrics = ({ data, darkMode }) => {
  const metrics = data || {
    completed: 45,
    late: 8,
    missing: 3,
    quality: 4.2
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} text-center`}>
          <CheckCircle className="text-green-500 mx-auto mb-2" size={24} />
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {metrics.completed}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            הושלמו
          </div>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} text-center`}>
          <Timer className="text-yellow-500 mx-auto mb-2" size={24} />
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {metrics.late}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            באיחור
          </div>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} text-center`}>
          <AlertTriangle className="text-red-500 mx-auto mb-2" size={24} />
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {metrics.missing}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            חסרות
          </div>
        </div>

        <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'} text-center`}>
          <Star className="text-purple-500 mx-auto mb-2" size={24} />
          <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {metrics.quality}
          </div>
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            איכות ממוצעת
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Exam Performance Chart
const ExamPerformanceChart = ({ data, darkMode }) => {
  const exams = data || [
    { name: 'מבחן אמצע', score: 82, classAvg: 75 },
    { name: 'מבחן סוף', score: 88, classAvg: 80 },
    { name: 'בוחן 1', score: 91, classAvg: 85 },
    { name: 'בוחן 2', score: 79, classAvg: 77 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {exams.map((exam, index) => (
        <div key={index} className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
          <div className="flex items-center justify-between mb-3">
            <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {exam.name}
            </h4>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ציון</div>
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {exam.score}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>ממוצע כיתה</div>
                <div className={`text-xl font-bold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {exam.classAvg}
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-2 bg-white/20 rounded-full">
            <div className="absolute inset-0 flex">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                style={{ width: `${exam.score}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-4 bg-red-500"
              style={{ left: `${exam.classAvg}%` }}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
};

// ============================================================================
// 2. LEARNING ANALYTICS SECTION
// ============================================================================

const LearningAnalyticsSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center`}>
          <Brain className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ניתוח למידה
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Styles */}
        <LearningStylesAnalysis data={data?.styles} darkMode={darkMode} />

        {/* Study Time Analysis */}
        <StudyTimeAnalysis data={data?.studyTime} darkMode={darkMode} />

        {/* Engagement Score */}
        <EngagementScoreCard data={data?.engagement} darkMode={darkMode} theme={theme} />

        {/* Knowledge Gaps */}
        <KnowledgeGapsCard data={data?.gaps} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Learning Styles Analysis
const LearningStylesAnalysis = ({ data, darkMode }) => {
  const styles = data || [
    { name: 'חזותי', effectiveness: 85, icon: Eye },
    { name: 'שמיעתי', effectiveness: 72, icon: MessageSquare },
    { name: 'קינסתטי', effectiveness: 78, icon: Activity },
    { name: 'חברתי', effectiveness: 90, icon: Users }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        סגנונות למידה
      </h3>
      <div className="space-y-3">
        {styles.map((style, index) => (
          <div key={index} className="flex items-center gap-3">
            <style.icon className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={20} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {style.name}
                </span>
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {style.effectiveness}%
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full`}
                  style={{ width: `${style.effectiveness}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Study Time Analysis
const StudyTimeAnalysis = ({ data, darkMode }) => {
  const timeData = data || {
    totalHours: 42,
    avgPerDay: 2.5,
    peakTime: '16:00-18:00',
    optimalDuration: 45
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ניתוח זמן למידה
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Clock className="text-blue-500 mb-2" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {timeData.totalHours}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            שעות השבוע
          </div>
        </div>
        <div>
          <Timer className="text-green-500 mb-2" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {timeData.avgPerDay}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            שעות ביום
          </div>
        </div>
        <div>
          <Zap className="text-yellow-500 mb-2" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {timeData.peakTime}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            שעת שיא
          </div>
        </div>
        <div>
          <Target className="text-purple-500 mb-2" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {timeData.optimalDuration}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            דקות אופטימלי
          </div>
        </div>
      </div>
    </div>
  );
};

// Engagement Score Card
const EngagementScoreCard = ({ data, darkMode, theme }) => {
  const engagement = data || {
    overall: 85,
    participation: 90,
    homework: 78,
    extracurricular: 82,
    peer: 88
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ציון מעורבות
      </h3>
      <div className="flex items-center justify-center mb-4">
        <div className="relative w-32 h-32">
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - engagement.overall / 100)}`}
              className="text-purple-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {engagement.overall}%
              </div>
              <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                כללי
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>השתתפות בכיתה</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{engagement.participation}%</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>מטלות בית</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{engagement.homework}%</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>פעילות חוץ</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{engagement.extracurricular}%</span>
        </div>
      </div>
    </div>
  );
};

// Knowledge Gaps Card
const KnowledgeGapsCard = ({ data, darkMode }) => {
  const gaps = data || [
    { subject: 'מתמטיקה', topic: 'אלגברה', severity: 'critical' },
    { subject: 'אנגלית', topic: 'דקדוק', severity: 'moderate' },
    { subject: 'מדעים', topic: 'פיזיקה', severity: 'minor' }
  ];

  const severityColors = {
    critical: 'text-red-500 bg-red-500/20',
    moderate: 'text-yellow-500 bg-yellow-500/20',
    minor: 'text-green-500 bg-green-500/20'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        פערי ידע
      </h3>
      <div className="space-y-3">
        {gaps.map((gap, index) => (
          <div key={index} className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {gap.subject} - {gap.topic}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${severityColors[gap.severity]}`}>
                {gap.severity === 'critical' ? 'קריטי' : gap.severity === 'moderate' ? 'בינוני' : 'קל'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 3. BEHAVIORAL & EMOTIONAL INSIGHTS SECTION
// ============================================================================

const BehavioralInsightsSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center`}>
          <Heart className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תובנות התנהגותיות ורגשיות
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Motivation Index */}
        <MotivationCard data={data?.motivation} darkMode={darkMode} />

        {/* Stress Level */}
        <StressLevelCard data={data?.stress} darkMode={darkMode} />

        {/* Confidence Score */}
        <ConfidenceCard data={data?.confidence} darkMode={darkMode} />

        {/* Collaboration Preference */}
        <CollaborationCard data={data?.collaboration} darkMode={darkMode} />

        {/* Peak Performance Times */}
        <PeakTimesCard data={data?.peakTimes} darkMode={darkMode} />

        {/* Emotional Trend */}
        <EmotionalTrendCard data={data?.emotionalTrend} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Motivation Card
const MotivationCard = ({ data, darkMode }) => {
  const motivation = data || {
    overall: 78,
    intrinsic: 82,
    extrinsic: 75,
    trend: 'increasing'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מדד מוטיבציה
        </h4>
        <Sparkles className="text-yellow-500" size={20} />
      </div>
      <div className="text-center mb-3">
        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {motivation.overall}%
        </div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          כללי
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>פנימית</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{motivation.intrinsic}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>חיצונית</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{motivation.extrinsic}%</span>
        </div>
      </div>
    </div>
  );
};

// Stress Level Card
const StressLevelCard = ({ data, darkMode }) => {
  const stress = data || {
    level: 'medium',
    score: 45,
    mainSources: ['מבחנים', 'עומס מטלות', 'לחץ חברתי']
  };

  const levelColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          רמת לחץ
        </h4>
        <AlertTriangle className={levelColors[stress.level]} size={20} />
      </div>
      <div className="text-center mb-3">
        <div className={`text-3xl font-bold ${levelColors[stress.level]}`}>
          {stress.level === 'low' ? 'נמוכה' : stress.level === 'medium' ? 'בינונית' : 'גבוהה'}
        </div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          ציון: {stress.score}/100
        </div>
      </div>
      <div className="space-y-1">
        <div className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          מקורות עיקריים:
        </div>
        {stress.mainSources.map((source, index) => (
          <div key={index} className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            • {source}
          </div>
        ))}
      </div>
    </div>
  );
};

// Confidence Card
const ConfidenceCard = ({ data, darkMode }) => {
  const confidence = data || {
    overall: 72,
    academic: 68,
    social: 85,
    trend: 'improving'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ביטחון עצמי
        </h4>
        <Star className="text-purple-500" size={20} />
      </div>
      <div className="relative w-full h-32 flex items-center justify-center">
        <div className="absolute inset-0 flex items-end justify-between gap-2">
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t"
              style={{ height: `${confidence.academic}%` }}
            />
            <span className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              אקדמי
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t"
              style={{ height: `${confidence.overall}%` }}
            />
            <span className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              כללי
            </span>
          </div>
          <div className="flex-1 flex flex-col items-center">
            <div
              className="w-full bg-gradient-to-t from-green-500 to-emerald-500 rounded-t"
              style={{ height: `${confidence.social}%` }}
            />
            <span className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              חברתי
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Collaboration Card
const CollaborationCard = ({ data, darkMode }) => {
  const collab = data || {
    preferred: 'smallGroup',
    effectiveness: { solo: 70, pair: 85, smallGroup: 92, largeGroup: 65 }
  };

  const styles = [
    { id: 'solo', name: 'עצמאי', icon: User },
    { id: 'pair', name: 'זוגות', icon: UserPlus },
    { id: 'smallGroup', name: 'קבוצה קטנה', icon: Users },
    { id: 'largeGroup', name: 'קבוצה גדולה', icon: Globe }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          סגנון שיתופי
        </h4>
        <Users className="text-blue-500" size={20} />
      </div>
      <div className="space-y-2">
        {styles.map(style => (
          <div key={style.id} className="flex items-center gap-2">
            <style.icon
              className={collab.preferred === style.id ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-600'}
              size={16}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {style.name}
                </span>
                <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {collab.effectiveness[style.id]}%
                </span>
              </div>
              <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    collab.preferred === style.id
                      ? 'bg-green-500'
                      : 'bg-gray-500'
                  }`}
                  style={{ width: `${collab.effectiveness[style.id]}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Peak Times Card
const PeakTimesCard = ({ data, darkMode }) => {
  const times = data || {
    morning: 65,
    afternoon: 85,
    evening: 70,
    optimal: '14:00-16:00'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          זמני שיא ביצועים
        </h4>
        <Clock className="text-orange-500" size={20} />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Sun className="text-yellow-500" size={16} />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>בוקר</span>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.morning}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${times.morning}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Activity className="text-orange-500" size={16} />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>צהריים</span>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.afternoon}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${times.afternoon}%` }} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Moon className="text-blue-500" size={16} />
          <div className="flex-1">
            <div className="flex justify-between mb-1">
              <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>ערב</span>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.evening}%</span>
            </div>
            <div className="h-1.5 bg-white/20 rounded-full">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${times.evening}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'} text-center`}>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>זמן אופטימלי</div>
        <div className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.optimal}</div>
      </div>
    </div>
  );
};

// Emotional Trend Card
const EmotionalTrendCard = ({ data, darkMode }) => {
  const trend = data || {
    current: 'positive',
    score: 78,
    weeklyTrend: [65, 70, 68, 75, 72, 78, 78]
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מגמה רגשית
        </h4>
        <TrendingUp className="text-green-500" size={20} />
      </div>
      <div className="h-20">
        <svg viewBox="0 0 100 40" className="w-full h-full">
          <polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            points={trend.weeklyTrend.map((val, i) =>
              `${(i / (trend.weeklyTrend.length - 1)) * 100},${40 - (val / 100) * 40}`
            ).join(' ')}
          />
          <defs>
            <linearGradient id="gradient">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex justify-between mt-2">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, i) => (
          <span key={i} className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {day}
          </span>
        ))}
      </div>
    </div>
  );
};

// Continue with sections 4-7...
// [Due to length constraints, I'll create the remaining sections in the next file]

// ============================================================================
// COGNITIVE ANALYSIS SECTION
// ============================================================================

const CognitiveAnalysisSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center`}>
          <Brain className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ניתוח קוגניטיבי
        </h2>
      </div>
      <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        תוכן מפורט לניתוח קוגניטיבי - עיבוד מידע, זיכרון, קשב וריכוז
      </p>
    </div>
  );
};

// ============================================================================
// SOCIAL DYNAMICS SECTION
// ============================================================================

const SocialDynamicsSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center`}>
          <Users className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          אינטראקציה חברתית
        </h2>
      </div>
      <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        ניתוח דינמיקה חברתית, יחסים בין אישיים ותקשורת
      </p>
    </div>
  );
};

// ============================================================================
// ENVIRONMENTAL SECTION
// ============================================================================

const EnvironmentalSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center`}>
          <Map className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          סביבת למידה אופטימלית
        </h2>
      </div>
      <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        העדפות סביבתיות, תנאי למידה מיטביים והתאמות נדרשות
      </p>
    </div>
  );
};

// ============================================================================
// LOADING STATE
// ============================================================================

const LoadingState = ({ darkMode, theme }) => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className={`backdrop-blur-xl ${darkMode ? 'bg-white/10' : 'bg-white/90'} rounded-3xl p-12 border border-white/20`}>
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-white/30 rounded-full"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-white rounded-full animate-spin"></div>
          </div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            טוען ניתוחים...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;