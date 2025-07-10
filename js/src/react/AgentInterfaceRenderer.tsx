import { useCallback } from "react";

import { type InterfaceType, type InterfaceData } from "../core/types";
import {
  ComponentErrorBoundary,
  type ComponentErrorContext,
} from "./ComponentErrorBoundary";
import { useInterfaceConfig } from "./hooks";
import {
  LoadingState,
  ErrorState,
  EmptyState,
  ComponentNotFound,
} from "./components";
import {
  createComponentProps,
  type RendererComponentProps,
} from "./utils/componentProps";
import type { Logger } from "../core/types";

/**
 * Props for the AgentInterfaceRenderer component
 */
export interface AgentInterfaceRendererProps {
  /**
   * Raw agent response string (may contain structured data)
   */
  agentResponse: string;

  /**
   * Component registry to use for rendering
   */
  components: Record<
    InterfaceType,
    React.ComponentType<RendererComponentProps>
  >;

  /**
   * Callback when user sends a message from within a component
   */
  onSendMessage?: (message: string) => void;

  /**
   * Additional CSS classes to apply to the wrapper
   */
  className?: string;

  /**
   * Whether to show error details in development mode
   * @default true in development
   */
  showErrorDetails?: boolean;

  /**
   * Whether to enable performance monitoring
   * @default true in development
   */
  enablePerformanceMonitoring?: boolean;

  /**
   * Custom error handler for component errors
   */
  onError?: (
    error: Error,
    errorInfo: React.ErrorInfo,
    context: ComponentErrorContext,
  ) => void;

  /**
   * Custom logger instance
   */
  logger?: Logger;
}

/**
 * Core AgentInterface renderer component
 *
 * Parses agent responses and dynamically selects appropriate UI components
 * based on content analysis and specified interface types.
 */
export const AgentInterfaceRenderer = ({
  agentResponse,
  components,
  onSendMessage,
  className = "",
  showErrorDetails,
  enablePerformanceMonitoring,
  onError,
  logger,
}: AgentInterfaceRendererProps) => {
  const { interfaceConfig, isLoading, error } = useInterfaceConfig(
    agentResponse,
    { enablePerformanceMonitoring, logger },
  );

  const handleError = useCallback(
    (
      error: Error,
      errorInfo: React.ErrorInfo,
      context: ComponentErrorContext,
    ) => {
      logger?.error("AgentInterfaceRenderer error", {
        error: {
          details: { message: error.message, stack: error.stack },
          originalData: error,
        },
        errorInfo,
        context,
      });
      onError?.(error, errorInfo, context);
    },
    [logger, onError],
  );

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (error) {
    const errorObject =
      error instanceof Error ? error : new Error(String(error));
    return (
      <ErrorState
        error={errorObject}
        agentResponse={agentResponse}
        showErrorDetails={showErrorDetails}
        className={className}
      />
    );
  }

  if (!interfaceConfig) {
    return <EmptyState className={className} />;
  }

  const Component = components[interfaceConfig.type];

  if (!Component) {
    logger?.warn(
      `No component found for interface type: ${interfaceConfig.type}`,
    );
    return (
      <ComponentNotFound
        interfaceType={interfaceConfig.type}
        content={interfaceConfig.content}
        className={className}
      />
    );
  }

  const componentProps = createComponentProps(
    interfaceConfig.content,
    interfaceConfig.data as InterfaceData, // Cast here
    className,
    onSendMessage,
  );

  return (
    <ComponentErrorBoundary
      interfaceType={interfaceConfig.type}
      content={interfaceConfig.content}
      interfaceData={interfaceConfig.data}
      showDebugInfo={showErrorDetails}
      onError={handleError}
    >
      <Component {...componentProps} />
    </ComponentErrorBoundary>
  );
};
