import { useState, useEffect, useCallback } from 'react';
import { trackEvent, logError } from '../utils';

type StorageValue<T> = T | null;

interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for managing localStorage with TypeScript support
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options: UseLocalStorageOptions = {}
): [StorageValue<T>, (value: T | ((prev: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    onError = (error) => logError(error, `localStorage.${key}`)
  } = options;

  // Initialize state with value from localStorage or default
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return defaultValue;
      }

      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }

      return deserialize(item);
    } catch (error) {
      onError(error as Error);
      return defaultValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
          trackEvent('localStorage_set', { key, hasValue: valueToStore !== null });
        }
      } catch (error) {
        onError(error as Error);
      }
    },
    [key, serialize, storedValue, onError]
  );

  // Remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        trackEvent('localStorage_remove', { key });
      }
    } catch (error) {
      onError(error as Error);
    }
  }, [key, defaultValue, onError]);

  // Listen for storage changes in other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(deserialize(e.newValue));
        } catch (error) {
          onError(error as Error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize, onError]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook for managing user preferences
 */
interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'he' | 'en';
  pageSize: number;
  defaultSort: string;
  animationsEnabled: boolean;
  notificationsEnabled: boolean;
  autoRefresh: boolean;
  autoRefreshInterval: number;
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  language: 'he',
  pageSize: 12,
  defaultSort: 'name',
  animationsEnabled: true,
  notificationsEnabled: true,
  autoRefresh: false,
  autoRefreshInterval: 30000 // 30 seconds
};

export function useUserPreferences() {
  const [preferences, setPreferences, clearPreferences] = useLocalStorage(
    'userPreferences',
    defaultPreferences
  );

  const updatePreference = useCallback(
    <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
      setPreferences(prev => ({ ...prev, [key]: value }));
      trackEvent('preference_updated', { key, value });
    },
    [setPreferences]
  );

  const resetPreferences = useCallback(() => {
    setPreferences(defaultPreferences);
    trackEvent('preferences_reset');
  }, [setPreferences]);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    clearPreferences
  };
}

/**
 * Hook for managing dashboard layout state
 */
interface DashboardState {
  sidebarCollapsed: boolean;
  activeFilters: Record<string, any>;
  viewMode: 'grid' | 'list' | 'table';
  selectedStudents: string[];
  expandedSections: Record<string, boolean>;
}

const defaultDashboardState: DashboardState = {
  sidebarCollapsed: false,
  activeFilters: {},
  viewMode: 'grid',
  selectedStudents: [],
  expandedSections: {}
};

export function useDashboardState() {
  const [state, setState, clearState] = useLocalStorage(
    'dashboardState',
    defaultDashboardState
  );

  const updateState = useCallback(
    <K extends keyof DashboardState>(key: K, value: DashboardState[K]) => {
      setState(prev => ({ ...prev, [key]: value }));
      trackEvent('dashboard_state_updated', { key });
    },
    [setState]
  );

  const toggleSidebar = useCallback(() => {
    updateState('sidebarCollapsed', !(state?.sidebarCollapsed ?? false));
  }, [state?.sidebarCollapsed, updateState]);

  const setActiveFilters = useCallback((filters: Record<string, any>) => {
    updateState('activeFilters', filters);
  }, [updateState]);

  const setViewMode = useCallback((mode: 'grid' | 'list' | 'table') => {
    updateState('viewMode', mode);
  }, [updateState]);

  const toggleStudentSelection = useCallback((studentId: string) => {
    setState(prev => {
      const prevValue = prev ?? defaultDashboardState;
      return {
        ...prevValue,
        selectedStudents: prevValue.selectedStudents.includes(studentId)
          ? prevValue.selectedStudents.filter(id => id !== studentId)
          : [...prevValue.selectedStudents, studentId]
      };
    });
  }, [setState]);

  const clearSelectedStudents = useCallback(() => {
    updateState('selectedStudents', []);
  }, [updateState]);

  const toggleSection = useCallback((sectionId: string) => {
    setState(prev => {
      const prevValue = prev ?? defaultDashboardState;
      return {
        ...prevValue,
        expandedSections: {
          ...prevValue.expandedSections,
          [sectionId]: !prevValue.expandedSections[sectionId]
        }
      };
    });
  }, [setState]);

  const resetState = useCallback(() => {
    setState(defaultDashboardState);
    trackEvent('dashboard_state_reset');
  }, [setState]);

  return {
    state,
    updateState,
    toggleSidebar,
    setActiveFilters,
    setViewMode,
    toggleStudentSelection,
    clearSelectedStudents,
    toggleSection,
    resetState,
    clearState
  };
}

