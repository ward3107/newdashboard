import React, { useState, useEffect } from 'react';
import {
  Brain,
  Target,
  Award,
  Lightbulb,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Heart,
  Activity,
  Zap,
  Star,
  TrendingUp,
  Clock,
  CheckCircle,
  Info,
  ArrowRight,
  Layers,
  Compass,
  Flag,
  BarChart3,
  Microscope,
  Plus,
  Bell
} from 'lucide-react';
import enhancedAnalysisService from '../services/enhancedAnalysisService';
import logger from '../utils/logger';

const EnhancedAnalysisDisplay = ({ studentData, darkMode }) => {
  const [analysis, setAnalysis] = useState(null);
  const [expandedInsights, setExpandedInsights] = useState({});
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [rating, setRating] = useState({
    successLevel: 0,
    observedChanges: '',
    nextSteps: '',
    continueAssignment: true
  });

  useEffect(() => {
    // Generate enhanced analysis when component mounts
    const generateAnalysis = async () => {
      setLoading(true);
      try {
        logger.log('📊 EnhancedAnalysisDisplay - Student Data:', {
          hasInsights: !!studentData.insights,
          insightsCount: studentData.insights?.length || 0,
          studentCode: studentData.studentCode,
          insights: studentData.insights,
          fullStudentData: studentData
        });
        const enhancedAnalysis = enhancedAnalysisService.generateEnhancedAnalysis(studentData);
        logger.log('📊 EnhancedAnalysisDisplay - Generated Analysis:', {
          ...enhancedAnalysis,
          insightsCount: enhancedAnalysis?.insights?.length || 0,
          firstInsight: enhancedAnalysis?.insights?.[0]
        });
        setAnalysis(enhancedAnalysis);

        // Load assignments from localStorage
        const savedAssignments = JSON.parse(localStorage.getItem(`assignments_${studentData.studentCode}`) || '[]');
        setAssignments(savedAssignments);
      } catch (error) {
        // Log error for debugging purposes
        if (process.env.NODE_ENV === 'development') {
          logger.error('Error generating enhanced analysis:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    generateAnalysis();
  }, [studentData]);

  const toggleInsight = (insightId) => {
    setExpandedInsights(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  const createAssignment = (recommendation, recIndex, categoryName) => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const newAssignment = {
      id: Date.now(),
      studentCode: studentData.studentCode,
      recommendation: recommendation.text,
      category: categoryName,
      priority: recommendation.priority,
      createdAt: new Date().toISOString(),
      reminderDate: oneWeekFromNow.toISOString(),
      status: 'active',
      implementation: recommendation.implementation,
      expectedOutcome: recommendation.expectedOutcome
    };

    // Save to state
    const updatedAssignments = [...assignments, newAssignment];
    setAssignments(updatedAssignments);

    // Save to localStorage
    localStorage.setItem(`assignments_${studentData.studentCode}`, JSON.stringify(updatedAssignments));

    // Show confirmation
    alert(`✅ המלצה נוצרה כמשימה!\n\n📅 תזכורת להגשת דוח התקדמות: ${oneWeekFromNow.toLocaleDateString('he-IL')}\n\nבעוד שבוע תקבל תזכורת לכתוב דוח על השינויים שחלו בתלמיד.`);
  };

  const openRatingModal = (assignment) => {
    setSelectedAssignment(assignment);
    setShowRatingModal(true);
    setRating({
      successLevel: 0,
      observedChanges: '',
      nextSteps: '',
      continueAssignment: true
    });
  };

  const submitRating = () => {
    if (!selectedAssignment) return;

    const updatedAssignments = assignments.map(assignment =>
      assignment.id === selectedAssignment.id
        ? {
            ...assignment,
            status: 'completed',
            rating: rating,
            completedAt: new Date().toISOString()
          }
        : assignment
    );

    setAssignments(updatedAssignments);

    // Save to localStorage
    localStorage.setItem(`assignments_${studentData.studentCode}`, JSON.stringify(updatedAssignments));

    setShowRatingModal(false);
    setSelectedAssignment(null);
  };

  const isAssignmentDue = (assignment) => {
    const reminderDate = new Date(assignment.reminderDate);
    const now = new Date();
    return now >= reminderDate;
  };

  const getSeverityIcon = (severity) => {
    switch(severity) {
      case 'critical': return AlertCircle;
      case 'high': return Target;
      case 'positive': return Award;
      case 'important': return Flag;
      default: return Info;
    }
  };

  const getInsightEmoji = (insight) => {
    const category = insight.category?.toLowerCase() || '';
    const title = insight.title?.toLowerCase() || '';

    if (category.includes('קוגניטיבי') || category.includes('cognitive')) return '🧠';
    if (category.includes('רגש') || category.includes('emotional')) return '❤️';
    if (category.includes('חברת') || category.includes('social')) return '👥';
    if (category.includes('מוטיב') || category.includes('motivation')) return '⚡';
    if (category.includes('ויסות') || category.includes('regulation')) return '🎯';
    if (category.includes('סביבת') || category.includes('environmental')) return '🌟';
    if (category.includes('חוזק') || title.includes('חוזק')) return '💪';
    if (category.includes('אתגר') || title.includes('אתגר')) return '🎢';
    if (category.includes('למידה') || title.includes('למידה')) return '📚';

    return '💡';
  };

  const getRecommendationEmoji = (recommendation) => {
    const text = recommendation.text?.toLowerCase() || '';
    const action = recommendation.action?.toLowerCase() || '';
    const combined = text + ' ' + action;

    if (combined.includes('פגישה') || combined.includes('meeting')) return '👤';
    if (combined.includes('חומר') || combined.includes('material')) return '📝';
    if (combined.includes('אתגר') || combined.includes('challenge')) return '🎯';
    if (combined.includes('משחק') || combined.includes('game')) return '🎮';
    if (combined.includes('קבוצ') || combined.includes('group')) return '👥';
    if (combined.includes('הורים') || combined.includes('parent')) return '👨‍👩‍👧';
    if (combined.includes('עזר') || combined.includes('help') || combined.includes('תמיכה')) return '🤝';
    if (combined.includes('משוב') || combined.includes('feedback')) return '💬';
    if (combined.includes('תרגול') || combined.includes('practice')) return '💪';
    if (combined.includes('חיזוק') || combined.includes('reinforce')) return '⭐';

    return '✅';
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      critical: 'bg-red-100 text-red-700 border-red-300',
      high: 'bg-orange-100 text-orange-700 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300'
    };

    const labels = {
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colors[priority]}`}>
        {labels[priority]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className={`ml-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          מייצר ניתוח מעמיק...
        </span>
      </div>
    );
  }

  if (!analysis) {
    logger.log('❌ NO ANALYSIS - Returning early');
    return (
      <div className={`text-center py-12 border-4 border-red-500 bg-red-100 ${darkMode ? 'text-red-900' : 'text-red-600'}`}>
        <Brain size={48} className="mx-auto mb-4 opacity-50" />
        <p className="font-bold text-xl">❌ אין ניתוח זמין</p>
        <p className="text-sm mt-2">analysis object is null/undefined</p>
      </div>
    );
  }

  logger.log('✅ RENDERING ANALYSIS with insights:', analysis.insights?.length);

  return (
    <div className="space-y-6 min-h-[400px]">
      {/* Debug info */}
      <div className={`p-4 rounded-lg ${darkMode ? 'bg-blue-600/40 border-2' : 'bg-blue-50'} border ${darkMode ? 'border-blue-400' : 'border-blue-200'}`}>
        <p className={`text-sm font-bold ${darkMode ? 'text-blue-100' : 'text-blue-700'}`}>
          ✅ נמצאו {analysis.insights?.length || 0} תובנות • טאב פעיל: {activeTab}
        </p>
      </div>

      {/* Analysis Tabs */}
      <div className={`flex space-x-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        {[
          { id: 'insights', label: 'תובנות מרכזיות', icon: Lightbulb, count: analysis.insights?.length },
          { id: 'recommendations', label: 'המלצות פעולה', icon: Target, count: analysis.recommendations?.length },
          { id: 'profiles', label: 'פרופילים', icon: Layers },
          { id: 'intervention', label: 'תכנית התערבות', icon: Compass }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 transition-all relative ${
              activeTab === tab.id
                ? `${darkMode ? 'text-white' : 'text-blue-600'} border-b-2 border-blue-500`
                : `${darkMode ? 'text-gray-400' : 'text-gray-600'} hover:text-blue-500`
            }`}
          >
            <tab.icon size={18} />
            <span className="font-medium">{tab.label}</span>
            {tab.count && (
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-blue-800/30 border-2' : 'bg-blue-50'} border ${
            darkMode ? 'border-blue-600' : 'border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="text-blue-500" size={20} />
              <h3 className={`font-bold ${darkMode ? 'text-blue-100' : 'text-gray-900'}`}>
                ניתוח מבוסס מחקר
              </h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-blue-100' : 'text-gray-700'}`}>
              הניתוח מבוסס על מחקרים אקדמיים עדכניים, פרקטיקות מיטביות בחינוך הישראלי,
              ותיאוריות פדגוגיות מובילות. כל תובנה מגובה במקורות מדעיים ומותאמת לקונטקסט הישראלי.
            </p>
          </div>

          {/* Debug: Show if insights exist */}
          {(!analysis.insights || analysis.insights.length === 0) && (
            <div className="p-6 rounded-xl border-4 border-yellow-500 bg-yellow-50">
              <p className="text-yellow-900 font-bold">⚠️ אין תובנות להצגה</p>
              <p className="text-sm text-yellow-700 mt-2">
                analysis.insights = {JSON.stringify(analysis.insights)}
              </p>
            </div>
          )}

          {analysis.insights?.map((insight, index) => {
            logger.log(`🔍 Rendering insight ${index}:`, {
              id: insight.id,
              title: insight.title,
              category: insight.category,
              hasDescription: !!insight.description
            });

            const Icon = getSeverityIcon(insight.severity);
            const isExpanded = expandedInsights[insight.id];

            return (
              <div
                key={insight.id || `insight-${index}`}
                className={`rounded-xl overflow-hidden border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } shadow-lg hover:shadow-xl transition-shadow`}
              >
                {/* Insight Header - Simplified with minimal coloring */}
                <div
                  className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${darkMode ? 'hover:bg-gray-700/30' : ''}`}
                  onClick={() => toggleInsight(insight.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleInsight(insight.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        insight.severity === 'critical' ? 'bg-red-100' :
                        insight.severity === 'high' ? 'bg-orange-100' :
                        insight.severity === 'positive' ? 'bg-blue-100' :
                        'bg-gray-100'
                      } ${darkMode ? 'bg-opacity-20' : ''}`}>
                        <Icon className={`${
                          insight.severity === 'critical' ? 'text-red-600' :
                          insight.severity === 'high' ? 'text-orange-600' :
                          insight.severity === 'positive' ? 'text-blue-600' :
                          'text-gray-600'
                        }`} size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getInsightEmoji(insight)}</span>
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            תובנה {index + 1} • {insight.category}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {insight.title}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronDown className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                      ) : (
                        <ChevronRight className={darkMode ? 'text-gray-400' : 'text-gray-500'} size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className={`p-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    {/* PATTERNS Section - Enhanced with more details */}
                    {insight.patterns && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Activity className="text-indigo-500" size={18} />
                          <h4 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            PATTERNS - דפוסים שזוהו
                          </h4>
                        </div>
                        <div className={`p-4 rounded-lg ${darkMode ? 'bg-indigo-900/20 border border-indigo-700' : 'bg-indigo-50 border border-indigo-200'}`}>
                          {Array.isArray(insight.patterns) ? (
                            <ul className="space-y-2">
                              {insight.patterns.map((pattern, idx) => (
                                <li key={idx} className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  <ChevronRight className="text-indigo-500 flex-shrink-0 mt-1" size={16} />
                                  <span className="text-sm leading-relaxed">{pattern}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {insight.patterns}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Scientific Basis */}
                    {insight.scientificBasis && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="text-purple-500" size={16} />
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            בסיס מדעי
                          </h4>
                        </div>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {insight.scientificBasis}
                        </p>
                      </div>
                    )}

                    {/* Israeli Context */}
                    {insight.israeliContext && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Flag className="text-blue-500" size={16} />
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            הקשר ישראלי
                          </h4>
                        </div>
                        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {insight.israeliContext}
                        </p>
                      </div>
                    )}

                    {/* Data Points */}
                    {insight.dataPoints && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart3 className="text-green-500" size={16} />
                          <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            נקודות נתונים
                          </h4>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(insight.dataPoints).map(([key, value]) => (
                            <div
                              key={key}
                              className={`p-3 rounded-lg ${
                                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                              }`}
                            >
                              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <p className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {typeof value === 'object' ? JSON.stringify(value) : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setActiveTab('recommendations')}
                        className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                          darkMode
                            ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        } transition-colors`}
                      >
                        <Target size={16} />
                        ראה המלצות
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6">
          {/* Active Assignments Section */}
          {assignments.filter(a => a.status === 'active').length > 0 && (
            <div className={`rounded-xl p-6 border-2 ${
              darkMode ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-300'
            }`}>
              <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Bell className="text-blue-500" size={20} />
                משימות פעילות ({assignments.filter(a => a.status === 'active').length})
              </h3>
              <div className="space-y-3">
                {assignments.filter(a => a.status === 'active').map(assignment => {
                  const isDue = isAssignmentDue(assignment);
                  return (
                    <div
                      key={assignment.id}
                      className={`p-4 rounded-lg border-2 ${
                        isDue
                          ? darkMode ? 'bg-yellow-900/20 border-yellow-600' : 'bg-yellow-50 border-yellow-400'
                          : darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          {isDue && (
                            <div className="mb-2 flex items-center gap-2">
                              <Bell className="text-yellow-600 animate-pulse" size={16} />
                              <span className={`text-sm font-bold ${
                                darkMode ? 'text-yellow-400' : 'text-yellow-700'
                              }`}>
                                זמן להערכת התקדמות!
                              </span>
                            </div>
                          )}
                          <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {assignment.recommendation}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {getPriorityBadge(assignment.priority)}
                            <span className={`px-2 py-1 rounded-full ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              📅 תזכורת: {new Date(assignment.reminderDate).toLocaleDateString('he-IL')}
                            </span>
                            <span className={`px-2 py-1 rounded-full ${
                              darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                            }`}>
                              📂 {assignment.category}
                            </span>
                          </div>
                        </div>
                        {isDue && (
                          <button
                            onClick={() => openRatingModal(assignment)}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 flex-shrink-0 ${
                              darkMode
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-yellow-500 text-white hover:bg-yellow-600'
                            } transition-colors font-medium`}
                          >
                            <Star size={16} />
                            דרג התקדמות
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommendations List */}
          {analysis.recommendations?.map(rec => (
            <div
              key={rec.insightId}
              className={`rounded-xl p-6 border ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}
            >
              <div className="mb-4">
                <h3 className={`text-lg font-bold flex items-center gap-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Target className="text-blue-500" size={20} />
                  {rec.category}
                </h3>
              </div>

              <div className="space-y-3">
                {rec.recommendations.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      darkMode
                        ? 'bg-gray-700/50 border-gray-600'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`p-2 rounded-lg ${
                          item.priority === 'critical' ? 'bg-red-100' :
                          item.priority === 'high' ? 'bg-orange-100' :
                          item.priority === 'medium' ? 'bg-yellow-100' :
                          'bg-green-100'
                        }`}>
                          <CheckCircle className={`${
                            item.priority === 'critical' ? 'text-red-600' :
                            item.priority === 'high' ? 'text-orange-600' :
                            item.priority === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`} size={16} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{getRecommendationEmoji(item)}</span>
                            <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {item.text}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {getPriorityBadge(item.priority)}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              darkMode
                                ? 'bg-gray-600 text-gray-300'
                                : 'bg-gray-200 text-gray-700'
                            }`}>
                              יישום: {item.implementation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => createAssignment(item, idx, rec.category)}
                        className={`ml-3 px-3 py-2 rounded-lg flex items-center gap-2 flex-shrink-0 ${
                          darkMode
                            ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        } transition-colors`}
                        title="צור משימה עם תזכורת שבועית"
                      >
                        <Plus size={16} />
                        צור משימה
                      </button>
                    </div>

                    {/* Recommendation Details */}
                    <div className="mt-3 space-y-2">
                      {item.tools && (
                        <div className="flex items-center gap-2">
                          <Zap className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={14} />
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            כלים: {item.tools.join(', ')}
                          </span>
                        </div>
                      )}
                      {item.expectedOutcome && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`} size={14} />
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            תוצאה צפויה: {item.expectedOutcome}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profiles Tab */}
      {activeTab === 'profiles' && (
        <div className="space-y-6">
          {/* Academic Profile */}
          <ProfileCard
            title="פרופיל אקדמי"
            icon={BookOpen}
            color="blue"
            profile={analysis.academicProfile}
            darkMode={darkMode}
          />

          {/* Social-Emotional Profile */}
          <ProfileCard
            title="פרופיל חברתי-רגשי"
            icon={Heart}
            color="pink"
            profile={analysis.socialEmotionalProfile}
            darkMode={darkMode}
          />

          {/* Learning Profile */}
          <ProfileCard
            title="פרופיל למידה"
            icon={Brain}
            color="purple"
            profile={analysis.learningProfile}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Intervention Plan Tab */}
      {activeTab === 'intervention' && (
        <div className="space-y-6">
          <InterventionPlan
            plan={analysis.interventionPlan}
            needs={analysis.developmentalNeeds}
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-2xl rounded-2xl shadow-2xl ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                דוח התקדמות והערכה
              </h2>

              <div className={`p-4 rounded-lg mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {selectedAssignment.recommendation}
                </p>
              </div>

              {/* Success Rating */}
              <div className="mb-6">
                <div className={`block text-sm font-bold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  מדד הצלחה (1-5) *
                </div>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(level => (
                    <button
                      key={level}
                      onClick={() => setRating(prev => ({ ...prev, successLevel: level }))}
                      className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all ${
                        rating.successLevel === level
                          ? 'bg-yellow-500 text-white scale-110 shadow-lg'
                          : darkMode
                            ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                    >
                      {level === 1 && '😟'}
                      {level === 2 && '😐'}
                      {level === 3 && '🙂'}
                      {level === 4 && '😊'}
                      {level === 5 && '🎉'}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs mt-2 px-2">
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>לא הצליח</span>
                  <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>הצליח מאוד</span>
                </div>
              </div>

              {/* Observed Changes */}
              <div className="mb-6">
                <label htmlFor="observed-changes" className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  שינויים שנצפו בתלמיד *
                </label>
                <textarea
                  id="observed-changes"
                  value={rating.observedChanges}
                  onChange={(e) => setRating(prev => ({ ...prev, observedChanges: e.target.value }))}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={4}
                  placeholder="תאר את השינויים שחלו בתלמיד..."
                  dir="rtl"
                />
              </div>

              {/* Next Steps */}
              <div className="mb-6">
                <label htmlFor="next-steps" className={`block text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  צעדים הבאים
                </label>
                <textarea
                  id="next-steps"
                  value={rating.nextSteps}
                  onChange={(e) => setRating(prev => ({ ...prev, nextSteps: e.target.value }))}
                  className={`w-full p-3 rounded-lg border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={3}
                  placeholder="מה יש לעשות בהמשך?"
                  dir="rtl"
                />
              </div>

              {/* Continue Assignment */}
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rating.continueAssignment}
                    onChange={(e) => setRating(prev => ({ ...prev, continueAssignment: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    המשך לעקוב אחרי משימה זו בשבוע הבא
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={submitRating}
                  disabled={!rating.successLevel || !rating.observedChanges}
                  className={`flex-1 px-6 py-3 rounded-lg font-bold transition-colors ${
                    !rating.successLevel || !rating.observedChanges
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  שמור דוח
                </button>
                <button
                  onClick={() => setShowRatingModal(false)}
                  className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-white hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  ביטול
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ title, icon: Icon, color, profile, darkMode }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    pink: 'from-pink-500 to-pink-600',
    purple: 'from-purple-500 to-purple-600'
  };

  // Hebrew translation map for profile field keys
  const translateKey = (key) => {
    const translations = {
      // Academic Profile
      'overallPerformance': 'ביצועים כלליים',
      'subjectStrengths': 'נקודות חוזק במקצועות',
      'subjectChallenges': 'אתגרים במקצועות',
      'learningGaps': 'פערי למידה',
      'progressTrajectory': 'מסלול התקדמות',

      // Social-Emotional Profile
      'emotionalIntelligence': 'אינטליגנציה רגשית',
      'socialCompetence': 'יכולת חברתית',
      'selfAwareness': 'מודעות עצמית',
      'relationshipSkills': 'כישורים בין-אישיים',
      'responsibleDecisionMaking': 'קבלת החלטות אחראית',

      // Learning Profile
      'primaryStyle': 'סגנון למידה עיקרי',
      'secondaryStyle': 'סגנון למידה משני',
      'preferredModalities': 'אופני למידה מועדפים',
      'optimalConditions': 'תנאים אופטימליים',
      'challengingConditions': 'תנאים מאתגרים'
    };

    // If key already starts with Hebrew character, return as is
    if (/[\u0590-\u05FF]/.test(key[0])) {
      return key;
    }

    // Try exact match first
    if (translations[key]) {
      return translations[key];
    }

    // Fallback to formatted English (convert camelCase to spaces)
    return key.replace(/([A-Z])/g, ' $1').trim();
  };

  return (
    <div className={`rounded-xl p-6 border ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg`}>
          <Icon className="text-white" size={24} />
        </div>
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {Object.entries(profile || {}).map(([key, value]) => (
          <div key={key} className={`p-3 rounded-lg ${
            darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
          }`}>
            <span className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {translateKey(key)}
            </span>
            <p className={`font-medium mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {Array.isArray(value) ? value.join(', ') : value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Intervention Plan Component
const InterventionPlan = ({ plan, needs, darkMode }) => {
  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Developmental Needs */}
      {needs && needs.length > 0 && (
        <div className={`rounded-xl p-6 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <AlertCircle className="text-orange-500" size={20} />
            צרכים התפתחותיים
          </h3>
          <div className="space-y-3">
            {needs.map((need, idx) => (
              <div key={idx} className={`p-3 rounded-lg border ${
                need.priority === 'high'
                  ? 'border-red-300 bg-red-50'
                  : 'border-yellow-300 bg-yellow-50'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{need.area}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    need.priority === 'high'
                      ? 'bg-red-200 text-red-700'
                      : 'bg-yellow-200 text-yellow-700'
                  }`}>
                    {need.priority === 'high' ? 'גבוה' : 'בינוני'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">{need.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Timeline */}
      <div className={`rounded-xl p-6 border ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
          darkMode ? 'text-white' : 'text-gray-900'
        }`}>
          <Clock className="text-blue-500" size={20} />
          לוח זמנים להתערבות
        </h3>

        <div className="space-y-4">
          {/* Immediate Actions */}
          <TimelineSection
            title="פעולות מיידיות"
            items={plan.immediateActions}
            color="red"
            darkMode={darkMode}
          />

          {/* Short Term Goals */}
          <TimelineSection
            title="יעדים לטווח קצר (1-3 חודשים)"
            items={plan.shortTermGoals}
            color="yellow"
            darkMode={darkMode}
          />

          {/* Long Term Goals */}
          <TimelineSection
            title="יעדים לטווח ארוך (3-12 חודשים)"
            items={plan.longTermGoals}
            color="green"
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Success Metrics */}
      {plan.successMetrics && (
        <div className={`rounded-xl p-6 border ${
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <Star className="text-yellow-500" size={20} />
            מדדי הצלחה
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(plan.successMetrics).map(([key, value]) => (
              <div key={key} className={`p-3 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {key}
                </span>
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Timeline Section Component
const TimelineSection = ({ title, items, color, darkMode }) => {
  const colorMap = {
    red: 'border-red-500',
    yellow: 'border-yellow-500',
    green: 'border-green-500'
  };

  return (
    <div>
      <h4 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {title}
      </h4>
      <div className={`border-l-2 ${colorMap[color]} pl-4 space-y-2`}>
        {items?.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ArrowRight size={14} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {typeof item === 'string' ? item : item.action}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedAnalysisDisplay;