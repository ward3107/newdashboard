import React, { useState } from 'react';
import { testConnection, getStats, getAllStudents } from '../services/api';
import { motion } from 'framer-motion';

const ApiTestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async (testName: string, testFn: () => Promise<any>) => {
    setLoading(true);
    setResult(null);

    try {
      console.log(`Running test: ${testName}`);
      const response = await testFn();
      console.log(`Test result:`, response);
      setResult(response);
    } catch (error: any) {
      console.error(`Test failed:`, error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20"
        >
          <h1 className="text-4xl font-bold text-white mb-2">🔧 API Test Page</h1>
          <p className="text-slate-300 mb-8">Test your Google Sheets API connection</p>

          {/* Test Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => runTest('Connection Test', testConnection)}
              disabled={loading}
              className="px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🔌 Test Connection
            </button>

            <button
              onClick={() => runTest('Get Stats', getStats)}
              disabled={loading}
              className="px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📊 Get Stats
            </button>

            <button
              onClick={() => runTest('Get Students', getAllStudents)}
              disabled={loading}
              className="px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👥 Get Students
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
              <p className="text-white mt-4">Testing API...</p>
            </div>
          )}

          {/* Result Display */}
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8"
            >
              {result.success ? (
                <div className="bg-green-500/20 border border-green-500 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-green-400 mb-4">✅ Success!</h3>
                  <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm text-green-300">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="bg-red-500/20 border border-red-500 rounded-xl p-6">
                  <h3 className="text-2xl font-bold text-red-400 mb-4">❌ Error</h3>
                  <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm text-red-300">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </motion.div>
          )}

          {/* Instructions */}
          <div className="mt-8 bg-blue-500/20 border border-blue-500 rounded-xl p-6">
            <h3 className="text-xl font-bold text-blue-400 mb-3">📝 Instructions:</h3>
            <ol className="text-slate-300 space-y-2 list-decimal list-inside">
              <li>Click "Test Connection" first to verify API is accessible</li>
              <li>Click "Get Stats" to see dashboard statistics</li>
              <li>Click "Get Students" to see all students data</li>
              <li>Check browser console (F12) for detailed logs</li>
            </ol>
          </div>

          {/* API Info */}
          <div className="mt-6 bg-slate-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-2">🔗 Current API URL:</h3>
            <code className="text-sm text-green-400 break-all">
              {import.meta.env.VITE_API_URL || 'Not configured'}
            </code>
            <p className="text-slate-400 text-sm mt-2">
              Mock Mode: {import.meta.env.VITE_USE_MOCK_DATA === 'true' ? '✅ ON' : '❌ OFF'}
            </p>
          </div>

          {/* Back Button */}
          <div className="mt-8 text-center">
            <a
              href="/"
              className="inline-block px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-semibold transition-all"
            >
              ← Back to Dashboard
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ApiTestPage;
