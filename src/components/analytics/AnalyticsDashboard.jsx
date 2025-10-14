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
  UserX,
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

// Import real analytics data aggregator
import { aggregateRealAnalytics } from '../../utils/realAnalyticsData';

// Import Core Stats Dashboard for Phase 1
import CoreStatsDashboard from './CoreStatsDashboard';

// Import Emotional-Behavioral-Cognitive Dashboard
import EmotionalBehavioralDashboard from './EmotionalBehavioralDashboard';

// Import Classroom Seating component (AI-powered version)
import ClassroomSeatingAI from '../classroom/ClassroomSeatingAI';

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

  // Filter to show only analyzed students (those who have completed deep analysis)
  const analyzedStudents = students ? students.filter(s => !s.needsAnalysis) : [];

  // Analytics categories - SHOWING ONLY CATEGORIES WITH REAL DATA
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
        { id: 'cognitive', name: 'ניתוח קוגניטיבי', icon: Brain }
      ]
    },
    {
      id: 'seating',
      name: 'סידור ישיבה AI',
      icon: Grid3x3,
      color: 'from-cyan-600 to-blue-600',
      priority: true,
      subItems: [
        { id: 'map', name: 'מפת כיתה', icon: Map },
        { id: 'recommendations', name: 'המלצות', icon: Lightbulb },
        { id: 'optimization', name: 'אופטימיזציה', icon: Target }
      ]
    },
    {
      id: 'core',
      name: 'סטטיסטיקות ליבה',
      icon: ChartBar,
      color: 'from-blue-600 to-indigo-600',
      subItems: [
        { id: 'summary', name: 'סיכום כללי', icon: FileText },
        { id: 'comparative', name: 'השוואה בין כיתות', icon: BarChart3 }
      ]
    },
    {
      id: 'predictive',
      name: 'חיזוי וסיכונים',
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-500',
      subItems: [
        { id: 'risks', name: 'זיהוי סיכונים', icon: AlertTriangle },
        { id: 'at-risk', name: 'תלמידים בסיכון', icon: UserX },
        { id: 'support-needed', name: 'זקוקים לתמיכה', icon: Shield }
      ]
    },
    {
      id: 'support',
      name: 'תמיכה והתערבות',
      icon: Shield,
      color: 'from-teal-500 to-cyan-500',
      subItems: [
        { id: 'interventions', name: 'התערבויות מומלצות', icon: Zap },
        { id: 'response-times', name: 'עדיפויות זמן', icon: Clock },
        { id: 'effectiveness', name: 'יעילות התערבויות', icon: Target }
      ]
    }
  ];

  // Load analytics data from real ISHEBOT analyses
  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        // Aggregate real analytics data from ISHEBOT-analyzed students
        if (analyzedStudents.length > 0) {
          console.log('📊 Aggregating real analytics from', analyzedStudents.length, 'analyzed students');
          const data = aggregateRealAnalytics(analyzedStudents);

          if (data) {
            console.log('✅ Real analytics data aggregated successfully:', data);
            setAnalyticsData(data);
          } else {
            console.warn('⚠️ No ISHEBOT analysis data found in students');
            setAnalyticsData(null);
          }
        } else {
          console.log('📭 No analyzed students available');
          setAnalyticsData(null);
        }
      } catch (error) {
        console.error('❌ Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [analyzedStudents.length]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  if (loading) {
    return <LoadingState darkMode={darkMode} theme={theme} />;
  }

  // Show empty state if no analyzed students
  if (analyzedStudents.length === 0) {
    return <NoAnalyzedStudentsState darkMode={darkMode} theme={theme} />;
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
              students={analyzedStudents}
              darkMode={darkMode}
              theme={theme}
              selectedView={selectedSubCategory}
            />
          )}

          {selectedCategory === 'seating' && (
            <ClassroomSeatingAI
              students={analyzedStudents}
              darkMode={darkMode}
              theme={theme}
              selectedView={selectedSubCategory}
            />
          )}

          {selectedCategory === 'core' && (
            <CoreStatsDashboard
              students={analyzedStudents}
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
              selectedSubCategory={selectedSubCategory}
              expanded={expandedSections.behavioral}
              onToggle={() => toggleSection('behavioral')}
            />
          )}

          {selectedCategory === 'cognitive' && (
            <CognitiveAnalysisSection
              data={analyticsData?.cognitive}
              darkMode={darkMode}
              theme={theme}
              selectedSubCategory={selectedSubCategory}
              expanded={expandedSections.cognitive}
              onToggle={() => toggleSection('cognitive')}
            />
          )}

          {selectedCategory === 'social' && (
            <SocialDynamicsSection
              data={analyticsData?.social}
              darkMode={darkMode}
              theme={theme}
              selectedSubCategory={selectedSubCategory}
              expanded={expandedSections.social}
              onToggle={() => toggleSection('social')}
            />
          )}

          {selectedCategory === 'environmental' && (
            <EnvironmentalSection
              data={analyticsData?.environmental}
              darkMode={darkMode}
              theme={theme}
              selectedSubCategory={selectedSubCategory}
              expanded={expandedSections.environmental}
              onToggle={() => toggleSection('environmental')}
            />
          )}

          {selectedCategory === 'predictive' && (
            <PredictiveStatisticsSection
              data={analyticsData?.predictive}
              darkMode={darkMode}
              theme={theme}
              selectedSubCategory={selectedSubCategory}
              expanded={expandedSections.predictive}
              onToggle={() => toggleSection('predictive')}
            />
          )}

          {selectedCategory === 'support' && (
            <TeacherSupportSection
              data={analyticsData?.support}
              darkMode={darkMode}
              theme={theme}
              selectedSubCategory={selectedSubCategory}
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
      // Close all other menus and open only this one
      setExpandedMenus({ [category.id]: true });
      setSelectedSubCategory(category.subItems[0].id);
    } else {
      // If no subitems, close all menus
      setExpandedMenus({});
    }
  };

  const handleSubItemClick = (categoryId, subItemId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(subItemId);
  };

  return (
    <div className={`w-72 h-screen sticky top-0 ${
      darkMode ? 'bg-gray-900/95' : 'bg-white/95'
    } backdrop-blur-xl border-r-4 ${
      darkMode ? 'border-purple-500/50' : 'border-blue-500/50'
    } shadow-2xl flex flex-col relative`}>
      {/* Decorative vertical line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        darkMode ? 'bg-gradient-to-b from-purple-500 via-pink-500 to-blue-500' : 'bg-gradient-to-b from-blue-500 via-cyan-500 to-purple-500'
      }`} />

      {/* Sidebar Header */}
      <div className={`p-6 border-b-2 ${
        darkMode ? 'border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20' : 'border-blue-500/30 bg-gradient-to-r from-blue-50/50 to-cyan-50/50'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${theme.primary} rounded-xl flex items-center justify-center shadow-lg ring-2 ${
            darkMode ? 'ring-purple-500/50' : 'ring-blue-500/50'
          }`}>
            <ChartBar className="text-white" size={22} />
          </div>
          <div>
            <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              לוח בקרה
            </h2>
            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              תפריט ניווט ראשי
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
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg ring-2 ${
                        darkMode ? 'ring-purple-400/50' : 'ring-blue-400/50'
                      } scale-[1.02]`
                    : darkMode
                      ? 'text-gray-300 hover:bg-white/10 border border-transparent hover:border-purple-500/30'
                      : 'text-gray-700 hover:bg-gray-100 border border-transparent hover:border-blue-500/30'
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
                                    ? 'bg-white/20 text-white border-l-2 border-purple-400 shadow-md'
                                    : 'bg-gray-200 text-gray-900 border-l-2 border-blue-500 shadow-md'
                                  : darkMode
                                    ? 'text-gray-400 hover:bg-white/10 hover:text-gray-300 border-l-2 border-transparent hover:border-purple-500/30'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800 border-l-2 border-transparent hover:border-blue-500/30'
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
      <div className={`p-4 border-t-2 ${
        darkMode ? 'border-purple-500/30 bg-gradient-to-r from-purple-900/20 to-pink-900/20' : 'border-blue-500/30 bg-gradient-to-r from-blue-50/50 to-cyan-50/50'
      }`}>
        <div className={`p-3 rounded-xl ${
          darkMode ? 'bg-white/10 border border-purple-500/30' : 'bg-white/50 border border-blue-500/30'
        } shadow-lg`}>
          <p className={`text-xs text-center font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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

const BehavioralInsightsSection = ({ data, darkMode, theme, selectedSubCategory }) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          אין נתונים התנהגותיים זמינים
        </p>
      </div>
    );
  }

  const getSubCategoryTitle = () => {
    const titles = {
      frequency: 'תדירות התנהגויות',
      interactions: 'אינטראקציות',
      focus: 'ריכוז וקשב',
      regulation: 'ויסות עצמי'
    };
    return titles[selectedSubCategory] || 'דפוסי התנהגות';
  };

  const renderContent = () => {
    const DataCard = ({ title, value, icon: Icon, color }) => (
      <div className={`p-6 rounded-xl backdrop-blur-xl ${darkMode ? 'bg-white/10' : 'bg-white/40'} border border-white/20`}>
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
          <Icon className={color} size={24} />
        </div>
        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </div>
      </div>
    );

    switch(selectedSubCategory) {
      case 'frequency':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DataCard
              title="תלמידים מעל הסף"
              value={data.motivation?.studentsAboveThreshold || 0}
              icon={TrendingUp}
              color="text-green-500"
            />
            <DataCard
              title="תלמידים מתחת לסף"
              value={data.motivation?.studentsBelowThreshold || 0}
              icon={TrendingDown}
              color="text-red-500"
            />
            <PlaceholderCard title="תדירות שבועית" icon={BarChart3} />
            <PlaceholderCard title="התנהגויות חיוביות" icon={CheckCircle} />
            <PlaceholderCard title="התנהגויות לשיפור" icon={AlertTriangle} />
            <PlaceholderCard title="מגמות לאורך זמן" icon={TrendingUp} />
            <PlaceholderCard title="השוואה לכיתה" icon={Users} />
          </div>
        );
      case 'interactions':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="אינטראקציות חברתיות" icon={Users} />
            <PlaceholderCard title="שיתוף פעולה" icon={UserPlus} />
            <PlaceholderCard title="תקשורת" icon={MessageSquare} />
            <PlaceholderCard title="יחסים עם מורים" icon={User} />
            <PlaceholderCard title="פתרון קונפליקטים" icon={Shield} />
            <PlaceholderCard title="מיומנויות חברתיות" icon={Heart} />
          </div>
        );
      case 'focus':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="יכולת ריכוז" icon={Target} />
            <PlaceholderCard title="זמני קשב" icon={Clock} />
            <PlaceholderCard title="הסחות דעת" icon={Eye} />
            <PlaceholderCard title="שיפור קשב" icon={TrendingUp} />
            <PlaceholderCard title="אסטרטגיות ריכוז" icon={Lightbulb} />
            <PlaceholderCard title="ביצועים" icon={Award} />
          </div>
        );
      case 'regulation':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="ויסות רגשי" icon={Heart} />
            <PlaceholderCard title="שליטה עצמית" icon={Shield} />
            <PlaceholderCard title="תגובות למצבי לחץ" icon={AlertTriangle} />
            <PlaceholderCard title="ניהול כעסים" icon={Activity} />
            <PlaceholderCard title="יציבות רגשית" icon={Target} />
            <PlaceholderCard title="אסטרטגיות התמודדות" icon={Lightbulb} />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MotivationCard data={data?.motivation} darkMode={darkMode} />
            <StressLevelCard data={data?.stress} darkMode={darkMode} />
            <ConfidenceCard data={data?.confidence} darkMode={darkMode} />
            <CollaborationCard data={data?.collaboration} darkMode={darkMode} />
            <PeakTimesCard data={data?.peakTimes} darkMode={darkMode} />
            <EmotionalTrendCard data={data?.emotionalTrend} darkMode={darkMode} />
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl flex items-center justify-center`}>
          <Activity className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getSubCategoryTitle()}
        </h2>
      </div>

      {renderContent()}
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

const CognitiveAnalysisSection = ({ data, darkMode, theme, selectedSubCategory }) => {
  const getSubCategoryTitle = () => {
    const titles = {
      processing: 'עיבוד מידע',
      memory: 'זיכרון',
      attention: 'קשב',
      flexibility: 'גמישות מחשבתית'
    };
    return titles[selectedSubCategory] || 'ניתוח קוגניטיבי';
  };

  const PlaceholderCard = ({ title, icon: Icon }) => (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="text-purple-500" size={20} />
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        תוכן מפורט עבור {title}
      </p>
    </div>
  );

  const renderContent = () => {
    switch(selectedSubCategory) {
      case 'processing':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="מהירות עיבוד" icon={Zap} />
            <PlaceholderCard title="דיוק במידע" icon={Target} />
            <PlaceholderCard title="עיבוד ויזואלי" icon={Eye} />
            <PlaceholderCard title="עיבוד שמיעתי" icon={MessageSquare} />
            <PlaceholderCard title="עיבוד רב-חושי" icon={Activity} />
            <PlaceholderCard title="שיפור עיבוד" icon={TrendingUp} />
          </div>
        );
      case 'memory':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="זיכרון קצר מועד" icon={Clock} />
            <PlaceholderCard title="זיכרון ארוך מועד" icon={BookOpen} />
            <PlaceholderCard title="זיכרון עבודה" icon={Brain} />
            <PlaceholderCard title="אסטרטגיות זכירה" icon={Lightbulb} />
            <PlaceholderCard title="שיפור זיכרון" icon={TrendingUp} />
            <PlaceholderCard title="ביצועים" icon={Award} />
          </div>
        );
      case 'attention':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="קשב מרוכז" icon={Target} />
            <PlaceholderCard title="קשב מתמשך" icon={Clock} />
            <PlaceholderCard title="קשב חלוקה" icon={Users} />
            <PlaceholderCard title="קשב בררני" icon={Filter} />
            <PlaceholderCard title="שיפור קשב" icon={TrendingUp} />
            <PlaceholderCard title="ביצועים" icon={Award} />
          </div>
        );
      case 'flexibility':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="חשיבה יצירתית" icon={Sparkles} />
            <PlaceholderCard title="פתרון בעיות" icon={Lightbulb} />
            <PlaceholderCard title="הסתגלות" icon={RefreshCw} />
            <PlaceholderCard title="חשיבה מופשטת" icon={Brain} />
            <PlaceholderCard title="גמישות תפיסתית" icon={Eye} />
            <PlaceholderCard title="שיפור גמישות" icon={TrendingUp} />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="עיבוד מידע" icon={Zap} />
            <PlaceholderCard title="זיכרון" icon={BookOpen} />
            <PlaceholderCard title="קשב" icon={Eye} />
            <PlaceholderCard title="גמישות מחשבתית" icon={RefreshCw} />
            <PlaceholderCard title="ביצועים כללים" icon={Award} />
            <PlaceholderCard title="שיפור קוגניטיבי" icon={TrendingUp} />
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center`}>
          <Brain className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getSubCategoryTitle()}
        </h2>
      </div>
      {renderContent()}
    </div>
  );
};

