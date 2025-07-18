import { z } from 'zod';

// Error types and schemas
const ErrorContextSchema = z.object({
  component: z.string(),
  operation: z.string(),
  timestamp: z.number(),
  userAgent: z.string().optional(),
  sessionId: z.string().optional(),
  stackTrace: z.string().optional(),
  additionalData: z.record(z.any()).optional()
});

const ErrorLogSchema = z.object({
  id: z.string(),
  level: z.enum(['error', 'warning', 'info', 'debug']),
  message: z.string(),
  context: ErrorContextSchema,
  resolved: z.boolean().default(false),
  resolution: z.string().optional(),
  occurrences: z.number().default(1),
  firstOccurrence: z.number(),
  lastOccurrence: z.number()
});

export type ErrorContext = z.infer<typeof ErrorContextSchema>;
export type ErrorLog = z.infer<typeof ErrorLogSchema>;

export type ErrorLevel = 'error' | 'warning' | 'info' | 'debug';

export interface ErrorHandlerConfig {
  enableLogging: boolean;
  enableReporting: boolean;
  maxLogSize: number;
  retryAttempts: number;
  retryDelay: number;
  onError: (error: ErrorLog) => void;
  onWarning: (warning: ErrorLog) => void;
  onInfo: (info: ErrorLog) => void;
  onDebug: (debug: ErrorLog) => void;
}

export class ErrorHandler {
  private readonly config: ErrorHandlerConfig;
  private readonly errorLogs: Map<string, ErrorLog> = new Map();
  private readonly errorCounts: Map<string, number> = new Map();
  private sessionId: string;

  constructor(config: Partial<ErrorHandlerConfig> = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: true,
      maxLogSize: 1000,
      retryAttempts: 3,
      retryDelay: 1000,
      onError: (error) => console.error('AIP Error:', error),
      onWarning: (warning) => console.warn('AIP Warning:', warning),
      onInfo: (info) => console.info('AIP Info:', info),
      onDebug: (debug) => console.debug('AIP Debug:', debug),
      ...config
    };

