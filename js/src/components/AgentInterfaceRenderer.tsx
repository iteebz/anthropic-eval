import { useCallback } from "react";

import { type InterfaceType, type InterfaceData } from "../types";
import { InterfaceErrorBoundary, InterfaceErrorContext } from "./common/InterfaceErrorBoundary";
import { useInterfaceConfig } from "../hooks";
import { LoadingState } from "./common/LoadingState";
import { ErrorState } from "./common/ErrorState";
import { EmptyState } from "./common/EmptyState";
import { ComponentNotFound } from "./common/ComponentNotFound";
import { type RendererComponentProps } from "../utils/componentProps";
import { RecursiveRenderer } from "./RecursiveRenderer";
import type { Logger } from "../types";

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
    context: InterfaceErrorContext,
  ) => void;

  /**
   * Custom logger instance
   */
  logger?: Logger;

  /**
   * Enable recursive rendering for nested components
   */
  enableRecursiveRendering?: boolean;

  /**
   * Maximum depth for recursive rendering
   */
  maxRecursiveDepth?: number;
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
  enableRecursiveRendering = false,
  maxRecursiveDepth = 10,
}: AgentInterfaceRendererProps) => {
  const { interfaceConfig, isLoading, error } = useInterfaceConfig(
    agentResponse,
    { enablePerformanceMonitoring, logger },
  );

  const handleError = useCallback(
    (
      error: Error,
      errorInfo: React.ErrorInfo,
      context: InterfaceErrorContext,
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

  const Component = components[interfaceConfig.type as keyof typeof components];

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

  const componentProps: RendererComponentProps = {
    content: interfaceConfig.content,
    interfaceData: interfaceConfig.data as InterfaceData,
    className,
    onSendMessage,
    children: enableRecursiveRendering && (interfaceConfig.data as any)?.children ? (
      <RecursiveRenderer
        content={(interfaceConfig.data as any).children}
        depth={1}
        maxDepth={maxRecursiveDepth}
        onSendMessage={onSendMessage}
      />
    ) : undefined,
  };

  return (
    <InterfaceErrorBoundary
      interfaceType={interfaceConfig.type}
      fallbackContent={interfaceConfig.content}
      interfaceData={interfaceConfig.data}
      showDebugInfo={showErrorDetails}
      onError={handleError}
    >
      <Component {...componentProps} />
    </InterfaceErrorBoundary>
  );
};
