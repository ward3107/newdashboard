import React from 'react';
import { AlertCircle, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

/**
 * Connection Status Banner Component
 * Shows API connection status and helpful instructions for fixing CORS
 */
export const ConnectionStatusBanner = ({ error, isLoading, hasData }) => {
  if (isLoading) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-r-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
          </div>
          <div className="mr-3">
            <p className="text-sm text-blue-700 font-medium">
              🔄 מתחבר ל-Google Apps Script...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && error.isCORS) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="mr-3 flex-1">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              🔒 שגיאת CORS - נדרשת פעולה
            </h3>
            <div className="text-sm text-red-700 space-y-2">
              <p className="font-semibold">ה-Google Apps Script חוסם גישה מ-Vercel</p>

              <div className="bg-white p-3 rounded border border-red-200">
                <p className="font-bold mb-2">✅ תיקון מהיר (5 דקות):</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>פתח את ה-Google Apps Script שלך</li>
                  <li>לחץ על <strong>Deploy → Manage deployments → Edit</strong></li>
                  <li>שנה <strong>"Who has access"</strong> ל-<strong>"Anyone"</strong></li>
                  <li>לחץ <strong>"Deploy"</strong></li>
                  <li>רענן את הדף הזה</li>
                </ol>
              </div>

              <div className="flex gap-2 mt-3">
                <a
                  href="test-api-connection.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  🧪 בדוק חיבור
                  <ExternalLink className="mr-2 h-4 w-4" />
                </a>
                <a
                  href="CONNECTING_YOUR_DATA.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  📚 הוראות מלאות
                  <ExternalLink className="mr-2 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="mr-3">
            <h3 className="text-sm font-medium text-yellow-800 mb-1">
              ⚠️ שגיאה בטעינת נתונים
            </h3>
            <p className="text-sm text-yellow-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasData) {
    return (
      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" />
          </div>
          <div className="mr-3">
            <p className="text-sm text-green-700 font-medium">
              ✅ מחובר ל-Google Apps Script בהצלחה
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ConnectionStatusBanner;
