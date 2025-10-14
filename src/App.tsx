import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Error Boundary and Loading Components
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Loading } from './components/common/Loading';

// Lazy load components for code splitting with preload hints
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ './components/dashboard/Dashboard'));
const FuturisticDashboard = lazy(() => import(/* webpackChunkName: "futuristic-dashboard" */ './components/dashboard/FuturisticDashboard'));
const StudentDetail = lazy(() => import(/* webpackChunkName: "student-detail" */ './components/student/StudentDetail'));
const TestAnalytics = lazy(() => import(/* webpackChunkName: "test-analytics" */ './components/analytics/TestAnalytics'));

// Styles
import './styles/global.css';
import './styles/cls-fixes.css';

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

function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
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

              {/* Main Application */}
              <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Suspense fallback={<Loading message="טוען דשבורד..." />}>
                  <ErrorBoundary>
                    <Routes>
                      <Route path="/" element={<FuturisticDashboard />} />
                      <Route path="/original" element={<Dashboard />} />
                      <Route path="/student/:studentId" element={<StudentDetail />} />
                      <Route path="/test-analytics" element={<TestAnalytics />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </ErrorBoundary>
                </Suspense>
              </motion.main>
            </div>
          </ErrorBoundary>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

// 404 Not Found Component
const NotFound: React.FC = () => {
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
          עמוד לא נמצא
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 mb-6"
        >
          הכתובת שביקשת אינה קיימת במערכת
        </motion.p>
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          href="/"
          className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          חזור לדף הראשי
        </motion.a>
      </div>
    </div>
  );
};

export default App;
