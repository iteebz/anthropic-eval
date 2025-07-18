import { useState, useEffect, useCallback } from "react";
import {
  useAgentResponseParser,
  type InterfaceConfig,
} from "./useAgentResponseParser";
import type { Logger } from "../types";

export interface UseInterfaceConfigOptions {
  enablePerformanceMonitoring?: boolean;
  logger?: Logger;
}

export const useInterfaceConfig = (
  agentResponse: string,
  options: UseInterfaceConfigOptions = {},
) => {
  const [interfaceConfig, setInterfaceConfig] =
    useState<InterfaceConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  const { parseResponse } = useAgentResponseParser({
    ...options,
    onError: useCallback((err: Error | undefined) => setError(err), []),
  });

  useEffect(() => {
    // DEBUG LOGGING START
    // eslint-disable-next-line no-console
    console.log('[useInterfaceConfig] effect triggered', { agentResponse });
    setIsLoading(true);
    setError(undefined);

    try {
      const config = parseResponse(agentResponse);
      // eslint-disable-next-line no-console
      console.log('[useInterfaceConfig] parseResponse result', { config });
      setInterfaceConfig(config);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[useInterfaceConfig] parseResponse error', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      options.logger?.error("Failed to process agent response", {
        error: {
          details: {
            message: err instanceof Error ? err.message : String(err),
          },
          originalData: err,
        },
        agentResponse,
      });
    } finally {
      setIsLoading(false);
      // eslint-disable-next-line no-console
      console.log('[useInterfaceConfig] effect finished, isLoading set to false');
    }
  }, [agentResponse, parseResponse, options.logger]);

  return {
    interfaceConfig,
    isLoading,
    error,
  };
};
