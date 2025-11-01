import { useState, useEffect } from 'react';
import {
  X,
  User,
  Brain,
  Award,
  Target,
  Calendar,
  BookOpen,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart,
  Heart,
  Lightbulb,
  Shield,
  Zap,
  Star,
  Activity,
  ChevronRight,
  Download,
  Printer,
  Users
} from 'lucide-react';
import * as API from '../services/googleAppsScriptAPI';

const StudentDetailModal = ({ student, onClose, darkMode, theme }) => {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch complete student data
    const fetchStudentDetails = async () => {
      try {
        const result = await API.getStudent(student.studentCode);
        if (result.success) {
          setFullData(result.student);
        } else {
          // Use the data we already have
          setFullData(student);
        }
      } catch (error) {
        console.error('Error fetching student details:', error);
        setFullData(student);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [student.studentCode]);

  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: User },
    { id: 'analysis', label: 'ניתוח AI', icon: Brain },
    { id: 'strengths', label: 'חוזקות', icon: Award },
    { id: 'challenges', label: 'אתגרים', icon: Target },
    { id: 'recommendations', label: 'המלצות', icon: Lightbulb },
    { id: 'progress', label: 'התקדמות', icon: TrendingUp },
  ];

  // Parse strengths and challenges from text
  const parseList = (text) => {
    if (!text) return [];
    return text.split('\n').filter(item => item.trim());
  };

  const strengths = parseList(fullData?.strengths || student.strengths);
  const challenges = parseList(fullData?.challenges || student.challenges);
  const recommendations = parseList(fullData?.recommendations);

  // Generate learning style color
  const getLearningStyleColor = (style) => {
    const styleColors = {
      'חזותי': 'from-blue-500 to-cyan-500',
      'שמיעתי': 'from-purple-500 to-pink-500',
      'קינסתטי': 'from-green-500 to-emerald-500',
      'חברתי': 'from-orange-500 to-yellow-500',
      'default': theme.primary
    };

    for (const [key, value] of Object.entries(styleColors)) {
      if (style?.includes(key)) return value;
    }
    return styleColors.default;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(fullData || student, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `student_${student.studentCode}_analysis.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
      onKeyDown={(e) => (e.key === 'Escape') && onClose()}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
    >
      <div
        className={`relative w-full max-w-[95vw] max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className={`relative h-48 bg-gradient-to-r ${getLearningStyleColor(student.learningStyle)} p-8`}>
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Close and action buttons */}
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={handleExport}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              title="Export data"
            >
              <Download size={20} className="text-white" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              title="Print"
            >
              <Printer size={20} className="text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Student header info */}
          <div className="relative z-10 flex items-end gap-6 h-full pb-4">
            <div className={`w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center`}>
              <User size={48} className="text-white" />
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-4xl font-bold mb-2">{student.name}</h1>
              <div className="flex items-center gap-4 text-white/90">
                <span className="flex items-center gap-1">
                  <Shield size={16} />
                  {student.studentCode}
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen size={16} />
                  {student.classId}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {student.date || 'רבעון 1'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 transition-all ${
                activeTab === tab.id
                  ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b-2 border-blue-500`
                  : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={`p-6 overflow-y-auto max-h-[calc(90vh-20rem)] ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Stats */}
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <BarChart size={20} className="text-blue-500" />
                      סטטיסטיקות מהירות
                    </h3>
                    <div className="space-y-3">
                      <StatRow
                        icon={Award}
                        label="חוזקות"
                        value={student.strengthsCount || strengths.length}
                        color="text-green-500"
                        darkMode={darkMode}
                      />
                      <StatRow
                        icon={Target}
                        label="אתגרים"
                        value={student.challengesCount || challenges.length}
                        color="text-amber-500"
                        darkMode={darkMode}
                      />
                      <StatRow
                        icon={Brain}
                        label="סגנון למידה"
                        value={student.learningStyle}
                        color="text-purple-500"
                        darkMode={darkMode}
                      />
                      <StatRow
                        icon={Activity}
                        label="סטטוס ניתוח"
                        value={student.needsAnalysis ? 'דורש עדכון' : 'מעודכן'}
                        color={student.needsAnalysis ? 'text-red-500' : 'text-green-500'}
                        darkMode={darkMode}
                      />
                    </div>
                  </div>

                  {/* Key Notes */}
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Sparkles size={20} className="text-yellow-500" />
                      הערות מפתח
                    </h3>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                      <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
                        {student.keyNotes || 'אין הערות מיוחדות עבור תלמיד זה כרגע.'}
                      </p>
                    </div>
                  </div>

                  {/* Learning Style Visualization */}
                  <div className={`p-6 rounded-2xl col-span-full ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Brain size={20} className="text-indigo-500" />
                      פרופיל למידה
                    </h3>
                    <div className={`p-8 rounded-xl bg-gradient-to-r ${getLearningStyleColor(student.learningStyle)} bg-opacity-10`}>
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${getLearningStyleColor(student.learningStyle)} mb-4`}>
                          <Brain size={36} className="text-white" />
                        </div>
                        <h4 className={`text-2xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {student.learningStyle}
                        </h4>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          סגנון הלמידה המועדף של התלמיד
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Brain size={20} className="text-purple-500" />
                      ניתוח AI מלא
                    </h3>
                    <div className={`prose max-w-none ${darkMode ? 'prose-invert' : ''}`}>
                      <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
                          {fullData?.fullAnalysis || student.keyNotes || 'ניתוח מפורט יופיע כאן לאחר עיבוד המידע.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Metadata */}
                  <div className="grid grid-cols-3 gap-4">
                    <MetricCard
                      icon={Calendar}
                      label="תאריך ניתוח"
                      value={student.date || 'לא זמין'}
                      darkMode={darkMode}
                    />
                    <MetricCard
                      icon={Clock}
                      label="עדכון אחרון"
                      value={student.lastActivity || student.date || 'לא זמין'}
                      darkMode={darkMode}
                    />
                    <MetricCard
                      icon={CheckCircle}
                      label="סטטוס"
                      value={student.needsAnalysis ? 'דורש עדכון' : 'מעודכן'}
                      valueColor={student.needsAnalysis ? 'text-red-500' : 'text-green-500'}
                      darkMode={darkMode}
                    />
                  </div>
                </div>
              )}

              {/* Strengths Tab */}
              {activeTab === 'strengths' && (
                <div className="space-y-4">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Award size={20} className="text-green-500" />
                      חוזקות מזוהות ({strengths.length})
                    </h3>
                    <div className="space-y-3">
                      {strengths.length > 0 ? (
                        strengths.map((strength, index) => (
                          <ItemCard
                            key={index}
                            icon={Star}
                            text={strength}
                            color="green"
                            darkMode={darkMode}
                          />
                        ))
                      ) : (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          לא זוהו חוזקות עדיין. הרץ ניתוח AI כדי לזהות חוזקות.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Challenges Tab */}
              {activeTab === 'challenges' && (
                <div className="space-y-4">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Target size={20} className="text-amber-500" />
                      אתגרים לטיפול ({challenges.length})
                    </h3>
                    <div className="space-y-3">
                      {challenges.length > 0 ? (
                        challenges.map((challenge, index) => (
                          <ItemCard
                            key={index}
                            icon={AlertCircle}
                            text={challenge}
                            color="amber"
                            darkMode={darkMode}
                          />
                        ))
                      ) : (
                        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          לא זוהו אתגרים עדיין. הרץ ניתוח AI כדי לזהות אתגרים.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Lightbulb size={20} className="text-blue-500" />
                      המלצות פדגוגיות
                    </h3>
                    <div className="space-y-3">
                      {recommendations.length > 0 ? (
                        recommendations.map((rec, index) => (
                          <ItemCard
                            key={index}
                            icon={ChevronRight}
                            text={rec}
                            color="blue"
                            darkMode={darkMode}
                          />
                        ))
                      ) : (
                        <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            המלצות מותאמות אישית יופיעו כאן לאחר ניתוח מלא של התלמיד.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Teaching Strategies */}
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Zap size={20} className="text-yellow-500" />
                      אסטרטגיות הוראה מומלצות
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <StrategyCard
                        icon={Heart}
                        title="גישה רגשית"
                        description="חיזוק חיובי ותמיכה רגשית"
                        darkMode={darkMode}
                      />
                      <StrategyCard
                        icon={Brain}
                        title="התאמה קוגניטיבית"
                        description="התאמת חומר לסגנון הלמידה"
                        darkMode={darkMode}
                      />
                      <StrategyCard
                        icon={Users}
                        title="למידה שיתופית"
                        description="עבודה בקבוצות קטנות"
                        darkMode={darkMode}
                      />
                      <StrategyCard
                        icon={Activity}
                        title="למידה פעילה"
                        description="שילוב פעילויות מעשיות"
                        darkMode={darkMode}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <TrendingUp size={20} className="text-green-500" />
                      מעקב התקדמות
                    </h3>
                    <div className="text-center py-12">
                      <Activity size={48} className={`mx-auto mb-4 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        מעקב התקדמות יהיה זמין בקרוב
                      </p>
                      <p className={`text-sm mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                        כאן יוצגו גרפים ונתונים על התקדמות התלמיד לאורך זמן
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const StatRow = ({ icon: Icon, label, value, color, darkMode }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <Icon size={18} className={color} />
      <span className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
    </div>
    <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</span>
  </div>
);

const MetricCard = ({ icon: Icon, label, value, valueColor, darkMode }) => (
  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{label}</span>
    </div>
    <p className={`font-semibold ${valueColor || (darkMode ? 'text-white' : 'text-gray-900')}`}>
      {value}
    </p>
  </div>
);

const ItemCard = ({ icon: Icon, text, color, darkMode }) => {
  const colors = {
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
      <div className={`p-2 rounded-lg ${colors[color]}`}>
        <Icon size={16} />
      </div>
      <p className={`flex-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{text}</p>
    </div>
  );
};

const StrategyCard = ({ icon: Icon, title, description, darkMode }) => (
  <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-white'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
    <Icon size={20} className="text-blue-500 mb-2" />
    <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{title}</h4>
    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
  </div>
);

export default StudentDetailModal;