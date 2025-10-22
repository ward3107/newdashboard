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
  Heart,
  Lightbulb,
  Shield,
  Zap,
  Star,
  Activity,
  ChevronRight,
  Bell,
  MessageCircle,
  ListChecks,
  CheckSquare,
  Square,
  Send,
  Plus,
  Trash2,
  Edit2,
  Save,
  Download,
  Printer
} from 'lucide-react';
import * as API from '../services/googleAppsScriptAPI';
import EnhancedAnalysisDisplay from './EnhancedAnalysisDisplay';

const EnhancedStudentDetail = ({ student, onClose, darkMode, theme, assignments = [] }) => {
  const [fullData, setFullData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [tasks, setTasks] = useState([]);
  const [customTask, setCustomTask] = useState('');
  const [reminder, setReminder] = useState({ enabled: false, date: '' });

  useEffect(() => {
    // Fetch complete student data
    const fetchStudentDetails = async () => {
      try {
        const result = await API.getStudent(student.studentCode);
        console.log('📊 API Response for student:', student.studentCode, result);

        if (result.success) {
          console.log('✅ Student data received:', result.student);
          console.log('🔍 Has insights?', result.student?.insights ? 'YES' : 'NO');
          if (result.student?.insights) {
            console.log('📋 Insights count:', result.student.insights.length);
          }
          setFullData(result.student);
          // Generate AI tasks based on analysis
          generateAITasks(result.student);
        } else {
          console.log('⚠️ API returned unsuccessful, using basic student data');
          setFullData(student);
          generateAITasks(student);
        }
      } catch (error) {
        console.error('❌ Error fetching student details:', error);
        setFullData(student);
        generateAITasks(student);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [student.studentCode]);

  // Generate AI-suggested tasks based on student analysis
  const generateAITasks = (studentData) => {
    const generatedTasks = [];

    // Priority 1: Address critical challenges
    if (studentData.challengesCount >= 5) {
      generatedTasks.push({
        id: 1,
        text: 'פגישה אישית עם התלמיד לדיון באתגרים המרכזיים',
        priority: 'high',
        category: 'intervention',
        completed: false,
        aiReason: 'התלמיד מתמודד עם מספר רב של אתגרים שדורשים תשומת לב מיידית'
      });
    }

    // Priority 2: Learning style adaptation
    if (studentData.learningStyle) {
      generatedTasks.push({
        id: 2,
        text: `התאמת חומרי למידה לסגנון ${studentData.learningStyle}`,
        priority: 'medium',
        category: 'adaptation',
        completed: false,
        aiReason: 'התאמת שיטות ההוראה לסגנון הלמידה המועדף תשפר את ההבנה'
      });
    }

    // Priority 3: Strengthen strengths
    if (studentData.strengthsCount >= 3) {
      generatedTasks.push({
        id: 3,
        text: 'מתן אתגרים נוספים בתחומי החוזק להעמקת הלמידה',
        priority: 'low',
        category: 'enrichment',
        completed: false,
        aiReason: 'חיזוק נקודות החוזק יעזור לבנות ביטחון עצמי'
      });
    }

    // Priority 4: Parent communication
    if (studentData.needsAnalysis || studentData.challengesCount >= 3) {
      generatedTasks.push({
        id: 4,
        text: 'עדכון הורים על ההתקדמות והאתגרים',
        priority: 'medium',
        category: 'communication',
        completed: false,
        aiReason: 'שיתוף ההורים חיוני להצלחת התהליך'
      });
    }

    setTasks(generatedTasks);
  };

  const toggleTask = (taskId) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const addCustomTask = () => {
    if (customTask.trim()) {
      const newTask = {
        id: Date.now(),
        text: customTask,
        priority: 'medium',
        category: 'custom',
        completed: false,
        aiReason: null
      };
      setTasks([...tasks, newTask]);
      setCustomTask('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const setReminderDate = () => {
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);
    setReminder({
      enabled: true,
      date: oneWeekFromNow.toISOString().split('T')[0]
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const content = `
תלמיד: ${student.studentCode}
כיתה: ${student.classId}
תאריך: ${student.date || 'רבעון 1'}

חוזקות: ${student.strengthsCount || 0}
${fullData?.strengths ? fullData.strengths.join('\n') : student.strengths || ''}

אתגרים: ${student.challengesCount || 0}
${fullData?.challenges ? fullData.challenges.join('\n') : student.challenges || ''}

סגנון למידה: ${student.learningStyle || 'לא זוהה'}

ניתוח:
${fullData?.analysis || student.keyNotes || 'טרם בוצע ניתוח'}

משימות:
${tasks.map(t => `${t.completed ? '✅' : '⬜'} ${t.text}`).join('\n')}
    `;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `student_${student.studentCode}_report.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'overview', label: 'סקירה כללית', icon: User },
    { id: 'analysis', label: 'ניתוח מפורט', icon: Brain },
    { id: 'tasks', label: 'משימות ומעקב', icon: ListChecks },
    { id: 'progress', label: 'התקדמות', icon: TrendingUp },
  ];

  // Parse analysis into categories
  const parseAnalysis = (text) => {
    if (!text) return {};

    const categories = {
      academic: [],
      social: [],
      emotional: [],
      behavioral: [],
      recommendations: []
    };

    // Simple categorization based on keywords
    const lines = text.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      if (line.includes('למידה') || line.includes('אקדמ') || line.includes('ציונ')) {
        categories.academic.push(line);
      } else if (line.includes('חברת') || line.includes('חבר') || line.includes('קשר')) {
        categories.social.push(line);
      } else if (line.includes('רגש') || line.includes('הרגש') || line.includes('פחד')) {
        categories.emotional.push(line);
      } else if (line.includes('התנהג') || line.includes('משמע')) {
        categories.behavioral.push(line);
      } else {
        categories.recommendations.push(line);
      }
    });

    return categories;
  };

  const categories = parseAnalysis(fullData?.analysis || student.keyNotes);

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'text-red-500 bg-red-100 border-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 border-green-300';
      default: return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl ${
          darkMode ? 'bg-gray-900' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`relative h-32 bg-gradient-to-r ${theme.primary} p-6`}>
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Action buttons on the left side */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <button
              onClick={handleDownload}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              title="הורד דוח"
            >
              <Download size={24} className="text-white" />
            </button>
            <button
              onClick={handlePrint}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              title="הדפס"
            >
              <Printer size={24} className="text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 backdrop-blur-md rounded-xl hover:bg-white/30 transition-all"
              title="סגור"
            >
              <X size={24} className="text-white" />
            </button>
          </div>

          {/* Student header info */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="text-4xl bg-white/20 backdrop-blur-md w-16 h-16 rounded-2xl flex items-center justify-center">
              {student.needsAnalysis ? "📝" : "⭐"}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{student.studentCode}</h1>
              <div className="flex items-center gap-3 text-white/90">
                <span>{student.classId}</span>
                <span>•</span>
                <span>{student.date || 'רבעון 1'}</span>
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
              className={`flex items-center gap-1.5 px-4 py-2 transition-all ${
                activeTab === tab.id
                  ? `${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} border-b-2 border-blue-500`
                  : `${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
              }`}
            >
              <tab.icon size={16} />
              <span className="font-medium text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className={`p-6 overflow-y-auto max-h-[calc(90vh-14rem)] ${
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
                <div className="space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="text-green-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>חוזקות</span>
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.strengthsCount || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="text-amber-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>אתגרים</span>
                      </div>
                      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.challengesCount || 0}
                      </p>
                    </div>
                    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="text-purple-500" size={20} />
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>סגנון למידה</span>
                      </div>
                      <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {student.learningStyle || 'לא זוהה'}
                      </p>
                    </div>
                  </div>

                  {/* Summary - Display ISHEBOT summary if available */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Sparkles className="text-yellow-500" size={20} />
                      סיכום כללי
                    </h3>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} leading-relaxed text-right`} dir="rtl">
                      {fullData?.ishebotReport?.summary || fullData?.summary || student.keyNotes || 'טרם בוצע ניתוח מלא עבור תלמיד זה'}
                    </p>
                  </div>
                </div>
              )}

              {/* Analysis Tab - Enhanced Analysis */}
              {activeTab === 'analysis' && (
                <EnhancedAnalysisDisplay
                  studentData={fullData || student}
                  darkMode={darkMode}
                  theme={theme}
                />
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Recommendation Assignments - Show assignments from the recommendations tab */}
                  {(() => {
                    const studentAssignments = JSON.parse(localStorage.getItem(`assignments_${student.studentCode}`) || '[]');
                    return studentAssignments.length > 0 && (
                      <div className={`p-6 rounded-xl ${darkMode ? 'bg-blue-900/20 border-2 border-blue-700' : 'bg-blue-50 border-2 border-blue-300'}`}>
                        <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          <Target className="text-blue-500" size={20} />
                          משימות מהמלצות ({studentAssignments.length})
                        </h3>

                        <div className="space-y-3">
                          {studentAssignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className={`p-4 rounded-lg border ${
                                assignment.status === 'completed'
                                  ? darkMode ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-300'
                                  : darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                {assignment.status === 'completed' ? (
                                  <CheckCircle className="text-green-500 flex-shrink-0 mt-1" size={20} />
                                ) : (
                                  <Clock className="text-blue-500 flex-shrink-0 mt-1" size={20} />
                                )}

                                <div className="flex-1">
                                  <p className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {assignment.recommendation}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={`px-2 py-1 rounded-full ${
                                      assignment.priority === 'high'
                                        ? 'bg-red-100 text-red-700'
                                        : assignment.priority === 'medium'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-green-100 text-green-700'
                                    }`}>
                                      {assignment.priority === 'high' ? 'דחוף' : assignment.priority === 'medium' ? 'בינוני' : 'נמוך'}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      📅 {new Date(assignment.reminderDate).toLocaleDateString('he-IL')}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full ${
                                      darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                                    }`}>
                                      📂 {assignment.category}
                                    </span>
                                    {assignment.status === 'completed' && (
                                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-700">
                                        ✅ הושלם
                                      </span>
                                    )}
                                  </div>
                                  {assignment.rating && (
                                    <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white'}`}>
                                      <div className="flex items-center gap-2 mb-2">
                                        <Star className="text-yellow-500" size={16} />
                                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                          דירוג: {assignment.rating.successLevel}/5
                                        </span>
                                      </div>
                                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        {assignment.rating.observedChanges}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* AI Suggested Tasks */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Zap className="text-yellow-500" size={20} />
                      משימות מומלצות ע״י AI
                    </h3>

                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTask(task.id)}
                              className="mt-1"
                            >
                              {task.completed ? (
                                <CheckSquare className="text-green-500" size={20} />
                              ) : (
                                <Square className={darkMode ? "text-gray-400" : "text-gray-500"} size={20} />
                              )}
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className={`${task.completed ? 'line-through opacity-60' : ''} ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {task.text}
                                </p>
                                <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                                  {task.priority === 'high' ? 'דחוף' : task.priority === 'medium' ? 'בינוני' : 'נמוך'}
                                </span>
                              </div>

                              {task.aiReason && (
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                                  💡 {task.aiReason}
                                </p>
                              )}
                            </div>

                            {task.category === 'custom' && (
                              <button
                                onClick={() => deleteTask(task.id)}
                                className={`p-1 hover:bg-red-100 rounded ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Custom Task */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={customTask}
                        onChange={(e) => setCustomTask(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addCustomTask()}
                        placeholder="הוסף משימה חדשה..."
                        className={`flex-1 px-4 py-2 rounded-lg ${
                          darkMode
                            ? 'bg-gray-700 text-white border-gray-600'
                            : 'bg-white text-gray-900 border-gray-300'
                        } border`}
                      />
                      <button
                        onClick={addCustomTask}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        הוסף
                      </button>
                    </div>
                  </div>

                  {/* Reminder Section */}
                  <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Bell className="text-blue-500" size={20} />
                      תזכורת למעקב
                    </h3>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={setReminderDate}
                        className={`px-4 py-2 rounded-lg ${
                          reminder.enabled
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {reminder.enabled ? '✓ תזכורת הוגדרה' : 'הגדר תזכורת לשבוע הבא'}
                      </button>

                      {reminder.enabled && (
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          {reminder.date}
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              )}

              {/* Progress Tab */}
              {activeTab === 'progress' && (
                <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Activity size={48} className="mx-auto mb-4 opacity-50" />
                  <p>מעקב התקדמות יהיה זמין בקרוב</p>
                  <p className="text-sm mt-2">כאן יוצגו גרפים ונתונים על השיפור לאורך זמן</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Category Section Component
const CategorySection = ({ title, icon: Icon, items, color, darkMode }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
    pink: 'bg-pink-500/20 border-pink-500/30 text-pink-400',
    purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
    green: 'bg-green-500/20 border-green-500/30 text-green-400',
    yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
    amber: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  };

  return (
    <div className={`p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <h3 className={`text-lg font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        <Icon className={`text-${color}-500`} size={20} />
        {title}
      </h3>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className={`p-3 rounded-lg ${colorClasses[color]} border`}>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EnhancedStudentDetail;