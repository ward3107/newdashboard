import React, { useState, useEffect } from 'react';
import {
  Shield,
  Database,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Settings,
  Play,
  Archive,
  FileText,
  Zap
} from 'lucide-react';
import * as API from '../services/api';

const AdminControlPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [backups, setBackups] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adminToken, setAdminToken] = useState(import.meta.env.VITE_ADMIN_TOKEN || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [deleteOlderThan, setDeleteOlderThan] = useState(30);
  const [singleStudentCode, setSingleStudentCode] = useState('');
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const statsRes = await API.getStats();

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }

      // healthCheck is only available with Google Apps Script API
      // When using Firestore, skip health check
      if (API.healthCheck) {
        const healthRes = await API.healthCheck();
        if (healthRes) setHealth(healthRes);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading dashboard data:', error);
      }
    }
  };

  const loadBackups = async () => {
    try {
      const result = await API.listBackups();
      if (result.backups) {
        setBackups(result.backups);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading backups:', error);
      }
    }
  };

  const loadAuditLog = async () => {
    try {
      const result = await API.getAuditLog();
      if (result.events) {
        setAuditLog(result.events);
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading audit log:', error);
      }
    }
  };

  // Analysis Operations
  const handleAnalyzeAll = async () => {
    if (!confirm(`האם אתה בטוח שברצונך לנתח את כל התלמידים שטרם נותחו?\nזה עלול לקחת זמן ולצרוך API tokens.`)) return;

    setLoading(true);
    try {
      const result = await API.analyzeAllUnanalyzed();
      alert(`✅ Success!\nנותחו: ${result.analyzed} תלמידים\nנכשלו: ${result.failed || 0}`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleStandardBatch = async () => {
    setLoading(true);
    try {
      const result = await API.standardBatch();
      alert(`✅ Batch Analysis Complete!\nAnalyzed: ${result.analyzed}`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Delete Operations
  const handleDeleteOld = async () => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק ניתוחים ישנים מ-${deleteOlderThan} ימים?`)) return;

    setLoading(true);
    try {
      const result = await API.deleteOldAnalyses(deleteOlderThan);
      alert(`✅ נמחקו ${result.deleted} ניתוחים`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteByClass = async () => {
    if (!selectedClass) {
      alert('בחר כיתה למחיקה');
      return;
    }

    if (!confirm(`האם אתה בטוח שברצונך למחוק את כל הניתוחים של כיתה ${selectedClass}?`)) return;

    setLoading(true);
    try {
      const result = await API.deleteByClass(selectedClass);
      alert(`✅ נמחקו ${result.deleted} ניתוחים מכיתה ${selectedClass}`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!adminToken) {
      alert('נדרש Admin Token למחיקת כל הניתוחים');
      return;
    }

    const confirmation = prompt(
      `⚠️ אזהרה!\nזה ימחק את כל הניתוחים!\nגיבוי אוטומטי ייווצר.\n\nהקלד "DELETE ALL" לאישור:`
    );

    if (confirmation !== 'DELETE ALL') return;

    setLoading(true);
    try {
      const result = await API.deleteAllAnalysesWithToken(adminToken);
      alert(`✅ נמחקו ${result.deleted} ניתוחים\nגיבוי: ${result.backup}`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Backup Operations
  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const result = await API.backupAnalyses();
      alert(`✅ Backup Created!\n${result.backupName}`);
      await loadBackups();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupId) => {
    if (!adminToken) {
      alert('נדרש Admin Token לשחזור גיבוי');
      return;
    }

    if (!confirm('האם אתה בטוח שברצונך לשחזר גיבוי זה?\nזה יחליף את כל הנתונים הנוכחיים!')) return;

    setLoading(true);
    try {
      const result = await API.restoreFromBackupWithToken(backupId, adminToken);
      alert(`✅ ${result.message}`);
      await loadDashboardData();
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Export Operations
  const handleExport = async (format) => {
    setLoading(true);
    try {
      const result = await API.exportAnalyses(format);

      if (format === 'json') {
        const dataStr = JSON.stringify(result.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `analyses_${new Date().toISOString()}.json`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(result.data);
        const exportFileDefaultName = `analyses_${new Date().toISOString()}.csv`;

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }

      alert('✅ קובץ יוצא בהצלחה!');
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Search Operation
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const result = await API.searchAnalyses(searchQuery);
      // You can display results in a modal or dedicated section
      alert(`נמצאו ${result.count} תוצאות עבור "${searchQuery}"`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Single Student Analysis
  const handleAnalyzeSingleStudent = async () => {
    if (!singleStudentCode.trim()) {
      alert('הזן קוד תלמיד');
      return;
    }

    setLoading(true);
    try {
      const result = await API.analyzeOneStudent(singleStudentCode.trim());
      if (result.success) {
        alert(`✅ Success!\n\nהתלמיד ${singleStudentCode} נותח בהצלחה!\n\n📊 התוצאות נשמרו ב-Google Sheets\n🔄 הדשבורד הראשי יתעדכן אוטומטית בקרוב\n\nטיפ: לחץ על כפתור "רענן" בדשבורד הראשי כדי לראות את התוצאות מיד.`);
        setSingleStudentCode('');
        await loadDashboardData();

        // Notify main dashboard to refresh (if it's open in another tab/window)
        // This uses localStorage as a cross-tab communication mechanism
        localStorage.setItem('dashboardRefreshTrigger', Date.now().toString());

        // Also trigger custom event for same-tab refresh
        window.dispatchEvent(new CustomEvent('dashboardRefresh'));
      } else {
        alert(`❌ Error: ${result.error || result.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Diagnostic Test
  const handleDiagnosticTest = async () => {
    setLoading(true);
    setDiagnosticResult(null);

    try {
      const [testResult, healthResult] = await Promise.all([
        API.testConnection(),
        API.healthCheck()
      ]);

      const diagnostic = {
        apiReachable: testResult.success,
        hasOpenAIKey: healthResult.rateLimit?.hasKey || false,
        sheets: healthResult.sheets || {},
        stats: healthResult.stats || {},
        timestamp: testResult.timestamp
      };

      setDiagnosticResult(diagnostic);

      // Show summary alert
      if (diagnostic.apiReachable && diagnostic.hasOpenAIKey) {
        alert('✅ כל המערכות תקינות!\n\nה-API פעיל\nמפתח OpenAI מוגדר\nהגליונות נגישים');
      } else if (diagnostic.apiReachable && !diagnostic.hasOpenAIKey) {
        alert('⚠️ בעיה: מפתח OpenAI חסר!\n\nצעדים לפתרון:\n1. פתח את Google Apps Script\n2. לחץ על Project Settings\n3. הוסף Script Property:\n   Key: OPENAI_API_KEY\n   Value: sk-your-api-key');
      } else {
        alert('❌ לא ניתן להתחבר ל-API\n\nבדוק:\n1. האם ה-script פרוס?\n2. האם ה-URL בסדר?');
      }
    } catch (error) {
      setDiagnosticResult({ error: error.message });
      alert(`❌ Diagnostic Failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sync Operations
  const handleSync = async () => {
    setLoading(true);
    try {
      const result = await API.syncStudents();
      alert(`✅ ${result.message}\nנוספו: ${result.added} תלמידים`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSync = async () => {
    if (!confirm('האם אתה בטוח? זה יבדוק את כל תלמידי המערכת.')) return;

    setLoading(true);
    try {
      const result = await API.initialSync();
      alert(`✅ ${result.message}`);
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  לוח בקרה מנהלים
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  שליטה מלאה בניתוחי ISHEBOT
                </p>
              </div>
            </div>

            {health && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-700 dark:text-green-300">
                  מערכת פעילה
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">סה&quot;כ תלמידים</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {stats.totalStudents}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">נותחו</p>
                  <p className="text-3xl font-bold text-green-600">
                    {stats.analyzedStudents}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ממתינים לניתוח</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {stats.unanalyzedStudents}
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-500" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">ממוצע חוזקות</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.averageStrengths}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'סקירה', icon: Activity },
              { id: 'analyze', label: 'ניתוח', icon: Zap },
              { id: 'delete', label: 'מחיקה', icon: Trash2 },
              { id: 'backup', label: 'גיבוי', icon: Archive },
              { id: 'export', label: 'יצוא', icon: Download },
              { id: 'logs', label: 'יומנים', icon: FileText }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'backup') loadBackups();
                  if (tab.id === 'logs') loadAuditLog();
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  סקירת מערכת
                </h2>

                {health && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        גליונות
                      </h3>
                      {Object.entries(health.sheets).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600 dark:text-gray-300">{key}:</span>
                          <span className={value.exists ? 'text-green-600' : 'text-red-600'}>
                            {value.exists ? `✓ (${value.rowCount} שורות)` : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        מצב API
                      </h3>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">OpenAI Key:</span>
                        <span className={health.rateLimit.hasKey ? 'text-green-600' : 'text-red-600'}>
                          {health.rateLimit.hasKey ? '✓ מוגדר' : '✗ חסר'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">זמן תגובה:</span>
                        <span className="text-green-600">טוב</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  <button
                    onClick={handleSync}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>סנכרן תלמידים</span>
                  </button>

                  <button
                    onClick={handleAnalyzeAll}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Zap className="w-5 h-5" />
                    <span>נתח הכל</span>
                  </button>

                  <button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 p-4 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Archive className="w-5 h-5" />
                    <span>צור גיבוי</span>
                  </button>
                </div>
              </div>
            )}

            {/* Analyze Tab */}
            {activeTab === 'analyze' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  פעולות ניתוח
                </h2>

                {/* Diagnostic Test */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-6 border-2 border-purple-200 dark:border-purple-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                        <Settings className="w-5 h-5 text-purple-600" />
                        בדיקת מערכת (Diagnostic)
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        בדוק אם ה-API פעיל, מפתח OpenAI מוגדר, והגליונות נגישים
                      </p>
                      {diagnosticResult && !diagnosticResult.error && (
                        <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg text-sm space-y-1">
                          <div className="flex justify-between">
                            <span>API:</span>
                            <span className={diagnosticResult.apiReachable ? 'text-green-600' : 'text-red-600'}>
                              {diagnosticResult.apiReachable ? '✓ פעיל' : '✗ לא זמין'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>מפתח OpenAI:</span>
                            <span className={diagnosticResult.hasOpenAIKey ? 'text-green-600' : 'text-red-600'}>
                              {diagnosticResult.hasOpenAIKey ? '✓ מוגדר' : '✗ חסר'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>תלמידים:</span>
                            <span className="text-blue-600">{diagnosticResult.stats.totalStudents || 0}</span>
                          </div>
                        </div>
                      )}
                      <button
                        onClick={handleDiagnosticTest}
                        disabled={loading}
                        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Settings className="w-5 h-5" />
                        <span>הרץ בדיקה</span>
                      </button>
                    </div>
                    <Settings className="w-16 h-16 text-purple-500" />
                  </div>
                </div>

                {/* Single Student Analysis */}
                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-lg p-6 border-2 border-cyan-200 dark:border-cyan-800">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        נתח תלמיד בודד
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        הזן קוד תלמיד לניתוח מיידי באמצעות AI
                      </p>
                      <div className="flex gap-4 mb-4">
                        <input
                          type="text"
                          value={singleStudentCode}
                          onChange={(e) => setSingleStudentCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAnalyzeSingleStudent()}
                          placeholder="הזן קוד תלמיד (לדוגמה: 70101)"
                          className="flex-1 px-4 py-2 border-2 border-cyan-300 dark:border-cyan-700 rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                      </div>
                      <button
                        onClick={handleAnalyzeSingleStudent}
                        disabled={loading || !singleStudentCode.trim()}
                        className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        <span>התחל ניתוח</span>
                      </button>
                    </div>
                    <Zap className="w-16 h-16 text-cyan-500" />
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          ניתוח אוטומטי - כל התלמידים שטרם נותחו
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          מנתח את כל התלמידים שטרם נותחו בעזרת AI. כולל מגבלת קצב והשהיות.
                        </p>
                        <button
                          onClick={handleAnalyzeAll}
                          disabled={loading}
                          className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <Play className="w-5 h-5" />
                          <span>התחל ניתוח כולל</span>
                        </button>
                      </div>
                      <Zap className="w-16 h-16 text-green-500" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          ניתוח אצווה סטנדרטי
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          מנתח תלמידים באצווה עם עיבוד אופטימלי.
                        </p>
                        <button
                          onClick={handleStandardBatch}
                          disabled={loading}
                          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          <RefreshCw className="w-5 h-5" />
                          <span>הרץ אצווה</span>
                        </button>
                      </div>
                      <Database className="w-16 h-16 text-blue-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Tab */}
            {activeTab === 'delete' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    פעולות מחיקה
                  </h2>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                    ⚠️ אזהרה: פעולות מחיקה הן בלתי הפיכות (למעט deleteAll שיוצר גיבוי)
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Delete Old */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold mb-4">מחק ניתוחים ישנים</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <label htmlFor="deleteOlderThan" className="text-gray-700 dark:text-gray-300">מחק ניתוחים מעל:</label>
                      <input
                        id="deleteOlderThan"
                        type="number"
                        value={deleteOlderThan}
                        onChange={(e) => setDeleteOlderThan(parseInt(e.target.value))}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg w-24"
                      />
                      <span className="text-gray-700 dark:text-gray-300">ימים</span>
                    </div>
                    <button
                      onClick={handleDeleteOld}
                      disabled={loading}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      מחק ישנים
                    </button>
                  </div>

                  {/* Delete by Class */}
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-bold mb-4">מחק לפי כיתה</h3>
                    <div className="flex items-center gap-4 mb-4">
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg flex-1"
                      >
                        <option value="">בחר כיתה</option>
                        {stats?.byClass && Object.keys(stats.byClass).map(cls => (
                          <option key={cls} value={cls}>{cls}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleDeleteByClass}
                      disabled={loading || !selectedClass}
                      className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                    >
                      מחק כיתה
                    </button>
                  </div>

                  {/* Delete All */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 border-2 border-red-300 dark:border-red-800">
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-300 mb-4">
                      מחק את כל הניתוחים (מסוכן!)
                    </h3>
                    <div className="mb-4">
                      <label htmlFor="adminToken" className="block text-gray-700 dark:text-gray-300 mb-2">
                        Admin Token (נדרש):
                      </label>
                      <input
                        id="adminToken"
                        type="password"
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value)}
                        placeholder="הזן admin token"
                        className="w-full px-4 py-2 border-2 border-red-300 dark:border-red-700 rounded-lg"
                      />
                    </div>
                    <button
                      onClick={handleDeleteAll}
                      disabled={loading || !adminToken}
                      className="px-6 py-3 bg-red-700 hover:bg-red-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>מחק הכל (גיבוי אוטומטי)</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backup Tab */}
            {activeTab === 'backup' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ניהול גיבויים
                  </h2>
                  <button
                    onClick={handleCreateBackup}
                    disabled={loading}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Archive className="w-5 h-5" />
                    <span>צור גיבוי חדש</span>
                  </button>
                </div>

                <div className="grid gap-4">
                  {backups.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      אין גיבויים זמינים
                    </div>
                  ) : (
                    backups.map(backup => (
                      <div key={backup.id} className="bg-white dark:bg-gray-700 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {backup.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {backup.created} • {backup.rowCount} שורות
                            </p>
                          </div>
                          <button
                            onClick={() => handleRestore(backup.id)}
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            <span>שחזר</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  יצוא נתונים
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold mb-4">יצוא JSON</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      יצא את כל הניתוחים בפורמט JSON מובנה
                    </p>
                    <button
                      onClick={() => handleExport('json')}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>יצא JSON</span>
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-6 border-2 border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-bold mb-4">יצוא CSV</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      יצא טבלה פשוטה לאקסל/גוגל שיטס
                    </p>
                    <button
                      onClick={() => handleExport('csv')}
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      <span>יצא CSV</span>
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-gray-700 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-600">
                  <h3 className="text-lg font-bold mb-4">חיפוש בניתוחים</h3>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="חפש תלמיד, כיתה, או תוכן..."
                      className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      onClick={handleSearch}
                      disabled={loading || !searchQuery.trim()}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Search className="w-5 h-5" />
                      <span>חפש</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    יומן פעילות (Audit Log)
                  </h2>
                  <button
                    onClick={loadAuditLog}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>רענן</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {auditLog.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      אין אירועים ביומן
                    </div>
                  ) : (
                    auditLog.map((event, index) => (
                      <div key={index} className="bg-white dark:bg-gray-700 rounded-lg p-4 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
                                {event.type}
                              </span>
                              <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {event.action}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(event.timestamp).toLocaleString('he-IL')}
                            </p>
                            {event.details && Object.keys(event.details).length > 0 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {JSON.stringify(event.details)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    מעבד...
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    אנא המתן
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControlPanel;
