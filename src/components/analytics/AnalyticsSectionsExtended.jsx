import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Activity,
  BarChart3,
  Users,
  Calendar,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Star,
  UserCheck,
  GraduationCap,
  Briefcase,
  MessageSquare,
  FileText,
  Settings,
  Shield,
  Percent,
  Timer,
  UserPlus,
  UserMinus,
  Eye,
  Layers,
  Compass,
  Map,
  Navigation,
  Sparkles,
  BookOpen,
  Brain,
  Heart,
  Globe,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// 4. PROGRESS & GROWTH METRICS SECTION
// ============================================================================

export const ProgressGrowthSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center`}>
          <TrendingUp className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          התקדמות וצמיחה
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Progress */}
        <MonthlyProgressCard data={data?.monthly} darkMode={darkMode} />

        {/* Goal Achievement */}
        <GoalAchievementCard data={data?.goals} darkMode={darkMode} />

        {/* Strength Development */}
        <StrengthDevelopmentCard data={data?.strengths} darkMode={darkMode} />

        {/* Challenge Resolution */}
        <ChallengeResolutionCard data={data?.challenges} darkMode={darkMode} />

        {/* Learning Velocity */}
        <LearningVelocityCard data={data?.velocity} darkMode={darkMode} />

        {/* Growth Summary */}
        <GrowthSummaryCard data={data?.summary} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Monthly Progress Card
const MonthlyProgressCard = ({ data, darkMode }) => {
  const progress = data || [
    { month: 'ינואר', improvement: 12 },
    { month: 'פברואר', improvement: 15 },
    { month: 'מרץ', improvement: 8 },
    { month: 'אפריל', improvement: 18 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        התקדמות חודשית
      </h4>
      <div className="space-y-2">
        {progress.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {item.month}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.improvement * 5}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                />
              </div>
              <span className={`text-sm font-bold ${
                item.improvement > 10 ? 'text-green-500' : darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                +{item.improvement}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Goal Achievement Card
const GoalAchievementCard = ({ data, darkMode }) => {
  const goals = data || {
    completed: 8,
    onTrack: 5,
    atRisk: 2,
    total: 15,
    completionRate: 53
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        השגת יעדים
      </h4>
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="48"
              cy="48"
              r="36"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - goals.completionRate / 100)}`}
              className="text-green-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {goals.completionRate}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-green-500 font-bold text-lg">{goals.completed}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>הושלמו</div>
        </div>
        <div>
          <div className="text-yellow-500 font-bold text-lg">{goals.onTrack}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>במסלול</div>
        </div>
        <div>
          <div className="text-red-500 font-bold text-lg">{goals.atRisk}</div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>בסיכון</div>
        </div>
      </div>
    </div>
  );
};

// Strength Development Card
const StrengthDevelopmentCard = ({ data, darkMode }) => {
  const strengths = data || [
    { name: 'חשיבה ביקורתית', initial: 60, current: 85, growth: 25 },
    { name: 'יצירתיות', initial: 70, current: 88, growth: 18 },
    { name: 'עבודת צוות', initial: 55, current: 78, growth: 23 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        פיתוח חוזקות
      </h4>
      <div className="space-y-3">
        {strengths.map((strength, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {strength.name}
              </span>
              <span className={`text-sm font-bold text-green-500`}>
                +{strength.growth}%
              </span>
            </div>
            <div className="relative h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gray-500/30 rounded-full"
                style={{ width: `${strength.initial}%` }}
              />
              <motion.div
                initial={{ width: `${strength.initial}%` }}
                animate={{ width: `${strength.current}%` }}
                transition={{ duration: 1, delay: index * 0.2 }}
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Challenge Resolution Card
const ChallengeResolutionCard = ({ data, darkMode }) => {
  const challenges = data || [
    { name: 'ריכוז בשיעור', status: 'resolved', days: 21 },
    { name: 'הגשת מטלות בזמן', status: 'improving', days: 14 },
    { name: 'השתתפות בכיתה', status: 'ongoing', days: 7 }
  ];

  const statusColors = {
    resolved: 'text-green-500 bg-green-500/20',
    improving: 'text-yellow-500 bg-yellow-500/20',
    ongoing: 'text-orange-500 bg-orange-500/20',
    new: 'text-red-500 bg-red-500/20'
  };

  const statusLabels = {
    resolved: 'נפתר',
    improving: 'משתפר',
    ongoing: 'בטיפול',
    new: 'חדש'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        פתרון אתגרים
      </h4>
      <div className="space-y-2">
        {challenges.map((challenge, index) => (
          <div key={index} className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {challenge.name}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[challenge.status]}`}>
                {statusLabels[challenge.status]}
              </span>
            </div>
            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {challenge.days} ימים
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Learning Velocity Card
const LearningVelocityCard = ({ data, darkMode }) => {
  const velocity = data || {
    overall: 3.5,
    trend: 'accelerating',
    subjects: [
      { name: 'מתמטיקה', velocity: 4.2 },
      { name: 'מדעים', velocity: 3.8 },
      { name: 'שפות', velocity: 2.9 }
    ]
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        מהירות למידה
      </h4>
      <div className="text-center mb-3">
        <div className="flex items-center justify-center gap-2">
          <Zap className="text-yellow-500" size={24} />
          <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {velocity.overall}
          </div>
        </div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          מושגים לשבוע
        </div>
      </div>
      <div className="space-y-2">
        {velocity.subjects.map((subject, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {subject.name}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1 bg-white/20 rounded-full">
                <div
                  className="h-full bg-yellow-500 rounded-full"
                  style={{ width: `${(subject.velocity / 5) * 100}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {subject.velocity}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Growth Summary Card
const GrowthSummaryCard = ({ data, darkMode }) => {
  const summary = data || {
    overallGrowth: 22,
    topArea: 'מתמטיקה',
    topGrowth: 35,
    improvementAreas: 2
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        סיכום צמיחה
      </h4>
      <div className="space-y-3">
        <div className="text-center">
          <div className={`text-3xl font-bold text-green-500`}>
            +{summary.overallGrowth}%
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            צמיחה כוללת
          </div>
        </div>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            תחום מוביל
          </div>
          <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {summary.topArea}
          </div>
          <div className="text-sm font-bold text-green-500">
            +{summary.topGrowth}%
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            תחומים לשיפור
          </span>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {summary.improvementAreas}
          </span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 5. COMPARATIVE ANALYTICS SECTION
// ============================================================================

export const ComparativeAnalyticsSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center`}>
          <Users className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          ניתוחים השוואתיים
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Class Comparison */}
        <ClassComparisonCard data={data?.class} darkMode={darkMode} />

        {/* Gender Analysis */}
        <GenderAnalysisCard data={data?.gender} darkMode={darkMode} />

        {/* Age Group Comparison */}
        <AgeGroupCard data={data?.ageGroups} darkMode={darkMode} />

        {/* Year Over Year */}
        <YearOverYearCard data={data?.yearOverYear} darkMode={darkMode} />

        {/* Benchmark Comparison */}
        <BenchmarkCard data={data?.benchmarks} darkMode={darkMode} />

        {/* Peer Comparison */}
        <PeerComparisonCard data={data?.peers} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Class Comparison Card
const ClassComparisonCard = ({ data, darkMode }) => {
  const comparison = data || {
    studentAvg: 85,
    classAvg: 78,
    percentile: 82,
    rank: 5,
    total: 30
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        השוואה לכיתה
      </h4>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ממוצע תלמיד
          </span>
          <span className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {comparison.studentAvg}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            ממוצע כיתה
          </span>
          <span className={`text-xl font-bold ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
            {comparison.classAvg}
          </span>
        </div>
        <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gray-500/30 rounded-full" />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
            style={{ width: `${comparison.percentile}%` }}
          />
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-1 h-5 bg-blue-500"
            style={{ left: `${comparison.percentile}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            דירוג: {comparison.rank}/{comparison.total}
          </span>
          <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            אחוזון {comparison.percentile}
          </span>
        </div>
      </div>
    </div>
  );
};

// Gender Analysis Card
const GenderAnalysisCard = ({ data, darkMode }) => {
  const analysis = data || {
    metrics: [
      { name: 'ממוצע כללי', male: 82, female: 86 },
      { name: 'נוכחות', male: 90, female: 94 },
      { name: 'מטלות', male: 78, female: 85 }
    ]
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ניתוח מגדרי
      </h4>
      <div className="space-y-3">
        {analysis.metrics.map((metric, index) => (
          <div key={index}>
            <div className={`text-xs mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {metric.name}
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-blue-500">בנים</span>
                  <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.male}
                  </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${metric.male}%` }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-pink-500">בנות</span>
                  <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {metric.female}
                  </span>
                </div>
                <div className="h-1.5 bg-white/20 rounded-full">
                  <div
                    className="h-full bg-pink-500 rounded-full"
                    style={{ width: `${metric.female}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Age Group Card
const AgeGroupCard = ({ data, darkMode }) => {
  const ageGroups = data || [
    { age: '15-16', count: 45, avg: 82 },
    { age: '16-17', count: 52, avg: 85 },
    { age: '17-18', count: 38, avg: 88 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        קבוצות גיל
      </h4>
      <div className="space-y-3">
        {ageGroups.map((group, index) => (
          <div key={index} className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
            <div className="flex justify-between items-center">
              <div>
                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {group.age}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {group.count} תלמידים
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {group.avg}
                </div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  ממוצע
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Year Over Year Card
const YearOverYearCard = ({ data, darkMode }) => {
  const yearData = data || {
    metrics: [
      { name: 'ממוצע כללי', current: 85, previous: 78, change: 7 },
      { name: 'נוכחות', current: 92, previous: 88, change: 4 },
      { name: 'השלמת מטלות', current: 78, previous: 82, change: -4 }
    ]
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        השוואה שנתית
      </h4>
      <div className="space-y-3">
        {yearData.metrics.map((metric, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {metric.name}
            </span>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {metric.previous}→{metric.current}
              </span>
              <span className={`text-sm font-bold ${
                metric.change > 0 ? 'text-green-500' : metric.change < 0 ? 'text-red-500' : 'text-gray-500'
              }`}>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Benchmark Card
const BenchmarkCard = ({ data, darkMode }) => {
  const benchmarks = data || [
    { type: 'מחוזי', student: 85, benchmark: 78, percentile: 75 },
    { type: 'ארצי', student: 85, benchmark: 80, percentile: 68 },
    { type: 'בינלאומי', student: 85, benchmark: 82, percentile: 62 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        השוואה לנורמות
      </h4>
      <div className="space-y-3">
        {benchmarks.map((bench, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {bench.type}
              </span>
              <span className={`text-sm font-bold ${
                bench.student > bench.benchmark ? 'text-green-500' : 'text-red-500'
              }`}>
                {bench.student > bench.benchmark ? '+' : ''}{bench.student - bench.benchmark}
              </span>
            </div>
            <div className="relative h-2 bg-white/20 rounded-full">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  bench.student > bench.benchmark
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${bench.percentile}%` }}
              />
            </div>
            <div className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              אחוזון {bench.percentile}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Peer Comparison Card
const PeerComparisonCard = ({ data, darkMode }) => {
  const peers = data || [
    { name: 'תלמיד א', score: 88 },
    { name: 'תלמיד נוכחי', score: 85, isCurrentStudent: true },
    { name: 'תלמיד ב', score: 82 },
    { name: 'תלמיד ג', score: 79 },
    { name: 'תלמיד ד', score: 76 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        השוואה לעמיתים
      </h4>
      <div className="space-y-2">
        {peers.map((peer, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-2 rounded-lg ${
              peer.isCurrentStudent
                ? darkMode ? 'bg-blue-500/20 border border-blue-500/30' : 'bg-blue-100 border border-blue-300'
                : darkMode ? 'bg-white/5' : 'bg-white/20'
            }`}
          >
            <span className={`text-sm ${
              peer.isCurrentStudent
                ? 'font-bold text-blue-500'
                : darkMode ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {peer.name}
            </span>
            <span className={`text-sm font-bold ${
              peer.isCurrentStudent
                ? 'text-blue-500'
                : darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {peer.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// 6. PREDICTIVE STATISTICS SECTION
// ============================================================================

export const PredictiveStatisticsSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center`}>
          <AlertTriangle className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          חיזוי וסטטיסטיקות חזויות
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Risk Indicators */}
        <RiskIndicatorsCard data={data?.risks} darkMode={darkMode} />

        {/* Success Predictions */}
        <SuccessPredictionsCard data={data?.success} darkMode={darkMode} />

        {/* Dropout Risk */}
        <DropoutRiskCard data={data?.dropout} darkMode={darkMode} />

        {/* College Readiness */}
        <CollegeReadinessCard data={data?.college} darkMode={darkMode} />

        {/* Career Path Alignment */}
        <CareerAlignmentCard data={data?.career} darkMode={darkMode} />

        {/* Future Performance */}
        <FuturePerformanceCard data={data?.future} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Risk Indicators Card
const RiskIndicatorsCard = ({ data, darkMode }) => {
  const risks = data || [
    { type: 'נשירה', level: 'low', probability: 15 },
    { type: 'כישלון אקדמי', level: 'medium', probability: 35 },
    { type: 'התנהגות', level: 'low', probability: 10 },
    { type: 'רגשי', level: 'medium', probability: 40 }
  ];

  const levelColors = {
    low: 'text-green-500 bg-green-500/20',
    medium: 'text-yellow-500 bg-yellow-500/20',
    high: 'text-red-500 bg-red-500/20'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        מדדי סיכון
      </h4>
      <div className="space-y-2">
        {risks.map((risk, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {risk.type}
            </span>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${levelColors[risk.level]}`}>
                {risk.probability}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Success Predictions Card
const SuccessPredictionsCard = ({ data, darkMode }) => {
  const predictions = data || [
    { goal: 'סיום שנה בהצלחה', probability: 88 },
    { goal: 'שיפור ב-10%', probability: 75 },
    { goal: 'הצטיינות', probability: 62 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        חיזוי הצלחה
      </h4>
      <div className="space-y-3">
        {predictions.map((pred, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {pred.goal}
              </span>
              <span className={`text-sm font-bold ${
                pred.probability > 70 ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {pred.probability}%
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pred.probability}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className={`h-full rounded-full ${
                  pred.probability > 70
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                }`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Dropout Risk Card (Detailed)
const DropoutRiskCard = ({ data, darkMode }) => {
  const dropoutData = data || {
    score: 25,
    level: 'low',
    signals: [
      { signal: 'נוכחות נמוכה', detected: false },
      { signal: 'ירידה בציונים', detected: true },
      { signal: 'חוסר מעורבות', detected: false }
    ]
  };

  const levelColors = {
    low: 'text-green-500',
    medium: 'text-yellow-500',
    high: 'text-red-500'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        סיכון נשירה
      </h4>
      <div className="text-center mb-3">
        <div className={`text-3xl font-bold ${levelColors[dropoutData.level]}`}>
          {dropoutData.score}%
        </div>
        <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          רמת סיכון {dropoutData.level === 'low' ? 'נמוכה' : dropoutData.level === 'medium' ? 'בינונית' : 'גבוהה'}
        </div>
      </div>
      <div className="space-y-2">
        {dropoutData.signals.map((signal, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {signal.signal}
            </span>
            {signal.detected ? (
              <AlertTriangle className="text-yellow-500" size={14} />
            ) : (
              <CheckCircle className="text-green-500" size={14} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// College Readiness Card
const CollegeReadinessCard = ({ data, darkMode }) => {
  const readiness = data || {
    overall: 72,
    academic: 78,
    standardized: 68,
    extracurricular: 70
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        מוכנות לאקדמיה
      </h4>
      <div className="flex justify-center mb-3">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="48"
              cy="48"
              r="36"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - readiness.overall / 100)}`}
              className="text-indigo-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <GraduationCap className="text-indigo-500" size={24} />
          </div>
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>אקדמי</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{readiness.academic}%</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>מבחנים</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{readiness.standardized}%</span>
        </div>
        <div className="flex justify-between">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>חוץ לימודי</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{readiness.extracurricular}%</span>
        </div>
      </div>
    </div>
  );
};

// Career Alignment Card
const CareerAlignmentCard = ({ data, darkMode }) => {
  const careers = data || [
    { career: 'הנדסה', alignment: 85, icon: Settings },
    { career: 'רפואה', alignment: 72, icon: Heart },
    { career: 'חינוך', alignment: 68, icon: BookOpen },
    { career: 'עסקים', alignment: 78, icon: Briefcase }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        התאמה לקריירה
      </h4>
      <div className="space-y-2">
        {careers.map((career, index) => (
          <div key={index} className="flex items-center gap-3">
            <career.icon className={darkMode ? 'text-gray-400' : 'text-gray-600'} size={16} />
            <div className="flex-1">
              <div className="flex justify-between mb-1">
                <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {career.career}
                </span>
                <span className={`text-sm font-bold ${
                  career.alignment > 75 ? 'text-green-500' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {career.alignment}%
                </span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    career.alignment > 75
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-gray-400 to-gray-500'
                  }`}
                  style={{ width: `${career.alignment}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Future Performance Card
const FuturePerformanceCard = ({ data, darkMode }) => {
  const future = data || {
    nextQuarter: 87,
    nextYear: 90,
    graduation: 92,
    confidence: 78
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ביצועים עתידיים
      </h4>
      <div className="space-y-3">
        <div className="text-center">
          <Compass className="text-violet-500 mx-auto mb-2" size={32} />
          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            רמת ודאות: {future.confidence}%
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              רבעון הבא
            </span>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {future.nextQuarter}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              שנה הבאה
            </span>
            <span className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {future.nextYear}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              סיום לימודים
            </span>
            <span className={`text-lg font-bold text-green-500`}>
              {future.graduation}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// 7. TEACHER SUPPORT METRICS SECTION
// ============================================================================

export const TeacherSupportSection = ({ data, darkMode, theme }) => {
  return (
    <div className={`backdrop-blur-xl ${
      darkMode ? 'bg-white/10' : 'bg-white/40'
    } rounded-3xl p-6 border border-white/20 shadow-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center`}>
          <Shield className="text-white" size={20} />
        </div>
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          מדדי תמיכת מורים
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Intervention Success */}
        <InterventionSuccessCard data={data?.interventions} darkMode={darkMode} />

        {/* Response Times */}
        <ResponseTimesCard data={data?.responseTimes} darkMode={darkMode} />

        {/* Personalization Index */}
        <PersonalizationCard data={data?.personalization} darkMode={darkMode} />

        {/* Parent Engagement */}
        <ParentEngagementCard data={data?.parentEngagement} darkMode={darkMode} />

        {/* Resource Utilization */}
        <ResourceUtilizationCard data={data?.resources} darkMode={darkMode} />

        {/* Teaching Effectiveness */}
        <TeachingEffectivenessCard data={data?.effectiveness} darkMode={darkMode} />
      </div>
    </div>
  );
};

// Intervention Success Card
const InterventionSuccessCard = ({ data, darkMode }) => {
  const interventions = data || [
    { type: 'תמיכה אישית', success: 85, count: 12 },
    { type: 'קבוצת למידה', success: 78, count: 8 },
    { type: 'שיעורי עזר', success: 92, count: 15 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        הצלחת התערבויות
      </h4>
      <div className="space-y-3">
        {interventions.map((item, index) => (
          <div key={index}>
            <div className="flex justify-between mb-1">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.type}
              </span>
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {item.count} פעמים
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-white/20 rounded-full">
                <div
                  className={`h-full rounded-full ${
                    item.success > 80
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                  }`}
                  style={{ width: `${item.success}%` }}
                />
              </div>
              <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.success}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Response Times Card
const ResponseTimesCard = ({ data, darkMode }) => {
  const times = data || {
    average: 2.5,
    fastest: 0.5,
    slowest: 8,
    onTime: 92
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        זמני תגובה
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center">
          <Clock className="text-teal-500 mx-auto mb-1" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {times.average}
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            שעות בממוצע
          </div>
        </div>
        <div className="text-center">
          <Timer className="text-green-500 mx-auto mb-1" size={20} />
          <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {times.onTime}%
          </div>
          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            בזמן
          </div>
        </div>
      </div>
      <div className={`mt-3 p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
        <div className="flex justify-between text-xs">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>מהיר ביותר</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.fastest}h</span>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>איטי ביותר</span>
          <span className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{times.slowest}h</span>
        </div>
      </div>
    </div>
  );
};

// Personalization Card
const PersonalizationCard = ({ data, darkMode }) => {
  const personalization = data || {
    overall: 82,
    learningPlan: 88,
    assessment: 76,
    feedback: 85,
    resources: 79
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        מדד התאמה אישית
      </h4>
      <div className="text-center mb-3">
        <div className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          {personalization.overall}%
        </div>
        <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          כללי
        </div>
      </div>
      <div className="space-y-2">
        {[
          { label: 'תכנית למידה', value: personalization.learningPlan },
          { label: 'הערכה', value: personalization.assessment },
          { label: 'משוב', value: personalization.feedback },
          { label: 'משאבים', value: personalization.resources }
        ].map((item, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {item.label}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-white/20 rounded-full">
                <div
                  className="h-full bg-teal-500 rounded-full"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Parent Engagement Card
const ParentEngagementCard = ({ data, darkMode }) => {
  const engagement = data || {
    level: 'medium',
    meetings: { attended: 3, total: 4 },
    communication: 8,
    responseRate: 75
  };

  const levelColors = {
    high: 'text-green-500 bg-green-500/20',
    medium: 'text-yellow-500 bg-yellow-500/20',
    low: 'text-red-500 bg-red-500/20'
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        מעורבות הורים
      </h4>
      <div className="text-center mb-3">
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${levelColors[engagement.level]}`}>
          {engagement.level === 'high' ? 'גבוהה' : engagement.level === 'medium' ? 'בינונית' : 'נמוכה'}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            פגישות
          </span>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {engagement.meetings.attended}/{engagement.meetings.total}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            תקשורת חודשית
          </span>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {engagement.communication}
          </span>
        </div>
        <div className="flex justify-between">
          <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            שיעור תגובה
          </span>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {engagement.responseRate}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Resource Utilization Card
const ResourceUtilizationCard = ({ data, darkMode }) => {
  const resources = data || [
    { name: 'מערכת דיגיטלית', usage: 85, effectiveness: 92 },
    { name: 'ספרי לימוד', usage: 78, effectiveness: 70 },
    { name: 'חונכות אישית', usage: 45, effectiveness: 88 }
  ];

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        ניצול משאבים
      </h4>
      <div className="space-y-3">
        {resources.map((resource, index) => (
          <div key={index} className={`p-2 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white/20'}`}>
            <div className={`text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {resource.name}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>שימוש</div>
                <div className="h-1 bg-white/20 rounded-full mt-1">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${resource.usage}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {resource.usage}%
                </div>
              </div>
              <div>
                <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>יעילות</div>
                <div className="h-1 bg-white/20 rounded-full mt-1">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${resource.effectiveness}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {resource.effectiveness}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Teaching Effectiveness Card
const TeachingEffectivenessCard = ({ data, darkMode }) => {
  const effectiveness = data || {
    overall: 88,
    engagement: 92,
    clarity: 85,
    support: 90,
    innovation: 78
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-white/30'}`}>
      <h4 className={`font-medium mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        אפקטיביות הוראה
      </h4>
      <div className="flex justify-center mb-3">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r="36"
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              className={darkMode ? "text-gray-700" : "text-gray-300"}
            />
            <circle
              cx="48"
              cy="48"
              r="36"
              strokeWidth="6"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - effectiveness.overall / 100)}`}
              className="text-cyan-500 transition-all duration-1000"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {effectiveness.overall}%
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <Sparkles className="text-yellow-500 mx-auto mb-1" size={16} />
          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>מעורבות</div>
          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {effectiveness.engagement}%
          </div>
        </div>
        <div className="text-center">
          <Eye className="text-blue-500 mx-auto mb-1" size={16} />
          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>בהירות</div>
          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {effectiveness.clarity}%
          </div>
        </div>
        <div className="text-center">
          <Heart className="text-red-500 mx-auto mb-1" size={16} />
          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>תמיכה</div>
          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {effectiveness.support}%
          </div>
        </div>
        <div className="text-center">
          <Lightbulb className="text-purple-500 mx-auto mb-1" size={16} />
          <div className={darkMode ? 'text-gray-400' : 'text-gray-600'}>חדשנות</div>
          <div className={`font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {effectiveness.innovation}%
          </div>
        </div>
      </div>
    </div>
  );
};