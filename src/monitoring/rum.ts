/**
 * Real User Monitoring (RUM)
 * Tracks actual user interactions and performance
 */

interface UserAction {
  type: 'click' | 'navigation' | 'scroll' | 'form' | 'error';
  target?: string;
  value?: any;
  timestamp: number;
  sessionId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface PerformanceEntry {
  metric: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  userAgent: string;
}

class RealUserMonitoring {
  private sessionId: string;
  private userId?: string;
  private actions: UserAction[] = [];
  private performanceData: PerformanceEntry[] = [];
  private maxBufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private apiEndpoint = import.meta.env.VITE_RUM_ENDPOINT || '/api/rum';

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeTracking();
    this.startPeriodicFlush();
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Initialize event tracking
   */
  private initializeTracking(): void {
    if (typeof window === 'undefined') return;

    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackAction({
        type: 'click',
        target: this.getElementIdentifier(target),
        metadata: {
          x: event.clientX,
          y: event.clientY,
          elementType: target.tagName,
          elementText: target.textContent?.substring(0, 50)
        }
      });
    });

    // Track navigation
    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      this.trackAction({
        type: 'navigation',
        target: args[2] as string,
        metadata: { method: 'pushState' }
      });
    };

    window.addEventListener('popstate', () => {
      this.trackAction({
        type: 'navigation',
        target: window.location.pathname,
        metadata: { method: 'popstate' }
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    let scrollTimeout: NodeJS.Timeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollPercentage = (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) * 100;

        if (scrollPercentage > maxScrollDepth) {
          maxScrollDepth = scrollPercentage;
          this.trackAction({
            type: 'scroll',
            value: Math.round(scrollPercentage),
            metadata: {
              viewportHeight: window.innerHeight,
              documentHeight: document.documentElement.scrollHeight
            }
          });
        }
      }, 500);
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackAction({
        type: 'error',
        target: event.filename,
        value: event.message,
        metadata: {
          line: event.lineno,
          column: event.colno,
          stack: event.error?.stack
        }
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackAction({
        type: 'error',
        value: event.reason,
        metadata: { type: 'unhandledRejection' }
      });
    });
  }

  /**
   * Get element identifier for tracking
   */
  private getElementIdentifier(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className && typeof element.className === 'string') {
      return `.${element.className.split(' ')[0]}`;
    }
    return element.tagName.toLowerCase();
  }

  /**
   * Track user action
   */
  public trackAction(action: Partial<UserAction>): void {
    const fullAction: UserAction = {
      type: action.type || 'click',
      target: action.target,
      value: action.value,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      metadata: action.metadata
    };

    this.actions.push(fullAction);

    // Flush if buffer is full
    if (this.actions.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Track performance metric
   */
  public trackPerformance(entry: Omit<PerformanceEntry, 'timestamp' | 'url' | 'userAgent'>): void {
    const fullEntry: PerformanceEntry = {
      ...entry,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    this.performanceData.push(fullEntry);

    // Flush if buffer is full
    if (this.performanceData.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  /**
   * Set user ID for tracking
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Start periodic flush
   */
  private startPeriodicFlush(): void {
    setInterval(() => this.flush(), this.flushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => this.flush());
  }

  /**
   * Flush data to server
   */
  private async flush(): Promise<void> {
    if (this.actions.length === 0 && this.performanceData.length === 0) {
      return;
    }

    const data = {
      sessionId: this.sessionId,
      userId: this.userId,
      actions: [...this.actions],
      performance: [...this.performanceData],
      timestamp: Date.now()
    };

    // Clear buffers
    this.actions = [];
    this.performanceData = [];

    try {
      // Send to monitoring endpoint
      await this.sendToServer(data);

      // Also log to console in development
      if (import.meta.env.DEV) {
        console.log('📊 RUM Data:', data);
      }
    } catch (error) {
      console.error('Failed to send RUM data:', error);
      // Re-add data to buffers if send failed
      this.actions.push(...data.actions);
      this.performanceData.push(...data.performance);
    }
  }

  /**
   * Send data to server
   */
  private async sendToServer(data: any): Promise<void> {
    // For now, only log locally (RUM endpoint not deployed yet)
    // Store in localStorage for inspection in both dev and prod
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('rum_data') || '[]';
        const rumData = JSON.parse(stored);
        rumData.push(data);
        // Keep only last 10 entries
        if (rumData.length > 10) {
          rumData.shift();
        }
        localStorage.setItem('rum_data', JSON.stringify(rumData));
      } catch (err) {
        // Silently fail if localStorage is not available
        console.debug('RUM: localStorage not available');
      }
    }

    // TODO: Uncomment when RUM endpoint is deployed
    // if (import.meta.env.PROD && this.apiEndpoint !== '/api/rum') {
    //   const response = await fetch(this.apiEndpoint, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //     keepalive: true
    //   });
    //   if (!response.ok) {
    //     throw new Error(`RUM endpoint returned ${response.status}`);
    //   }
    // }
  }

  /**
   * Get current session analytics
   */
  public getSessionAnalytics(): any {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      actionCount: this.actions.length,
      performanceCount: this.performanceData.length,
      sessionDuration: Date.now() - parseInt(this.sessionId.split('-')[0])
    };
  }
}

// Singleton instance
let rumInstance: RealUserMonitoring | null = null;

/**
 * Initialize RUM
 */
export function initializeRUM(): RealUserMonitoring {
  if (!rumInstance && typeof window !== 'undefined') {
    rumInstance = new RealUserMonitoring();
    console.log('📊 Real User Monitoring initialized');
  }
  return rumInstance!;
}

/**
 * Get RUM instance
 */
export function getRUM(): RealUserMonitoring | null {
  return rumInstance;
}

export default {
  initializeRUM,
  getRUM
};