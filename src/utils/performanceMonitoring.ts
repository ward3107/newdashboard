/**
 * Performance Monitoring with Web Vitals
 * Tracks Core Web Vitals and custom performance metrics
 */

import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

/**
 * Performance data interface
 */
interface PerformanceData {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

/**
 * Performance thresholds based on Google's recommendations
 */
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  INP: { good: 200, poor: 500 },   // Interaction to Next Paint (replaces FID)
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

/**
 * Get rating based on metric value
 */
function getRating(metric: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metric as keyof typeof THRESHOLDS];
  if (!threshold) return 'needs-improvement';

  if (value <= threshold.good) return 'good';
  if (value >= threshold.poor) return 'poor';
  return 'needs-improvement';
}

/**
 * Send performance data to analytics
 */
function sendToAnalytics(data: PerformanceData) {
  // Log to console in development
  if (import.meta.env.DEV) {
    const emoji = data.rating === 'good' ? '✅' : data.rating === 'poor' ? '❌' : '⚠️';
    console.log(`${emoji} ${data.metric}: ${data.value.toFixed(2)}ms (${data.rating})`);
  }

  // Send to your analytics service (Google Analytics, etc.)
  if (typeof window !== 'undefined' && (window as Window & { gtag?: (...args: unknown[]) => void }).gtag) {
    const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('event', 'web_vitals', {
        event_category: 'Performance',
        event_label: data.metric,
        value: Math.round(data.value),
        metric_rating: data.rating,
        non_interaction: true,
      });
    }
  }

  // Store in localStorage for debugging
  try {
    const stored = localStorage.getItem('performance_metrics') || '[]';
    const metrics = JSON.parse(stored);
    metrics.push(data);
    // Keep only last 100 entries
    if (metrics.length > 100) {
      metrics.shift();
    }
    localStorage.setItem('performance_metrics', JSON.stringify(metrics));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to store performance metrics:', error);
    }
  }
}

/**
 * Initialize Web Vitals monitoring
 */
export function initPerformanceMonitoring() {
  // Core Web Vitals
  onLCP((metric) => {
    sendToAnalytics({
      metric: 'LCP',
      value: metric.value,
      rating: getRating('LCP', metric.value),
      timestamp: Date.now(),
    });
  });

  // Note: FID is deprecated in web-vitals v5 in favor of INP
  // INP (Interaction to Next Paint) is a better metric for responsiveness

  onCLS((metric) => {
    sendToAnalytics({
      metric: 'CLS',
      value: metric.value,
      rating: getRating('CLS', metric.value),
      timestamp: Date.now(),
    });
  });

  // Additional metrics
  onFCP((metric) => {
    sendToAnalytics({
      metric: 'FCP',
      value: metric.value,
      rating: getRating('FCP', metric.value),
      timestamp: Date.now(),
    });
  });

  onINP((metric) => {
    sendToAnalytics({
      metric: 'INP',
      value: metric.value,
      rating: getRating('INP', metric.value),
      timestamp: Date.now(),
    });
  });

  onTTFB((metric) => {
    sendToAnalytics({
      metric: 'TTFB',
      value: metric.value,
      rating: getRating('TTFB', metric.value),
      timestamp: Date.now(),
    });
  });

  // Custom metrics
  measureCustomMetrics();

  // Log initial performance summary
  if (import.meta.env.DEV) {
    console.log('🚀 Performance monitoring initialized');
    console.log('📊 Tracking: LCP, CLS, FCP, INP, TTFB');
  }
}

/**
 * Measure custom application-specific metrics
 */
function measureCustomMetrics() {
  if (typeof window === 'undefined') return;

  // Time to Interactive
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const interactive = timing.domInteractive - timing.navigationStart;

    sendToAnalytics({
      metric: 'TTI',
      value: interactive,
      rating: interactive < 3000 ? 'good' : interactive < 5000 ? 'needs-improvement' : 'poor',
      timestamp: Date.now(),
    });
  }

  // Bundle size (approximate)
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsSize = resources
      .filter(r => r.name.endsWith('.js'))
      .reduce((total, r) => total + r.transferSize || 0, 0);

    if (jsSize > 0) {
      const sizeMB = jsSize / (1024 * 1024);
      sendToAnalytics({
        metric: 'JS_Bundle_Size',
        value: sizeMB * 1000, // Convert to ms-like value for consistent reporting
        rating: sizeMB < 1 ? 'good' : sizeMB < 2 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });
    }
  }

  // Memory usage (if available)
  interface PerformanceWithMemory extends Performance {
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  }

  const performanceWithMemory = window.performance as PerformanceWithMemory;
  if (performanceWithMemory.memory) {
    const memory = performanceWithMemory.memory;
    const usedMB = memory.usedJSHeapSize / (1024 * 1024);

    sendToAnalytics({
      metric: 'Memory_Usage',
      value: usedMB,
      rating: usedMB < 50 ? 'good' : usedMB < 100 ? 'needs-improvement' : 'poor',
      timestamp: Date.now(),
    });
  }
}

/**
 * Get stored performance metrics
 */
export function getPerformanceMetrics(): PerformanceData[] {
  try {
    const stored = localStorage.getItem('performance_metrics') || '[]';
    return JSON.parse(stored);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to retrieve performance metrics:', error);
    }
    return [];
  }
}

/**
 * Clear stored performance metrics
 */
export function clearPerformanceMetrics() {
  try {
    localStorage.removeItem('performance_metrics');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Failed to clear performance metrics:', error);
    }
  }
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): string {
  const metrics = getPerformanceMetrics();
  if (metrics.length === 0) {
    return 'No performance data available';
  }

  // Group by metric
  const grouped = metrics.reduce((acc, curr) => {
    if (!acc[curr.metric]) {
      acc[curr.metric] = [];
    }
    acc[curr.metric].push(curr);
    return acc;
  }, {} as Record<string, PerformanceData[]>);

  // Calculate averages
  const report: string[] = ['=== Performance Report ===\n'];

  Object.entries(grouped).forEach(([metric, values]) => {
    const avg = values.reduce((sum, v) => sum + v.value, 0) / values.length;
    const goodCount = values.filter(v => v.rating === 'good').length;
    const poorCount = values.filter(v => v.rating === 'poor').length;

    report.push(`${metric}:`);
    report.push(`  Average: ${avg.toFixed(2)}ms`);
    report.push(`  Good: ${goodCount}/${values.length} (${((goodCount/values.length)*100).toFixed(1)}%)`);
    report.push(`  Poor: ${poorCount}/${values.length} (${((poorCount/values.length)*100).toFixed(1)}%)`);
    report.push('');
  });

  return report.join('\n');
}

/**
 * Performance monitoring React hook
 */
export function usePerformanceMonitoring() {
  if (typeof window !== 'undefined') {
    // Initialize on mount
    window.addEventListener('load', () => {
      initPerformanceMonitoring();
    });

    // Clean up
    return () => {
      // Performance monitoring doesn't need cleanup
    };
  }
  return undefined;
}

// Export all functions
export default {
  initPerformanceMonitoring,
  getPerformanceMetrics,
  clearPerformanceMetrics,
  generatePerformanceReport,
  usePerformanceMonitoring,
};