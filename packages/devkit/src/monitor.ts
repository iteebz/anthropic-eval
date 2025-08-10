/**
 * Performance Monitor for AgentInterface
 * Integrates with React DevTools for component performance tracking
 */

export interface PerformanceMetrics {
  componentRenderTime: number;
  componentMountTime: number;
  totalRenderTime: number;
  componentName: string;
  timestamp: number;
}

export interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of renders to sample
  slowThreshold: number; // ms - what constitutes a slow render
  logSlowRenders: boolean;
  enableProfiler: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private config: PerformanceConfig;
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor(config: Partial<PerformanceConfig> = {}) {
    this.config = {
      enabled: process.env.NODE_ENV === 'development',
      sampleRate: 0.1, // Sample 10% of renders
      slowThreshold: 16, // 16ms = 60fps
      logSlowRenders: true,
      enableProfiler: true,
      ...config,
    };

    if (this.config.enabled) {
      this.setupPerformanceObserver();
      this.setupReactDevTools();
    }
  }

  private setupPerformanceObserver() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'measure' && entry.name.startsWith('aip-')) {
          this.recordMetric({
            componentName: entry.name.replace('aip-', ''),
            componentRenderTime: entry.duration,
            componentMountTime: 0,
            totalRenderTime: entry.duration,
            timestamp: Date.now(),
          });
        }
      }
    });

    observer.observe({ entryTypes: ['measure'] });
    this.observers.set('main', observer);
  }

  private setupReactDevTools() {
    if (typeof window === 'undefined') return;

    // Hook into React DevTools Profiler if available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;

      // Listen to profiler events
      hook.onCommitFiberRoot = (id: any, root: any, priorityLevel: any) => {
        if (Math.random() > this.config.sampleRate) return;

        // Collect render metrics from React fiber tree
        this.collectReactMetrics(root);
      };
    }
  }

  private collectReactMetrics(root: any) {
    // This would traverse the React fiber tree and collect metrics
    // For now, we'll use a simpler approach with performance.mark/measure
    if (performance && performance.getEntriesByType) {
      const measures = performance.getEntriesByType('measure');
      measures.forEach((measure) => {
        if (measure.name.includes('React')) {
          this.recordMetric({
            componentName: 'React',
            componentRenderTime: measure.duration,
            componentMountTime: 0,
            totalRenderTime: measure.duration,
            timestamp: Date.now(),
          });
        }
      });
    }
  }

  recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // Log slow renders
    if (
      this.config.logSlowRenders &&
      metric.componentRenderTime > this.config.slowThreshold
    ) {
      console.warn(
        `🐌 Slow render detected: ${metric.componentName} took ${metric.componentRenderTime.toFixed(2)}ms`,
      );
    }

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getSlowRenders(): PerformanceMetrics[] {
    return this.metrics.filter(
      (m) => m.componentRenderTime > this.config.slowThreshold,
    );
  }

  getAverageRenderTime(componentName?: string): number {
    const filtered = componentName
      ? this.metrics.filter((m) => m.componentName === componentName)
      : this.metrics;

    if (filtered.length === 0) return 0;

    return (
      filtered.reduce((sum, m) => sum + m.componentRenderTime, 0) /
      filtered.length
    );
  }

  exportReport(): string {
    const report = {
      totalMetrics: this.metrics.length,
      slowRenders: this.getSlowRenders().length,
      averageRenderTime: this.getAverageRenderTime(),
      componentsAnalyzed: [
        ...new Set(this.metrics.map((m) => m.componentName)),
      ],
      topSlowComponents: this.getTopSlowComponents(),
      timeRange: {
        start: Math.min(...this.metrics.map((m) => m.timestamp)),
        end: Math.max(...this.metrics.map((m) => m.timestamp)),
      },
    };

    return JSON.stringify(report, null, 2);
  }

  private getTopSlowComponents(): Array<{ name: string; avgTime: number }> {
    const componentTimes = new Map<string, number[]>();

    this.metrics.forEach((metric) => {
      if (!componentTimes.has(metric.componentName)) {
        componentTimes.set(metric.componentName, []);
      }
      componentTimes
        .get(metric.componentName)!
        .push(metric.componentRenderTime);
    });

    return Array.from(componentTimes.entries())
      .map(([name, times]) => ({
        name,
        avgTime: times.reduce((sum, time) => sum + time, 0) / times.length,
      }))
      .sort((a, b) => b.avgTime - a.avgTime)
      .slice(0, 5);
  }

  clear() {
    this.metrics = [];
  }

  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for component performance monitoring
export function usePerformanceMonitor(componentName: string) {
  const startTime = performance.now();

  return {
    markRenderStart: () => {
      if (performanceMonitor.config.enabled) {
        performance.mark(`aip-${componentName}-start`);
      }
    },

    markRenderEnd: () => {
      if (performanceMonitor.config.enabled) {
        performance.mark(`aip-${componentName}-end`);
        performance.measure(
          `aip-${componentName}`,
          `aip-${componentName}-start`,
          `aip-${componentName}-end`,
        );
      }
    },

    recordCustomMetric: (renderTime: number) => {
      performanceMonitor.recordMetric({
        componentName,
        componentRenderTime: renderTime,
        componentMountTime: 0,
        totalRenderTime: renderTime,
        timestamp: Date.now(),
      });
    },
  };
}

// Types for global declarations
declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: any;
    __AIP_PERFORMANCE_MONITOR__?: PerformanceMonitor;
  }
}

// Expose to window for debugging
if (typeof window !== 'undefined') {
  window.__AIP_PERFORMANCE_MONITOR__ = performanceMonitor;
}
