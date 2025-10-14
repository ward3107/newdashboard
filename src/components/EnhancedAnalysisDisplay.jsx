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
  Shield,
  Activity,
  Zap,
  Star,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  Info,
  ArrowRight,
  Layers,
  Compass,
  Flag,
  BarChart3,
  PieChart,
  Microscope,
  Sparkles
} from 'lucide-react';
import enhancedAnalysisService from '../services/enhancedAnalysisService';

const EnhancedAnalysisDisplay = ({ studentData, darkMode, theme }) => {
  const [analysis, setAnalysis] = useState(null);
  const [expandedInsights, setExpandedInsights] = useState({});
  const [activeTab, setActiveTab] = useState('insights');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate enhanced analysis when component mounts
    const generateAnalysis = async () => {
      setLoading(true);
      try {
        const enhancedAnalysis = enhancedAnalysisService.generateEnhancedAnalysis(studentData);
        setAnalysis(enhancedAnalysis);
      } catch (error) {
        console.error('Error generating enhanced analysis:', error);
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

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'moderate': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      case 'positive': return 'from-blue-500 to-blue-600';
      case 'important': return 'from-purple-500 to-purple-600';
      default: return 'from-gray-500 to-gray-600';
    }
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
    return (
      <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <Brain size={48} className="mx-auto mb-4 opacity-50" />
        <p>לא ניתן לייצר ניתוח מפורט</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800/50' : 'bg-blue-50'} border ${
            darkMode ? 'border-gray-700' : 'border-blue-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Microscope className="text-blue-500" size={20} />
              <h3 className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                ניתוח מבוסס מחקר
              </h3>
            </div>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              הניתוח מבוסס על מחקרים אקדמיים עדכניים, פרקטיקות מיטביות בחינוך הישראלי,
              ותיאוריות פדגוגיות מובילות. כל תובנה מגובה במקורות מדעיים ומותאמת לקונטקסט הישראלי.
            </p>
          </div>

          {analysis.insights?.map((insight, index) => {
            const Icon = getSeverityIcon(insight.severity);
            const isExpanded = expandedInsights[insight.id];

            return (
              <div
                key={insight.id}
                className={`rounded-xl overflow-hidden border ${
                  darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                } shadow-lg hover:shadow-xl transition-shadow`}
              >
                {/* Insight Header */}
                <div
                  className={`p-6 cursor-pointer bg-gradient-to-r ${getSeverityColor(insight.severity)} bg-opacity-10`}
                  onClick={() => toggleInsight(insight.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${getSeverityColor(insight.severity)} shadow-lg`}>
                        <Icon className="text-white" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            תובנה {index + 1} • {insight.category}
                          </span>
                        </div>
                        <h3 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {insight.title}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    {/* Scientific Basis */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <BookOpen className="text-purple-500" size={16} />
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          בסיס מדעי
                        </h4>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {insight.scientificBasis}
                      </p>
                    </div>

                    {/* Israeli Context */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Flag className="text-blue-500" size={16} />
                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          הקשר ישראלי
                        </h4>
                      </div>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {insight.israeliContext}
                      </p>
                    </div>

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
                      <button className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        darkMode
                          ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      } transition-colors`}>
                        <Target size={16} />
                        ראה המלצות
                      </button>
                      <button className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                        darkMode
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } transition-colors`}>
                        <Sparkles size={16} />
                        צור משימות
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
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${
                          item.priority === 'critical' ? 'from-red-500 to-red-600' :
                          item.priority === 'high' ? 'from-orange-500 to-orange-600' :
                          item.priority === 'medium' ? 'from-yellow-500 to-yellow-600' :
                          'from-green-500 to-green-600'
                        }`}>
                          <CheckCircle className="text-white" size={16} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {item.text}
                          </p>
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
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              {key.replace(/([A-Z])/g, ' $1').trim()}
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