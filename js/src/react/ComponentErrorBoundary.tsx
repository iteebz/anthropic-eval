import { Component, type ErrorInfo, type ReactNode } from "react";
import type { InterfaceType } from "../core/types";
import { ComponentFallbacks, ErrorHeader, DebugInfo } from "./fallbacks";
import {
  getRecoveryMessage,
  categorizePerformanceImpact,
} from "./utils/recovery";
import type { Logger } from "../core/types";

interface ComponentErrorBoundaryProps {
  children: ReactNode;
  interfaceType: InterfaceType;
  content: string;
  interfaceData?: unknown;
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    context: ComponentErrorContext,
  ) => void;
  onRetry?: () => void;
  showDebugInfo?: boolean;
  logger?: Logger;
}

export interface ComponentErrorContext {
  interfaceType: InterfaceType;
  content: string;
  interfaceData?: unknown;
  timestamp: number;
  userAgent: string;
}

interface ComponentErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  performanceImpact: number;
}

/**
 * Component-aware error boundary specifically for AgentInterface system
 *
 * Features:
 * - Component-specific fallback UIs (e.g., empty project grid vs. timeline)
 * - Validation error context and recovery suggestions
 * - Performance impact tracking for failed renders
 * - Debugging information for development
 */
export class ComponentErrorBoundary extends Component<
  ComponentErrorBoundaryProps,
  ComponentErrorBoundaryState
> {
  private performanceStart = 0;

  constructor(props: ComponentErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
      performanceImpact: 0,
    };
  }

  static getDerivedStateFromError(
    error: Error,
  ): Partial<ComponentErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const performanceImpact = performance.now() - this.performanceStart;

    const context: ComponentErrorContext = {
      interfaceType: this.props.interfaceType,
      content: this.props.content,
      interfaceData: this.props.interfaceData,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
    };

    this.setState({
      error,
      errorInfo,
      performanceImpact: Math.round(performanceImpact),
    });

    // Log component-specific error details
    this.props.logger?.componentError?.(this.props.interfaceType, error, {
      component: "ComponentErrorBoundary",
      userJourney: {
        interfaceType: this.props.interfaceType,
        action: "component_render_error",
      },
      performance: {
        renderTime: performanceImpact,
      },
      errorDetails: {
        componentStack: errorInfo.componentStack,
        interfaceData: this.props.interfaceData,
        retryCount: this.state.retryCount,
        performanceImpact: categorizePerformanceImpact(performanceImpact),
      },
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo, context);
  }

  componentDidMount() {
    this.performanceStart = performance.now();
  }

  componentDidUpdate() {
    if (!this.state.hasError) {
      this.performanceStart = performance.now();
    }
  }

  private handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));

    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const { interfaceType, content, showDebugInfo = false } = this.props;
      const { error, errorInfo, retryCount, performanceImpact } = this.state;

      const FallbackComponent = ComponentFallbacks[interfaceType];

      return (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20">
          <ErrorHeader
            interfaceType={interfaceType}
            retryCount={retryCount}
            recoveryMessage={getRecoveryMessage(interfaceType)}
            onRetry={this.handleRetry}
          />

          <div className="p-3">
            <FallbackComponent content={content} />
          </div>

          {showDebugInfo && (
            <DebugInfo
              error={error}
              errorInfo={errorInfo}
              performanceImpact={performanceImpact}
              retryCount={retryCount}
            />
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with ComponentErrorBoundary
 */
export function withComponentErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  interfaceType: InterfaceType,
  options?: {
    showDebugInfo?: boolean;
    onError?: ComponentErrorBoundaryProps["onError"];
  },
) {
  const WrappedComponent = (
    props: P & { content: string; interfaceData?: unknown },
  ) => (
    <ComponentErrorBoundary
      interfaceType={interfaceType}
      content={props.content}
      interfaceData={props.interfaceData}
      showDebugInfo={options?.showDebugInfo}
      onError={options?.onError}
    >
      <Component {...props} />
    </ComponentErrorBoundary>
  );

  WrappedComponent.displayName = `withComponentErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}
