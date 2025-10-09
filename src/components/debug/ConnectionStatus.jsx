import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';
import { API_CONFIG, FEATURES } from '../../config';

const ConnectionStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const testConnection = async () => {
    setStatus('checking');
    setError(null);

    // Check if using mock data
    if (FEATURES.ENABLE_MOCK_DATA) {
      setStatus('mock');
      setData({ mode: 'Mock Data', students: 'Using fake data' });
      return;
    }

    // Test real API
    try {
      const url = `${API_CONFIG.BASE_URL}?action=test`;
      console.log('Testing connection to:', url);

      const response = await fetch(url);
      const result = await response.json();

      console.log('Connection test result:', result);

      if (result.success) {
        setStatus('connected');
        setData(result);
      } else {
        setStatus('error');
        setError(result.error || 'Unknown error');
      }
    } catch (err) {
      console.error('Connection error:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border-2 p-4 min-w-[300px]">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">Connection Status</h3>
          <button
            onClick={testConnection}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {status === 'checking' && (
              <>
                <Loader className="w-5 h-5 animate-spin text-blue-500" />
                <span className="text-sm">Checking connection...</span>
              </>
            )}
            {status === 'connected' && (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Connected!</span>
              </>
            )}
            {status === 'mock' && (
              <>
                <CheckCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-sm text-yellow-700">Using Mock Data</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">Connection Failed</span>
              </>
            )}
          </div>

          {/* API URL */}
          <div className="text-xs text-gray-600 break-all">
            <strong>API:</strong> {API_CONFIG.BASE_URL}
          </div>

          {/* Mock Data Status */}
          <div className="text-xs">
            <strong>Mock Data:</strong>{' '}
            <span className={FEATURES.ENABLE_MOCK_DATA ? 'text-yellow-600' : 'text-green-600'}>
              {FEATURES.ENABLE_MOCK_DATA ? 'Enabled ⚠️' : 'Disabled ✓'}
            </span>
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Success Data */}
          {data && status === 'connected' && (
            <div className="text-xs text-green-600 mt-2 p-2 bg-green-50 rounded">
              <strong>Response:</strong> {JSON.stringify(data, null, 2)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
