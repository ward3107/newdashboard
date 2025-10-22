import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Users,
  Heart,
  Zap,
  BookOpen,
  Settings
} from 'lucide-react';

/**
 * ISHEBOT Report Display Component
 * Displays comprehensive pedagogical analysis from ISHEBOT engine
 */
const ISHEBOTReportDisplay = ({ report }) => {
  const [expandedInsights, setExpandedInsights] = useState({});
  const [expandedRecommendations, setExpandedRecommendations] = useState({});

  if (!report || !report.insights) {
    return (
      <div className="text-center py-12">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">לא נמצא דוח ניתוח ISHEBOT</p>
      </div>
    );
  }

  const toggleInsight = (id) => {
    setExpandedInsights(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleRecommendations = (insightId, recIndex) => {
    const key = `${insightId}_${recIndex}`;
    setExpandedRecommendations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getDomainIcon = (domain) => {
    const icons = {
      cognitive: Brain,
      emotional: Heart,
      social: Users,
      motivation: Zap,
      'self-regulation': Settings,
      environmental: BookOpen
    };
    return icons[domain] || Brain;
  };

  const getDomainColor = (domain) => {
    const colors = {
      cognitive: 'blue',
      emotional: 'pink',
      social: 'purple',
      motivation: 'yellow',
      'self-regulation': 'green',
      environmental: 'indigo'
    };
    return colors[domain] || 'gray';
  };

  const getDomainLabel = (domain) => {
    const labels = {
      cognitive: 'קוגניטיבי',
      emotional: 'רגשי',
      social: 'חברתי',
      motivation: 'מוטיבציה',
      'self-regulation': 'ויסות עצמי',
      environmental: 'סביבתי'
    };
    return labels[domain] || domain;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300'
    };
    const labels = {
      critical: 'קריטי',
      high: 'גבוה',
      medium: 'בינוני',
      low: 'נמוך'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[priority] || styles.medium}`}>
        {labels[priority] || priority}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header: Overall Stats with Hybrid Scoring */}
      {(report.stats || report.scores) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200"
        >
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 ml-2" />
            ציונים כלליים
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.scores ? (
              <>
                <HybridStatCard label="ריכוז" score={report.scores.focus} color="blue" />
                <HybridStatCard label="מוטיבציה" score={report.scores.motivation} color="yellow" />
                <HybridStatCard label="שיתוף פעולה" score={report.scores.collaboration} color="purple" />
                <HybridStatCard label="ויסות רגשי" score={report.scores.emotional} color="pink" />
                <HybridStatCard label="מסוגלות עצמית" score={report.scores.self_efficacy} color="green" />
                <HybridStatCard label="ניהול זמן" score={report.scores.time_management} color="indigo" />
              </>
            ) : report.stats && (
              <>
                <StatCard label="ריכוז" value={report.stats.focus} color="blue" />
                <StatCard label="מוטיבציה" value={report.stats.motivation} color="yellow" />
                <StatCard label="שיתוף פעולה" value={report.stats.collaboration} color="purple" />
                <StatCard label="ויסות רגשי" value={report.stats.emotional_regulation} color="pink" />
              </>
            )}
          </div>

          {/* Risk Flags */}
          {((report.stats?.risk_flags && report.stats.risk_flags.length > 0) || report.risk_flags) && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="text-sm font-semibold text-red-800 mb-2 flex items-center">
                <AlertCircle className="w-4 h-4 ml-1" />
                אזורי התראה
              </h4>
              <div className="flex flex-wrap gap-2">
                {(report.stats?.risk_flags || [report.risk_flags]).filter(Boolean).map((flag, i) => (
                  <span key={i} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                    {flag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Insights Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <Lightbulb className="w-7 h-7 text-yellow-500 ml-2" />
          תובנות פדגוגיות מעמיקות
        </h3>

        {report.insights.map((insight, index) => {
          const DomainIcon = getDomainIcon(insight.domain);
          const domainColor = getDomainColor(insight.domain);
          const isExpanded = expandedInsights[insight.id];

          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden"
            >
              {/* Insight Header */}
              <button
                onClick={() => toggleInsight(insight.id)}
                className="w-full p-6 hover:bg-gray-50 transition-colors text-right"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`flex-shrink-0 w-12 h-12 bg-${domainColor}-100 rounded-xl flex items-center justify-center`}>
                      <DomainIcon className={`w-6 h-6 text-${domainColor}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-900">{insight.title}</h4>
                        <span className={`px-3 py-1 bg-${domainColor}-100 text-${domainColor}-800 rounded-full text-xs font-semibold`}>
                          {getDomainLabel(insight.domain)}
                        </span>
                      </div>
                      <p className="text-gray-700 text-right leading-relaxed">{insight.summary}</p>

                      {/* Confidence & Evidence */}
                      <div className="mt-3 flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${domainColor}-500`}
                              style={{ width: `${insight.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-gray-600 font-medium">
                            {Math.round(insight.confidence * 100)}% ביטחון
                          </span>
                        </div>
                        {insight.evidence?.from_questions && (
                          <span className="text-gray-500">
                            📝 מבוסס על שאלות: {insight.evidence.from_questions.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mr-4">
                    {isExpanded ? (
                      <ChevronUp className="w-6 h-6 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </div>
              </button>

              {/* Recommendations (Expanded) */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-gray-200"
                  >
                    <div className="p-6 bg-gray-50">
                      <h5 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Target className="w-5 h-5 ml-2 text-green-600" />
                        המלצות פעולה ({insight.recommendations.length})
                      </h5>
                      <div className="space-y-3">
                        {insight.recommendations.map((rec, recIndex) => {
                          const recKey = `${insight.id}_${recIndex}`;
                          const isRecExpanded = expandedRecommendations[recKey];

                          return (
                            <div
                              key={recIndex}
                              className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden hover:border-blue-300 transition-colors"
                            >
                              <button
                                onClick={() => toggleRecommendations(insight.id, recIndex)}
                                className="w-full p-4 text-right hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                      <span className="text-lg font-bold text-gray-700">
                                        {recIndex + 1}.
                                      </span>
                                      <h6 className="text-base font-bold text-gray-900 flex-1">
                                        {rec.action}
                                      </h6>
                                      {getPriorityBadge(rec.priority)}
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-600 mr-8">
                                      <span>📚 {rec.category}</span>
                                      <span>👥 {rec.audience === 'teacher' ? 'למורה' : rec.audience}</span>
                                      <span>⏰ {rec.duration}</span>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    {isRecExpanded ? (
                                      <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </button>

                              <AnimatePresence>
                                {isRecExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="border-t border-gray-200 bg-blue-50"
                                  >
                                    <div className="p-4 space-y-3 text-sm">
                                      <div>
                                        <strong className="text-blue-900">איך ליישם:</strong>
                                        <p className="text-blue-800 mt-1 leading-relaxed">{rec.how_to}</p>
                                      </div>
                                      <div className="flex gap-6">
                                        <div>
                                          <strong className="text-blue-900">מתי:</strong>
                                          <p className="text-blue-800">{rec.when}</p>
                                        </div>
                                        <div>
                                          <strong className="text-blue-900">משך:</strong>
                                          <p className="text-blue-800">{rec.duration}</p>
                                        </div>
                                      </div>
                                      {rec.materials && rec.materials.length > 0 && (
                                        <div>
                                          <strong className="text-blue-900">כלים נדרשים:</strong>
                                          <div className="flex flex-wrap gap-2 mt-1">
                                            {rec.materials.map((mat, i) => (
                                              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                {mat}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      <div>
                                        <strong className="text-blue-900">מדד הצלחה:</strong>
                                        <p className="text-blue-800 mt-1">{rec.follow_up_metric}</p>
                                      </div>
                                      <div className="p-3 bg-blue-100 rounded-lg">
                                        <strong className="text-blue-900">רציונל פדגוגי:</strong>
                                        <p className="text-blue-800 mt-1 leading-relaxed">{rec.rationale}</p>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Summary */}
      {report.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200"
        >
          <h3 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
            <Award className="w-6 h-6 ml-2" />
            סיכום כללי
          </h3>
          <p className="text-purple-800 leading-relaxed text-right">{report.summary}</p>
        </motion.div>
      )}

      {/* Metadata */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🧠 נוצר על ידי ISHEBOT Analysis Engine</p>
        <p>📅 {report.analysis_date || new Date().toLocaleDateString('he-IL')}</p>
        {report.model_used && <p>🤖 מודל: {report.model_used}</p>}
      </div>
    </div>
  );
};

// Helper component for hybrid stat display (stars + label + percentage)
const HybridStatCard = ({ label, score, color }) => {
  if (!score) return null;

  const bgColors = {
    blue: 'bg-blue-50',
    yellow: 'bg-yellow-50',
    purple: 'bg-purple-50',
    pink: 'bg-pink-50',
    green: 'bg-green-50',
    indigo: 'bg-indigo-50'
  };

  const textColors = {
    blue: 'text-blue-800',
    yellow: 'text-yellow-800',
    purple: 'text-purple-800',
    pink: 'text-pink-800',
    green: 'text-green-800',
    indigo: 'text-indigo-800'
  };

  const borderColors = {
    blue: 'border-blue-200',
    yellow: 'border-yellow-200',
    purple: 'border-purple-200',
    pink: 'border-pink-200',
    green: 'border-green-200',
    indigo: 'border-indigo-200'
  };

  return (
    <div className={`${bgColors[color]} rounded-xl p-4 border-2 ${borderColors[color]} text-center`}>
      <div className="text-sm font-semibold text-gray-700 mb-3">{label}</div>

      {/* Stars Display */}
      <div className="text-3xl mb-2" title={`${score.stars} מתוך 5 כוכבים`}>
        {score.label}
      </div>

      {/* Percentage */}
      <div className={`text-2xl font-bold ${textColors[color]} mb-1`}>
        {score.percentage}%
      </div>

      {/* Star Rating Bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2">
        <div
          className={`h-full ${bgColors[color].replace('50', '500')} transition-all duration-500`}
          style={{ width: `${(score.stars / 5) * 100}%` }}
        />
      </div>

      {/* Text Label */}
      <div className={`text-xs font-medium ${textColors[color]} mt-2`}>
        {score.stars === 1 && 'זקוק לתמיכה מיידית'}
        {score.stars === 2 && 'מתפתח'}
        {score.stars === 3 && 'מתקדם'}
        {score.stars === 4 && 'טוב מאוד'}
        {score.stars === 5 && 'מצוין'}
      </div>
    </div>
  );
};

// Helper component for legacy stat display (for backward compatibility)
const StatCard = ({ label, value, color }) => {
  const percentage = Math.round(value * 100);
  const colorClasses = {
    blue: 'from-blue-400 to-blue-600',
    yellow: 'from-yellow-400 to-yellow-600',
    purple: 'from-purple-400 to-purple-600',
    pink: 'from-pink-400 to-pink-600',
    green: 'from-green-400 to-green-600'
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
      <div className="text-sm font-medium text-gray-600 mb-2">{label}</div>
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="transform -rotate-90 w-16 h-16">
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - value)}`}
            className={`text-${color}-500`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
    </div>
  );
};

export default ISHEBOTReportDisplay;
