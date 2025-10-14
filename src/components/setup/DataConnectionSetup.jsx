import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { testConnection, updateApiConfig, getSavedConfig } from '../../api/studentAPI.js';
import {
  Settings,
  Database,
  Link,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  RefreshCw,
  FileSpreadsheet,
  Brain
} from 'lucide-react';

const DataConnectionSetup = ({ onConnectionSuccess, currentConfig }) => {
  const [config, setConfig] = useState({
    webAppUrl: '',
    spreadsheetId: '',
    spreadsheetUrl: '',
    showAdvanced: false,
    testConnection: false,
    ...currentConfig
  });

  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = getSavedConfig();
    if (savedConfig) {
      setConfig(prev => ({ ...prev, ...savedConfig }));
      setConnected(true);
    }
  }, []);

  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showUrls, setShowUrls] = useState(false);
  const [step, setStep] = useState(1); // 1: Google Apps Script, 2: Spreadsheet, 3: Test

  // Test connection function
  const handleTestConnection = async () => {
    if (!config.webAppUrl) {
      toast.error('אנא הכנס את URL של Google Apps Script');
      return;
    }

    setTesting(true);
    try {
      const data = await testConnection(config.webAppUrl);

      if (data.success) {
        setConnected(true);

        // Update API configuration to use real data
        updateApiConfig(config);

        toast.success('החיבור הצליח! 🎉');

        if (onConnectionSuccess) {
          onConnectionSuccess(config);
        }
      } else {
        throw new Error(data.error || 'שגיאה לא ידועה');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      toast.error(`החיבור נכשל: ${error.message}`);
      setConnected(false);
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = async (text, description) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${description} הועתק ללוח`);
    } catch (error) {
      toast.error('שגיאה בהעתקה');
    }
  };

  const extractSpreadsheetId = (url) => {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : '';
  };

  const handleSpreadsheetUrlChange = (url) => {
    const id = extractSpreadsheetId(url);
    setConfig(prev => ({
      ...prev,
      spreadsheetUrl: url,
      spreadsheetId: id
    }));
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < step) return 'completed';
    if (stepNumber === step) return 'active';
    return 'pending';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto p-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Database className="w-8 h-8 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          חיבור לנתונים אמיתיים
        </h1>
        <p className="text-gray-600">
          חבר את המערכת ל-Google Forms ו-Google Sheets שלך כדי לקבל נתונים אמיתיים
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[
          { num: 1, title: 'Google Apps Script' },
          { num: 2, title: 'Google Sheets' },
          { num: 3, title: 'בדיקת חיבור' }
        ].map((stepItem, index) => (
          <div key={stepItem.num} className="flex items-center">
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                ${getStepStatus(stepItem.num) === 'completed'
                  ? 'bg-green-500 text-white'
                  : getStepStatus(stepItem.num) === 'active'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }
              `}
              whileHover={{ scale: 1.1 }}
            >
              {getStepStatus(stepItem.num) === 'completed' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                stepItem.num
              )}
            </motion.div>
            <span className="mr-3 text-sm font-medium text-gray-700">
              {stepItem.title}
            </span>
            {index < 2 && (
              <div className="w-8 h-0.5 bg-gray-200 mx-4"></div>
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-blue-500 ml-3" />
              <h2 className="text-xl font-semibold">שלב 1: הגדרת Google Apps Script</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2">הוראות:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-700 text-sm">
                  <li>פתח את <a href="https://script.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Apps Script</a></li>
                  <li>צור פרויקט חדש</li>
                  <li>העתק את הקוד מהמדריך שלנו</li>
                  <li>פרסם כ-Web App</li>
                  <li>העתק את ה-URL שמתקבל</li>
                </ol>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL של Google Apps Script Web App
                </label>
                <div className="relative">
                  <input
                    type={showUrls ? 'text' : 'password'}
                    value={config.webAppUrl}
                    onChange={(e) => setConfig(prev => ({ ...prev, webAppUrl: e.target.value }))}
                    placeholder="https://script.google.com/macros/s/YOUR_ID/exec"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUrls(!showUrls)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showUrls ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-3">
                {/* Test Connection Button */}
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !config.webAppUrl}
                  className={`
                    flex items-center justify-center w-full px-6 py-3 rounded-lg font-semibold transition-all
                    ${testing || !config.webAppUrl
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : connected
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    }
                  `}
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                      בודק חיבור...
                    </>
                  ) : connected ? (
                    <>
                      <CheckCircle className="w-5 h-5 ml-2" />
                      החיבור הצליח! ✓
                    </>
                  ) : (
                    <>
                      <Link className="w-5 h-5 ml-2" />
                      בדוק חיבור עכשיו
                    </>
                  )}
                </button>

                {/* Connection Success Message */}
                {connected && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                  >
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <h3 className="text-base font-semibold text-green-800 mb-1">
                      מעולה! החיבור הצליח
                    </h3>
                    <p className="text-green-600 text-sm">
                      המערכת מחוברת לנתונים האמיתיים. עכשיו אפשר לסגור את החלון הזה.
                    </p>
                  </motion.div>
                )}

                <div className="flex space-x-3 space-x-reverse">
                  <button
                    onClick={() => copyToClipboard(
                      'https://github.com/your-repo/google-apps-script-template',
                      'קישור לתבנית'
                    )}
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Copy className="w-4 h-4 ml-2" />
                    העתק תבנית קוד
                  </button>
                  <a
                    href="https://script.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 ml-2" />
                    פתח Google Apps Script
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center mb-4">
              <FileSpreadsheet className="w-6 h-6 text-green-500 ml-3" />
              <h2 className="text-xl font-semibold">שלב 2: הגדרת Google Sheets</h2>
            </div>

            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">מבנה הגיליון הנדרש:</h3>
                <ul className="list-disc list-inside space-y-1 text-green-700 text-sm">
                  <li><strong>students</strong> - מידע בסיסי על תלמידים</li>
                  <li><strong>responses</strong> - תשובות מ-Google Forms</li>
                  <li><strong>AI_Insights</strong> - ניתוחי AI (31 עמודות)</li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <h4 className="font-semibold text-blue-800 mb-2">⚠️ חשוב - שמות עמודות בגוגל פורמס:</h4>
                  <p className="text-blue-700 text-sm mb-2">
                    הוודא שבגוגל פורמס יש עמודות עם השמות הבאים (או דומים):
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700 text-xs">
                    <li><strong>שם התלמיד</strong> או <strong>name</strong> או <strong>Student Name</strong></li>
                    <li><strong>קוד תלמיד</strong> או <strong>studentCode</strong> או <strong>ID</strong></li>
                    <li><strong>כיתה</strong> או <strong>class</strong> או <strong>classId</strong></li>
                  </ul>
                  <p className="text-blue-600 text-xs mt-2">
                    המערכת תזהה אוטומטית וריאציות שונות של השמות האלה.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  קישור ל-Google Sheets
                </label>
                <input
                  type="url"
                  value={config.spreadsheetUrl || ''}
                  onChange={(e) => handleSpreadsheetUrlChange(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {config.spreadsheetId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-600 mb-2">Spreadsheet ID שחולץ:</p>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <code className="flex-1 px-3 py-2 bg-white border rounded text-sm font-mono">
                      {config.spreadsheetId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(config.spreadsheetId, 'Spreadsheet ID')}
                      className="p-2 text-gray-500 hover:text-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-6"
          >
            <div className="flex items-center mb-4">
              <Brain className="w-6 h-6 text-purple-500 ml-3" />
              <h2 className="text-xl font-semibold">שלב 3: בדיקת חיבור</h2>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <motion.button
                  onClick={handleTestConnection}
                  disabled={testing || !config.webAppUrl}
                  className={`
                    px-8 py-4 rounded-lg font-semibold text-white transition-all duration-300
                    ${testing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : connected
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }
                  `}
                  whileHover={{ scale: testing ? 1 : 1.05 }}
                  whileTap={{ scale: testing ? 1 : 0.95 }}
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                      בודק חיבור...
                    </>
                  ) : connected ? (
                    <>
                      <CheckCircle className="w-5 h-5 ml-2" />
                      החיבור הצליח!
                    </>
                  ) : (
                    <>
                      <Link className="w-5 h-5 ml-2" />
                      בדוק חיבור
                    </>
                  )}
                </motion.button>
              </div>

              {connected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 text-center"
                >
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-green-800 mb-1">
                    מעולה! החיבור הצליח
                  </h3>
                  <p className="text-green-600 text-sm">
                    המערכת מחוברת לנתונים האמיתיים שלך מ-Google Forms
                  </p>
                </motion.div>
              )}

              {!connected && config.webAppUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-amber-500 ml-2" />
                    <h3 className="font-semibold text-amber-800">טיפים לפתרון בעיות:</h3>
                  </div>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-amber-700 text-sm">
                    <li>וודא שה-Web App פורסם עם הרשאות "Anyone"</li>
                    <li>בדוק שה-URL נכון ומלא</li>
                    <li>וודא שהגיליון מכיל את הנתונים הנדרשים</li>
                    <li>בדוק את ה-console בדפדפן לשגיאות</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          חזור
        </button>

        <button
          onClick={() => {
            if (step < 3) {
              setStep(step + 1);
            } else if (connected && onConnectionSuccess) {
              onConnectionSuccess(config);
            }
          }}
          disabled={
            (step === 1 && !config.webAppUrl) ||
            (step === 2 && !config.spreadsheetId) ||
            (step === 3 && !connected)
          }
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {step === 3 ? 'סיים' : 'המשך'}
        </button>
      </div>
    </motion.div>
  );
};

export default DataConnectionSetup;