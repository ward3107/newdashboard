import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Lightbulb, Clock, TrendingUp } from 'lucide-react';

// Color schemes for different insight categories
const categoryColors = {
  '🧠 למידה קוגניטיבית': {
    gradient: 'from-purple-500 to-indigo-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-900',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800'
  },
  '💪 מוטיבציה ומעורבות': {
    gradient: 'from-orange-500 to-red-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-900',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-800'
  },
  '👥 למידה חברתית ושיתופית': {
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-900',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800'
  },
  '🎯 ריכוז וקשב': {
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-900',
    badgeBg: 'bg-green-100',
    badgeText: 'text-green-800'
  },
  '😊 רגשות ותחושות': {
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    text: 'text-pink-900',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-800'
  },
  '⏰ ניהול זמן וארגון': {
    gradient: 'from-amber-500 to-yellow-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-900',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800'
  },
  '🌱 חשיבה גמישה וגישה לאתגרים': {
    gradient: 'from-teal-500 to-green-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    text: 'text-teal-900',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-800'
  },
  '🎨 יצירתיות וחשיבה יצירתית': {
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-900',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-800'
  }
};

// Difficulty badge colors
const difficultyColors = {
  'קל': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
  'בינוני': { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
  'מאתגר': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
};

const InsightCard = ({ insight, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Get colors for this category
  const colors = categoryColors[insight.category] || categoryColors['🧠 למידה קוגניטיבית'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative overflow-hidden rounded-2xl border-2 ${colors.border} ${colors.bg} shadow-lg hover:shadow-xl transition-all duration-300`}
    >
      {/* Gradient header bar */}
      <div className={`h-2 bg-gradient-to-r ${colors.gradient}`} />

      <div className="p-6">
        {/* Category header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-2xl font-bold ${colors.text} flex items-center gap-3`}>
            <span className="text-3xl">{insight.category.split(' ')[0]}</span>
            <span>{insight.category.substring(insight.category.indexOf(' ') + 1)}</span>
          </h3>
          {insight.theory_basis && (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.badgeBg} ${colors.badgeText} border ${colors.border}`}>
              {insight.theory_basis}
            </span>
          )}
        </div>

        {/* Finding */}
        <div className="mb-6">
          <p className={`text-lg leading-relaxed ${colors.text} font-medium`}>
            {insight.finding}
          </p>
        </div>

        {/* Recommendations header */}
        {insight.recommendations && insight.recommendations.length > 0 && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full flex items-center justify-between p-4 rounded-xl ${colors.badgeBg} hover:opacity-80 transition-all duration-200`}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className={`w-5 h-5 ${colors.badgeText}`} />
                <span className={`font-bold ${colors.badgeText}`}>
                  {insight.recommendations.length} המלצות מעשיות
                </span>
              </div>
              {isExpanded ? (
                <ChevronUp className={`w-5 h-5 ${colors.badgeText}`} />
              ) : (
                <ChevronDown className={`w-5 h-5 ${colors.badgeText}`} />
              )}
            </button>

            {/* Recommendations list */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 space-y-4">
                    {insight.recommendations.map((rec, recIndex) => (
                      <motion.div
                        key={recIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: recIndex * 0.1 }}
                        className="bg-white rounded-xl p-5 shadow-md border-2 border-gray-100 hover:border-gray-200 transition-all duration-200"
                      >
                        {/* Recommendation header */}
                        <div className="flex items-start justify-between mb-3">
                          <h5 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <span className={`flex items-center justify-center w-8 h-8 rounded-full ${colors.badgeBg} ${colors.badgeText} font-bold`}>
                              {recIndex + 1}
                            </span>
                            {rec.action}
                          </h5>
                        </div>

                        {/* How to implement */}
                        <div className="mb-4 bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200">
                          <p className="text-sm font-medium text-gray-600 mb-2">איך ליישם:</p>
                          <p className="text-gray-800 leading-relaxed">{rec.how_to}</p>
                        </div>

                        {/* Rationale */}
                        {rec.rationale && (
                          <div className="mb-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                            <p className="text-sm font-medium text-blue-600 mb-2 flex items-center gap-2">
                              <TrendingUp className="w-4 h-4" />
                              למה זה עובד:
                            </p>
                            <p className="text-gray-800 leading-relaxed">{rec.rationale}</p>
                          </div>
                        )}

                        {/* Expected impact */}
                        {rec.expected_impact && (
                          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                            <p className="text-sm font-medium text-green-600 mb-2">תוצאה צפויה:</p>
                            <p className="text-gray-800 leading-relaxed">{rec.expected_impact}</p>
                          </div>
                        )}

                        {/* Meta information */}
                        <div className="flex flex-wrap gap-3 mt-4">
                          {rec.time_needed && (
                            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg border border-gray-200">
                              <Clock className="w-4 h-4 text-gray-600" />
                              <span className="text-sm font-medium text-gray-700">
                                {rec.time_needed}
                              </span>
                            </div>
                          )}

                          {rec.difficulty && (
                            <div className={`px-3 py-2 rounded-lg border ${difficultyColors[rec.difficulty]?.bg || 'bg-gray-100'} ${difficultyColors[rec.difficulty]?.text || 'text-gray-700'} ${difficultyColors[rec.difficulty]?.border || 'border-gray-200'}`}>
                              <span className="text-sm font-medium">
                                {rec.difficulty}
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default InsightCard;
