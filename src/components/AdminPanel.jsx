import { useState } from 'react';
import * as API from '../services/api';
import {
  Settings,
  Database,
  RefreshCw,
  Trash2,
  UserCheck,
  Users,
  Download,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Zap,
  Clock,
  Archive,
  Shield,
  Sparkles
} from 'lucide-react';

const AdminPanel = ({ darkMode, theme, onClose, onDataUpdate, onSmartAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('core');
  const [results, setResults] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [batchSize, setBatchSize] = useState(5);
  const [daysOld, setDaysOld] = useState(30);

  const showResult = (message, type = 'info') => {
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setResults(`${icon} ${message}\n${new Date().toLocaleTimeString()}`);
  };

  const handleApiCall = async (apiFunction, ...args) => {
    setLoading(true);
    try {
      const result = await apiFunction(...args);
      if (result.success !== false) {
        showResult(JSON.stringify(result, null, 2), 'success');
        if (onDataUpdate) onDataUpdate(); // Refresh dashboard data
      } else {
        showResult(`Error: ${result.error || 'Unknown error'}`, 'error');
      }
      return result;
    } catch (error) {
      showResult(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'core', name: 'Core Functions', icon: Database },
    { id: 'analysis', name: 'Analysis', icon: UserCheck },
    { id: 'batch', name: 'Batch Operations', icon: Users },
    { id: 'delete', name: 'Delete & Clean', icon: Trash2 },
    { id: 'utility', name: 'Utilities', icon: Settings },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="presentation"
    >
      <div
        className={`relative backdrop-blur-xl ${
          darkMode ? 'bg-gray-900/95' : 'bg-white/95'
        } rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-white/20 shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={`p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary}`}>
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Admin Control Panel
                </h2>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Direct access to all Google Apps Script functions
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl ${
                darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } transition-colors`}
            >
              <XCircle size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${theme.primary} text-white`
                  : darkMode
                    ? 'text-gray-400 hover:bg-gray-800'
                    : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} />
              <span className="font-medium">{tab.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex h-[calc(100%-8rem)]">
          {/* Functions Panel */}
          <div className={`w-2/3 p-6 overflow-y-auto ${
            darkMode ? 'bg-gray-900/50' : 'bg-gray-50'
          }`}>
            {loading && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className={`p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <Loader2 className="animate-spin text-blue-500 mb-2" size={48} />
                  <p className={darkMode ? 'text-white' : 'text-gray-900'}>Processing...</p>
                </div>
              </div>
            )}

            {/* Core Functions */}
            {activeTab === 'core' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Core Functions
                </h3>

                <FunctionCard
                  title="קבל את כל התלמידים"
                  description="שלוף את כל התלמידים מבסיס הנתונים"
                  icon={Users}
                  onClick={() => handleApiCall(API.getAllStudents)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="קבל סטטיסטיקה"
                  description="קבל סטטיסטיקה מקיפה על כל התלמידים"
                  icon={Database}
                  onClick={() => handleApiCall(API.getStats)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="סנכרן תלמידים"
                  description="סנכרן נתוני תלמידים מטפסי Google"
                  icon={RefreshCw}
                  onClick={() => handleApiCall(API.syncStudents)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="Initial Sync"
                  description="Perform initial synchronization of all data"
                  icon={Download}
                  onClick={() => handleApiCall(API.initialSync)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="Test Connection"
                  description="Test the connection to Google Apps Script"
                  icon={AlertCircle}
                  onClick={() => handleApiCall(API.testConnection)}
                  darkMode={darkMode}
                  theme={theme}
                />
              </div>
            )}

            {/* Analysis Functions */}
            {activeTab === 'analysis' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Analysis Functions
                </h3>

                {/* AI Smart Analysis Button - Prominent */}
                <button
                  onClick={onSmartAnalysis}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer bg-gradient-to-r ${theme.secondary} hover:opacity-90 shadow-lg mb-6 w-full text-left`}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Sparkles className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1">
                        ניתוח חכם AI
                      </h4>
                      <p className="text-white/90 text-sm">
                        הפעל ניתוח אוטומטי לכל התלמידים שממתינים לניתוח
                      </p>
                    </div>
                  </div>
                </button>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                  <label htmlFor="studentCode" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Student Code
                  </label>
                  <input
                    id="studentCode"
                    type="text"
                    placeholder="הכנס קוד תלמיד (לדוגמה: 70105)"
                    className={`w-full px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-300'
                    } border`}
                    onChange={(e) => setSelectedStudents([e.target.value])}
                  />
                </div>

                <FunctionCard
                  title="נתח תלמיד"
                  description="הרץ ניתוח AI על תלמיד ספציפי"
                  icon={UserCheck}
                  onClick={() => handleApiCall(API.analyzeOneStudent, selectedStudents[0])}
                  disabled={!selectedStudents[0]}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="נתח תלמיד מחדש"
                  description="הרץ ניתוח מחדש עבור תלמיד (מוחק ניתוח ישן)"
                  icon={RefreshCw}
                  onClick={() => handleApiCall(API.reanalyzeStudent, selectedStudents[0])}
                  disabled={!selectedStudents[0]}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="קבל תלמידים מנותחים"
                  description="הצג רשימת כל התלמידים שנותחו"
                  icon={CheckCircle}
                  onClick={() => handleApiCall(API.getAnalyzedStudents)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="קבל תלמידים לא מנותחים"
                  description="הצג רשימת כל התלמידים שצריכים ניתוח"
                  icon={AlertCircle}
                  onClick={() => handleApiCall(API.getUnanalyzedStudents)}
                  darkMode={darkMode}
                  theme={theme}
                />
              </div>
            )}

            {/* Batch Operations */}
            {activeTab === 'batch' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Batch Operations
                </h3>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                  <label htmlFor="batchSize" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Batch Size
                  </label>
                  <input
                    id="batchSize"
                    type="number"
                    value={batchSize}
                    onChange={(e) => setBatchSize(e.target.value)}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-300'
                    } border`}
                  />
                </div>

                <FunctionCard
                  title="נתח אצווה"
                  description={`נתח ${batchSize} תלמידים שלא נותחו`}
                  icon={Users}
                  onClick={() => handleApiCall(API.analyzeBatch, batchSize)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="אצווה רגילה"
                  description="הרץ ניתוח אצווה רגיל (5 תלמידים)"
                  icon={Zap}
                  onClick={() => handleApiCall(API.standardBatch)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="אצווה מהירה"
                  description="הרץ ניתוח אצווה מהיר (3 תלמידים)"
                  icon={Clock}
                  onClick={() => handleApiCall(API.quickBatch)}
                  darkMode={darkMode}
                  theme={theme}
                />
              </div>
            )}

            {/* Delete Functions */}
            {activeTab === 'delete' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete & Clean Operations
                </h3>

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} mb-4 border ${darkMode ? 'border-red-700' : 'border-red-300'}`}>
                  <p className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-700'}`}>
                    ⚠️ Warning: Delete operations are permanent and cannot be undone!
                  </p>
                </div>

                <FunctionCard
                  title="מחק ניתוח תלמיד"
                  description="מחק ניתוח עבור תלמיד ספציפי"
                  icon={Trash2}
                  onClick={() => handleApiCall(API.deleteStudentAnalysis, selectedStudents[0])}
                  disabled={!selectedStudents[0]}
                  variant="danger"
                  darkMode={darkMode}
                  theme={theme}
                />

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                  <label htmlFor="daysOld" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Days Old (for old analyses deletion)
                  </label>
                  <input
                    id="daysOld"
                    type="number"
                    value={daysOld}
                    onChange={(e) => setDaysOld(e.target.value)}
                    min="1"
                    className={`w-full px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-300'
                    } border`}
                  />
                </div>

                <FunctionCard
                  title="Delete Old Analyses"
                  description={`Delete analyses older than ${daysOld} days`}
                  icon={Clock}
                  onClick={() => handleApiCall(API.deleteOldAnalyses, daysOld)}
                  variant="danger"
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="מחק את כל הניתוחים"
                  description="⚠️ מחק את כל ניתוחי התלמידים (השתמש בזהירות רבה!)"
                  icon={XCircle}
                  onClick={() => {
                    if (confirm('האם אתה בטוח לחלוטין? זה ימחק את כל הניתוחים!')) {
                      handleApiCall(API.deleteAllAnalyses);
                    }
                  }}
                  variant="danger"
                  darkMode={darkMode}
                  theme={theme}
                />
              </div>
            )}

            {/* Utility Functions */}
            {activeTab === 'utility' && (
              <div className="space-y-4">
                <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Utility Functions
                </h3>

                <FunctionCard
                  title="Backup Analyses"
                  description="Create a backup of all current analyses"
                  icon={Archive}
                  onClick={() => handleApiCall(API.backupAnalyses)}
                  darkMode={darkMode}
                  theme={theme}
                />

                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} mb-4`}>
                  <label htmlFor="searchQuery" className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Search Query
                  </label>
                  <input
                    id="searchQuery"
                    type="text"
                    placeholder="Search in analyses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg ${
                      darkMode
                        ? 'bg-gray-700 text-white border-gray-600'
                        : 'bg-gray-50 text-gray-900 border-gray-300'
                    } border`}
                  />
                </div>

                <FunctionCard
                  title="Search Analyses"
                  description="Search through all analyses"
                  icon={Search}
                  onClick={() => handleApiCall(API.searchAnalyses, searchQuery)}
                  disabled={!searchQuery}
                  darkMode={darkMode}
                  theme={theme}
                />

                <FunctionCard
                  title="Get Audit Log"
                  description="View system audit log"
                  icon={Shield}
                  onClick={() => handleApiCall(API.getAuditLog)}
                  darkMode={darkMode}
                  theme={theme}
                />
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className={`w-1/3 p-6 border-l ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Results & Output
            </h3>
            <div className={`h-[calc(100%-3rem)] overflow-y-auto`}>
              <pre className={`p-4 rounded-lg text-sm font-mono ${
                darkMode ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-700'
              }`}>
                {results || 'Results will appear here...'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function Card Component
const FunctionCard = ({
  title,
  description,
  icon: Icon,
  onClick,
  disabled = false,
  variant = 'default',
  darkMode,
  theme
}) => {
  const getVariantStyles = () => {
    if (variant === 'danger') {
      return darkMode
        ? 'hover:bg-red-900/30 border-red-800'
        : 'hover:bg-red-50 border-red-200';
    }
    return darkMode
      ? 'hover:bg-gray-800 border-gray-700'
      : 'hover:bg-gray-50 border-gray-200';
  };

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`p-4 rounded-xl border transition-all cursor-pointer w-full text-left ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : getVariantStyles()
      } ${darkMode ? 'bg-gray-800/50' : 'bg-white'}`}
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${
          variant === 'danger' ? 'from-red-500 to-red-600' : theme.primary
        }`}>
          <Icon className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {title}
          </h4>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default AdminPanel;