import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

import { Student, Filters, UseStudentsHook, SortBy, SortOrder } from '../types';
import {
  getAllStudents,
  searchStudents,
  filterStudents,
  sortStudents,
  getFilterOptions
} from '../api/studentAPI';
import { debounce, trackEvent } from '../utils';

const QUERY_KEY = 'students';
const CACHE_TIME = 10 * 60 * 1000; // 10 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useStudents = (): UseStudentsHook & {
  filteredStudents: Student[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  sortBy: SortBy;
  setSortBy: (sortBy: SortBy) => void;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  filterOptions: any;
  totalCount: number;
  clearFilters: () => void;
  exportData: () => Student[];
} => {
  const queryClient = useQueryClient();

  // State for search and filters
  const [searchQuery, setSearchQueryState] = useState<string>('');
  const [filters, setFilters] = useState<Filters>({
    classId: 'all',
    quarter: 'all',
    learningStyle: 'all',
    minStrengths: '',
    maxChallenges: ''
  });
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // React Query for data fetching
  const {
    data: students = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getAllStudents,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error: Error) => {
      toast.error(`שגיאה בטעינת רשימת התלמידים: ${error.message}`);
      trackEvent('students_fetch_error', { error: error.message });
    },
    onSuccess: () => {
      trackEvent('students_fetch_success', { count: students.length });
    }
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      trackEvent('search_query', { query: query.length > 0 ? 'has_query' : 'cleared' });
    }, 300),
    []
  );

  // Search query setter with debouncing
  const setSearchQuery = useCallback((query: string) => {
    setSearchQueryState(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  // Calculate filter options
  const filterOptions = useCallback(() => {
    if (!students.length) return null;
    return getFilterOptions(students);
  }, [students])();

  // Apply search, filters, and sorting
  const filteredStudents = useCallback(() => {
    let result = [...students];

    // Apply search
    if (searchQuery.trim()) {
      result = searchStudents(searchQuery, result);
    }

    // Apply filters
    result = filterStudents(result, filters);

    // Apply sorting
    result = sortStudents(result, sortBy, sortOrder);

    return result;
  }, [students, searchQuery, filters, sortBy, sortOrder])();

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setFilters({
      classId: 'all',
      quarter: 'all',
      learningStyle: 'all',
      minStrengths: '',
      maxChallenges: ''
    });
    setSortBy('name');
    setSortOrder('asc');
    trackEvent('filters_cleared');
  }, []);

  // Export filtered data
  const exportData = useCallback(() => {
    trackEvent('data_exported', {
      count: filteredStudents.length,
      hasFilters: searchQuery.length > 0 || Object.values(filters).some(f => f !== 'all' && f !== '')
    });
    return filteredStudents;
  }, [filteredStudents, searchQuery, filters]);

  // Manual refetch with loading state
  const handleRefetch = useCallback(async () => {
    try {
      trackEvent('data_refresh_requested');
      await refetch();
      toast.success('הנתונים עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון הנתונים');
      trackEvent('data_refresh_error');
    }
  }, [refetch]);

  // Track filter changes
  useEffect(() => {
    const hasActiveFilters = Object.values(filters).some(value => value !== 'all' && value !== '');
    if (hasActiveFilters) {
      trackEvent('filters_applied', { filters });
    }
  }, [filters]);

  // Track sort changes
  useEffect(() => {
    trackEvent('sort_changed', { sortBy, sortOrder });
  }, [sortBy, sortOrder]);

  // Prefetch related data
  useEffect(() => {
    if (students.length > 0) {
      // Prefetch filter options
      queryClient.setQueryData(['filterOptions'], filterOptions);
    }
  }, [students, filterOptions, queryClient]);

  return {
    students,
    loading,
    error: error?.message || null,
    refetch: handleRefetch,
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
    totalCount: filteredStudents.length,
    clearFilters,
    exportData
  };
};

// Hook for individual student data
export const useStudent = (studentId: string) => {
  const {
    data: student,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => import('../api/studentAPI').then(api => api.getStudent(studentId)),
    enabled: !!studentId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: 2,
    onError: (error: Error) => {
      toast.error(`שגיאה בטעינת נתוני התלמיד: ${error.message}`);
      trackEvent('student_fetch_error', { studentId, error: error.message });
    },
    onSuccess: () => {
      trackEvent('student_fetch_success', { studentId });
    }
  });

  const handleRefetch = useCallback(async () => {
    try {
      trackEvent('student_refresh_requested', { studentId });
      await refetch();
      toast.success('נתוני התלמיד עודכנו בהצלחה');
    } catch (error) {
      toast.error('שגיאה בעדכון נתוני התלמיד');
      trackEvent('student_refresh_error', { studentId });
    }
  }, [refetch, studentId]);

  return {
    student,
    loading,
    error: error?.message || null,
    refetch: handleRefetch
  };
};

// Hook for bulk operations
export const useStudentOperations = () => {
  const queryClient = useQueryClient();

  const invalidateStudents = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
  }, [queryClient]);

  const updateStudentInCache = useCallback((studentId: string, updates: Partial<Student>) => {
    queryClient.setQueryData([QUERY_KEY], (oldData: Student[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.map(student =>
        student.studentCode === studentId
          ? { ...student, ...updates }
          : student
      );
    });
  }, [queryClient]);

  const addStudentToCache = useCallback((newStudent: Student) => {
    queryClient.setQueryData([QUERY_KEY], (oldData: Student[] | undefined) => {
      if (!oldData) return [newStudent];
      return [...oldData, newStudent];
    });
  }, [queryClient]);

  const removeStudentFromCache = useCallback((studentId: string) => {
    queryClient.setQueryData([QUERY_KEY], (oldData: Student[] | undefined) => {
      if (!oldData) return oldData;
      return oldData.filter(student => student.studentCode !== studentId);
    });
  }, [queryClient]);

  return {
    invalidateStudents,
    updateStudentInCache,
    addStudentToCache,
    removeStudentFromCache
  };
};

// Hook for search history
export const useSearchHistory = (maxItems: number = 10) => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

  const addToHistory = useCallback((query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;

    const newHistory = [query, ...searchHistory.slice(0, maxItems - 1)];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory, maxItems]);

  const removeFromHistory = useCallback((query: string) => {
    const newHistory = searchHistory.filter(item => item !== query);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  }, [searchHistory]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  }, []);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory
  };
};

export default useStudents;