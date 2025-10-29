/**
 * Protected Route Component
 * Wraps routes that require authentication
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth';

/**
 * Props for ProtectedRoute
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole; // Optional: require specific role
  requiredRoles?: UserRole[]; // Optional: require one of multiple roles
}

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

/**
 * Unauthorized Component
 */
const Unauthorized: React.FC<{ requiredRole?: UserRole }> = ({ requiredRole }) => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
    <div className="max-w-md w-full text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600 mb-6">
          {requiredRole
            ? `You don't have permission to access this page. ${requiredRole} role required.`
            : "You don't have permission to access this page."}
        </p>
        <a
          href="/dashboard"
          className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  </div>
);

/**
 * Protected Route Component
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('🛡️ ProtectedRoute:', { loading, hasUser: !!user, path: location.pathname });

  // Show loading spinner while checking auth state
  if (loading) {
    console.log('🛡️ ProtectedRoute: Showing loading spinner');
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('🛡️ ProtectedRoute: No user, redirecting to /login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('🛡️ ProtectedRoute: User authenticated, showing protected content');

  // Check if user has required role
  if (requiredRole && user.role !== requiredRole) {
    return <Unauthorized requiredRole={requiredRole} />;
  }

  // Check if user has one of the required roles
  if (requiredRoles && !requiredRoles.includes(user.role)) {
    return <Unauthorized />;
  }

  // Check if user account is active
  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Deactivated</h2>
            <p className="text-gray-600 mb-6">
              Your account has been deactivated. Please contact your school administrator for assistance.
            </p>
            <a
              href="/login"
              className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Back to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

export default ProtectedRoute;