// ============================================================================
// SOCIAL DYNAMICS SECTION
// ============================================================================

const SocialDynamicsSection = ({ data, darkMode, theme, selectedSubCategory }) => {
  const getSubCategoryTitle = () => {
    const titles = {
      dynamics: 'דינמיקה חברתית',
      relationships: 'יחסים בין-אישיים',
      communication: 'תקשורת',
      collaboration: 'שיתוף פעולה'
    };
    return titles[selectedSubCategory] || 'אינטראקציה חברתית';
  };

  const PlaceholderCard = ({ title, icon: Icon }) => (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="text-green-500" size={20} />
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        תוכן מפורט עבור {title}
      </p>
    </div>
  );

  const renderContent = () => {
    switch(selectedSubCategory) {
      case 'dynamics':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="קבוצות חברתיות" icon={Users} />
            <PlaceholderCard title="מעמד חברתי" icon={Award} />
            <PlaceholderCard title="השפעה חברתית" icon={TrendingUp} />
            <PlaceholderCard title="אינטראקציות" icon={UserPlus} />
            <PlaceholderCard title="רשתות חברתיות" icon={Globe} />
            <PlaceholderCard title="שינויים דינמיים" icon={RefreshCw} />
          </div>
        );
      case 'relationships':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="חברויות" icon={Heart} />
            <PlaceholderCard title="יחסי תלמיד-מורה" icon={User} />
            <PlaceholderCard title="משפחה" icon={Home} />
            <PlaceholderCard title="איכות יחסים" icon={Star} />
            <PlaceholderCard title="קונפליקטים" icon={AlertTriangle} />
            <PlaceholderCard title="פתרון בעיות" icon={Lightbulb} />
          </div>
        );
      case 'communication':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="מיומנויות תקשורת" icon={MessageSquare} />
            <PlaceholderCard title="הבעה מילולית" icon={MessageSquare} />
            <PlaceholderCard title="הבעה לא-מילולית" icon={Eye} />
            <PlaceholderCard title="הקשבה פעילה" icon={Users} />
            <PlaceholderCard title="אמפתיה" icon={Heart} />
            <PlaceholderCard title="משוב יעיל" icon={CheckCircle} />
          </div>
        );
      case 'collaboration':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="עבודת צוות" icon={Users} />
            <PlaceholderCard title="שיתוף פעולה" icon={UserPlus} />
            <PlaceholderCard title="פתרון בעיות קבוצתי" icon={Lightbulb} />
            <PlaceholderCard title="מנהיגות" icon={Award} />
            <PlaceholderCard title="תרומה קבוצתית" icon={Star} />
            <PlaceholderCard title="יעילות צוותית" icon={TrendingUp} />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="דינמיקה חברתית" icon={Users} />
            <PlaceholderCard title="יחסים" icon={Heart} />
            <PlaceholderCard title="תקשורת" icon={MessageSquare} />
            <PlaceholderCard title="שיתוף פעולה" icon={UserPlus} />
            <PlaceholderCard title="מיומנויות חברתיות" icon={Star} />
            <PlaceholderCard title="שיפור חברתי" icon={TrendingUp} />
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center`}>
          <Users className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getSubCategoryTitle()}
        </h2>
      </div>
      {renderContent()}
    </div>
  );
};

// ============================================================================
// ENVIRONMENTAL SECTION
// ============================================================================

const EnvironmentalSection = ({ data, darkMode, theme, selectedSubCategory }) => {
  const getSubCategoryTitle = () => {
    const titles = {
      preferences: 'העדפות סביבתיות',
      optimal: 'תנאים מיטביים',
      adaptations: 'התאמות נדרשות',
      classroom: 'סביבת הכיתה'
    };
    return titles[selectedSubCategory] || 'סביבת למידה';
  };

  const PlaceholderCard = ({ title, icon: Icon }) => (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="text-orange-500" size={20} />
        <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
      </div>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        תוכן מפורט עבור {title}
      </p>
    </div>
  );

  const renderContent = () => {
    switch(selectedSubCategory) {
      case 'preferences':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="אור" icon={Sun} />
            <PlaceholderCard title="רעש" icon={Bell} />
            <PlaceholderCard title="טמפרטורה" icon={Activity} />
            <PlaceholderCard title="סידור ישיבה" icon={Grid3x3} />
            <PlaceholderCard title="כלים טכנולוגיים" icon={Globe} />
            <PlaceholderCard title="סגנון למידה" icon={Eye} />
          </div>
        );
      case 'optimal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="מקום אופטימלי" icon={Star} />
            <PlaceholderCard title="זמן אופטימלי" icon={Clock} />
            <PlaceholderCard title="גורמים סביבתיים" icon={Compass} />
            <PlaceholderCard title="תנאי עבודה" icon={Settings} />
            <PlaceholderCard title="משאבים זמינים" icon={BookOpen} />
            <PlaceholderCard title="שיפור תנאים" icon={TrendingUp} />
          </div>
        );
      case 'adaptations':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="התאמות פיזיות" icon={Settings} />
            <PlaceholderCard title="התאמות למידה" icon={Brain} />
            <PlaceholderCard title="התאמות טכנולוגיות" icon={Globe} />
            <PlaceholderCard title="התאמות זמן" icon={Clock} />
            <PlaceholderCard title="תמיכה נוספת" icon={Shield} />
            <PlaceholderCard title="מעקב התאמות" icon={Eye} />
          </div>
        );
      case 'classroom':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="עיצוב כיתה" icon={Home} />
            <PlaceholderCard title="סידור מקומות" icon={Grid3x3} />
            <PlaceholderCard title="חומרים זמינים" icon={BookOpen} />
            <PlaceholderCard title="אזורי למידה" icon={Map} />
            <PlaceholderCard title="אווירה כיתתית" icon={Heart} />
            <PlaceholderCard title="שיפור סביבה" icon={TrendingUp} />
          </div>
        );
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PlaceholderCard title="העדפות" icon={Settings} />
            <PlaceholderCard title="תנאים מיטביים" icon={Star} />
            <PlaceholderCard title="התאמות" icon={Compass} />
            <PlaceholderCard title="סביבת כיתה" icon={Home} />
            <PlaceholderCard title="משאבים" icon={BookOpen} />
            <PlaceholderCard title="שיפור סביבתי" icon={TrendingUp} />
          </div>
        );
    }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center`}>
          <Map className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {getSubCategoryTitle()}
        </h2>
      </div>
      {renderContent()}
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

