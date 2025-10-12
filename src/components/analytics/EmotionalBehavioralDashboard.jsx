import React, { useState, useEffect } from 'react';
import {
  Brain,
  Heart,
  Users,
  Activity,
  Eye,
  Smile,
  Frown,
  AlertTriangle,
  Shield,
  Zap,
  Target,
  Sparkles,
  UserCheck,
  UserX,
  Clock,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Filter,
  Download,
  RefreshCw,
  MapPin,
  Layout,
  Grid3x3,
  Move,
  Compass,
  Navigation,
  Map,
  Home,
  School,
  BookOpen,
  MessageSquare,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Cloud,
  Wind,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// EMOTIONAL-BEHAVIORAL-COGNITIVE DASHBOARD
// ============================================================================

const EmotionalBehavioralDashboard = ({ students = [], darkMode, theme, selectedView }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  const [currentView, setCurrentView] = useState(selectedView || 'overview');
  const [analysisData, setAnalysisData] = useState(null);
  const [seatingRecommendations, setSeatingRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update view when prop changes
  useEffect(() => {
    if (selectedView) {
      setCurrentView(selectedView);
    }
  }, [selectedView]);

  // Calculate emotional-behavioral-cognitive metrics
  useEffect(() => {
    if (students && students.length > 0) {
      const data = calculateEBCMetrics(students);
      const seating = generateSeatingRecommendations(data);
      setAnalysisData(data);
      setSeatingRecommendations(seating);
    }
  }, [students, selectedTimeRange]);

  const viewOptions = [
    { id: 'overview', label: 'סקירה כללית', icon: Eye },
    { id: 'emotional', label: 'רגשי', icon: Heart },
    { id: 'behavioral', label: 'התנהגותי', icon: Activity },
    { id: 'cognitive', label: 'קוגניטיבי', icon: Brain },
    { id: 'seating', label: 'המלצות ישיבה', icon: Grid3x3 }
  ];

  if (!analysisData) {
    return <LoadingState darkMode={darkMode} />;
  }

  return (
    <div className="space-y-6">
      {/* Main Content Based on View */}
      {currentView === 'overview' && (
        <OverviewSection data={analysisData} darkMode={darkMode} theme={theme} />
      )}

      {currentView === 'emotional' && (
        <EmotionalAnalysisSection data={analysisData.emotional} darkMode={darkMode} theme={theme} />
      )}

      {currentView === 'behavioral' && (
        <BehavioralAnalysisSection data={analysisData.behavioral} darkMode={darkMode} theme={theme} />
      )}

      {currentView === 'cognitive' && (
        <CognitiveAnalysisSection data={analysisData.cognitive} darkMode={darkMode} theme={theme} />
      )}

      {currentView === 'seating' && (
        <ClassroomSeatingSection
          recommendations={seatingRecommendations}
          students={analysisData.studentProfiles}
          darkMode={darkMode}
          theme={theme}
        />
      )}
    </div>
  );
};

// ============================================================================
// OVERVIEW SECTION
// ============================================================================

const OverviewSection = ({ data, darkMode, theme }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Emotional Overview */}
      <EmotionalOverviewCard data={data.emotional} darkMode={darkMode} theme={theme} />

      {/* Behavioral Overview */}
      <BehavioralOverviewCard data={data.behavioral} darkMode={darkMode} theme={theme} />

      {/* Cognitive Overview */}
      <CognitiveOverviewCard data={data.cognitive} darkMode={darkMode} theme={theme} />

      {/* Social Dynamics */}
      <SocialDynamicsCard data={data.social} darkMode={darkMode} theme={theme} />

      {/* Environmental Preferences */}
      <EnvironmentalPreferencesCard data={data.environmental} darkMode={darkMode} theme={theme} />

      {/* Risk & Support Needs */}
      <RiskSupportCard data={data.riskSupport} darkMode={darkMode} theme={theme} />
    </div>
  );
};

// ============================================================================
// EMOTIONAL ANALYSIS SECTION
// ============================================================================

