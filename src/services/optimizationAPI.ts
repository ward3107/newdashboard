/**
 * Classroom Seating Optimization API Service
 * Connects to FastAPI Python backend for genetic algorithm optimization
 */

// ====================================
// TYPE DEFINITIONS
// ====================================

export type GenderType = 'male' | 'female' | 'other';
export type BehaviorLevel = 'excellent' | 'good' | 'average' | 'challenging';
export type AcademicLevel = 'advanced' | 'proficient' | 'basic' | 'below_basic';
export type LayoutType = 'rows' | 'pairs' | 'clusters' | 'u-shape' | 'circle' | 'flexible';

export interface SpecialNeed {
  type: string;
  description?: string;
  requires_front_seat: boolean;
  requires_support_buddy: boolean;
}

export interface OptimizationStudent {
  id: string;
  name: string;
  gender: GenderType;
  age?: number;
  academic_level: AcademicLevel;
  academic_score: number;
  math_score?: number;
  reading_score?: number;
  behavior_level: BehaviorLevel;
  behavior_score: number;
  attention_span?: number;
  participation_level?: number;
  is_leader: boolean;
  is_shy: boolean;
  friends_ids: string[];
  incompatible_ids: string[];
  special_needs: SpecialNeed[];
  requires_front_row: boolean;
  requires_quiet_area: boolean;
  has_mobility_issues: boolean;
  primary_language?: string;
  is_bilingual: boolean;
  cultural_background?: string;
  notes?: string;
  preferred_seat_position?: string;
}

export interface OptimizationObjectives {
  academic_balance: number;
  behavioral_balance: number;
  diversity: number;
  special_needs: number;
}

export interface SeatingConstraints {
  separate_student_pairs: string[][];
  fixed_positions: Record<string, { row: number; col: number }>;
}

export interface SeatPosition {
  row: number;
  col: number;
  x?: number;
  y?: number;
  is_front_row: boolean;
  is_near_teacher: boolean;
  is_window_seat: boolean;
  is_door_seat: boolean;
}

export interface Seat {
  position: SeatPosition;
  student_id?: string;
  is_empty: boolean;
}

export interface ClassroomLayout {
  layout_type: LayoutType;
  rows: number;
  cols: number;
  total_seats: number;
  seats: Seat[];
}

export interface SeatingArrangement {
  layout: ClassroomLayout;
  student_seats: Record<string, SeatPosition>;
  fitness_score: number;
  objective_scores: {
    academic_balance: number;
    behavioral_balance: number;
    diversity: number;
    special_needs: number;
  };
  generation_count: number;
  computation_time: number;
  warnings: string[];
}

export interface OptimizeClassroomRequest {
  students: OptimizationStudent[];
  layout_type: LayoutType;
  rows: number;
  cols: number;
  objectives?: OptimizationObjectives;
  constraints?: SeatingConstraints;
  max_generations?: number;
}

export interface OptimizeClassroomResponse {
  success: boolean;
  optimization_id: string;
  result?: SeatingArrangement;
  error?: string;
}

export interface HealthCheckResponse {
  status: string;
  version: string;
  message: string;
}

export interface OptimizationStatusResponse {
  status: string;
  service: string;
  algorithm: string;
  capabilities: {
    max_students: number;
    layouts: LayoutType[];
    features: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ====================================
// API CONFIGURATION
// ====================================

const OPTIMIZATION_API_URL = import.meta.env.VITE_OPTIMIZATION_API_URL || 'http://localhost:8000';
const API_TIMEOUT = 60000; // 60 seconds for optimization

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = API_TIMEOUT
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Generic API call handler for optimization backend
 */
async function optimizationApiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${OPTIMIZATION_API_URL}${endpoint}`;

    if (process.env.NODE_ENV === 'development') {
    }

    const response = await fetchWithTimeout(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail || errorData.error || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();

    if (process.env.NODE_ENV === 'development') {
    }

    return {
      success: true,
      data: data as T,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ Optimization API Error: ${endpoint}`, error);
    }

    // Handle specific errors
    if (error instanceof Error && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timeout. Optimization is taking too long.',
      };
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ====================================
// PUBLIC API METHODS
// ====================================

/**
 * Check health of optimization service
 */
export async function checkHealth(): Promise<ApiResponse<HealthCheckResponse>> {
  return optimizationApiCall<HealthCheckResponse>('/health');
}

/**
 * Get optimization service status and capabilities
 */
export async function getOptimizationStatus(): Promise<ApiResponse<OptimizationStatusResponse>> {
  return optimizationApiCall<OptimizationStatusResponse>('/api/v1/optimize/status');
}

/**
 * Optimize classroom seating arrangement
 */
export async function optimizeClassroom(
  request: OptimizeClassroomRequest
): Promise<ApiResponse<OptimizeClassroomResponse>> {
  return optimizationApiCall<OptimizeClassroomResponse>('/api/v1/optimize/classroom', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

/**
 * Test connection to optimization backend
 */
export async function testOptimizationConnection(): Promise<ApiResponse<{
  message: string;
  version: string;
  status: string;
}>> {
  try {
    const healthResponse = await checkHealth();

    if (healthResponse.success && healthResponse.data) {
      return {
        success: true,
        data: {
          message: 'Optimization backend connected successfully',
          version: healthResponse.data.version,
          status: healthResponse.data.status,
        },
      };
    }

    return {
      success: false,
      error: healthResponse.error || 'Failed to connect to optimization backend',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Connection failed: ${errorMessage}`,
    };
  }
}

// ====================================
// REACT QUERY HELPERS
// ====================================

/**
 * Query keys for React Query
 */
export const optimizationQueryKeys = {
  health: ['optimization', 'health'],
  status: ['optimization', 'status'],
  optimize: (classId: string) => ['optimization', 'classroom', classId],
};

/**
 * Default React Query options for optimization
 */
export const optimizationQueryOptions = {
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
  retry: 1, // Only retry once for optimization
  refetchOnWindowFocus: false,
};

// ====================================
// EXPORT UTILITIES
// ====================================

export const optimizationApi = {
  checkHealth,
  getOptimizationStatus,
  optimizeClassroom,
  testOptimizationConnection,
};

export default optimizationApi;
