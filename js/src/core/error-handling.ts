/**
 * Error Handling Core
 * Centralized error handling with graceful degradation
 */

import { ComponentType } from 'react';

export interface AIPError {
  code: string;
  message: string;
  component?: string;
  props?: any;
  cause?: Error;
  timestamp: number;
  context?: Record<string, any>;
}

export interface ErrorHandlingConfig {
  enableLogging?: boolean;
  enableReporting?: boolean;
  fallbackComponent?: ComponentType<any>;
  maxRetries?: number;
  retryDelay?: number;
  onError?: (error: AIPError) => void;
}

export class AIPErrorHandler {
  private config: ErrorHandlingConfig;
  private retryCount = new Map<string, number>();

  constructor(config: ErrorHandlingConfig = {}) {
    this.config = {
      enableLogging: true,
      enableReporting: false,
      maxRetries: 3,
      retryDelay: 1000,
      ...config
    };
  }

  /**
   * Create standardized AIP error
   */
  createError(
    code: string,
    message: string,
    component?: string,
    props?: any,
    cause?: Error,
    context?: Record<string, any>
  ): AIPError {
    return {
      code,
      message,
      component,
      props,
      cause,
      timestamp: Date.now(),
      context
    };
  }

  /**
   * Handle error with logging and reporting
   */
  handleError(error: AIPError): void {
    if (this.config.enableLogging) {
      console.error(`[AIP Error] ${error.code}: ${error.message}`, {
        component: error.component,
        props: error.props,
        cause: error.cause,
        context: error.context,
        timestamp: new Date(error.timestamp).toISOString()
      });
    }

    if (this.config.enableReporting) {
      this.reportError(error);
    }

    if (this.config.onError) {
      this.config.onError(error);
    }
  }

  /**
   * Handle component loading errors with retry logic
   */
  async handleComponentError<T>(
    componentName: string,
    operation: () => Promise<T>,
    fallback?: T
  ): Promise<T | null> {
    const key = `component:${componentName}`;
    const retries = this.retryCount.get(key) || 0;

    try {
      const result = await operation();
      
      // Reset retry count on success
      this.retryCount.delete(key);
      
      return result;
    } catch (error) {
      const aipError = this.createError(
        'COMPONENT_LOAD_ERROR',
        `Failed to load component: ${componentName}`,
        componentName,
        undefined,
        error instanceof Error ? error : new Error(String(error))
      );

      this.handleError(aipError);

      // Retry logic
      if (retries < (this.config.maxRetries || 3)) {
        this.retryCount.set(key, retries + 1);
        
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay || 1000)
        );
        
        return this.handleComponentError(componentName, operation, fallback);
      }

      // Max retries reached, return fallback
      return fallback || null;
    }
  }

  /**
   * Handle validation errors gracefully
   */
  handleValidationError(
    componentName: string,
    props: any,
    validationError: Error,
    strictMode: boolean = false
  ): { success: boolean; error?: string; data?: any } {
    const aipError = this.createError(
      'VALIDATION_ERROR',
      `Props validation failed for component: ${componentName}`,
      componentName,
      props,
      validationError
    );

    this.handleError(aipError);

    if (strictMode) {
      throw validationError;
    }

    return {
      success: false,
      error: validationError.message,
      data: props // Return original props for graceful degradation
    };
  }

  /**
   * Handle registry errors
   */
  handleRegistryError(
    operation: string,
    error: Error,
    context?: Record<string, any>
  ): void {
    const aipError = this.createError(
      'REGISTRY_ERROR',
      `Registry operation failed: ${operation}`,
      undefined,
      undefined,
      error,
      context
    );

    this.handleError(aipError);
  }

  /**
   * Handle bundle loading errors
   */
  async handleBundleError(
    bundleName: string,
    operation: () => Promise<any>,
    fallback?: any
  ): Promise<any> {
    try {
      return await operation();
    } catch (error) {
      const aipError = this.createError(
        'BUNDLE_LOAD_ERROR',
        `Failed to load bundle: ${bundleName}`,
        undefined,
        undefined,
        error instanceof Error ? error : new Error(String(error)),
        { bundleName }
      );

      this.handleError(aipError);
      return fallback;
    }
  }

  /**
   * Report error to external service
   */
  private reportError(error: AIPError): void {
    // Implementation would depend on error reporting service
    // e.g., Sentry, LogRocket, etc.
    console.warn('[AIP] Error reporting not configured');
  }

  /**
   * Clear retry count for component
   */
  clearRetries(componentName: string): void {
    this.retryCount.delete(`component:${componentName}`);
  }

  /**
   * Get retry count for component
   */
  getRetryCount(componentName: string): number {
    return this.retryCount.get(`component:${componentName}`) || 0;
  }
}

// Global error handler instance
let globalErrorHandler: AIPErrorHandler | null = null;

/**
 * Get or create global error handler
 */
export function getErrorHandler(config?: ErrorHandlingConfig): AIPErrorHandler {
  if (!globalErrorHandler) {
    globalErrorHandler = new AIPErrorHandler(config);
  }
  return globalErrorHandler;
}

/**
 * Error boundary utilities
 */
export const ErrorCodes = {
  COMPONENT_LOAD_ERROR: 'COMPONENT_LOAD_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REGISTRY_ERROR: 'REGISTRY_ERROR',
  BUNDLE_LOAD_ERROR: 'BUNDLE_LOAD_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

/**
 * Error recovery strategies
 */
export const ErrorRecoveryStrategies = {
  RETRY: 'retry',
  FALLBACK: 'fallback',
  IGNORE: 'ignore',
  FAIL_FAST: 'fail_fast'
} as const;

export type ErrorRecoveryStrategy = typeof ErrorRecoveryStrategies[keyof typeof ErrorRecoveryStrategies];

/**
 * Utility for wrapping async operations with error handling
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorCode: ErrorCode,
  message: string,
  context?: Record<string, any>,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    const errorHandler = getErrorHandler();
    const aipError = errorHandler.createError(
      errorCode,
      message,
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    errorHandler.handleError(aipError);
    return fallback || null;
  }
}

/**
 * Utility for wrapping sync operations with error handling
 */
export function withSyncErrorHandling<T>(
  operation: () => T,
  errorCode: ErrorCode,
  message: string,
  context?: Record<string, any>,
  fallback?: T
): T | null {
  try {
    return operation();
  } catch (error) {
    const errorHandler = getErrorHandler();
    const aipError = errorHandler.createError(
      errorCode,
      message,
      undefined,
      undefined,
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    
    errorHandler.handleError(aipError);
    return fallback || null;
  }
}