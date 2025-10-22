import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import React, { useCallback, useMemo } from 'react';

import { Stats, Student, UseStatsHook, ChartData } from '../types';
import { getStats, calculateStats } from '../api/studentAPI';
import { trackEvent, formatPercentage } from '../utils';

const QUERY_KEY = 'stats';
const CACHE_TIME = 15 * 60 * 1000; // 15 minutes
const STALE_TIME = 10 * 60 * 1000; // 10 minutes

export const useStats = (): UseStatsHook & {
  chartData: {
    classDistribution: ChartData[];
    learningStyleDistribution: ChartData[];
    strengthsVsChallenges: ChartData[];
  };
  insights: {
    largestClass: string | null;
    mostCommonLearningStyle: string | null;
    averageRatio: number;
    trendAnalysis: string;
  };
  refreshStats: () => Promise<void>;
} => {
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading: loading,
    error,
    refetch
  } = useQuery<Stats>({
    queryKey: [QUERY_KEY],
    queryFn: getStats,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Handle error with useEffect
  React.useEffect(() => {
    if (error) {
      toast.error(`שגיאה בטעינת הסטטיסטיקות: ${error.message}`);
      trackEvent('stats_fetch_error', { error: error.message });
    }
  }, [error]);

  // Handle success with useEffect
  React.useEffect(() => {
    if (stats) {
      trackEvent('stats_fetch_success', {
        totalStudents: stats.totalStudents,
        classCount: Object.keys(stats.byClass || {}).length,
        learningStyleCount: Object.keys(stats.byLearningStyle || {}).length
      });
    }
  }, [stats]);

  // Generate chart data
  const chartData = useMemo(() => {
    if (!stats) {
      return {
        classDistribution: [],
        learningStyleDistribution: [],
        strengthsVsChallenges: []
      };
    }

    const classDistribution: ChartData[] = Object.entries(stats.byClass || {}).map(([name, value]) => ({
      name,
      value: value as number,
      percentage: formatPercentage(value as number, stats.totalStudents)
    }));

    const learningStyleDistribution: ChartData[] = Object.entries(stats.byLearningStyle || {}).map(([name, value]) => ({
      name,
      value: value as number,
      percentage: formatPercentage(value as number, stats.totalStudents)
    }));

    // For strengths vs challenges, we'll use the average values
    const strengthsVsChallenges: ChartData[] = [
      {
        name: 'חוזקות',
        value: parseFloat(stats.averageStrengths?.toString() || '0')
      },
      {
        name: 'אתגרים',
        value: parseFloat(stats.averageChallenges?.toString() || '0')
      }
    ];

    return {
      classDistribution,
      learningStyleDistribution,
      strengthsVsChallenges
    };
  }, [stats]);

  // Generate insights
  const insights = useMemo(() => {
    if (!stats) {
      return {
        largestClass: null,
        mostCommonLearningStyle: null,
        averageRatio: 0,
        trendAnalysis: ''
      };
    }

    const largestClass = Object.entries(stats.byClass).reduce((max, [className, count]) =>
      count > (stats.byClass[max] || 0) ? className : max, ''
    );

    const mostCommonLearningStyle = Object.entries(stats.byLearningStyle).reduce((max, [style, count]) =>
      count > (stats.byLearningStyle[max] || 0) ? style : max, ''
    );

    const averageStrengths = parseFloat(stats.averageStrengths?.toString() || '0');
    const averageChallenges = parseFloat(stats.averageChallenges?.toString() || '1');
    const averageRatio = averageChallenges > 0 ? averageStrengths / averageChallenges : averageStrengths;

    let trendAnalysis = '';
    if (averageRatio > 2) {
      trendAnalysis = 'מצוין - יחס חיובי של חוזקות לאתגרים';
    } else if (averageRatio > 1.5) {
      trendAnalysis = 'טוב - יותר חוזקות מאתגרים';
    } else if (averageRatio > 1) {
      trendAnalysis = 'בינוני - חוזקות ואתגרים מאוזנים';
    } else {
      trendAnalysis = 'זקוק לתשומת לב - יותר אתגרים מחוזקות';
    }

    return {
      largestClass,
      mostCommonLearningStyle,
      averageRatio,
      trendAnalysis
    };
  }, [stats]);

  // Manual refresh function
  const refreshStats = useCallback(async () => {
    try {
      trackEvent('stats_refresh_requested');
      await refetch();
      toast.success('הסטטיסטיקות עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון הסטטיסטיקות');
      trackEvent('stats_refresh_error');
    }
  }, [refetch]);

  return {
    stats: stats ?? null,
    loading,
    error: error?.message || null,
    refetch: refreshStats,
    chartData,
    insights,
    refreshStats
  };
};

// Hook for calculated stats from student array (for filtered data)
export const useCalculatedStats = (students: Student[]) => {
  return useMemo(() => {
    if (!students.length) {
      return {
        totalStudents: 0,
        byClass: {},
        byLearningStyle: {},
        averageStrengths: '0',
        averageChallenges: '0'
      };
    }

    return calculateStats(students);
  }, [students]);
};

// Hook for real-time stats comparison
export const useStatsComparison = (filteredStudents: Student[]) => {
  const { stats: globalStats } = useStats();
  const filteredStats = useCalculatedStats(filteredStudents);

  const comparison = useMemo(() => {
    if (!globalStats || !filteredStats) return null;

    const totalDiff = filteredStats.totalStudents - globalStats.totalStudents;
    const strengthsDiff = parseFloat(filteredStats.averageStrengths.toString()) - parseFloat(globalStats.averageStrengths?.toString() || '0');
    const challengesDiff = parseFloat(filteredStats.averageChallenges?.toString() || '0') - parseFloat(globalStats.averageChallenges?.toString() || '0');

    return {
      totalDiff,
      strengthsDiff: Number(strengthsDiff.toFixed(1)),
      challengesDiff: Number(challengesDiff.toFixed(1)),
      isFiltered: filteredStats.totalStudents !== globalStats.totalStudents,
      percentageOfTotal: formatPercentage(filteredStats.totalStudents, globalStats.totalStudents)
    };
  }, [globalStats, filteredStats]);

  return {
    globalStats,
    filteredStats,
    comparison
  };
};

// Hook for stats caching and background updates
export const useStatsCache = () => {
  const queryClient = useQueryClient();

  const prefetchStats = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey: [QUERY_KEY],
      queryFn: getStats,
      staleTime: STALE_TIME
    });
  }, [queryClient]);

  const invalidateStats = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  const updateStatsCache = useCallback((newStats: Stats) => {
    queryClient.setQueryData([QUERY_KEY], newStats);
  }, [queryClient]);

  const getStatsFromCache = useCallback(() => {
    return queryClient.getQueryData<Stats>([QUERY_KEY]);
  }, [queryClient]);

  return {
    prefetchStats,
    invalidateStats,
    updateStatsCache,
    getStatsFromCache
  };
};