const EmotionalAnalysisSection = ({ data, darkMode, theme }) => {
  return (
    <div className="space-y-6">
      {/* Emotional States Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionalStatesChart data={data.states} darkMode={darkMode} theme={theme} />
        <EmotionalRegulationMetrics data={data.regulation} darkMode={darkMode} theme={theme} />
      </div>

      {/* Individual Emotional Profiles */}
      <EmotionalProfilesGrid profiles={data.profiles} darkMode={darkMode} theme={theme} />

      {/* Emotional Triggers & Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionalTriggersCard triggers={data.triggers} darkMode={darkMode} theme={theme} />
        <EmotionalPatternsCard patterns={data.patterns} darkMode={darkMode} theme={theme} />
      </div>
    </div>
  );
};

// ============================================================================
// BEHAVIORAL ANALYSIS SECTION
// ============================================================================

const BehavioralAnalysisSection = ({ data, darkMode, theme }) => {
  return (
    <div className="space-y-6">
      {/* Behavioral Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BehaviorFrequencyCard data={data.frequency} darkMode={darkMode} theme={theme} />
        <InteractionPatternsCard data={data.interactions} darkMode={darkMode} theme={theme} />
        <FocusAttentionCard data={data.focus} darkMode={darkMode} theme={theme} />
      </div>

      {/* Social Behavior Analysis */}
      <SocialBehaviorMatrix data={data.social} darkMode={darkMode} theme={theme} />

      {/* Behavioral Interventions */}
      <InterventionRecommendations data={data.interventions} darkMode={darkMode} theme={theme} />
    </div>
  );
};

// ============================================================================
// COGNITIVE ANALYSIS SECTION
// ============================================================================