    this.sessionId = this.generateSessionId();
    this.setupGlobalErrorHandling();
  }

  /**
   * Log an error with context
   */
  error(message: string, context: Partial<ErrorContext> = {}, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Log a warning
   */
  warn(message: string, context: Partial<ErrorContext> = {}): void {
    this.log('warning', message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context: Partial<ErrorContext> = {}): void {
    this.log('info', message, context);
  }

  /**
   * Log debug message
   */
  debug(message: string, context: Partial<ErrorContext> = {}): void {
    this.log('debug', message, context);
  }

  /**
   * Wrap a function with error handling
   */
  wrap<T extends (...args: any[]) => any>(
    fn: T,
    context: Partial<ErrorContext> = {}
  ): T {
    return ((...args: Parameters<T>) => {
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result && typeof result.then === 'function') {
          return result.catch((error: Error) => {
            this.error(`Promise rejected in ${context.component || 'unknown'}`, context, error);
            throw error;
          });
        }
        
        return result;
      } catch (error) {
        this.error(`Error in ${context.component || 'unknown'}`, context, error as Error);
        throw error;
      }
    }) as T;
  }

  /**
   * Wrap async function with error handling and retries
   */
  wrapAsync<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    context: Partial<ErrorContext> = {},
    retryConfig?: { attempts?: number; delay?: number }
  ): T {
    return (async (...args: Parameters<T>) => {
      const maxAttempts = retryConfig?.attempts || this.config.retryAttempts;
      const delay = retryConfig?.delay || this.config.retryDelay;
      
      let lastError: Error;
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          return await fn(...args);
        } catch (error) {
          lastError = error as Error;
          
          this.error(
            `Attempt ${attempt}/${maxAttempts} failed in ${context.component || 'unknown'}`,
            { ...context, additionalData: { attempt, maxAttempts } },
            lastError
          );
          
          if (attempt < maxAttempts) {
            await this.sleep(delay * attempt); // Exponential backoff
          }
        }
      }
      
      throw lastError!;
    }) as T;
  }

  /**
   * Create error boundary for React components
   */
  createErrorBoundary(componentName: string) {
    return {
      componentDidCatch: (error: Error, errorInfo: any) => {
        this.error(
          `React component error in ${componentName}`,
          {
            component: componentName,
            operation: 'render',
            timestamp: Date.now(),
            additionalData: { errorInfo }
          },
          error
        );
      }
    };
  }

  /**
   * Get error statistics
   */
  getStatistics(): {
    totalErrors: number;
    totalWarnings: number;
    totalInfo: number;
    totalDebug: number;
    uniqueErrors: number;
    topErrors: Array<{ message: string; count: number }>;
    errorsByComponent: Record<string, number>;
  } {
    const stats = {
      totalErrors: 0,
      totalWarnings: 0,
      totalInfo: 0,
      totalDebug: 0,
      uniqueErrors: this.errorLogs.size,
      topErrors: [] as Array<{ message: string; count: number }>,
      errorsByComponent: {} as Record<string, number>
    };

    const errorFrequency = new Map<string, number>();
    
    this.errorLogs.forEach(log => {
      switch (log.level) {
        case 'error':
          stats.totalErrors += log.occurrences;
          break;
        case 'warning':
          stats.totalWarnings += log.occurrences;
          break;
        case 'info':
          stats.totalInfo += log.occurrences;
          break;
        case 'debug':
          stats.totalDebug += log.occurrences;
          break;
      }

      // Track by component
      const component = log.context.component;
      if (component) {
        stats.errorsByComponent[component] = (stats.errorsByComponent[component] || 0) + log.occurrences;
      }

      // Track frequency
      errorFrequency.set(log.message, log.occurrences);
    });

    // Get top errors
    stats.topErrors = Array.from(errorFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }));

    return stats;
  }

  /**
   * Clear error logs
   */
  clearLogs(): void {
    this.errorLogs.clear();
    this.errorCounts.clear();
  }

  /**
   * Get all error logs
   */
  getLogs(): ErrorLog[] {
    return Array.from(this.errorLogs.values());
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level: ErrorLevel): ErrorLog[] {
    return this.getLogs().filter(log => log.level === level);
  }

  /**
   * Get logs by component
   */
  getLogsByComponent(component: string): ErrorLog[] {
    return this.getLogs().filter(log => log.context.component === component);
  }

  /**
   * Mark error as resolved
   */
  resolveError(errorId: string, resolution: string): void {
    const log = this.errorLogs.get(errorId);
    if (log) {
      log.resolved = true;
      log.resolution = resolution;
      this.errorLogs.set(errorId, log);
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(Array.from(this.errorLogs.values()), null, 2);
  }

  /**
   * Import logs from JSON
   */
  importLogs(jsonString: string): void {
    try {
      const logs = JSON.parse(jsonString) as ErrorLog[];
      logs.forEach(log => {
        const validated = ErrorLogSchema.parse(log);
        this.errorLogs.set(validated.id, validated);
      });
    } catch (error) {
      this.error('Failed to import logs', { operation: 'importLogs' }, error as Error);
    }
  }

  /**
   * Generate error report
   */
  generateReport(): string {
    const stats = this.getStatistics();
    const logs = this.getLogs();
    
    let report = `# Error Report - ${new Date().toISOString()}\n\n`;
    
    report += `## Statistics\n`;
    report += `- Total Errors: ${stats.totalErrors}\n`;
    report += `- Total Warnings: ${stats.totalWarnings}\n`;
    report += `- Total Info: ${stats.totalInfo}\n`;
    report += `- Total Debug: ${stats.totalDebug}\n`;
    report += `- Unique Issues: ${stats.uniqueErrors}\n\n`;
    
    report += `## Top Errors\n`;
    stats.topErrors.forEach(({ message, count }) => {
      report += `- ${message} (${count} occurrences)\n`;
    });
    report += '\n';
    
    report += `## Errors by Component\n`;
    Object.entries(stats.errorsByComponent).forEach(([component, count]) => {
      report += `- ${component}: ${count} errors\n`;
    });
    report += '\n';
    
    report += `## Recent Errors\n`;
    logs
      .filter(log => log.level === 'error')
      .sort((a, b) => b.lastOccurrence - a.lastOccurrence)
      .slice(0, 10)
      .forEach(log => {
        report += `### ${log.message}\n`;
        report += `- Component: ${log.context.component}\n`;
        report += `- Operation: ${log.context.operation}\n`;
        report += `- Occurrences: ${log.occurrences}\n`;
        report += `- Last Occurrence: ${new Date(log.lastOccurrence).toISOString()}\n`;
        report += `- Resolved: ${log.resolved ? 'Yes' : 'No'}\n`;
        if (log.resolution) {
          report += `- Resolution: ${log.resolution}\n`;
        }
        report += '\n';
      });
    
    return report;
  }

  /**
   * Private methods
   */
  private log(level: ErrorLevel, message: string, context: Partial<ErrorContext> = {}, error?: Error): void {
    if (!this.config.enableLogging) return;

    const fullContext: ErrorContext = {
      component: context.component || 'unknown',
      operation: context.operation || 'unknown',
      timestamp: Date.now(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      sessionId: this.sessionId,
      stackTrace: error?.stack,
      additionalData: context.additionalData
    };

    const errorId = this.generateErrorId(message, fullContext);
    const timestamp = Date.now();

    let log: ErrorLog;
    const existing = this.errorLogs.get(errorId);
    
    if (existing) {
      log = {
        ...existing,
        occurrences: existing.occurrences + 1,
        lastOccurrence: timestamp
      };
    } else {
      log = {
        id: errorId,
        level,
        message,
        context: fullContext,
        resolved: false,
        occurrences: 1,
        firstOccurrence: timestamp,
        lastOccurrence: timestamp
      };
    }

    this.errorLogs.set(errorId, log);
    this.trimLogs();

    // Call appropriate handler
    switch (level) {
      case 'error':
        this.config.onError(log);
        break;
      case 'warning':
        this.config.onWarning(log);
        break;
      case 'info':
        this.config.onInfo(log);
        break;
      case 'debug':
        this.config.onDebug(log);
        break;
    }
  }

  private setupGlobalErrorHandling(): void {
    if (typeof window !== 'undefined') {
      // Handle unhandled promise rejections
      window.addEventListener('unhandledrejection', (event) => {
        this.error(
          'Unhandled promise rejection',
          { component: 'global', operation: 'promise' },
          event.reason
        );
      });

      // Handle uncaught errors
      window.addEventListener('error', (event) => {
        this.error(
          'Uncaught error',
          { 
            component: 'global', 
            operation: 'runtime',
            additionalData: {
              filename: event.filename,
              lineno: event.lineno,
              colno: event.colno
            }
          },
          event.error
        );
      });
    }
  }

  private generateErrorId(message: string, context: ErrorContext): string {
    const key = `${message}-${context.component}-${context.operation}`;
    return btoa(key).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private trimLogs(): void {
    if (this.errorLogs.size > this.config.maxLogSize) {
      const sorted = Array.from(this.errorLogs.entries())
        .sort((a, b) => a[1].lastOccurrence - b[1].lastOccurrence);
      
      const toRemove = sorted.slice(0, this.errorLogs.size - this.config.maxLogSize);
      toRemove.forEach(([id]) => this.errorLogs.delete(id));
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Global error handler instance
export const globalErrorHandler = new ErrorHandler();

// Utility functions
export function withErrorHandling<T extends (...args: any[]) => any>(
  fn: T,
  context: Partial<ErrorContext> = {}
): T {
  return globalErrorHandler.wrap(fn, context);
}

export function withAsyncErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: Partial<ErrorContext> = {},
  retryConfig?: { attempts?: number; delay?: number }
): T {
  return globalErrorHandler.wrapAsync(fn, context, retryConfig);
}

export function logError(message: string, context: Partial<ErrorContext> = {}, error?: Error): void {
  globalErrorHandler.error(message, context, error);
}

export function logWarning(message: string, context: Partial<ErrorContext> = {}): void {
  globalErrorHandler.warn(message, context);
}

export function logInfo(message: string, context: Partial<ErrorContext> = {}): void {
  globalErrorHandler.info(message, context);
}

export function logDebug(message: string, context: Partial<ErrorContext> = {}): void {
  globalErrorHandler.debug(message, context);
}