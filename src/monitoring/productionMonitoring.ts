/**
 * Production Monitoring Service
 *
 * Comprehensive monitoring for production environment
 * - Performance metrics
 * - Error tracking
 * - User behavior analytics
 * - Health checks
 */

import { errorReporting } from '../services/errorReporting';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  webVitals: {
    lcp?: number; // Largest Contentful Paint
    fid?: number; // First Input Delay
    cls?: number; // Cumulative Layout Shift
    fcp?: number; // First Contentful Paint
    ttfb?: number; // Time to First Byte
    inp?: number; // Interaction to Next Paint
  };
  custom: {
    bundleSize: number;
    apiResponseTime: number;
    memoryUsage: number;
    renderTime: number;
  };
}

interface HealthCheck {
  api: boolean;
  database: boolean;
  authentication: boolean;
  criticalFeatures: boolean;
  timestamp: Date;
}

interface UserAnalytics {
  sessionId: string;
  userId?: string;
  pageViews: number;
  sessionDuration: number;
  interactions: number;
  errors: number;
  features: string[];
}

class ProductionMonitoring {
  private isProduction = import.meta.env.PROD;
  private sessionId: string;
  private sessionStartTime: Date;
  private metrics: PerformanceMetrics;
  private healthStatus: HealthCheck | null = null;
  private analytics: UserAnalytics;
  private performanceObserver: PerformanceObserver | null = null;