/**
 * Hook for managing recent items (students, searches, etc.)
 */
export function useRecentItems<T>(key: string, maxItems: number = 10) {
  const [items, setItems, clearItems] = useLocalStorage<T[]>(key, []);

  const addItem = useCallback((item: T) => {
    setItems(prev => {
      const prevItems = prev ?? [];
      const filtered = prevItems.filter(existing =>
        JSON.stringify(existing) !== JSON.stringify(item)
      );
      return [item, ...filtered].slice(0, maxItems);
    });
    trackEvent('recent_item_added', { key, maxItems });
  }, [setItems, maxItems, key]);

  const removeItem = useCallback((item: T) => {
    setItems(prev => {
      const prevItems = prev ?? [];
      return prevItems.filter(existing =>
        JSON.stringify(existing) !== JSON.stringify(item)
      );
    });
    trackEvent('recent_item_removed', { key });
  }, [setItems, key]);

  const clearAllItems = useCallback(() => {
    clearItems();
    trackEvent('recent_items_cleared', { key });
  }, [clearItems, key]);

  return {
    items,
    addItem,
    removeItem,
    clearAllItems
  };
}

/**
 * Hook for managing form state with persistence
 */
export function usePersistedForm<T extends Record<string, any>>(
  formKey: string,
  initialValues: T,
  options: { autoSave?: boolean; saveDelay?: number } = {}
) {
  const { autoSave = true, saveDelay = 1000 } = options;
  const [formData, setFormData, clearFormData] = useLocalStorage(formKey, initialValues);

  // Auto-save timer
  const [saveTimer, setSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const updateField = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      const currentData = formData ?? initialValues;
      const newData = { ...currentData, [field]: value };
      setFormData(newData);

      if (autoSave) {
        if (saveTimer) {
          clearTimeout(saveTimer);
        }

        const timer = setTimeout(() => {
          trackEvent('form_auto_saved', { formKey, field: String(field) });
        }, saveDelay);

        setSaveTimer(timer);
      }
    },
    [formData, setFormData, autoSave, saveTimer, saveDelay, formKey, initialValues]
  );

  const resetForm = useCallback(() => {
    setFormData(initialValues);
    trackEvent('form_reset', { formKey });
  }, [setFormData, initialValues, formKey]);

  const clearForm = useCallback(() => {
    clearFormData();
    trackEvent('form_cleared', { formKey });
  }, [clearFormData, formKey]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer) {
        clearTimeout(saveTimer);
      }
    };
  }, [saveTimer]);

  return {
    formData,
    updateField,
    resetForm,
    clearForm,
    setFormData
  };
}

/**
 * Hook for managing cache with expiration
 */
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export function useCachedData<T>(
  key: string,
  ttl: number = 300000 // 5 minutes default
) {
  const [cachedData, setCachedData, clearCache] = useLocalStorage<CachedData<T> | null>(
    `cache_${key}`,
    null
  );

  const isExpired = useCallback(() => {
    if (!cachedData) return true;
    return Date.now() > cachedData.expiresAt;
  }, [cachedData]);

  const getData = useCallback(() => {
    if (!cachedData || isExpired()) {
      return null;
    }
    return cachedData.data;
  }, [cachedData, isExpired]);

  const setData = useCallback((data: T) => {
    const now = Date.now();
    setCachedData({
      data,
      timestamp: now,
      expiresAt: now + ttl
    });
    trackEvent('cache_set', { key, ttl });
  }, [setCachedData, ttl, key]);

  const invalidateCache = useCallback(() => {
    clearCache();
    trackEvent('cache_invalidated', { key });
  }, [clearCache, key]);

  return {
    getData,
    setData,
    invalidateCache,
    isExpired,
    hasData: !!cachedData && !isExpired()
  };
}

export default useLocalStorage;