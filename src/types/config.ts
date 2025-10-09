// Configuration types

export interface APIConfig {
  BASE_URL: string;
  ENDPOINTS: {
    GET_ALL_STUDENTS: string;
    GET_STUDENT: string;
    GET_STATS: string;
    ANALYZE_STUDENT: string;
    SYNC_STUDENTS: string;
    INITIAL_SYNC: string;
  };
  TIMEOUT: number;
  RETRY_ATTEMPTS: number;
  RETRY_DELAY: number;
}

export interface StudentSummary {
  studentCode: string;
  quarter: string;
  classId: string;
  date: string;
  learningStyle: string;
  keyNotes: string;
  strengthsCount: number;
  challengesCount: number;
}

export interface StudentDetailSummary {
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

export interface StudentDetail {
  studentCode: string;
  quarter: string;
  classId: string;
  date: string;
  student_summary: StudentDetailSummary;
  insights: Insight[];
  immediate_actions: ImmediateAction[];
  seating_arrangement: SeatingArrangement;
}

export interface Stats {
  totalStudents: number;
  byClass: Record<string, number>;
  byLearningStyle: Record<string, number>;
  averageStrengths: number;
  lastUpdated: string;
}

export interface MockData {
  students: StudentSummary[];
  stats: Stats;
  studentDetail: StudentDetail;
}

export interface Features {
  ENABLE_MOCK_DATA: boolean;
  ENABLE_CHARTS: boolean;
  ENABLE_EXPORT: boolean;
  ENABLE_ANIMATIONS: boolean;
  ENABLE_RTL: boolean;
}

export interface GoogleAppsScriptConfig {
  WEB_APP_URL: string;
  SPREADSHEET_ID: string;
  SHEETS: {
    STUDENTS: string;
    RESPONSES: string;
    AI_INSIGHTS: string;
  };
  FIELD_MAPPING: {
    NAME_FIELDS: string[];
    STUDENT_CODE_FIELDS: string[];
    CLASS_FIELDS: string[];
  };
  CLAUDE_CONFIG: {
    MODEL: string;
    MAX_TOKENS: number;
    TEMPERATURE: number;
  };
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
