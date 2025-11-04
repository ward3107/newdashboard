/**
 * Enhanced Analytics Dashboard
 * Comprehensive data visualization with real student analysis
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Brain,
  Heart,
  Target,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  ChevronRight,
  Info,
  Activity,
  Award,
  BookOpen,
  Zap,
} from 'lucide-react';
import { AnalysisAggregator } from '../../services/analysisAggregator';
import { generateAnalyticsPDF } from '../../utils/pdfExport';
import { getStudentIdentifier } from '../../utils/studentFieldDetector';
import {
  PerformanceDistributionChart,
  EmotionalHealthChart,
  ClassPerformanceChart,
  PerformanceTrendsChart,
  StrengthsDistributionChart,
  RiskDistributionChart,
  AdvancedMetricsChart,
  ParticipationLevelsChart,
} from '../charts/AnalysisCharts';

interface Student {
  studentCode: string;
  name: string;
  className?: string;
  keyStrengths?: string[];
  areasNeedingSupport?: string[];
  emotionalState?: string;
  learningStyle?: string;
  challengesBehaviors?: string[];
  interventions?: string[];
  personalityTraits?: string[];
  grade?: number;
  lastAssessment?: number;
  attendanceRate?: number;
  participationLevel?: string;
  collaborationSkills?: string;
  criticalThinking?: string;
  creativityLevel?: string;
  needsAnalysis?: boolean;
  strengthsCount?: number;
  lastAnalysisDate?: string;
  performanceTrend?: 'improving' | 'stable' | 'declining';
  riskLevel?: 'low' | 'medium' | 'high';
}

interface Props {
  students: Student[];
  darkMode?: boolean;
  onRefresh?: () => void;
}

const EnhancedAnalyticsDashboard: React.FC<Props> = ({ students, darkMode = false, onRefresh }) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to content when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTimeout(() => {
      contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  // Aggregate all analysis data
  const analysisData = useMemo(() => {
    return AnalysisAggregator.aggregateStudentData(students);
  }, [students]);

  // Filter students based on selection
  const filteredStudents = useMemo(() => {
    switch (selectedFilter) {
      case 'analyzed':
        return students.filter(s => !s.needsAnalysis && (s.strengthsCount || 0) > 0);
      case 'unanalyzed':
        return students.filter(s => s.needsAnalysis || (s.strengthsCount || 0) === 0);
      case 'at-risk':
        return students.filter(s => {
          const riskFactors = [];
          if ((s.grade || 100) < 60) riskFactors.push(1);
          if (s.performanceTrend === 'declining') riskFactors.push(1);
          if (s.participationLevel?.toLowerCase().includes('low')) riskFactors.push(1);
          return riskFactors.length >= 2;
        });
      default:
        return students;
    }
  }, [students, selectedFilter]);

  // Recalculate data when filter changes
  const filteredAnalysisData = useMemo(() => {
    return AnalysisAggregator.aggregateStudentData(filteredStudents);
  }, [filteredStudents]);

  const handleRefresh = async () => {
    setIsLoading(true);
    if (onRefresh) {
      await onRefresh();
    }
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await generateAnalyticsPDF(filteredAnalysisData, {
        title: t('analytics.export.reportTitle'),
        subtitle: `${t('analytics.students')}: ${filteredAnalysisData.totalStudents}`,
        darkMode,
      });
      // Success notification could be added here
    } catch (error) {
      console.error('❌ Error exporting PDF:', error);
      alert(t('analytics.export.error'));
    } finally {
      setIsExporting(false);
    }
  };

  const tabs = [
    { id: 'overview', label: t('analytics.tabs.overview'), icon: BarChart3 },
    { id: 'academic', label: t('analytics.tabs.academic'), icon: BookOpen },
    { id: 'behavioral', label: t('analytics.tabs.behavioral'), icon: Brain },
    { id: 'emotional', label: t('analytics.tabs.emotional'), icon: Heart },
    { id: 'risk', label: t('analytics.tabs.risk'), icon: AlertTriangle },
    { id: 'advanced', label: t('analytics.tabs.advanced'), icon: Zap },
  ];

  return (
    <div className={`min-h-screen p-4 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`} dir="rtl">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-right`}>
              {t('analytics.title')}
            </h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-right`}>
              {t('analytics.subtitle')} • {analysisData.totalStudents} {t('analytics.students')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Dropdown */}
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700 text-white'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
            >
              <option value="all">{t('analytics.filters.all')}</option>
              <option value="analyzed">{t('analytics.filters.analyzed')}</option>
              <option value="unanalyzed">{t('analytics.filters.unanalyzed')}</option>
              <option value="at-risk">{t('analytics.filters.atRisk')}</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className={`p-2 rounded-lg transition-all ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-white'
                  : 'bg-white hover:bg-gray-100 text-gray-700'
              } ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={20} />
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                darkMode
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              } ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download size={18} className={isExporting ? 'animate-bounce' : ''} />
              {isExporting ? t('analytics.export.generating') : t('analytics.export')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3 py-2 flex items-center gap-1.5 border-b-2 transition-all text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? `border-blue-500 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Cards - Teacher Priority */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <QuickActionCard
          title={t('analytics.actionCards.urgentAttention')}
          count={filteredAnalysisData.riskDistribution.high}
          icon={AlertTriangle}
          color="red"
          darkMode={darkMode}
          onClick={() => setSelectedFilter('at-risk')}
          students={filteredStudents.filter(s => s.riskLevel === 'high' || (s.grade || 100) < 60)}
          t={t}
        />
        <QuickActionCard
          title={t('analytics.actionCards.needsConversation')}
          count={filteredAnalysisData.riskDistribution.medium}
          icon={Users}
          color="yellow"
          darkMode={darkMode}
          onClick={() => setSelectedFilter('at-risk')}
          students={filteredStudents.filter(s => s.riskLevel === 'medium' || ((s.grade || 100) >= 60 && (s.grade || 100) < 75))}
          t={t}
        />
        <QuickActionCard
          title={t('analytics.actionCards.showingProgress')}
          count={filteredAnalysisData.performanceTrends.improving}
          icon={TrendingUp}
          color="green"
          darkMode={darkMode}
          onClick={() => {}}
          students={filteredStudents.filter(s => s.performanceTrend === 'improving')}
          t={t}
        />
      </div>

      {/* Weekly Summary */}
      <WeeklySummary data={filteredAnalysisData} darkMode={darkMode} t={t} students={filteredStudents} />

      {/* Tab Content */}
      <div ref={contentRef} className="space-y-4">
        {activeTab === 'overview' && (
          <>
            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ChartCard
                title={t('analytics.charts.performance')}
                icon={TrendingUp}
                darkMode={darkMode}
              >
                <PerformanceDistributionChart data={filteredAnalysisData} darkMode={darkMode} />
              </ChartCard>

              <ChartCard
                title={t('analytics.charts.classPerformance')}
                icon={Users}
                darkMode={darkMode}
              >
                <ClassPerformanceChart data={filteredAnalysisData} darkMode={darkMode} />
              </ChartCard>

              <ChartCard
                title={t('analytics.charts.participation')}
                icon={Activity}
                darkMode={darkMode}
              >
                <ParticipationLevelsChart data={filteredAnalysisData} darkMode={darkMode} />
              </ChartCard>
            </div>

            {/* Top Insights */}
            <InsightsSection
              title={t('analytics.insights.title')}
              insights={generateInsights(filteredAnalysisData)}
              darkMode={darkMode}
            />
          </>
        )}

        {activeTab === 'academic' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('analytics.charts.performanceTrends')}
              icon={TrendingUp}
              darkMode={darkMode}
            >
              <PerformanceTrendsChart data={filteredAnalysisData} darkMode={darkMode} />
            </ChartCard>

            <ChartCard
              title={t('analytics.charts.strengths')}
              icon={Award}
              darkMode={darkMode}
            >
              <StrengthsDistributionChart data={filteredAnalysisData} darkMode={darkMode} />
            </ChartCard>
          </div>
        )}

        {activeTab === 'emotional' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('analytics.charts.emotionalHealth')}
              icon={Heart}
              darkMode={darkMode}
            >
              <EmotionalHealthChart data={filteredAnalysisData} darkMode={darkMode} />
            </ChartCard>

            <ChartCard
              title={t('analytics.charts.wellbeingFactors')}
              icon={Brain}
              darkMode={darkMode}
            >
              <div className="p-4">
                <WellbeingFactors data={filteredAnalysisData} darkMode={darkMode} />
              </div>
            </ChartCard>
          </div>
        )}

        {activeTab === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('analytics.charts.riskDistribution')}
              icon={AlertTriangle}
              darkMode={darkMode}
            >
              <RiskDistributionChart data={filteredAnalysisData} darkMode={darkMode} />
            </ChartCard>

            <ChartCard
              title={t('analytics.charts.atRiskStudents')}
              icon={Users}
              darkMode={darkMode}
            >
              <AtRiskStudentsList students={filteredAnalysisData.studentsAtRisk} darkMode={darkMode} />
            </ChartCard>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title={t('analytics.charts.advancedMetrics')}
              icon={Zap}
              darkMode={darkMode}
              fullWidth
            >
              <AdvancedMetricsChart data={filteredAnalysisData} darkMode={darkMode} />
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Components

