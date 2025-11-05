import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowRight,
  Download,
  Printer,
  Mail,
  User,
  Brain,
  Target,
  Award,
  Clock,
  Timer,
  MapPin,
  Users,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Lightbulb
} from 'lucide-react';

// API - Using new unified API that supports both Firebase and Google Sheets
import { getStudent } from '../../services/api';

// Utils
import { exportStudentDetailToPDF, generatePrintHTML } from '../../utils/exportUtils';

// Components
import InsightCard from './InsightCard';
import ISHEBOTReportDisplay from './ISHEBOTReportDisplay';

const StudentDetail = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // State
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    ishebotReport: true,
    insights: true,
    actions: true,
    seating: true
  });
  const [completedActions, setCompletedActions] = useState(new Set());

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const loadStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // getStudent returns ApiResponse<DetailedStudent>
      const response = await getStudent(studentId);

      if (response.success && response.data) {
        setStudent(response.data);
      } else {
        throw new Error(response.error || 'Failed to load student data');
      }
    } catch (err) {
      console.error('Error loading student:', err);
      setError(err.message);
      toast.error('שגיאה בטעינת נתוני התלמיד');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleAction = (actionIndex) => {
    setCompletedActions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(actionIndex)) {
        newSet.delete(actionIndex);
        toast.success('פעולה בוטלה');
      } else {
        newSet.add(actionIndex);
        toast.success('פעולה הושלמה!');
      }
      return newSet;
    });
  };

  const handleExportPDF = async () => {
    try {
      await exportStudentDetailToPDF(student);
      toast.success('קובץ PDF נוצר בהצלחה');
    } catch (err) {
      toast.error('שגיאה בייצוא PDF');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(generatePrintHTML(student));
    printWindow.document.close();
    printWindow.print();
  };

  const handleSendEmail = () => {
    const subject = `דוח ניתוח תלמיד - ${student.studentCode}`;
    const body = `שלום,\n\nמצורף דוח ניתוח עבור התלמיד ${student.studentCode}\n\nבברכה,`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const getSectionIcon = (section) => {
    switch (section) {
      case 'summary': return Brain;
      case 'insights': return Lightbulb;
      case 'actions': return Target;
      case 'seating': return MapPin;
      default: return Brain;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">שגיאה בטעינת הנתונים</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            חזור
          </button>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">תלמיד לא נמצא</h2>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            חזור
          </button>
        </div>
      </div>
    );
  }

  const completedActionsCount = completedActions.size;
  const totalActions = student.immediate_actions?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4 space-x-reverse">
              <motion.button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 space-x-reverse text-gray-600 hover:text-gray-900 transition-colors"
                whileHover={{ x: -5 }}
              >
                <ArrowRight className="w-5 h-5" />
                <span>חזרה</span>
              </motion.button>

              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  👨‍🎓 תלמיד {student.studentCode}
                </h1>
                <div className="flex items-center space-x-3 space-x-reverse text-gray-600">
                  <span className="font-medium">🆔 #{student.studentCode}</span>
                  <span className="text-gray-400">|</span>
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full text-sm font-medium shadow-sm">
                    🏫 {student.classId}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span>📅 {student.quarter}</span>
                  <span className="text-gray-400">|</span>
                  <span>🗓️ {student.date}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 space-x-reverse print:hidden">
              <motion.button
                onClick={handlePrint}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Printer className="w-4 h-4" />
                <span>הדפס</span>
              </motion.button>

              <motion.button
                onClick={handleSendEmail}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-4 h-4" />
                <span>שלח למורה</span>
              </motion.button>

              <motion.button
                onClick={handleExportPDF}
                className="flex items-center space-x-2 space-x-reverse px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download className="w-4 h-4" />
                <span>שמור PDF</span>
              </motion.button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalActions > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  ✅ התקדמות פעולות: {completedActionsCount}/{totalActions}
                </span>
                <span className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-bold">
                  🎯 {Math.round((completedActionsCount / totalActions) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedActionsCount / totalActions) * 100}%` }}
                  className="bg-gradient-to-r from-green-400 via-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500 shadow-md"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Student Summary Section */}
        {student.student_summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6"
          >
            <button
              onClick={() => toggleSection('summary')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <Brain className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-bold text-gray-900">סיכום התלמיד</h2>
              </div>
              {expandedSections.summary ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {expandedSections.summary && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Learning Style */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                          <span className="text-2xl ml-2">🧠</span>
                          סגנון למידה
                        </h3>
                        <p className="text-blue-800 text-base leading-relaxed text-right">
                          {student.student_summary.learning_style}
                        </p>
                      </div>

                      {/* Strengths */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border-2 border-green-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                          <span className="text-2xl ml-2">💪</span>
                          חוזקות
                        </h3>
                        <ul className="space-y-2">
                          {student.student_summary.strengths?.map((strength, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-green-700 flex items-start"
                            >
                              <span className="text-lg ml-2">⭐</span>
                              {strength}
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      {/* Challenges */}
                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center">
                          <span className="text-2xl ml-2">🎯</span>
                          אתגרים
                        </h3>
                        <ul className="space-y-2">
                          {student.student_summary.challenges?.map((challenge, index) => (
                            <motion.li
                              key={index}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="text-amber-700 flex items-start"
                            >
                              <AlertCircle className="w-4 h-4 mt-0.5 ml-2 flex-shrink-0" />
                              {challenge}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Key Notes */}
                    {student.student_summary.key_notes && (
                      <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h3 className="text-lg font-semibold text-purple-800 mb-2">הערות מפתח</h3>
                        <p className="text-purple-700 leading-relaxed">
                          {student.student_summary.key_notes}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ISHEBOT Analysis Report Section */}
        {student.analysis_engine === 'ISHEBOT' && student.insights && student.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-indigo-200 mb-6"
          >
            <button
              onClick={() => toggleSection('ishebotReport')}
              className="w-full p-6 flex items-center justify-between hover:bg-white/50 transition-colors rounded-t-xl"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-indigo-900">דוח ניתוח ISHEBOT מלא</h2>
                  <p className="text-sm text-indigo-700">ניתוח פדגוגי מקיף מבוסס בינה מלאכותית</p>
                </div>
              </div>
              {expandedSections.ishebotReport ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-indigo-600" />}
            </button>

            <AnimatePresence>
              {expandedSections.ishebotReport && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <ISHEBOTReportDisplay report={student} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Insights Section */}
        {student.insights && student.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6"
          >
            <button
              onClick={() => toggleSection('insights')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <Lightbulb className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-bold text-gray-900">תובנות פדגוגיות</h2>
              </div>
              {expandedSections.insights ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {expandedSections.insights && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-6">
                    {student.insights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} index={index} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Immediate Actions Section */}
        {student.immediate_actions && student.immediate_actions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6"
          >
            <button
              onClick={() => toggleSection('actions')}
              className="w-full p-6 hover:bg-gray-50 transition-colors rounded-t-xl text-right"
            >
              <div className="flex items-center justify-between w-full">
                {/* Right Side - Icon and Title */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex flex-col items-start gap-2">
                    <h2 className="text-xl font-bold text-gray-900 text-right leading-tight">פעולות מיידיות</h2>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold whitespace-nowrap">
                        {completedActionsCount}/{totalActions} הושלמו
                      </span>
                    </div>
                  </div>
                </div>

                {/* Left Side - Chevron */}
                <div className="flex-shrink-0 mr-4">
                  {expandedSections.actions ? (
                    <ChevronUp className="w-6 h-6 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </div>
            </button>

            <AnimatePresence>
              {expandedSections.actions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 space-y-4">
                    {student.immediate_actions.map((action, index) => {
                      const isCompleted = completedActions.has(index);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`
                            border rounded-lg p-4 transition-all duration-300
                            ${isCompleted
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                            }
                          `}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 space-x-reverse mb-2">
                                <motion.button
                                  onClick={() => toggleAction(index)}
                                  className={`
                                    w-6 h-6 rounded-full border-2 flex items-center justify-center
                                    transition-all duration-200
                                    ${isCompleted
                                      ? 'bg-green-500 border-green-500'
                                      : 'border-gray-300 hover:border-green-400'
                                    }
                                  `}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                >
                                  {isCompleted && <CheckCircle className="w-4 h-4 text-white" />}
                                </motion.button>
                                <h3 className={`
                                  text-lg font-semibold transition-colors
                                  ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}
                                `}>
                                  {index + 1}. {action.what}
                                </h3>
                              </div>

                              <div className="mr-9 space-y-2">
                                <div className="flex items-start space-x-2 space-x-reverse">
                                  <span className="text-sm font-medium text-gray-600 min-w-fit">איך:</span>
                                  <p className="text-sm text-gray-700">{action.how}</p>
                                </div>
                                <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-600">
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Clock className="w-4 h-4" />
                                    <span>מתי: {action.when}</span>
                                  </div>
                                  <div className="flex items-center space-x-1 space-x-reverse">
                                    <Timer className="w-4 h-4" />
                                    <span>זמן: {action.time}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Seating Arrangement Section */}
        {student.seating_arrangement && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg border border-gray-100"
          >
            <button
              onClick={() => toggleSection('seating')}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3 space-x-reverse">
                <MapPin className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">סידור ישיבה</h2>
              </div>
              {expandedSections.seating ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            <AnimatePresence>
              {expandedSections.seating && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                          <MapPin className="w-5 h-5 ml-2" />
                          מיקום מומלץ
                        </h3>
                        <p className="text-blue-700">{student.seating_arrangement.location}</p>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                        <h3 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                          <Users className="w-5 h-5 ml-2" />
                          שותף מומלץ
                        </h3>
                        <p className="text-green-700">{student.seating_arrangement.partner_type}</p>
                      </div>

                      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                        <h3 className="text-lg font-semibold text-red-800 mb-2 flex items-center">
                          <AlertCircle className="w-5 h-5 ml-2" />
                          להימנע
                        </h3>
                        <p className="text-red-700">{student.seating_arrangement.avoid}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;