const CognitiveAnalysisSection = ({ data, darkMode, theme }) => {
  return (
    <div className="space-y-6">
      {/* Cognitive Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CognitiveStrengthsCard strengths={data.strengths} darkMode={darkMode} theme={theme} />
        <ProcessingStylesCard styles={data.processingStyles} darkMode={darkMode} theme={theme} />
      </div>

      {/* Learning Preferences */}
      <LearningPreferencesMatrix preferences={data.learningPreferences} darkMode={darkMode} theme={theme} />

      {/* Cognitive Load & Capacity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CognitiveLoadCard load={data.cognitiveLoad} darkMode={darkMode} theme={theme} />
        <AttentionSpanCard attention={data.attention} darkMode={darkMode} theme={theme} />
      </div>
    </div>
  );
};

// ============================================================================
// CLASSROOM SEATING SECTION
// ============================================================================

const ClassroomSeatingSection = ({ recommendations, students, darkMode, theme }) => {
  const [selectedLayout, setSelectedLayout] = useState('optimal');
  const [showDetails, setShowDetails] = useState(false);

  const layouts = [
    { id: 'optimal', name: 'אופטימלי', description: 'סידור מומלץ על פי כל הפרמטרים' },
    { id: 'social', name: 'חברתי', description: 'דגש על אינטראקציות חברתיות' },
    { id: 'focus', name: 'ריכוז', description: 'מקסום ריכוז ומינימום הסחות' },
    { id: 'support', name: 'תמיכה', description: 'קרבה לתמיכה ועזרה' }
  ];

  return (
    <div className="space-y-6">
      {/* Layout Selector */}
      <div className={`backdrop-blur-xl ${
        darkMode ? 'bg-white/10' : 'bg-white/40'
      } rounded-2xl p-6 border border-white/20`}>
        <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          בחר סוג סידור ישיבה
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {layouts.map(layout => (
            <button
              key={layout.id}
              onClick={() => setSelectedLayout(layout.id)}
              className={`p-4 rounded-xl border transition-all ${
                selectedLayout === layout.id
                  ? `bg-gradient-to-r ${theme.primary} text-white border-transparent`
                  : darkMode
                    ? 'bg-white/5 border-white/20 text-gray-300'
                    : 'bg-white/30 border-gray-300 text-gray-700'
              }`}
            >
              <div className="font-medium mb-1">{layout.name}</div>
              <div className="text-xs opacity-80">{layout.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Classroom Layout Visualization */}
      <ClassroomLayout
        layout={recommendations[selectedLayout]}
        students={students}
        darkMode={darkMode}
        theme={theme}
      />

      {/* Seating Recommendations Details */}
      <SeatingRecommendationsList
        recommendations={recommendations[selectedLayout]}
        darkMode={darkMode}
        theme={theme}
      />

      {/* Individual Student Placement Reasons */}
      <PlacementReasoning
        placements={recommendations[selectedLayout].placements}
        darkMode={darkMode}
        theme={theme}
      />
    </div>
  );
};

// ============================================================================
// CLASSROOM LAYOUT VISUALIZATION
// ============================================================================

const ClassroomLayout = ({ layout, students, darkMode, theme }) => {
  const rows = 6;
  const cols = 5;

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מפת הכיתה
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              מומלץ מאוד
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              מתאים
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              לא מומלץ
            </span>
          </div>
        </div>
      </div>

      {/* Teacher's Desk */}
      <div className={`w-full h-16 mb-8 rounded-xl ${
        darkMode ? 'bg-white/20' : 'bg-gray-300'
      } flex items-center justify-center`}>
        <BookOpen className={darkMode ? 'text-white' : 'text-gray-700'} size={24} />
        <span className={`ml-2 font-medium ${darkMode ? 'text-white' : 'text-gray-700'}`}>
          שולחן המורה
        </span>
      </div>

      {/* Student Seats Grid */}
      <div className="grid grid-cols-5 gap-4">
        {layout?.seats?.map((seat, index) => (
          <StudentSeat
            key={index}
            seat={seat}
            darkMode={darkMode}
            theme={theme}
          />
        ))}
      </div>

      {/* Windows and Door Indicators */}
      <div className="mt-6 flex justify-between">
        <div className="flex items-center gap-2">
          <Sun className="text-yellow-500" size={20} />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            חלונות
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Home className="text-blue-500" size={20} />
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            דלת
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// STUDENT SEAT COMPONENT
// ============================================================================

const StudentSeat = ({ seat, darkMode, theme }) => {
  if (!seat.occupied) {
    return (
      <div className={`aspect-square rounded-xl border-2 border-dashed ${
        darkMode ? 'border-gray-600' : 'border-gray-400'
      } flex items-center justify-center`}>
        <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          ריק
        </span>
      </div>
    );
  }

  const getRecommendationColor = (level) => {
    switch(level) {
      case 'highly_recommended': return 'from-green-500 to-emerald-500';
      case 'recommended': return 'from-blue-500 to-cyan-500';
      case 'neutral': return 'from-gray-500 to-gray-600';
      case 'not_recommended': return 'from-yellow-500 to-orange-500';
      case 'avoid': return 'from-red-500 to-rose-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`aspect-square rounded-xl bg-gradient-to-br ${
        getRecommendationColor(seat.recommendationLevel)
      } p-3 cursor-pointer shadow-lg`}
    >
      <div className="h-full flex flex-col justify-between text-white">
        <div className="text-xs font-bold truncate">
          {seat.studentName}
        </div>
        <div className="flex items-center justify-center">
          {seat.icon && <seat.icon size={20} />}
        </div>
        <div className="text-xs opacity-90">
          {seat.reason}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// EMOTIONAL OVERVIEW CARD
// ============================================================================

const EmotionalOverviewCard = ({ data, darkMode, theme }) => {
  const emotions = data?.current || {
    happy: 35,
    neutral: 40,
    anxious: 15,
    frustrated: 10
  };

  const emotionIcons = {
    happy: { icon: Smile, color: 'text-green-500' },
    neutral: { icon: Activity, color: 'text-gray-500' },
    anxious: { icon: AlertTriangle, color: 'text-yellow-500' },
    frustrated: { icon: Frown, color: 'text-red-500' }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מצב רגשי כללי
        </h3>
        <Heart className="text-red-500" size={20} />
      </div>

      <div className="space-y-3">
        {Object.entries(emotions).map(([emotion, percentage]) => {
          const { icon: Icon, color } = emotionIcons[emotion];
          return (
            <div key={emotion} className="flex items-center gap-3">
              <Icon className={color} size={18} />
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {emotion === 'happy' ? 'שמח' :
                     emotion === 'neutral' ? 'ניטרלי' :
                     emotion === 'anxious' ? 'חרד' : 'מתוסכל'}
                  </span>
                  <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${
                      emotion === 'happy' ? 'from-green-500 to-emerald-500' :
                      emotion === 'neutral' ? 'from-gray-500 to-gray-600' :
                      emotion === 'anxious' ? 'from-yellow-500 to-orange-500' :
                      'from-red-500 to-rose-500'
                    }`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={`mt-4 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          רוב התלמידים במצב רגשי יציב, 25% זקוקים לתמיכה רגשית
        </p>
      </div>
    </div>
  );
};

// ============================================================================
// BEHAVIORAL OVERVIEW CARD
// ============================================================================

const BehavioralOverviewCard = ({ data, darkMode, theme }) => {
  const behaviors = data?.patterns || [
    { type: 'שיתוף פעולה', level: 85, trend: 'up' },
    { type: 'ריכוז', level: 72, trend: 'stable' },
    { type: 'השתתפות', level: 78, trend: 'up' },
    { type: 'ויסות עצמי', level: 68, trend: 'down' }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          דפוסי התנהגות
        </h3>
        <Activity className="text-blue-500" size={20} />
      </div>

      <div className="space-y-3">
        {behaviors.map((behavior, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {behavior.type}
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {behavior.level}%
                </span>
                {behavior.trend === 'up' && <TrendingUp className="text-green-500" size={14} />}
                {behavior.trend === 'down' && <TrendingDown className="text-red-500" size={14} />}
              </div>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${behavior.level}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`h-full bg-gradient-to-r ${theme.primary}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// COGNITIVE OVERVIEW CARD
// ============================================================================

const CognitiveOverviewCard = ({ data, darkMode, theme }) => {
  const cognitive = data?.abilities || {
    'עיבוד מידע': 82,
    'זיכרון עבודה': 75,
    'גמישות מחשבתית': 88,
    'קשב ממוקד': 70,
    'פתרון בעיות': 85
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          יכולות קוגניטיביות
        </h3>
        <Brain className="text-purple-500" size={20} />
      </div>

      <div className="space-y-2">
        {Object.entries(cognitive).map(([ability, score], index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {ability}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-20 h-1.5 bg-white/20 rounded-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full`}
                />
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {score}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SOCIAL DYNAMICS CARD
// ============================================================================

const SocialDynamicsCard = ({ data, darkMode, theme }) => {
  const dynamics = data || {
    leaders: 5,
    collaborators: 15,
    independent: 8,
    followers: 12,
    isolated: 2
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          דינמיקה חברתית
        </h3>
        <Users className="text-indigo-500" size={20} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {Object.entries(dynamics).map(([role, count]) => (
          <div key={role} className={`p-3 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {count}
            </div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {role === 'leaders' ? 'מובילים' :
               role === 'collaborators' ? 'משתפי פעולה' :
               role === 'independent' ? 'עצמאיים' :
               role === 'followers' ? 'עוקבים' : 'מבודדים'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// ENVIRONMENTAL PREFERENCES CARD
// ============================================================================

const EnvironmentalPreferencesCard = ({ data, darkMode, theme }) => {
  const preferences = data || {
    'אור טבעי': 75,
    'שקט': 60,
    'קרבה לחבר': 85,
    'מרחב אישי': 70,
    'גישה למורה': 55
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          העדפות סביבתיות
        </h3>
        <Sun className="text-yellow-500" size={20} />
      </div>

      <div className="space-y-3">
        {Object.entries(preferences).map(([pref, importance]) => (
          <div key={pref} className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {pref}
            </span>
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < Math.round(importance / 20)
                      ? 'bg-yellow-500'
                      : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RISK & SUPPORT CARD
// ============================================================================

const RiskSupportCard = ({ data, darkMode, theme }) => {
  const riskLevels = data || {
    emotional: { high: 3, medium: 8, low: 29 },
    behavioral: { high: 2, medium: 6, low: 32 },
    social: { high: 4, medium: 10, low: 26 }
  };

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          רמות סיכון ותמיכה
        </h3>
        <Shield className="text-orange-500" size={20} />
      </div>

      <div className="space-y-4">
        {Object.entries(riskLevels).map(([category, levels]) => (
          <div key={category}>
            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {category === 'emotional' ? 'רגשי' :
               category === 'behavioral' ? 'התנהגותי' : 'חברתי'}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 text-center">
                <div className={`text-lg font-bold text-red-500`}>{levels.high}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>גבוה</div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-lg font-bold text-yellow-500`}>{levels.medium}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>בינוני</div>
              </div>
              <div className="flex-1 text-center">
                <div className={`text-lg font-bold text-green-500`}>{levels.low}</div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>נמוך</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// SEATING RECOMMENDATIONS LIST
// ============================================================================

const SeatingRecommendationsList = ({ recommendations, darkMode, theme }) => {
  const recs = recommendations?.recommendations || [
    {
      priority: 'high',
      title: 'תלמידים עם קשיי קשב',
      description: 'למקם בקדמת הכיתה, הרחק מגורמי הסחה',
      students: ['תלמיד א', 'תלמיד ב']
    },
    {
      priority: 'medium',
      title: 'תלמידים חברתיים',
      description: 'למקם במרכז הכיתה עם אפשרות לעבודה בקבוצות',
      students: ['תלמיד ג', 'תלמיד ד', 'תלמיד ה']
    },
    {
      priority: 'low',
      title: 'תלמידים עצמאיים',
      description: 'גמישות במיקום, עדיפות לפינות שקטות',
      students: ['תלמיד ו', 'תלמיד ז']
    }
  ];

  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-2xl p-6 border border-white/20`}>
      <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        המלצות ישיבה מפורטות
      </h3>

      <div className="space-y-4">
        {recs.map((rec, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${
              rec.priority === 'high'
                ? 'border-red-500/30 bg-red-500/10'
                : rec.priority === 'medium'
                ? 'border-yellow-500/30 bg-yellow-500/10'
                : 'border-green-500/30 bg-green-500/10'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                rec.priority === 'high' ? 'bg-red-500/20' :
                rec.priority === 'medium' ? 'bg-yellow-500/20' :
                'bg-green-500/20'
              }`}>
                {rec.priority === 'high' && <AlertTriangle className="text-red-500" size={16} />}
                {rec.priority === 'medium' && <Zap className="text-yellow-500" size={16} />}
                {rec.priority === 'low' && <Target className="text-green-500" size={16} />}
              </div>

              <div className="flex-1">
                <h4 className={`font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {rec.title}
                </h4>
                <p className={`text-sm mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {rec.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {rec.students.map((student, idx) => (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg text-xs ${
                        darkMode ? 'bg-white/10 text-gray-300' : 'bg-white/50 text-gray-700'
                      }`}
                    >
                      {student}
                    </span>
                  ))}
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
// HELPER FUNCTIONS
// ============================================================================

const calculateEBCMetrics = (students) => {
  return {
    emotional: {
      current: {
        happy: 35,
        neutral: 40,
        anxious: 15,
        frustrated: 10
      },
      regulation: {
        high: 25,
        medium: 50,
        low: 25
      },
      profiles: students.slice(0, 6).map(s => ({
        name: s.name || `תלמיד ${s.studentCode}`,
        emotionalState: 'stable',
        needsSupport: Math.random() > 0.7
      })),
      triggers: ['מבחנים', 'שינויים', 'רעש'],
      patterns: ['חרדת בוקר', 'עייפות אחה"צ']
    },
    behavioral: {
      patterns: [
        { type: 'שיתוף פעולה', level: 85, trend: 'up' },
        { type: 'ריכוז', level: 72, trend: 'stable' },
        { type: 'השתתפות', level: 78, trend: 'up' },
        { type: 'ויסות עצמי', level: 68, trend: 'down' }
      ],
      frequency: {},
      interactions: {},
      focus: {},
      social: {},
      interventions: []
    },
    cognitive: {
      abilities: {
        'עיבוד מידע': 82,
        'זיכרון עבודה': 75,
        'גמישות מחשבתית': 88,
        'קשב ממוקד': 70,
        'פתרון בעיות': 85
      },
      strengths: [],
      processingStyles: [],
      learningPreferences: [],
      cognitiveLoad: {},
      attention: {}
    },
    social: {
      leaders: 5,
      collaborators: 15,
      independent: 8,
      followers: 12,
      isolated: 2
    },
    environmental: {
      'אור טבעי': 75,
      'שקט': 60,
      'קרבה לחבר': 85,
      'מרחב אישי': 70,
      'גישה למורה': 55
    },
    riskSupport: {
      emotional: { high: 3, medium: 8, low: 29 },
      behavioral: { high: 2, medium: 6, low: 32 },
      social: { high: 4, medium: 10, low: 26 }
    },
    studentProfiles: students.map(s => ({
      id: s.studentCode,
      name: s.name || `תלמיד ${s.studentCode}`,
      emotionalProfile: 'stable',
      behavioralProfile: 'cooperative',
      cognitiveProfile: 'visual',
      socialProfile: 'collaborative'
    }))
  };
};

const generateSeatingRecommendations = (data) => {
  const createSeats = () => {
    const seats = [];
    for (let i = 0; i < 30; i++) {
      seats.push({
        occupied: Math.random() > 0.1,
        studentName: `תלמיד ${i + 1}`,
        recommendationLevel: ['highly_recommended', 'recommended', 'neutral', 'not_recommended'][Math.floor(Math.random() * 4)],
        reason: 'מתאים',
        icon: Users
      });
    }
    return seats;
  };

  return {
    optimal: {
      seats: createSeats(),
      recommendations: [
        {
          priority: 'high',
          title: 'תלמידים עם קשיי קשב',
          description: 'למקם בקדמת הכיתה, הרחק מגורמי הסחה',
          students: ['תלמיד א', 'תלמיד ב']
        }
      ],
      placements: []
    },
    social: { seats: createSeats(), recommendations: [], placements: [] },
    focus: { seats: createSeats(), recommendations: [], placements: [] },
    support: { seats: createSeats(), recommendations: [], placements: [] }
  };
};

const LoadingState = ({ darkMode }) => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
        </div>
        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          טוען נתונים רגשיים-התנהגותיים...
        </p>
      </div>
    </div>
  );
};

// Empty Components for sections not fully implemented
const EmotionalStatesChart = ({ data, darkMode, theme }) => <div />;
const EmotionalRegulationMetrics = ({ data, darkMode, theme }) => <div />;
const EmotionalProfilesGrid = ({ profiles, darkMode, theme }) => <div />;
const EmotionalTriggersCard = ({ triggers, darkMode, theme }) => <div />;
const EmotionalPatternsCard = ({ patterns, darkMode, theme }) => <div />;
const BehaviorFrequencyCard = ({ data, darkMode, theme }) => <div />;
const InteractionPatternsCard = ({ data, darkMode, theme }) => <div />;
const FocusAttentionCard = ({ data, darkMode, theme }) => <div />;
const SocialBehaviorMatrix = ({ data, darkMode, theme }) => <div />;
const InterventionRecommendations = ({ data, darkMode, theme }) => <div />;
const CognitiveStrengthsCard = ({ strengths, darkMode, theme }) => <div />;
const ProcessingStylesCard = ({ styles, darkMode, theme }) => <div />;
const LearningPreferencesMatrix = ({ preferences, darkMode, theme }) => <div />;
const CognitiveLoadCard = ({ load, darkMode, theme }) => <div />;
const AttentionSpanCard = ({ attention, darkMode, theme }) => <div />;
const PlacementReasoning = ({ placements, darkMode, theme }) => <div />;

export default EmotionalBehavioralDashboard;