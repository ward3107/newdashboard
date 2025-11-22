/**
 * ISHEBOT - Futuristic Dashboard Component
 * Main dashboard for student management and analytics
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  BookOpen,
  Brain,
  X,
  ChevronDown,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import { useStudents } from '../../hooks/useStudents';
import { VirtualStudentList } from '../optimized/VirtualStudentList';
import { Loading } from '../common/Loading';
import SecurityStatusWidget from '../security/SecurityStatusWidget';
import type { Student, Filters } from '../../types';

const FuturisticDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    students,
    loading,
    error,
    refetch,
    filteredStudents,
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    filterOptions,
    totalCount,
    clearFilters,
    exportData
  } = useStudents();

  const [showFilters, setShowFilters] = useState(false);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredStudents.length;
    const totalStrengths = filteredStudents.reduce((sum, s) => sum + s.strengthsCount, 0);
    const totalChallenges = filteredStudents.reduce((sum, s) => sum + s.challengesCount, 0);
    const avgStrengths = total > 0 ? (totalStrengths / total).toFixed(1) : '0';
    const avgChallenges = total > 0 ? (totalChallenges / total).toFixed(1) : '0';

    return {
      total,
      avgStrengths,
      avgChallenges,
      classes: filterOptions?.classes?.length || 0
    };
  }, [filteredStudents, filterOptions]);

  // Handle student click
  const handleStudentClick = (student: Student) => {
    navigate(`/student/${student.studentCode}`);
  };

  // Handle export
  const handleExport = () => {
    try {
      const data = exportData();
      const csv = convertToCSV(data);
      downloadCSV(csv, 'students.csv');
      toast.success(`${data.length} תלמידים יוצאו בהצלחה`);
    } catch (error) {
      toast.error('שגיאה בייצוא הנתונים');
    }
  };

  // Convert to CSV
  const convertToCSV = (data: Student[]) => {
    if (data.length === 0) return '';

    const headers = ['קוד תלמיד', 'כיתה', 'רבעון', 'סגנון למידה', 'חוזקות', 'אתגרים', 'הערות'];
    const rows = data.map(s => [
      s.studentCode,
      s.classId,
      s.quarter,
      s.learningStyle.replace(/\n/g, ' '),
      s.strengthsCount,
      s.challengesCount,
      s.keyNotes
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Download CSV
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (loading && students.length === 0) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              ISHEBOT
            </span>
          </h1>
          <p className="text-gray-600 text-lg">
            מערכת חכמה לניתוח והערכה הוליסטית של תלמידים
          </p>
        </div>

        {/* Security Status Widget */}
        <div className="mb-8 animate-fade-in-up">
          <SecurityStatusWidget />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up">
          <StatsCard
            icon={<Users className="w-6 h-6" />}
            label="סך התלמידים"
            value={stats.total}
            color="blue"
          />
          <StatsCard
            icon={<BookOpen className="w-6 h-6" />}
            label="כיתות"
            value={stats.classes}
            color="purple"
          />
          <StatsCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="ממוצע חוזקות"
            value={stats.avgStrengths}
            color="green"
          />
          <StatsCard
            icon={<Brain className="w-6 h-6" />}
            label="ממוצע אתגרים"
            value={stats.avgChallenges}
            color="orange"
          />
        </div>

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="חיפוש תלמידים..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all ${
                  showFilters
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-5 h-5" />
                <span className="hidden md:inline">פילטרים</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              <button
                onClick={handleExport}
                disabled={filteredStudents.length === 0}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span className="hidden md:inline">ייצוא</span>
              </button>

              <button
                onClick={refetch}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">רענון</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 animate-slide-down">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    כיתה
                  </label>
                  <select
                    value={filters.classId}
                    onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">הכל</option>
                    {filterOptions?.classes?.map((cls: string) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quarter Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    רבעון
                  </label>
                  <select
                    value={filters.quarter}
                    onChange={(e) => setFilters({ ...filters, quarter: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">הכל</option>
                    {filterOptions?.quarters?.map((q: string) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מיון לפי
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="studentCode">קוד תלמיד</option>
                    <option value="classId">כיתה</option>
                    <option value="strengthsCount">חוזקות</option>
                    <option value="challengesCount">אתגרים</option>
                    <option value="date">תאריך</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  נקה פילטרים
                </button>
                <span className="text-sm text-gray-500">
                  מציג {totalCount} מתוך {students.length} תלמידים
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in-up">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Student List */}
        <div className="animate-fade-in-up">
          {filteredStudents.length > 0 ? (
            <VirtualStudentList
              students={filteredStudents}
              height={600}
              itemHeight={160}
              onStudentClick={handleStudentClick}
              searchQuery={searchQuery}
              className="rounded-2xl shadow-lg overflow-hidden"
            />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                לא נמצאו תלמידים
              </h3>
              <p className="text-gray-500 mb-4">
                נסה לשנות את החיפוש או הפילטרים
              </p>
              <button
                onClick={clearFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                נקה פילטרים
              </button>
            </div>
          )}
        </div>

        {/* Footer - Assessment Form Link */}
        <div className="mt-8 animate-fade-in-up">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-1">שאלון הערכת תלמיד</h3>
                  <p className="text-blue-100 text-sm">
                    מלא שאלון לתלמיד חדש או עדכן נתונים קיימים
                  </p>
                </div>
              </div>
              <Link
                to="/assessment"
                className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <span>פתח שאלון</span>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
};

export default FuturisticDashboard;