// Hook for stats history tracking
export const useStatsHistory = () => {
  const queryClient = useQueryClient();

  const addStatsSnapshot = useCallback((stats: Stats) => {
    const timestamp = new Date().toISOString();
    const snapshot = { ...stats, timestamp };

    const existingHistory = queryClient.getQueryData<Array<Stats & { timestamp: string }>>(['statsHistory']) || [];
    const newHistory = [...existingHistory, snapshot].slice(-30); // Keep last 30 snapshots

    queryClient.setQueryData(['statsHistory'], newHistory);

    // Save to localStorage for persistence
    localStorage.setItem('statsHistory', JSON.stringify(newHistory));

    trackEvent('stats_snapshot_added', { timestamp });
  }, [queryClient]);

  const getStatsHistory = useCallback(() => {
    return queryClient.getQueryData<Array<Stats & { timestamp: string }>>(['statsHistory']) || [];
  }, [queryClient]);

  const clearStatsHistory = useCallback(() => {
    queryClient.removeQueries({ queryKey: ['statsHistory'] });
    localStorage.removeItem('statsHistory');
    trackEvent('stats_history_cleared');
  }, [queryClient]);

  return {
    addStatsSnapshot,
    getStatsHistory,
    clearStatsHistory
  };
};

export default useStats;