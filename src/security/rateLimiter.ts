/**
 * Client-side Rate Limiting
 * Prevents API abuse and DoS attacks
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private defaultConfig: RateLimitConfig = {
    maxRequests: 100,
    windowMs: 60000 // 1 minute
  };

  /**
   * Check if request is allowed
   */
  public isAllowed(endpoint: string, config?: RateLimitConfig): boolean {
    const cfg = { ...this.defaultConfig, ...config };
    const key = `${cfg.identifier || 'global'}:${endpoint}`;
    const now = Date.now();

    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new window
      this.limits.set(key, {
        count: 1,
        resetTime: now + cfg.windowMs
      });
      return true;
    }

    if (entry.count >= cfg.maxRequests) {
      // Rate limit exceeded
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);
      console.warn(`Rate limit exceeded for ${endpoint}. Try again in ${remainingTime}s`);
      return false;
    }

    // Increment counter
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Get remaining requests for endpoint
   */
  public getRemainingRequests(endpoint: string, config?: RateLimitConfig): number {
    const cfg = { ...this.defaultConfig, ...config };
    const key = `${cfg.identifier || 'global'}:${endpoint}`;
    const entry = this.limits.get(key);

    if (!entry || Date.now() > entry.resetTime) {
      return cfg.maxRequests;
    }

    return Math.max(0, cfg.maxRequests - entry.count);
  }

  /**
   * Get time until reset
   */
  public getResetTime(endpoint: string, identifier?: string): number {
    const key = `${identifier || 'global'}:${endpoint}`;
    const entry = this.limits.get(key);

    if (!entry || Date.now() > entry.resetTime) {
      return 0;
    }

    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Reset limits for endpoint
   */
  public reset(endpoint?: string, identifier?: string): void {
    if (endpoint) {
      const key = `${identifier || 'global'}:${endpoint}`;
      this.limits.delete(key);
    } else {
      this.limits.clear();
    }
  }

  /**
   * Clean up expired entries
   */
  public cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

// Clean up expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => rateLimiter.cleanup(), 60000); // Every minute
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Critical endpoints - strict limits
  analyzeStudent: { maxRequests: 10, windowMs: 60000 }, // 10 per minute
  getAllStudents: { maxRequests: 30, windowMs: 60000 }, // 30 per minute
  getStats: { maxRequests: 60, windowMs: 60000 }, // 60 per minute

  // Export operations - moderate limits
  exportData: { maxRequests: 5, windowMs: 60000 }, // 5 per minute
  generateReport: { maxRequests: 3, windowMs: 60000 }, // 3 per minute

  // Auth operations - very strict
  login: { maxRequests: 5, windowMs: 300000 }, // 5 per 5 minutes
  resetPassword: { maxRequests: 3, windowMs: 3600000 }, // 3 per hour

  // Default for unspecified endpoints
  default: { maxRequests: 100, windowMs: 60000 } // 100 per minute
};

/**
 * Middleware function for API calls
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  endpoint: string,
  config?: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    const limitConfig = config || RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;

    if (!rateLimiter.isAllowed(endpoint, limitConfig)) {
      const resetTime = rateLimiter.getResetTime(endpoint);
      const error = new Error(`Rate limit exceeded. Please wait ${Math.ceil(resetTime / 1000)} seconds.`);
      (error as any).code = 'RATE_LIMIT_EXCEEDED';
      (error as any).resetTime = resetTime;
      throw error;
    }

    try {
      return await fn(...args);
    } catch (error) {
      // If the request failed due to network error, don't count it against the limit
      if ((error as any).code === 'NETWORK_ERROR') {
        rateLimiter.reset(endpoint);
      }
      throw error;
    }
  }) as T;
}

/**
 * Hook for React components
 */
export function useRateLimit(endpoint: string, config?: RateLimitConfig) {
  const checkLimit = () => {
    const cfg = config || RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    return rateLimiter.isAllowed(endpoint, cfg);
  };

  const getRemainingRequests = () => {
    const cfg = config || RATE_LIMITS[endpoint as keyof typeof RATE_LIMITS] || RATE_LIMITS.default;
    return rateLimiter.getRemainingRequests(endpoint, cfg);
  };

  const getResetTime = () => {
    return rateLimiter.getResetTime(endpoint);
  };

  return {
    checkLimit,
    getRemainingRequests,
    getResetTime,
    isLimited: !checkLimit()
  };
}

export default rateLimiter;