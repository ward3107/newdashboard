// TypeScript type definitions for the Student Dashboard

export interface Student {
  studentCode: string;
  quarter: string;
  classId: string;
  date: string;
  name: string;
  learningStyle: string;
  keyNotes: string;
  strengthsCount: number;
  challengesCount: number;
}

export interface StudentSummary {
  learning_style: string;
  strengths: string[];
  challenges: string[];
  key_notes: string;
}

export interface Recommendation {
  action: string;
  how_to: string;
  time_needed: string;
  examples: string;
  priority: 'high' | 'medium' | 'low';
}

export interface Insight {
  category: string;
  finding: string;
  recommendations: Recommendation[];
}

export interface ImmediateAction {
  what: string;
  how: string;
  when: string;
  time: string;
}

export interface SeatingArrangement {
  location: string;
  partner_type: string;
  avoid: string;
}

export interface StudentDetail extends Student {
  student_summary: StudentSummary;
  insights: Insight[];
  immediate_actions: ImmediateAction[];
  seating_arrangement: SeatingArrangement;
}

export interface Stats {
  totalStudents: number;
  byClass: Record<string, number>;
  byLearningStyle: Record<string, number>;
  averageStrengths: number | string;
  averageChallenges?: number | string;
  lastUpdated: string;
}

export interface FilterOptions {
  classes: string[];
  quarters: string[];
  learningStyles: string[];
  strengthsRange: {
    min: number;
    max: number;
  };
  challengesRange: {
    min: number;
    max: number;
  };
}

export interface Filters {
  classId: string;
  quarter: string;
  learningStyle: string;
  minStrengths: string;
  maxChallenges: string;
}

export interface ChartData {
  name: string;
  value: number;
  percentage?: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface APIConfig {
  BASE_URL: string;
  ENDPOINTS: {
    GET_ALL_STUDENTS: string;
    GET_STUDENT: string;
    GET_STATS: string;
    ANALYZE_STUDENT: string;
  };
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  RETRY_DELAY: number;
}

export interface MockData {
  students: Student[];
  stats: Stats;
  studentDetail: StudentDetail;
}

export interface FeatureFlags {
  ENABLE_MOCK_DATA: boolean;
  ENABLE_CHARTS: boolean;
  ENABLE_EXPORT: boolean;
  ENABLE_ANIMATIONS: boolean;
  ENABLE_RTL: boolean;
}

export interface Theme {
  PRIMARY_COLOR: string;
  SUCCESS_COLOR: string;
  WARNING_COLOR: string;
  DANGER_COLOR: string;
  FONT_FAMILY: string;
  BREAKPOINTS: {
    SM: string;
    MD: string;
    LG: string;
    XL: string;
  };
}

export interface ExportConfig {
  PDF: {
    FORMAT: string;
    ORIENTATION: string;
    MARGIN: number;
    FONT_SIZE: number;
  };
  EXCEL: {
    SHEET_NAME: string;
    FILE_NAME: string;
  };
}

// Component Props Types
export interface StatsCardsProps {
  stats: Stats | null;
  loading?: boolean;
}

export interface StudentCardProps {
  student: Student;
  index?: number;
}

export interface SearchAndFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Filters | ((prev: Filters) => Filters)) => void;
  filterOptions: FilterOptions | null;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onClearFilters?: () => void;
}

export interface ChartsSectionProps {
  students: Student[];
  stats: Stats;
}

// Animation Types
export interface AnimationVariants {
  hidden: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
  };
  visible: {
    opacity: number;
    y?: number;
    x?: number;
    scale?: number;
    transition?: {
      delay?: number;
      duration?: number;
      type?: string;
      stiffness?: number;
    };
  };
  hover?: {
    y?: number;
    x?: number;
    scale?: number;
    rotate?: number;
    transition?: {
      duration?: number;
      type?: string;
      stiffness?: number;
    };
  };
}

// Utility Types
export type SortBy = 'name' | 'date' | 'classId' | 'strengthsCount' | 'challengesCount';
export type SortOrder = 'asc' | 'desc';
export type Priority = 'high' | 'medium' | 'low';
export type LearningStyle = 'ויזואלי' | 'אודיטורי' | 'קינסטטי' | 'לוגי' | 'יצירתי' | 'חברתי' | 'מילולי' | 'אנליטי';

// API Function Types
export type GetAllStudentsFunction = () => Promise<Student[]>;
export type GetStudentFunction = (studentId: string) => Promise<StudentDetail>;
export type GetStatsFunction = () => Promise<Stats>;
export type AnalyzeStudentFunction = (studentId: string) => Promise<APIResponse<any>>;

// Export Function Types
export type ExportToExcelFunction = (students: Student[]) => Promise<{ success: boolean; filename: string }>;
export type ExportToPDFFunction = (students: Student[]) => Promise<{ success: boolean; filename: string }>;
export type ExportStudentDetailToPDFFunction = (studentData: StudentDetail) => Promise<{ success: boolean; filename: string }>;

// Hook Types
export interface UseStudentsHook {
  students: Student[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseStatsHook {
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Error Types
export interface APIError extends Error {
  status?: number;
  code?: string;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading';

export interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  style?: React.CSSProperties;
}

// Form Types
export interface SearchFormData {
  query: string;
  filters: Filters;
  sortBy: SortBy;
  sortOrder: SortOrder;
}

// Navigation Types
export interface NavigationItem {
  path: string;
  label: string;
  icon?: React.ComponentType;
}

// Progress Types
export interface ProgressData {
  completed: number;
  total: number;
  percentage: number;
}

// Color Scheme Types
export interface ColorScheme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  info: string;
}

// Responsive Types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveValue<T> {
  xs?: T;
  sm?: T;
  md?: T;
  lg?: T;
  xl?: T;
  '2xl'?: T;
}

// Analytics Types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
}

// Configuration Types
export interface AppConfig {
  api: APIConfig;
  features: FeatureFlags;
  theme: Theme;
  export: ExportConfig;
  analytics?: {
    enabled: boolean;
    trackingId?: string;
  };
}

export default {
  Student,
  StudentDetail,
  Stats,
  Filters,
  FilterOptions,
  ChartData,
  APIResponse,
  StatsCardsProps,
  StudentCardProps,
  SearchAndFiltersProps,
  ChartsSectionProps
};