// ============================================================================
// NO ANALYZED STUDENTS STATE
// ============================================================================

const NoAnalyzedStudentsState = ({ darkMode, theme }) => {
  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className={`backdrop-blur-xl ${darkMode ? 'bg-white/10' : 'bg-white/90'} rounded-3xl p-12 border border-white/20 max-w-2xl w-full`}>
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Icon */}
          <div className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center shadow-2xl`}>
            <Brain className="text-white" size={48} />
          </div>

          {/* Title */}
          <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            אין תלמידים מנותחים
          </h2>

          {/* Description */}
          <div className={`space-y-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="text-lg">
              לוח הבקרה מציג רק נתונים של תלמידים שעברו ניתוח מעמיק.
            </p>
            <p className="text-base">
              כדי לצפות בנתונים כאן, עליך תחילה לנתח תלמידים באמצעות כפתור "AI חכם" בתפריט הראשי.
            </p>
          </div>

          {/* Features List */}
          <div className={`w-full mt-6 p-6 rounded-2xl ${darkMode ? 'bg-white/5' : 'bg-gray-100/50'} border ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              מה מציג לוח הבקרה?
            </h3>
            <ul className={`space-y-3 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span>ניתוח רגשי-התנהגותי-קוגניטיבי מפורט</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span>סטטיסטיקות ליבה ומדדי סיכון</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span>המלצות ישיבה ואינטראקציה חברתית</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-green-500 flex-shrink-0" size={20} />
                <span>חיזוי מגמות והתערבויות מומלצות</span>
              </li>
            </ul>
          </div>

          {/* Action hint */}
          <div className={`mt-4 p-4 rounded-xl ${darkMode ? 'bg-blue-500/10' : 'bg-blue-50'} border ${darkMode ? 'border-blue-500/20' : 'border-blue-200'}`}>
            <div className="flex items-center gap-3">
              <Sparkles className="text-blue-500" size={24} />
              <div className="text-right">
                <p className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                  מוכן להתחיל?
                </p>
                <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                  לחץ על "AI חכם" בתפריט העליון כדי לנתח תלמידים
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;