/**
 * Performance monitoring utilities for AgentInterface
 */

export interface PerformanceMetrics {
  renderTime: number;
  validationTime: number;
  memoryUsage?: number;
}

export function categorizePerformanceImpact(
  ms: number,
): 'low' | 'medium' | 'high' {
  if (ms < 16) return 'low'; // < 1 frame at 60fps
  if (ms < 100) return 'medium'; // < 100ms
  return 'high'; // > 100ms
}

export function measurePerformance<T>(
  fn: () => T,
  label?: string,
  isDevMode = false,
): { result: T; duration: number } {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;

  if (label && isDevMode) {
    console.debug(`[AgentInterface] ${label}: ${duration.toFixed(2)}ms`);
  }

  return { result, duration };
}

interface PerformanceStats {
  avg: number;
  min: number;
  max: number;
  count: number;
}

export function createPerformanceTracker() {
  const metrics: Record<string, number[]> = {};

  return {
    track(operation: string, duration: number) {
      if (!metrics[operation]) {
        metrics[operation] = [];
      }
      metrics[operation].push(duration);
    },

    getStats(operation: string): PerformanceStats | null {
      const times = metrics[operation] || [];
      if (times.length === 0) return null;

      const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
      const min = Math.min(...times);
      const max = Math.max(...times);

      return { avg, min, max, count: times.length };
    },

    getAllStats(): Record<string, PerformanceStats | null> {
      return Object.keys(metrics).reduce(
        (acc, key) => {
          acc[key] = this.getStats(key);
          return acc;
        },
        {} as Record<string, PerformanceStats | null>,
      );
    },
  };
}
