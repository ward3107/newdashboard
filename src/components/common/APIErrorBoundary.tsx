/**
 * API Error Boundary
 *
 * Specialized error boundary for API calls and data fetching
 * Provides specific error messages for different API failure types
 */

import React, { Component, ReactNode } from 'react';
import { errorReporting } from '../../services/errorReporting';

interface APIErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  endpoint?: string;
  method?: string;
}

interface APIErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorType?: 'network' | 'timeout' | 'auth' | 'server' | 'unknown';
}

export class APIErrorBoundary extends Component<APIErrorBoundaryProps, APIErrorBoundaryState> {
  constructor(props: APIErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): APIErrorBoundaryState {
    // Categorize error type based on error message
    let errorType: APIErrorBoundaryState['errorType'] = 'unknown';

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorType = 'network';
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      errorType = 'auth';
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      errorType = 'server';
    }

    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Report to error reporting service with API context
    errorReporting.reportError(error, {
      component: 'APIErrorBoundary',
      action: 'apiCallFailure',
      additionalInfo: {
        endpoint: this.props.endpoint,
        method: this.props.method,
        errorType: this.state.errorType,
        ...errorInfo,
      }
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  getErrorMessage = (): string => {
    switch (this.state.errorType) {
      case 'network':
        return 'בעיית חיבור לאינטרנט. אנא בדוק את החיבור ונסה שוב.';
      case 'timeout':
        return 'הבקשה לקחה זמן רב מדי. אנא נסה שוב.';
      case 'auth':
        return 'אין לך הרשאה לבצע פעולה זו. אנא התחבר מחדש.';
      case 'server':
        return 'בעיה בשרת. אנא נסה שוב מאוחר יותר.';
      default:
        return 'אירעה שגיאה בלתי צפויה. אנא נסה שוב.';
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default API error fallback
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg" dir="rtl">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">🔴</div>
            <h3 className="text-lg font-semibold text-red-800">
              שגיאת שרת
            </h3>
          </div>

          <p className="text-red-700 mb-4">
            {this.getErrorMessage()}
          </p>

          {this.props.endpoint && (
            <p className="text-red-600 text-sm mb-4">
              נקודת קצה: {this.props.method || 'GET'} {this.props.endpoint}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              aria-label="רענן דף"
            >
              רענן דף
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              aria-label="חזור"
            >
              חזור
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling API errors in functional components
export const useAPIError = () => {
  const [error, setError] = React.useState<{
    message: string;
    type: APIErrorBoundaryState['errorType'];
    endpoint?: string;
    method?: string;
  } | null>(null);

  const handleAPIError = React.useCallback((
    error: Error,
    endpoint?: string,
    method?: string
  ) => {
    let errorType: APIErrorBoundaryState['errorType'] = 'unknown';

    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      errorType = 'network';
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
    } else if (error.message.includes('401') || error.message.includes('403')) {
      errorType = 'auth';
    } else if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
      errorType = 'server';
    }

    const apiError = {
      message: error.message,
      type: errorType,
      endpoint,
      method,
    };

    setError(apiError);

    // Report to error service
    errorReporting.reportError(error, {
      component: 'useAPIError',
      action: 'apiErrorThrown',
      additionalInfo: { endpoint, method, errorType },
    });
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  return { error, handleAPIError, clearError };
};