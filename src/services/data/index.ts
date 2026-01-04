/**
 * Data Source Layer
 *
 * Entry point for the data abstraction layer.
 * Automatically selects the correct data source based on environment configuration.
 *
 * Usage:
 *   import { dataSource } from '@/services/data';
 *   const students = await dataSource.getStudents();
 */

import { logger } from '../../utils/logger';

export type {
  Student,
  DashboardStats,
  OptimizationRequest,
  OptimizationResult,
  ApiResponse,
  DataSourceAdapter,
  DataSourceConfig
} from './DataSourceAdapter';

export { createDataSource } from './DataSourceAdapter';

// Lazy-loaded adapters (only import what's needed)
let dataSourceInstance: import('./DataSourceAdapter').DataSourceAdapter | null = null;

/**
 * Get the configured data source instance
 * Automatically selects based on environment variables:
 * - VITE_USE_FIRESTORE=true: FirestoreAdapter
 * - VITE_USE_MOCK_DATA=true: MockAdapter
 * - Otherwise: SheetsAdapter (if VITE_API_URL is set)
 */
export async function getDataSource(): Promise<import('./DataSourceAdapter').DataSourceAdapter> {
  if (dataSourceInstance) {
    return dataSourceInstance;
  }

  const useFirestore = import.meta.env.VITE_USE_FIRESTORE === 'true';
  const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true';
  const apiUrl = import.meta.env.VITE_API_URL || '';

  let adapter: import('./DataSourceAdapter').DataSourceAdapter;

  if (useMockData) {
    // Mock data for development/testing
    const { MockAdapter } = await import('./mockAdapter');
    adapter = new MockAdapter();
    logger.log('📦 Using MockAdapter for data source');
  } else if (useFirestore) {
    // Firebase Firestore
    const { FirestoreAdapter } = await import('./firestoreAdapter');
    adapter = new FirestoreAdapter({
      schoolId: import.meta.env.VITE_SCHOOL_ID || 'default'
    });
    logger.log('🔥 Using FirestoreAdapter for data source');
  } else if (apiUrl && !apiUrl.includes('YOUR_DEPLOYMENT_ID')) {
    // Google Sheets via Apps Script
    const { SheetsAdapter } = await import('./sheetsAdapter');
    adapter = new SheetsAdapter({ apiUrl });
    logger.log('📊 Using SheetsAdapter for data source');
  } else {
    // Fallback to mock if nothing configured
    const { MockAdapter } = await import('./mockAdapter');
    adapter = new MockAdapter();
    logger.warn('⚠️ No data source configured. Using MockAdapter as fallback.');
  }

  dataSourceInstance = adapter;
  return adapter;
}

/**
 * Convenience singleton accessor
 * Returns the data source instance (lazy-loaded on first access)
 */
export const dataSource = await getDataSource();

// Re-export types for convenience
export type { FirestoreAdapter } from './firestoreAdapter';
export type { SheetsAdapter } from './sheetsAdapter';
export type { MockAdapter } from './mockAdapter';
