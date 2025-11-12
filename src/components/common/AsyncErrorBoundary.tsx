/**
 * Async Error Boundary
 *
 * Specialized error boundary for async operations (API calls, data fetching)
 * Provides better UX for network-related failures
 */

import React, { Component, ReactNode } from 'react';
import { errorReporting } from '../../services/errorReporting';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
  retry?: () => void;
}

interface AsyncErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  retryCount: number;
}

const MAX_RETRIES = 3;

export class AsyncErrorBoundary extends Component<AsyncErrorBoundaryProps, AsyncErrorBoundaryState> {
  constructor(props: AsyncErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): AsyncErrorBoundaryState {
    return { hasError: true, error, retryCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    // Report to error reporting service
    errorReporting.reportError(error, {
      component: 'AsyncErrorBoundary',
      action: 'asyncOperationFailure',
      additionalInfo: {
        retryCount: this.state.retryCount,
        ...errorInfo,
      }
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        retryCount: prevState.retryCount + 1,
      }));

      // Call retry function if provided
      this.props.retry?.();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default async error fallback
      return (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg" dir="rtl">
          <div className="flex items-center mb-4">
            <div className="text-2xl mr-3">⚠️</div>
            <h3 className="text-lg font-semibold text-amber-800">
              שגיאת תקשורת
            </h3>
          </div>

          <p className="text-amber-700 mb-4">
            אירעה שגיאה בעת טעינת הנתונים. אנא בדוק את החיבור לאינטרנט ונסה שוב.
          </p>

          {this.state.retryCount < MAX_RETRIES ? (
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              aria-label="נסה שוב"
            >
              נסה שוב ({this.state.retryCount + 1}/{MAX_RETRIES})
            </button>
          ) : (
            <div>
              <p className="text-amber-600 mb-3">
                הגעת למספר הניסיונות המקסימלי. אנא רענן את הדף או נסה מאוחר יותר.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                aria-label="רענן דף"
              >
                רענן דף
              </button>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useAsyncError = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const throwAsyncError = React.useCallback((error: Error) => {
    setError(error);

    // Report to error service
    errorReporting.reportError(error, {
      component: 'useAsyncError',
      action: 'asyncErrorThrown',
    });
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { throwAsyncError, resetError };
};