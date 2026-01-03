/**
 * Production Environment Variable Validation
 *
 * Validates that all required environment variables are properly configured
 * for production deployment. This helps catch configuration errors early.
 */

import logger from './logger';

export interface EnvValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Firebase configuration
 */
function validateFirebaseConfig(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const requiredFirebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missingVars = requiredFirebaseVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    result.isValid = false;
    result.errors.push(
      `Missing Firebase configuration: ${missingVars.join(', ')}`
    );
  }

  // Validate Firebase API key format (should start with a specific prefix)
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (apiKey && !apiKey.startsWith('AIza')) {
    result.warnings.push(
      'VITE_FIREBASE_API_KEY format looks invalid (should start with "AIza")'
    );
  }

  return result;
}

/**
 * Validate Sentry configuration (optional but recommended for production)
 */
function validateSentryConfig(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;

  if (!sentryDsn) {
    result.warnings.push(
      'VITE_SENTRY_DSN not configured. Error tracking will be disabled.'
    );
  } else if (!sentryDsn.startsWith('https://')) {
    result.warnings.push(
      'VITE_SENTRY_DSN format looks invalid (should start with "https://")'
    );
  }

  return result;
}

/**
 * Validate data source configuration
 */
function validateDataSourceConfig(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const useFirestore = import.meta.env.VITE_USE_FIRESTORE;
  const schoolId = import.meta.env.VITE_SCHOOL_ID;
  const apiUrl = import.meta.env.VITE_API_URL;

  if (useFirestore === 'true') {
    if (!schoolId) {
      result.errors.push(
        'VITE_SCHOOL_ID is required when VITE_USE_FIRESTORE=true'
      );
      result.isValid = false;
    }
  } else {
    if (!apiUrl) {
      result.warnings.push(
        'VITE_API_URL not configured. Using Google Sheets API without endpoint may fail.'
      );
    }
  }

  return result;
}

/**
 * Validate optimization API configuration
 */
function validateOptimizationApiConfig(): EnvValidationResult {
  const result: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  const apiUrl = import.meta.env.VITE_OPTIMIZATION_API_URL;

  if (!apiUrl) {
    result.warnings.push(
      'VITE_OPTIMIZATION_API_URL not configured. Classroom optimization will use mock data.'
    );
  } else if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
    result.warnings.push(
      'VITE_OPTIMIZATION_API_URL format looks invalid (should start with http:// or https://)'
    );
  }

  return result;
}

/**
 * Validate all environment variables for production
 */
export function validateProductionEnv(): EnvValidationResult {
  const isProd = import.meta.env.PROD;
  const isDev = import.meta.env.DEV;

  // Skip validation in development
  if (isDev && !isProd) {
    return {
      isValid: true,
      errors: [],
      warnings: ['Running in development mode - production validation skipped']
    };
  }

  logger.info('🔍 Validating production environment variables...');

  const results: EnvValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  // Run all validations
  const firebaseValid = validateFirebaseConfig();
  const sentryValid = validateSentryConfig();
  const dataSourceValid = validateDataSourceConfig();
  const optimizationValid = validateOptimizationApiConfig();

  // Aggregate errors
  results.errors.push(
    ...firebaseValid.errors,
    ...dataSourceValid.errors
  );

  // Aggregate warnings
  results.warnings.push(
    ...firebaseValid.warnings,
    ...sentryValid.warnings,
    ...dataSourceValid.warnings,
    ...optimizationValid.warnings
  );

  // Determine overall validity
  results.isValid = results.errors.length === 0;

  // Log results
  if (results.isValid) {
    logger.info('✅ Production environment validation passed');
  } else {
    logger.error('❌ Production environment validation failed:');
    results.errors.forEach(error => logger.error(`  - ${error}`));
  }

  if (results.warnings.length > 0) {
    logger.warn('⚠️ Production environment warnings:');
    results.warnings.forEach(warning => logger.warn(`  - ${warning}`));
  }

  return results;
}

/**
 * Get environment configuration summary
 */
export function getEnvSummary(): Record<string, string | boolean> {
  return {
    mode: import.meta.env.MODE,
    isProduction: import.meta.env.PROD,
    isDevelopment: import.meta.env.DEV,
    useFirestore: import.meta.env.VITE_USE_FIRESTORE === 'true',
    firebaseConfigured: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
    schoolId: import.meta.env.VITE_SCHOOL_ID || 'not set',
    sentryConfigured: !!import.meta.env.VITE_SENTRY_DSN,
    optimizationApiConfigured: !!import.meta.env.VITE_OPTIMIZATION_API_URL
  };
}

/**
 * Validate environment and throw if invalid
 * Use this during app initialization to fail fast
 */
export function assertProductionEnvValid(): void {
  const validation = validateProductionEnv();

  if (!validation.isValid) {
    const errorMessage =
      '❌ Production environment configuration is invalid:\n' +
      validation.errors.map(e => `  - ${e}`).join('\n') +
      '\n\nPlease check your environment variables and deployment configuration.';

    // Log the error
    logger.error(errorMessage);

    // In production, throw to prevent app from running with bad config
    if (import.meta.env.PROD) {
      throw new Error(errorMessage);
    }
  }
}
