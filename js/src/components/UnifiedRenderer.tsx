/**
 * Unified AIP Renderer - Uses the new registry system
 * 
 * Replaces AgentInterfaceRenderer with clean registry-driven approach
 */

import React, { useCallback } from 'react';
import { renderAIPComponent, isRegistered } from '../registry/unified';
import { InterfaceErrorBoundary, InterfaceErrorContext } from './common/InterfaceErrorBoundary';
import { useInterfaceConfig } from '../hooks';
import { LoadingState } from './common/LoadingState';
import { ErrorState } from './common/ErrorState';
import { EmptyState } from './common/EmptyState';
import { ComponentNotFound } from './common/ComponentNotFound';
import type { Logger } from '../types';

export interface UnifiedRendererProps {
  /**
   * Raw agent response string (may contain structured data)
   */
  agentResponse: string;

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
}

/**
 * Unified AIP Renderer using the new registry system
 * 
 * Parses agent responses and renders components using the unified registry
 */
export const UnifiedRenderer: React.FC<UnifiedRendererProps> = ({
  agentResponse,
  onSendMessage,
  className = "",
  showErrorDetails,
  enablePerformanceMonitoring,
  onError,
  logger,
}) => {
  const { interfaceConfig, isLoading, error } = useInterfaceConfig(
    agentResponse,
    { enablePerformanceMonitoring, logger }
  );

  const handleError = useCallback(
    (
      error: Error,
      errorInfo: React.ErrorInfo,
      context: InterfaceErrorContext,
    ) => {
      logger?.error("UnifiedRenderer error", {
        error: {
          details: { message: error.message, stack: error.stack },
          originalData: error,
        },
        errorInfo,
        context,
      });
      onError?.(error, errorInfo, context);
    },
    [logger, onError]
  );

  if (isLoading) {
    return <LoadingState className={className} />;
  }

  if (error) {
    const errorObject = error instanceof Error ? error : new Error(String(error));
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

  // Check if component type is registered
  if (!isRegistered(interfaceConfig.type)) {
    logger?.warn(`No component registered for type: ${interfaceConfig.type}`);
    return (
      <ComponentNotFound
        interfaceType={interfaceConfig.type}
        content={interfaceConfig.content}
        className={className}
      />
    );
  }

  // Prepare component data
  const componentData = {
    ...interfaceConfig.data,
    content: interfaceConfig.content,
    className,
    onSendMessage
  };

  return (
    <InterfaceErrorBoundary
      interfaceType={interfaceConfig.type}
      fallbackContent={interfaceConfig.content}
      interfaceData={interfaceConfig.data}
      showDebugInfo={showErrorDetails}
      onError={handleError}
    >
      {renderAIPComponent({
        type: interfaceConfig.type,
        data: componentData
      })}
    </InterfaceErrorBoundary>
  );
};