/**
 * AIP Renderer - The one true renderer for Agent Interface Protocol
 * 
 * Registry-driven component rendering with comprehensive error handling
 */

import React, { useCallback } from 'react';
import { render, isRegistered, getRegisteredTypes } from '../registry';
import { InterfaceErrorBoundary, InterfaceErrorContext } from '../core/InterfaceErrorBoundary';
import { useInterfaceConfig } from '../hooks';
import { Loading } from './common/loading';
import { Error } from './common/error';
import { Empty } from './common/empty';
import { NotFound } from './common/not-found';
import type { Logger } from '../types';

export interface AIPRendererProps {
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
 * AIP Renderer - The one true renderer
 * 
 * Parses agent responses and renders components using the unified registry
 */
export const AIPRenderer: React.FC<AIPRendererProps> = ({
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
      logger?.error("AIPRenderer error", {
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
    return <Loading className={className} />;
  }

  if (error) {
    const errorObject = error instanceof Error ? error : new Error(String(error));
    return (
      <Error
        error={errorObject}
        agentResponse={agentResponse}
        showErrorDetails={showErrorDetails}
        className={className}
      />
    );
  }

  if (!interfaceConfig) {
    return <Empty className={className} />;
  }

  // Check if component type is registered
  if (!isRegistered(interfaceConfig.type)) {
    const availableTypes = getRegisteredTypes();
    const errorMessage = availableTypes.length > 0 
      ? `Unknown component '${interfaceConfig.type}'. Available: ${availableTypes.join(', ')}`
      : `Unknown component '${interfaceConfig.type}'. No components registered.`;
    
    logger?.warn(errorMessage);
    return (
      <NotFound
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
      {render({
        type: interfaceConfig.type,
        data: componentData
      })}
    </InterfaceErrorBoundary>
  );
};