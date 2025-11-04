import type { LearningStyle, Priority } from '../types';

/**
 * Utility functions for the Student Dashboard
 */

// Date formatting utilities
export const formatDate = (dateString: string, locale: string = 'he-IL'): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

export const formatDateRelative = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'היום';
    if (diffDays === 1) return 'אתמול';
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    if (diffDays < 30) return `לפני ${Math.floor(diffDays / 7)} שבועות`;
    if (diffDays < 365) return `לפני ${Math.floor(diffDays / 30)} חודשים`;
    return `לפני ${Math.floor(diffDays / 365)} שנים`;
  } catch (error) {
    return dateString;
  }
};

// String utilities
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const capitalizeFirst = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const removeEmojis = (text: string): string => {
  return text.replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
};

// Learning style utilities
export const parseLearningStyles = (learningStyleString: string): string[] => {
  return learningStyleString
    .split('\n')
    .map(style => style.replace(/^• /, '').trim())
    .filter(style => style.length > 0);
};

export const getLearningStyleColor = (style: string): string => {
  const normalizedStyle = style.toLowerCase();

  if (normalizedStyle.includes('ויזואלי')) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (normalizedStyle.includes('אודיטורי')) return 'bg-green-100 text-green-800 border-green-200';
  if (normalizedStyle.includes('קינסטטי')) return 'bg-orange-100 text-orange-800 border-orange-200';
  if (normalizedStyle.includes('לוגי')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (normalizedStyle.includes('יצירתי')) return 'bg-pink-100 text-pink-800 border-pink-200';
  if (normalizedStyle.includes('חברתי')) return 'bg-cyan-100 text-cyan-800 border-cyan-200';
  if (normalizedStyle.includes('מילולי')) return 'bg-indigo-100 text-indigo-800 border-indigo-200';
  if (normalizedStyle.includes('אנליטי')) return 'bg-gray-100 text-gray-800 border-gray-200';

  return 'bg-gray-100 text-gray-800 border-gray-200';
};

// Priority utilities
export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case 'high':
      return 'גבוהה';
    case 'medium':
      return 'בינונית';
    case 'low':
      return 'נמוכה';
    default:
      return 'לא צוין';
  }
};

// Metric utilities
export const getMetricColor = (count: number, type: 'strengths' | 'challenges'): string => {
  if (type === 'strengths') {
    if (count >= 5) return 'text-green-600 bg-green-50 border-green-200';
    if (count >= 3) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  } else {
    if (count <= 2) return 'text-green-600 bg-green-50 border-green-200';
    if (count <= 4) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  }
};

// Number utilities
export const formatNumber = (num: number, locale: string = 'he-IL'): string => {
  return new Intl.NumberFormat(locale).format(num);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// Array utilities
export const groupBy = <T>(array: T[], keyGetter: (item: T) => string): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const key = keyGetter(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

export const sortBy = <T>(array: T[], keyGetter: (item: T) => string | number | Date, direction: 'asc' | 'desc' = 'asc'): T[] => {
  return [...array].sort((a, b) => {
    const aValue = keyGetter(a);
    const bValue = keyGetter(b);

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const result = aValue.localeCompare(bValue, 'he');
      return direction === 'asc' ? result : -result;
    }

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export const unique = <T>(array: T[], keyGetter?: (item: T) => string | number): T[] => {
  if (!keyGetter) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const key = keyGetter(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

// Search utilities
export const fuzzySearch = (query: string, text: string): boolean => {
  if (!query || !text) return false;

  const normalizedQuery = query.toLowerCase().trim();
  const normalizedText = text.toLowerCase();

  // Exact match
  if (normalizedText.includes(normalizedQuery)) return true;

  // Fuzzy match - check if all characters in query exist in text in order
  let queryIndex = 0;
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === normalizedQuery.length;
};

export const highlightText = (text: string, query: string): string => {
  if (!query) return text;

  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Validation utilities
export const isValidStudentCode = (code: string): boolean => {
  return /^\d{5}$/.test(code);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^05\d-?\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Local storage utilities
export const storage = {
  get: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading from localStorage:', error);
      }
      return defaultValue || null;
    }
  },

  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error writing to localStorage:', error);
      }
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error removing from localStorage:', error);
      }
    }
  },

  clear: (): void => {
    try {
      localStorage.clear();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error clearing localStorage:', error);
      }
    }
  }
};

// URL utilities
export const createShareableUrl = (studentId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/student/${studentId}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (fallbackError) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to copy to clipboard:', fallbackError);
      }
      return false;
    }
  }
};

// Performance utilities
export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const throttle = <T extends (...args: never[]) => unknown>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Analytics utilities
export const trackEvent = (eventName: string, properties?: Record<string, string | number | boolean>): void => {
  // This would typically integrate with your analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }

  // Example: Google Analytics, Mixpanel, etc.
  // gtag('event', eventName, properties);
};

// Error utilities
export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'שגיאה לא צפויה';
};

export const logError = (error: unknown, context?: string): void => {
  const errorMessage = formatError(error);
  const timestamp = new Date().toISOString();

  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}] ${context ? `${context}: ` : ''}${errorMessage}`);
  }

  // In production, you might want to send this to an error tracking service
  // Sentry.captureException(error);
};

// Constants
export const CONSTANTS = {
  MAX_SEARCH_RESULTS: 100,
  DEBOUNCE_DELAY: 300,
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 4000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: ['pdf', 'xlsx', 'xls', 'csv'],
  DEFAULT_PAGE_SIZE: 12,
  BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  }
} as const;

export default {
  formatDate,
  formatDateRelative,
  truncateText,
  capitalizeFirst,
  removeEmojis,
  parseLearningStyles,
  getLearningStyleColor,
  getPriorityColor,
  getPriorityLabel,
  getMetricColor,
  formatNumber,
  formatPercentage,
  clamp,
  groupBy,
  sortBy,
  unique,
  fuzzySearch,
  highlightText,
  isValidStudentCode,
  isValidEmail,
  isValidPhoneNumber,
  storage,
  createShareableUrl,
  copyToClipboard,
  debounce,
  throttle,
  trackEvent,
  formatError,
  logError,
  CONSTANTS
};