const MetricCard: React.FC<{
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
  darkMode: boolean;
  trend?: 'up' | 'down' | 'stable';
}> = ({ title, value, change, icon: Icon, color, darkMode, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend === 'up') return <TrendingUp size={16} className="text-green-500" />;
    if (trend === 'down') return <Activity size={16} className="text-red-500" />;
    return <span className="text-gray-400">→</span>;
  };

  return (
    <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} shadow-lg hover:shadow-xl transition-all`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} bg-opacity-20`}>
          <Icon size={20} className={colorClasses[color as keyof typeof colorClasses].replace('bg-', 'text-')} />
        </div>
        {getTrendIcon()}
      </div>
      <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} text-right`}>
        {value}
      </h3>
      <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 text-right`}>
        {title}
      </p>
      <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 text-right`}>
        {change}
      </p>
    </div>
  );
};

const ChartCard: React.FC<{
  title: string;
  icon: any;
  darkMode: boolean;
  children: React.ReactNode;
  fullWidth?: boolean;
}> = ({ title, icon: Icon, darkMode, children, fullWidth = false }) => {
  return (
    <div className={`${fullWidth ? 'lg:col-span-2' : ''} ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-4 shadow-lg`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon size={18} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} text-right`}>
            {title}
          </h3>
        </div>
        <button className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}>
          <Info size={14} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
        </button>
      </div>
      {children}
    </div>
  );
};

