/**
 * ISHEBOT - Intelligent Student Holistic Evaluation & Behavior Optimization Tool
 *
 * Copyright (c) 2025 Waseem Abu Akel - All Rights Reserved
 *
 * PROPRIETARY AND CONFIDENTIAL
 *
 * This file is part of ISHEBOT proprietary software. Unauthorized copying,
 * modification, distribution, or use of this file, via any medium, is strictly
 * prohibited without the express written permission of the copyright holder.
 *
 * For licensing inquiries: wardwas3107@gmail.com
 */

import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { initPerformanceMonitoring } from './utils/performanceMonitoring';
import { initializeCSP } from './security/csp';
import { initializeRUM } from './monitoring/rum';
import { securityManager } from './security/securityEnhancements';
import logger from './utils/logger';

// Error Boundary and Loading Components
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';

// UI Components
import CookieConsent from './components/ui/CookieConsent';
import AccessibilityWidget from './components/ui/AccessibilityWidget';

// Authentication
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';

// Lazy load components for code splitting with preload hints
const LandingPage = lazy(() => import(/* webpackChunkName: "landing" */ './pages/OptimizedLandingPage'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './components/dashboard/Dashboard'));
const FuturisticDashboard = lazy(() => import(/* webpackChunkName: "futuristic-dashboard" */ './components/dashboard/FuturisticDashboard'));
const StudentDetail = lazy(() => import(/* webpackChunkName: "student-detail" */ './components/student/StudentDetail'));
const TestAnalytics = lazy(() => import(/* webpackChunkName: "test-analytics" */ './components/analytics/TestAnalytics'));
const ApiTestPage = lazy(() => import(/* webpackChunkName: "api-test" */ './pages/ApiTestPage'));
const AdminControlPanel = lazy(() => import(/* webpackChunkName: "admin-control" */ './components/AdminControlPanel'));
const ClassroomOptimizationPage = lazy(() => import(/* webpackChunkName: "classroom-optimization" */ './pages/ClassroomOptimizationPage'));

// Assessment Form
const AssessmentPage = lazy(() => import(/* webpackChunkName: "assessment" */ './pages/AssessmentPage'));

// Security Dashboard
const AISecurityDashboard = lazy(() => import(/* webpackChunkName: "security-dashboard" */ './components/security/AISecurityDashboard'));

// Legal pages
const PrivacyPolicyPage = lazy(() => import(/* webpackChunkName: "privacy-policy" */ './pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import(/* webpackChunkName: "terms" */ './pages/TermsPage'));
const DataProcessingPage = lazy(() => import(/* webpackChunkName: "data-processing" */ './pages/DataProcessingPage'));
const SecurityPage = lazy(() => import(/* webpackChunkName: "security" */ './pages/SecurityPage'));

// Styles
import './styles/global.css';
import './styles/cls-fixes.css';
import './styles/accessibility.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    },
  },
});

function App() {
  // Initialize monitoring and security features
  useEffect(() => {
    // Performance monitoring
    initPerformanceMonitoring();

    // Enhanced Security System
    const securityStatus = securityManager.getSecurityStatus();
    logger.log('🔒 Security Status:', securityStatus);

    // Content Security Policy
    initializeCSP();

    // Real User Monitoring
    initializeRUM();

    // Log security initialization
    logger.log('✅ Security initialized successfully');
    logger.log('🛡️ Features: CSRF protection, Rate limiting, Bot detection, Data encryption');

    // PWA and Service Worker are enabled
    // Auto-registered via VitePWA plugin in vite.config.js
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <ErrorBoundary>
              <div className="min-h-screen bg-gray-50" dir="rtl">
              {/* Toast Notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#fff',
                    color: '#333',
                    fontFamily: 'Inter, Assistant, sans-serif',
                    fontSize: '14px',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    border: '1px solid #e5e7eb',
                    textAlign: 'right',
                    direction: 'rtl'
                  },
                  success: {
                    iconTheme: {
                      primary: '#10b981',
                      secondary: '#ffffff',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#ffffff',
                    },
                  },
                  loading: {
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#ffffff',
                    },
                  },
                }}
              />

              {/* Cookie Consent Banner */}
              <CookieConsent />

              {/* Accessibility Widget */}
              <AccessibilityWidget />

              {/* Main Application */}
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Loading />}>
                  <ErrorBoundary>
                    <Routes>
                      {/* Legal Pages (Public) */}
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/terms" element={<TermsPage />} />
                      <Route path="/data-processing" element={<DataProcessingPage />} />
                      <Route path="/security" element={<SecurityPage />} />

                      {/* Landing Page - Redirect to standalone HTML */}
                      <Route path="/" element={<RedirectToLanding />} />

                      {/* Authentication Routes (Public) */}
                      <Route path="/login" element={<LoginPage />} />

                      {/* Public Route - Student Assessment (No authentication required) */}
                      <Route path="/assessment" element={<AssessmentPage />} />

                      {/* Protected Routes - Require Authentication */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <FuturisticDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/original"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/student/:studentId"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <StudentDetail />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/test-analytics"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <TestAnalytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AdminControlPanel />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/api-test"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <ApiTestPage />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/security-dashboard"
                        element={
                          <ProtectedRoute requiredRole="admin">
                            <AISecurityDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/classroom-optimization"
                        element={
                          <ProtectedRoute requiredRoles={['teacher', 'admin']}>
                            <ClassroomOptimizationPage />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </Suspense>
              </motion.main>
            </div>
          </ErrorBoundary>
        </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Redirect to Landing HTML Component
const RedirectToLanding: React.FC = () => {
  React.useEffect(() => {
    window.location.href = '/landing.html';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600">מפנה לדף הבית...</p>
      </div>
    </div>
  );
};

// 404 Not Found Component
const NotFound: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-6xl mb-4"
        >
          🔍
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {t('notFound.title')}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6"
        >
          {t('notFound.description')}
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          href="/dashboard"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          {t('notFound.backHome')}
        </motion.a>
      </div>
    </div>
  );
};

export default App;