  constructor() {
    if (!this.isProduction) {
      logger.info('ProductionMonitoring', 'Monitoring disabled in development');
      return;
    }

    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    this.metrics = this.initializeMetrics();
    this.analytics = this.initializeAnalytics();

    this.setupPerformanceMonitoring();
    this.setupHealthChecks();
    this.setupErrorTracking();
    this.setupUserAnalytics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializeMetrics(): PerformanceMetrics {
    return {
      webVitals: {},
      custom: {
        bundleSize: 0,
        apiResponseTime: 0,
        memoryUsage: 0,
        renderTime: 0,
      },
    };
  }

  private initializeAnalytics(): UserAnalytics {
    return {
      sessionId: this.sessionId,
      pageViews: 0,
      sessionDuration: 0,
      interactions: 0,
      errors: 0,
      features: [],
    };
  }

  private setupPerformanceMonitoring(): void {
    // Web Vitals monitoring
    this.trackWebVitals();

    // Custom performance monitoring
    this.observeResourceTiming();
    this.observeLongTasks();
    this.trackMemoryUsage();

    // Bundle size monitoring
    this.trackBundleSize();
  }

  private trackWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.webVitals.lcp = lastEntry.startTime;

      if (this.metrics.webVitals.lcp! > 2500) {
        this.reportPerformanceIssue('LCP', this.metrics.webVitals.lcp);
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.webVitals.fid = entry.processingStart - entry.startTime;

        if (this.metrics.webVitals.fid! > 100) {
          this.reportPerformanceIssue('FID', this.metrics.webVitals.fid);
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          this.metrics.webVitals.cls = clsValue;
        }
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private observeResourceTiming(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('/api/')) {
          const responseTime = entry.responseEnd - entry.requestStart;
          this.metrics.custom.apiResponseTime = Math.max(
            this.metrics.custom.apiResponseTime,
            responseTime
          );

          if (responseTime > 5000) {
            this.reportPerformanceIssue('API Response Time', responseTime, {
              endpoint: entry.name,
            });
          }
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.performanceObserver = observer;
  }

  private observeLongTasks(): void {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (entry.duration > 50) {
          this.reportPerformanceIssue('Long Task', entry.duration, {
            startTime: entry.startTime,
            name: entry.name,
          });
        }
      });
    }).observe({ entryTypes: ['longtask'] });
  }

  private trackMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.custom.memoryUsage = memory.usedJSHeapSize;

      // Monitor memory leaks
      setInterval(() => {
        const currentUsage = memory.usedJSHeapSize;
        if (currentUsage > memory.jsHeapSizeLimit * 0.8) {
          this.reportPerformanceIssue('High Memory Usage', currentUsage, {
            limit: memory.jsHeapSizeLimit,
            percentage: (currentUsage / memory.jsHeapSizeLimit) * 100,
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  private trackBundleSize(): void {
    // Calculate bundle sizes from resource timing
    window.addEventListener('load', () => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      let totalSize = 0;

      resources.forEach((resource) => {
        if (resource.name.includes('.js') || resource.name.includes('.css')) {
          totalSize += resource.transferSize || 0;
        }
      });

      this.metrics.custom.bundleSize = totalSize;

      if (totalSize > 1024 * 1024) { // > 1MB
        this.reportPerformanceIssue('Large Bundle Size', totalSize);
      }
    });
  }

  private setupHealthChecks(): void {
    // Run health checks every 5 minutes
    setInterval(() => {
      this.performHealthCheck();
    }, 5 * 60 * 1000);

    // Initial health check
    this.performHealthCheck();
  }

  private async performHealthCheck(): Promise<void> {
    const healthCheck: HealthCheck = {
      api: false,
      database: false,
      authentication: false,
      criticalFeatures: false,
      timestamp: new Date(),
    };

    try {
      // Check API health
      const apiResponse = await fetch('/api/health', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      healthCheck.api = apiResponse.ok;

      // Check database connectivity (through API)
      const dbResponse = await fetch('/api/health/database', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      healthCheck.database = dbResponse.ok;

      // Check authentication
      const authResponse = await fetch('/api/health/auth', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      healthCheck.authentication = authResponse.ok;

      // Check critical features
      const featuresResponse = await fetch('/api/health/features', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      healthCheck.criticalFeatures = featuresResponse.ok;

      this.healthStatus = healthCheck;

      // Report if any health check fails
      const hasFailures = !healthCheck.api || !healthCheck.database ||
                         !healthCheck.authentication || !healthCheck.criticalFeatures;

      if (hasFailures) {
        this.reportHealthIssue(healthCheck);
      }

    } catch (error) {
      errorReporting.reportError(error as Error, {
        component: 'ProductionMonitoring',
        action: 'healthCheck',
      });
    }
  }

  private setupErrorTracking(): void {
    // Track error rates
    let errorCount = 0;
    const originalErrorReporting = errorReporting.reportError;

    errorReporting.reportError = (error, context) => {
      errorCount++;
      this.analytics.errors++;

      // Report high error rates
      if (errorCount > 10) {
        this.reportErrorSpike(errorCount);
      }

      return originalErrorReporting.call(errorReporting, error, context);
    };
  }

  private setupUserAnalytics(): void {
    // Track page views
    let pageViews = 0;
    const trackPageView = () => {
      pageViews++;
      this.analytics.pageViews = pageViews;
      this.trackUserBehavior('page_view');
    };

    // Track initial page view
    if (document.readyState === 'complete') {
      trackPageView();
    } else {
      window.addEventListener('load', trackPageView);
    }

    // Track SPA navigation
    let lastPath = window.location.pathname;
    setInterval(() => {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        trackPageView();
      }
    }, 1000);

    // Track user interactions
    this.trackUserInteractions();

    // Track session duration
    window.addEventListener('beforeunload', () => {
      this.analytics.sessionDuration = Date.now() - this.sessionStartTime.getTime();
      this.reportSessionEnd();
    });
  }

  private trackUserInteractions(): void {
    let interactionCount = 0;

    const trackInteraction = () => {
      interactionCount++;
      this.analytics.interactions = interactionCount;
    };

    // Track clicks
    document.addEventListener('click', trackInteraction);

    // Track form submissions
    document.addEventListener('submit', trackInteraction);

    // Track API calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      trackInteraction();
      return originalFetch.apply(window, args);
    };
  }

  private trackUserBehavior(action: string, data?: any): void {
    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('event', action, {
        session_id: this.sessionId,
        custom_parameter: data,
      });
    }
  }

  private reportPerformanceIssue(metric: string, value: number, context?: any): void {
    errorReporting.reportError(
      new Error(`Performance Issue: ${metric} - ${value}ms`),
      {
        component: 'ProductionMonitoring',
        action: 'performanceIssue',
        additionalInfo: { metric, value, ...context }
      }
    );
  }

  private reportHealthIssue(healthCheck: HealthCheck): void {
    const issues = [];
    if (!healthCheck.api) issues.push('API');
    if (!healthCheck.database) issues.push('Database');
    if (!healthCheck.authentication) issues.push('Authentication');
    if (!healthCheck.criticalFeatures) issues.push('Critical Features');

    errorReporting.reportError(
      new Error(`Health Check Failed: ${issues.join(', ')}`),
      {
        component: 'ProductionMonitoring',
        action: 'healthCheckFailed',
        additionalInfo: { healthCheck, failedServices: issues }
      }
    );
  }

  private reportErrorSpike(errorCount: number): void {
    errorReporting.reportError(
      new Error(`High Error Rate Detected: ${errorCount} errors`),
      {
        component: 'ProductionMonitoring',
        action: 'errorSpike',
        additionalInfo: { errorCount, sessionId: this.sessionId }
      }
    );
  }

  private reportSessionEnd(): void {
    // Send session analytics to analytics service
    this.trackUserBehavior('session_end', {
      duration: this.analytics.sessionDuration,
      pageViews: this.analytics.pageViews,
      interactions: this.analytics.interactions,
      errors: this.analytics.errors,
    });
  }

  // Public API
  public trackFeatureUsage(featureName: string): void {
    this.analytics.features.push(featureName);
    this.trackUserBehavior('feature_usage', { feature: featureName });
  }

  public trackCustomMetric(name: string, value: number, context?: any): void {
    this.trackUserBehavior('custom_metric', { name, value, ...context });
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  public getHealthStatus(): HealthCheck | null {
    return this.healthStatus;
  }

  public getAnalytics(): UserAnalytics {
    return { ...this.analytics };
  }

  public cleanup(): void {
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Export singleton instance
export const productionMonitoring = new ProductionMonitoring();

// Export convenience functions
export const trackFeatureUsage = (featureName: string) => {
  productionMonitoring.trackFeatureUsage(featureName);
};

export const trackCustomMetric = (name: string, value: number, context?: any) => {
  productionMonitoring.trackCustomMetric(name, value, context);
};

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  productionMonitoring.cleanup();
});