const InsightsSection: React.FC<{
  title: string;
  insights: string[];
  darkMode: boolean;
}> = ({ title, insights, darkMode }) => {
  return (
    <div className={`${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-xl p-6 shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'} text-right`}>
        {title}
      </h3>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex items-start gap-3">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-right flex-1`}>
              {insight}
            </p>
            <ChevronRight size={16} className="text-blue-500 mt-0.5 flex-shrink-0 rotate-180" />
          </div>
        ))}
      </div>
    </div>
  );
};

const WellbeingFactors: React.FC<{ data: any; darkMode: boolean }> = ({ data, darkMode }) => {
  const factors = [
    { label: 'מעורבות', value: data.engagementScore, max: 100 },
    { label: 'רווחה נפשית', value: data.wellbeingIndex, max: 100 },
    { label: 'מוכנות אקדמית', value: data.academicReadiness, max: 100 },
    { label: 'השתלבות חברתית', value: data.socialIntegration, max: 100 },
  ];

  return (
    <div className="space-y-4">
      {factors.map((factor, index) => (
        <div key={index}>
          <div className="flex justify-between mb-2">
            <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {factor.value}%
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {factor.label}
            </span>
          </div>
          <div className={`h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
            <div
              className={`h-2 rounded-full transition-all ${
                factor.value >= 70 ? 'bg-green-500' : factor.value >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(factor.value / factor.max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

const AtRiskStudentsList: React.FC<{ students: any[]; darkMode: boolean }> = ({ students, darkMode }) => {
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {students.length === 0 ? (
        <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          אין תלמידים בסיכון גבוה
        </p>
      ) : (
        students.map((student, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'} hover:shadow-md transition-shadow`}
          >
            <div className="flex justify-between items-start">
              <div className="text-right flex-1">
                <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {student.name}
                </p>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  קוד: {student.code}
                </p>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 justify-end">
              {student.riskFactors.map((factor: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs rounded-full bg-red-500 bg-opacity-20 text-red-600 font-medium"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  title: string;
  count: number;
  icon: any;
  color: 'red' | 'yellow' | 'green';
  darkMode: boolean;
  onClick: () => void;
  students?: Student[];
  t?: any;
}> = ({ title, count, icon: Icon, color, darkMode, onClick, students = [], t }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const colorClasses = {
    red: { bg: 'from-red-500 to-orange-500', border: 'border-red-500', text: 'text-red-600', icon: 'text-red-500' },
    yellow: { bg: 'from-yellow-500 to-orange-500', border: 'border-yellow-500', text: 'text-yellow-600', icon: 'text-yellow-500' },
    green: { bg: 'from-green-500 to-emerald-500', border: 'border-green-500', text: 'text-green-600', icon: 'text-green-500' },
  };

  const colors = colorClasses[color];

  return (
    <div
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] relative ${
        darkMode
          ? 'bg-gray-800 border-2 border-gray-700 hover:border-gray-600'
          : 'bg-white border-2 border-gray-200 hover:shadow-lg'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-xl bg-gradient-to-r ${colors.bg}`}>
          <Icon size={20} className="text-white" />
        </div>
        <ChevronRight size={18} className={darkMode ? 'text-gray-400' : 'text-gray-500'} />
      </div>
      <h3 className={`text-3xl font-bold mb-1 text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        {count}
      </h3>
      <p className={`text-sm font-medium text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
        {title}
      </p>
      <button className={`mt-2 text-xs px-3 py-1 rounded-lg ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} hover:opacity-80 transition-opacity w-full`}>
        לחץ לצפייה →
      </button>

      {/* Tooltip with student list */}
      {showTooltip && students && students.length > 0 && (
        <div className={`absolute bottom-full left-0 right-0 mb-2 p-3 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto ${
          darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-300'
        }`}>
          <p className={`text-xs font-semibold mb-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {t?.('analytics.tooltips.students') || 'תלמידים'}:
          </p>
          <div className="space-y-1">
            {students.slice(0, 10).map((student, idx) => {
              const identifier = getStudentIdentifier(student);
              return (
                <div key={idx} className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`font-medium text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {identifier.displayName || t('common.student')}
                  </p>
                  {identifier.code && (
                    <p className={`text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      קוד: {identifier.code}
                    </p>
                  )}
                </div>
              );
            })}
            {students.length > 10 && (
              <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                +{students.length - 10} עוד
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Weekly Summary Component
const WeeklySummary: React.FC<{
  data: any;
  darkMode: boolean;
  t: any;
  students?: Student[];
}> = ({ data, darkMode, t, students = [] }) => {
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  // Filter students by category
  const getStudentsByCategory = (category: string): Student[] => {
    if (!students || students.length === 0) return [];

    switch (category) {
      case 'improving':
        return students.filter(s => s.performanceTrend === 'improving');
      case 'declining':
        return students.filter(s => s.performanceTrend === 'declining');
      case 'recent':
        return students.filter(s => !s.needsAnalysis && (s.strengthsCount || 0) > 0);
      default:
        return [];
    }
  };

  const summaryItems = [
    {
      label: t('analytics.weeklySummary.improved'),
      value: data.performanceTrends.improving,
      icon: TrendingUp,
      color: 'text-green-500',
      bg: darkMode ? 'bg-green-900/20' : 'bg-green-50',
      students: getStudentsByCategory('improving')
    },
    {
      label: t('analytics.weeklySummary.declined'),
      value: data.performanceTrends.declining,
      icon: Activity,
      color: 'text-red-500',
      bg: darkMode ? 'bg-red-900/20' : 'bg-red-50',
      students: getStudentsByCategory('declining')
    },
    {
      label: t('analytics.weeklySummary.newAnalyses'),
      value: data.recentAnalyses,
      icon: Brain,
      color: 'text-blue-500',
      bg: darkMode ? 'bg-blue-900/20' : 'bg-blue-50',
      students: getStudentsByCategory('recent')
    },
  ];

  return (
    <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700' : 'bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200'}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className={`text-lg font-bold text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          📊 {t('analytics.weeklySummary.title')}
        </h2>
        <span className={`text-xs px-2 py-1 rounded-full ${darkMode ? 'bg-blue-800 text-blue-200' : 'bg-blue-200 text-blue-800'}`}>
          {t('analytics.weeklySummary.thisWeek')}
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {summaryItems.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredItem(index)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`p-3 rounded-lg ${item.bg} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} relative transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-center justify-between mb-1">
                <ItemIcon size={18} className={item.color} />
                <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {item.value}
                </p>
              </div>
              <p className={`text-sm text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.label}
              </p>

              {/* Tooltip with student list */}
              {hoveredItem === index && item.students && item.students.length > 0 && (
                <div className={`absolute bottom-full left-0 right-0 mb-2 p-3 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto ${
                  darkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-300'
                }`}>
                  <p className={`text-xs font-semibold mb-2 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {t('analytics.tooltips.students')}:
                  </p>
                  <div className="space-y-1">
                    {item.students.slice(0, 10).map((student, idx) => {
                      const identifier = getStudentIdentifier(student);
                      return (
                        <div key={idx} className={`text-xs p-2 rounded ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                          <p className={`font-medium text-right ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {identifier.displayName || t('common.student')}
                          </p>
                          {identifier.code && (
                            <p className={`text-right text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              קוד: {identifier.code}
                            </p>
                          )}
                        </div>
                      );
                    })}
                    {item.students.length > 10 && (
                      <p className={`text-xs text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{item.students.length - 10} עוד
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generate insights based on data
function generateInsights(data: any): string[] {
  const insights = [];

  // Completion rate insight
  if (data.analysisCompletionRate < 50) {
    insights.push(`רק ${data.analysisCompletionRate.toFixed(1)}% מהתלמידים נותחו. מומלץ להשלים ניתוח עבור ${data.unanalyzedStudents} תלמידים נוספים.`);
  } else if (data.analysisCompletionRate > 80) {
    insights.push(`${data.analysisCompletionRate.toFixed(1)}% מהתלמידים נותחו - כיסוי מצוין של נתוני הכיתה.`);
  }

  // Performance insight
  if (data.performanceTrends.improving > data.performanceTrends.declining) {
    insights.push(`מגמה חיובית: ${data.performanceTrends.improving} תלמידים מראים שיפור בביצועים.`);
  } else if (data.performanceTrends.declining > 5) {
    insights.push(`${data.performanceTrends.declining} תלמידים מראים ירידה בביצועים - דורש התערבות.`);
  }

  // Emotional health insight
  if (data.emotionalHealth.concerning > data.emotionalHealth.positive) {
    insights.push(`${data.emotionalHealth.concerning} תלמידים במצב רגשי מדאיג - מומלץ לפנות לייעוץ.`);
  }

  // Risk insight
  if (data.riskDistribution.high > 0) {
    insights.push(`${data.riskDistribution.high} תלמידים בסיכון גבוה דורשים התייחסות מיידית.`);
  }

  // Engagement insight
  if (data.engagementScore < 60) {
    insights.push(`רמת המעורבות הכיתתית (${data.engagementScore}%) נמוכה מהממוצע.`);
  }

  return insights;
}

export default EnhancedAnalyticsDashboard;