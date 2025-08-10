/**
 * Production-ready error boundary for AgentInterface components
 *
 * Provides graceful degradation with markdown fallback, retry functionality,
 * and detailed error reporting. Designed to be shadcn-quality and work out of the box.
 */
import { Component, type ErrorInfo, type ReactNode } from 'react';
// import { Prose } from "../prose";

export interface InterfaceErrorBoundaryProps {
  children: ReactNode;
  /** Fallback content to display (markdown format) */
  fallbackContent?: string;
  /** Interface type for context */
  interfaceType?: string;
  /** Interface data for debugging */
  interfaceData?: any;
  /** Show retry button */
  showRetry?: boolean;
  /** Show debug information in development */
  showDebugInfo?: boolean;
  /** Custom error handler */
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    context: InterfaceErrorContext,
  ) => void;
  /** Custom className for styling */
  className?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export interface InterfaceErrorContext {
  interfaceType?: string;
  interfaceData?: any;
  fallbackContent?: string;
  retryCount: number;
}

export class InterfaceErrorBoundary extends Component<
  InterfaceErrorBoundaryProps,
  State
> {
  private readonly maxRetries = 3;

  constructor(props: InterfaceErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const context: InterfaceErrorContext = {
      interfaceType: this.props.interfaceType,
      interfaceData: this.props.interfaceData,
      fallbackContent: this.props.fallbackContent,
      retryCount: this.state.retryCount,
    };

    console.error('AgentInterface component error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context,
    });

    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo, context);
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackContent,
        interfaceType,
        showRetry = true,
        className = '',
      } = this.props;
      const canRetry = this.state.retryCount < this.maxRetries;

      return (
        <div
          className={`rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20 ${className}`}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <svg
                className="size-5 text-red-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                Interface Component Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                An error occurred while rendering this interface component. The
                chat will continue to work normally.
                {interfaceType && (
                  <span className="mt-1 block text-xs opacity-75">
                    Interface type: {interfaceType}
                  </span>
                )}
              </p>

              {fallbackContent && (
                <div className="mt-3 rounded border border-red-200 bg-white p-3 dark:border-red-700 dark:bg-gray-800">
                  <pre className="whitespace-pre-wrap text-sm">
                    {fallbackContent}
                  </pre>
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                {showRetry && canRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="rounded border border-red-300 bg-red-100 px-3 py-1 text-xs text-red-800 transition-colors hover:bg-red-200 dark:border-red-600 dark:bg-red-800 dark:text-red-200 dark:hover:bg-red-700"
                  >
                    ↻ Retry ({this.maxRetries - this.state.retryCount} left)
                  </button>
                )}
                {this.state.retryCount >= this.maxRetries && (
                  <span className="text-xs text-red-600 dark:text-red-400">
                    Max retries reached
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
