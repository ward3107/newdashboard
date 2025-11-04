/**
 * Insights and Recommendations Display Component
 * Shows actionable insights and recommendations from student analysis
 */

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  Users,
  Target,
  Heart,
  BookOpen,
  Lightbulb,
  ChevronRight,
  Filter,
  Download,
  Bell,
  Star,
  AlertCircle,
  Shield,
  Zap,
} from 'lucide-react';
import { InsightsGenerator, Insight, Recommendation } from '../../services/insightsGenerator';

interface Student {
  studentCode: string;
  name: string;
  className?: string;
  keyStrengths?: string[];
  areasNeedingSupport?: string[];
  emotionalState?: string;
  learningStyle?: string;
  challengesBehaviors?: string[];
  interventions?: string[];
  grade?: number;
  performanceTrend?: 'improving' | 'stable' | 'declining';
}

interface Props {
  students: Student[];
  darkMode?: boolean;
  onActionClick?: (action: string) => void;
}

const InsightsAndRecommendations: React.FC<Props> = ({
  students,
  darkMode = false,
  onActionClick
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'insights' | 'recommendations' | 'individual'>('insights');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  // Generate insights and recommendations
  const classInsights = useMemo(() =>
    InsightsGenerator.generateClassInsights(students),
    [students]
  );

  const classRecommendations = useMemo(() =>
    InsightsGenerator.generateClassRecommendations(students),
    [students]
  );

  const studentRecommendations = useMemo(() => {
    if (!selectedStudent) return null;
    const student = students.find(s => s.studentCode === selectedStudent);
    if (!student) return null;
    return InsightsGenerator.generateStudentRecommendations(student);
  }, [selectedStudent, students]);

  // Filter insights by category
  const filteredInsights = useMemo(() => {
    if (selectedCategory === 'all') return classInsights;
    return classInsights.filter(i => i.category === selectedCategory);
  }, [classInsights, selectedCategory]);

  // Filter recommendations by category
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') return classRecommendations;
    return classRecommendations.filter(r => r.category === selectedCategory);
  }, [classRecommendations, selectedCategory]);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'danger': return AlertCircle;
      case 'info': return Info;
      case 'recommendation': return Lightbulb;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'danger': return 'text-red-500';
      case 'info': return 'text-blue-500';
      case 'recommendation': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case 'success': return darkMode ? 'bg-green-900/20' : 'bg-green-50';
      case 'warning': return darkMode ? 'bg-yellow-900/20' : 'bg-yellow-50';
      case 'danger': return darkMode ? 'bg-red-900/20' : 'bg-red-50';
      case 'info': return darkMode ? 'bg-blue-900/20' : 'bg-blue-50';
      case 'recommendation': return darkMode ? 'bg-purple-900/20' : 'bg-purple-50';
      default: return darkMode ? 'bg-gray-900/20' : 'bg-gray-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-500',
      immediate: 'bg-red-500',
      medium: 'bg-yellow-500',
      'short-term': 'bg-yellow-500',
      low: 'bg-green-500',
      'long-term': 'bg-green-500',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full text-white ${colors[priority as keyof typeof colors]}`}>
        {priority === 'high' || priority === 'immediate' ? 'דחוף' :
         priority === 'medium' || priority === 'short-term' ? 'בינוני' : 'נמוך'}
      </span>
    );
  };

  const categories = [
    { id: 'all', label: 'הכל', icon: Brain },
    { id: 'academic', label: 'אקדמי', icon: BookOpen },
    { id: 'behavioral', label: 'התנהגותי', icon: Users },
    { id: 'emotional', label: 'רגשי', icon: Heart },
    { id: 'social', label: 'חברתי', icon: Users },
    { id: 'teaching', label: 'הוראה', icon: Target },
    { id: 'intervention', label: 'התערבות', icon: Shield },
  ];

  return (
    <div className={`p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          תובנות והמלצות מניתוח הכיתה
        </h1>
        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          המלצות מבוססות נתונים לשיפור הלמידה וההוראה
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'insights'
              ? 'border-blue-500 text-blue-500'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <div className="flex items-center gap-2">
            <Brain size={18} />
            תובנות כלליות ({classInsights.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'recommendations'
              ? 'border-blue-500 text-blue-500'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={18} />
            המלצות פעולה ({classRecommendations.length})
          </div>
        </button>

        <button
          onClick={() => setActiveTab('individual')}
          className={`px-4 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'individual'
              ? 'border-blue-500 text-blue-500'
              : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
          }`}
        >
          <div className="flex items-center gap-2">
            <Users size={18} />
            המלצות אישיות
          </div>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {categories.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-blue-500 text-white'
                  : darkMode
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeTab === 'insights' && (
          <>
            {filteredInsights.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                אין תובנות בקטגוריה זו
              </div>
            ) : (
              filteredInsights.map((insight) => {
                const Icon = getInsightIcon(insight.type);
                return (
                  <div
                    key={insight.id}
                    className={`rounded-xl p-6 ${getInsightBg(insight.type)} ${
                      darkMode ? 'border border-gray-700' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <Icon size={24} className={getInsightColor(insight.type)} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {insight.title}
                          </h3>
                          {getPriorityBadge(insight.priority)}
                        </div>

                        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {insight.description}
                        </p>

                        {insight.actionable && insight.actions && (
                          <div className="space-y-2">
                            <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              פעולות מומלצות:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {insight.actions.map((action, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => onActionClick?.(action)}
                                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 transition-all ${
                                    darkMode
                                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  <ChevronRight size={14} />
                                  {action}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {insight.affectedStudents && insight.affectedStudents.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              תלמידים רלוונטיים: {insight.affectedStudents.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

        {activeTab === 'recommendations' && (
          <>
            {filteredRecommendations.length === 0 ? (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                אין המלצות בקטגוריה זו
              </div>
            ) : (
              filteredRecommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {rec.title}
                      </h3>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {rec.description}
                      </p>
                    </div>
                    {getPriorityBadge(rec.priority)}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        צעדי יישום:
                      </h4>
                      <ul className="space-y-1">
                        {rec.implementation.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {step}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        תוצאה צפויה:
                      </h4>
                      <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-900'}`}>
                          {rec.expectedOutcome}
                        </p>
                      </div>
                    </div>
                  </div>

                  {rec.evidence && (
                    <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <p className={`text-sm italic ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {rec.evidence}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}

        {activeTab === 'individual' && (
          <div>
            {/* Student Selector */}
            <div className="mb-6">
              <label htmlFor="student-selector" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                בחר תלמיד:
              </label>
              <select
                id="student-selector"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className={`w-full md:w-auto px-4 py-2 rounded-lg border ${
                  darkMode
                    ? 'bg-gray-800 border-gray-700 text-white'
                    : 'bg-white border-gray-200 text-gray-900'
                }`}
              >
                <option value="">-- בחר תלמיד --</option>
                {students.map(student => (
                  <option key={student.studentCode} value={student.studentCode}>
                    {student.name} ({student.studentCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Individual Recommendations */}
            {studentRecommendations && (
              <div className="space-y-6">
                {/* Student Header */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-blue-50'}`}>
                  <h3 className={`text-lg font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {studentRecommendations.studentName}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    קוד תלמיד: {studentRecommendations.studentCode}
                  </p>
                </div>

                {/* Insights */}
                {studentRecommendations.insights.length > 0 && (
                  <div>
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      תובנות אישיות
                    </h4>
                    <div className="space-y-3">
                      {studentRecommendations.insights.map((insight) => {
                        const Icon = getInsightIcon(insight.type);
                        return (
                          <div
                            key={insight.id}
                            className={`rounded-lg p-4 ${getInsightBg(insight.type)}`}
                          >
                            <div className="flex items-start gap-3">
                              <Icon size={20} className={getInsightColor(insight.type)} />
                              <div className="flex-1">
                                <p className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {insight.title}
                                </p>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                  {insight.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {studentRecommendations.recommendations.length > 0 && (
                  <div>
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      המלצות אישיות
                    </h4>
                    <div className="space-y-3">
                      {studentRecommendations.recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className={`rounded-lg p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${
                            darkMode ? 'border-gray-700' : 'border-gray-200'
                          }`}
                        >
                          <h5 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {rec.title}
                          </h5>
                          <p className={`text-sm mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {rec.description}
                          </p>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span className="font-medium">תוצאה צפויה:</span> {rec.expectedOutcome}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Seating Recommendation */}
                {studentRecommendations.seatingRecommendation && (
                  <div className={`rounded-lg p-4 ${darkMode ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
                    <h4 className={`text-md font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      המלצת הושבה
                    </h4>
                    <div className="space-y-2">
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">מיקום מומלץ:</span>{' '}
                        {studentRecommendations.seatingRecommendation.position}
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">סיבה:</span>{' '}
                        {studentRecommendations.seatingRecommendation.reason}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!selectedStudent && (
              <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                בחר תלמיד כדי לראות המלצות אישיות
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsAndRecommendations;