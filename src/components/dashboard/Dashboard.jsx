import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Download, FileText, Users, RefreshCw, Database, Settings, AlertCircle } from 'lucide-react';

// Components
import Button from '../ui/Button';
import StatsCards from './StatsCards';
import SearchAndFilters from './SearchAndFilters';
import StudentCard from './StudentCard';
import ChartsSection from '../charts/ChartsSection';
import DataConnectionSetup from '../setup/DataConnectionSetup';
import DataAnalytics from './DataAnalytics';
import ConnectionStatus from '../debug/ConnectionStatus';

// API
import {
  getAllStudents,
  getStats,
  searchStudents,
  filterStudents,
  sortStudents,
  getFilterOptions,
  calculateStats,
  isConnectedToRealData,
  getSavedConfig,
  syncNewStudents,
  initialSyncAllStudents
} from '../../api/studentAPI';

// Utils
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';

const Dashboard = () => {
  // State
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showConnectionSetup, setShowConnectionSetup] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [initialSyncing, setInitialSyncing] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    classId: 'all',
    quarter: 'all',
    learningStyle: 'all',
    minStrengths: '',
    maxChallenges: ''
  });
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 12;

  // Load data on component mount
  useEffect(() => {
    checkConnection();
    loadData();
  }, []);

  // Listen for dashboard refresh trigger from AdminControlPanel
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Check if the dashboardRefreshTrigger was updated
      if (e.key === 'dashboardRefreshTrigger' || e.storageArea === localStorage) {
        toast.success('נתוח תלמיד חדש! מרענן את הנתונים...');
        loadData();
      }
    };

    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', handleStorageChange);

    // Also check for changes in the same tab using custom event
    const handleCustomRefresh = () => {
      toast.success('נתוח תלמיד חדש! מרענן את הנתונים...');
      loadData();
    };

    window.addEventListener('dashboardRefresh', handleCustomRefresh);

    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('dashboardRefresh', handleCustomRefresh);
    };
  }, []);

  // Check connection status
  const checkConnection = () => {
    const connected = isConnectedToRealData();
    setIsConnected(connected);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [studentsData, statsData] = await Promise.all([
        getAllStudents(),
        getStats()
      ]);

      setStudents(studentsData);
      setStats(statsData);

      toast.success('נתונים נטענו בהצלחה');
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      toast.error('שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadData();
    } finally {
      setRefreshing(false);
    }
  };

  // Sync new students only
  const handleSyncNewStudents = async () => {
    setSyncing(true);
    try {
      const response = await syncNewStudents();

      if (response.success) {
        if (response.added > 0) {
          toast.success(`נוספו ${response.added} תלמידים חדשים!`);
          await loadData();
        } else {
          toast.success('אין תלמידים חדשים');
        }
      } else {
        toast.error(`שגיאה: ${response.error || 'לא ידוע'}`);
      }
    } catch (error) {
      console.error('Error syncing new students:', error);
      toast.error('שגיאה בסנכרון. בדוק את החיבור ל-Google Sheets');
    } finally {
      setSyncing(false);
    }
  };

  // Initial sync of all existing students
  const handleInitialSync = async () => {
    const confirmSync = window.confirm(
      'האם לסנכרן את כל התלמידים שכבר ענו על הטופס?\n' +
      'פעולה זו תוסיף את כל התלמידים שעדיין לא במערכת.'
    );

    if (!confirmSync) return;

    setInitialSyncing(true);
    try {
      const response = await initialSyncAllStudents();

      if (response.success) {
        toast.success(`${response.message}\nנוספו ${response.added} תלמידים!`);
        await loadData();
      } else {
        toast.error(`שגיאה: ${response.error || 'לא ידוע'}`);
      }
    } catch (error) {
      console.error('Error in initial sync:', error);
      toast.error('שגיאה בסנכרון ראשוני. בדוק את החיבור ל-Google Sheets');
    } finally {
      setInitialSyncing(false);
    }
  };

  // Memoized filtered and sorted students
  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    if (searchQuery.trim()) {
      result = searchStudents(searchQuery, result);
    }

    result = filterStudents(result, filters);
    result = sortStudents(result, sortBy, sortOrder);

    return result;
  }, [students, searchQuery, filters, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const paginatedStudents = filteredAndSortedStudents.slice(startIndex, startIndex + studentsPerPage);

  // Filter options
  const filterOptions = useMemo(() => {
    if (students.length === 0) return null;
    return getFilterOptions(students);
  }, [students]);

  // Calculated stats for filtered results
  const filteredStats = useMemo(() => {
    if (filteredAndSortedStudents.length === 0) return stats;
    return calculateStats(filteredAndSortedStudents);
  }, [filteredAndSortedStudents, stats]);

  // Export functions
  const handleExportExcel = async () => {
    try {
      toast.loading('מייצא לקובץ Excel...');
      await exportToExcel(filteredAndSortedStudents);
      toast.dismiss();
      toast.success('קובץ Excel נוצר בהצלחה');
    } catch (err) {
      toast.dismiss();
      toast.error('שגיאה בייצוא לקובץ Excel');
      console.error('Export error:', err);
    }
  };

  const handleExportPDF = async () => {
    try {
      toast.loading('מייצא לקובץ PDF...');
      await exportToPDF(filteredAndSortedStudents);
      toast.dismiss();
      toast.success('קובץ PDF נוצר בהצלחה');
    } catch (err) {
      toast.dismiss();
      toast.error('שגיאה בייצוא לקובץ PDF');
      console.error('Export error:', err);
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, sortBy, sortOrder]);

  // Handle connection success
  const handleConnectionSuccess = (config) => {
    setIsConnected(true);
    setShowConnectionSetup(false);
    toast.success('מחובר לנתונים אמיתיים! רוענן את הדשבורד...');

    setTimeout(() => {
      loadData();
    }, 1000);
  };

  // Error State
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-error-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-6) auto'
          }}>
            <AlertCircle size={32} color="var(--color-error)" />
          </div>
          <h2 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-gray-900)',
            margin: '0 0 var(--space-2) 0'
          }}>
            שגיאה בטעינת הנתונים
          </h2>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-gray-600)',
            margin: '0 0 var(--space-6) 0'
          }}>
            {error}
          </p>
          <Button onClick={loadData} variant="primary">
            נסה שוב
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--color-gray-200)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: 'var(--space-4) var(--space-8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-6)',
          flexWrap: 'wrap'
        }}>
          {/* Logo & Title */}
          <div>
            <h1 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-gray-900)',
              margin: '0 0 var(--space-1) 0',
              lineHeight: 'var(--leading-tight)'
            }}>
              דשבורד ניתוח תלמידים
            </h1>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-gray-600)',
              margin: 0
            }}>
              מערכת AI לניתוח ומעקב אחר התקדמות התלמידים
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            flexWrap: 'wrap'
          }}>
            {/* Connection Status Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: isConnected ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
              border: `1px solid ${isConnected ? 'var(--color-success-light)' : 'var(--color-warning-light)'}`,
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              color: isConnected ? 'var(--color-success)' : 'var(--color-warning)'
            }}>
              <Database size={16} />
              <span>{isConnected ? 'נתונים אמיתיים' : 'נתוני דמו'}</span>
            </div>

            <Button
              variant="secondary"
              size="md"
              icon={<Settings size={16} />}
              onClick={() => setShowConnectionSetup(true)}
            >
              חיבור לנתונים
            </Button>

            <Button
              variant="ghost"
              size="md"
              icon={<RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              רענן
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<FileText size={16} />}
              onClick={handleExportExcel}
            >
              Excel
            </Button>

            <Button
              variant="secondary"
              size="md"
              icon={<Download size={16} />}
              onClick={handleExportPDF}
            >
              PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'var(--space-8)'
      }}>
        {/* Demo Data Notice */}
        {!isConnected && (
          <div style={{
            padding: 'var(--space-4)',
            backgroundColor: 'var(--color-warning-bg)',
            border: '1px solid var(--color-warning-light)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-6)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-3)'
          }}>
            <AlertCircle size={20} color="var(--color-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <h3 style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-gray-900)',
                margin: '0 0 var(--space-1) 0'
              }}>
                אתה רואה נתוני דמו
              </h3>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-gray-700)',
                margin: 0
              }}>
                כדי לראות את התלמידים האמיתיים מגוגל פורמס, לחץ על "חיבור לנתונים" למעלה
              </p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards stats={filteredStats} loading={loading} />

        {/* Sync Buttons Section */}
        {isConnected && !loading && (
          <div style={{
            padding: 'var(--space-6)',
            backgroundColor: 'var(--bg-primary)',
            border: '1px solid var(--color-gray-200)',
            borderRadius: 'var(--radius-xl)',
            marginBottom: 'var(--space-6)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 'var(--space-4)'
            }}>
              <div>
                <h3 style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-gray-900)',
                  margin: '0 0 var(--space-1) 0'
                }}>
                  סנכרון תלמידים
                </h3>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-gray-600)',
                  margin: 0
                }}>
                  הבא תלמידים חדשים מגוגל פורמס
                </p>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<Download size={16} />}
                  onClick={handleInitialSync}
                  loading={initialSyncing}
                  disabled={initialSyncing}
                >
                  סנכרון ראשוני
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  icon={<RefreshCw size={16} />}
                  onClick={handleSyncNewStudents}
                  loading={syncing}
                  disabled={syncing}
                >
                  סנכרן תלמידים חדשים
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Data Analytics - Tables, Charts, Insights */}
        {!loading && (
          <DataAnalytics
            students={filteredAndSortedStudents}
            stats={filteredStats}
          />
        )}

        {/* Charts Section */}
        {!loading && (
          <ChartsSection
            students={filteredAndSortedStudents}
            stats={filteredStats}
          />
        )}

        {/* Search and Filters */}
        <SearchAndFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filters={filters}
          setFilters={setFilters}
          filterOptions={filterOptions}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        {/* Results Summary */}
        <div style={{
          marginBottom: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-4)'
        }}>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-gray-600)'
          }}>
            {filteredAndSortedStudents.length === students.length ? (
              <span>מציג <strong>{students.length}</strong> תלמידים</span>
            ) : (
              <span>
                מציג <strong>{filteredAndSortedStudents.length}</strong> מתוך <strong>{students.length}</strong> תלמידים
              </span>
            )}
          </div>

          {totalPages > 1 && (
            <div style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-gray-600)'
            }}>
              עמוד {currentPage} מתוך {totalPages}
            </div>
          )}
        </div>

        {/* Students Grid */}
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--color-gray-200)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'var(--space-6)',
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              >
                <div style={{ marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-gray-100)' }}>
                  <div style={{ width: '60%', height: '20px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }} />
                  <div style={{ width: '40%', height: '16px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)' }} />
                </div>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <div style={{ width: '80%', height: '14px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2)' }} />
                  <div style={{ width: '70%', height: '14px', backgroundColor: 'var(--color-gray-200)', borderRadius: 'var(--radius-md)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedStudents.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--space-16) var(--space-8)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-gray-100)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-4) auto'
            }}>
              <Users size={32} color="var(--color-gray-400)" />
            </div>
            <h3 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-gray-700)',
              margin: '0 0 var(--space-2) 0'
            }}>
              לא נמצאו תלמידים
            </h3>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-gray-500)',
              margin: '0 0 var(--space-6) 0'
            }}>
              נסה לשנות את תנאי החיפוש או המסננים
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setFilters({
                  classId: 'all',
                  quarter: 'all',
                  learningStyle: 'all',
                  minStrengths: '',
                  maxChallenges: ''
                });
              }}
            >
              נקה מסננים
            </Button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 'var(--space-6)'
          }}>
            {paginatedStudents.map((student, index) => (
              <StudentCard
                key={student.studentCode}
                student={student}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-8)'
          }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              הקודם
            </Button>

            <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    style={{
                      width: '40px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)',
                      border: currentPage === pageNum ? 'none' : '1px solid var(--color-gray-300)',
                      backgroundColor: currentPage === pageNum ? 'var(--color-primary-600)' : 'var(--bg-primary)',
                      color: currentPage === pageNum ? '#ffffff' : 'var(--color-gray-700)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)'
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              הבא
            </Button>
          </div>
        )}
      </main>

      {/* Data Connection Setup Modal */}
      {showConnectionSetup && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 'var(--z-modal-backdrop)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowConnectionSetup(false);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowConnectionSetup(false);
            }
          }}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-2xl)',
              boxShadow: 'var(--shadow-2xl)',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              position: 'sticky',
              top: 0,
              backgroundColor: 'var(--bg-primary)',
              borderBottom: '1px solid var(--color-gray-200)',
              padding: 'var(--space-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 'var(--radius-2xl) var(--radius-2xl) 0 0',
              zIndex: 1
            }}>
              <h2 style={{
                fontSize: 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-gray-900)',
                margin: 0
              }}>
                הגדרת חיבור לנתונים
              </h2>
              <button
                onClick={() => setShowConnectionSetup(false)}
                style={{
                  padding: 'var(--space-2)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-2xl)',
                  color: 'var(--color-gray-500)',
                  lineHeight: 1,
                  transition: 'all var(--transition-base)'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: 'var(--space-6)' }}>
              <DataConnectionSetup
                onConnectionSuccess={handleConnectionSuccess}
                currentConfig={getSavedConfig()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Debug Connection Status */}
      <ConnectionStatus />
    </div>
  );
};

// Add CSS animation for spinner
if (typeof document !== 'undefined' && !document.getElementById('dashboard-animations')) {
  const style = document.createElement('style');
  style.id = 'dashboard-animations';
  style.textContent = `
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(style);
}

export default Dashboard;
