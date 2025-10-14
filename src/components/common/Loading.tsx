import React from 'react';

interface LoadingProps {
  /** Loading message to display */
  message?: string;
  /** Whether to show as full screen or inline */
  fullScreen?: boolean;
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Loading Component
 *
 * Displays a loading spinner with optional message.
 * Includes proper ARIA attributes for accessibility.
 */
export const Loading: React.FC<LoadingProps> = ({
  message = 'טוען...',
  fullScreen = true,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8 border-2',
    md: 'h-16 w-16 border-2',
    lg: 'h-24 w-24 border-4'
  };

  const containerClasses = fullScreen
    ? 'min-h-screen bg-gray-50 flex items-center justify-center'
    : 'flex items-center justify-center p-8';

  return (
    <div
      className={containerClasses}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="text-center">
        <div
          className={`animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4 ${sizeClasses[size]}`}
          aria-hidden="true"
        />
        <p className="text-gray-600 font-medium">{message}</p>
        <span className="sr-only">{message}</span>
      </div>
    </div>
  );
};

/**
 * Skeleton Loader Component
 *
 * Displays a placeholder skeleton while content is loading.
 */
export const Skeleton: React.FC<{ className?: string; count?: number }> = ({
  className = '',
  count = 1
}) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
          aria-hidden="true"
        />
      ))}
    </>
  );
};

/**
 * Card Skeleton Component
 *
 * Displays a skeleton placeholder for card components.
 */
export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4" aria-busy="true" role="status">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
      <span className="sr-only">טוען תוכן...</span>
    </div>
  );
};

/**
 * Table Skeleton Component
 *
 * Displays a skeleton placeholder for table components.
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4
}) => {
  return (
    <div className="space-y-3" aria-busy="true" role="status">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-12 flex-1" />
          ))}
        </div>
      ))}
      <span className="sr-only">טוען טבלה...</span>
    </div>
  );
};
