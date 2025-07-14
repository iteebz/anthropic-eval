import { useState, useEffect } from "react";
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
    onError: setError,
  });

  useEffect(() => {
    setIsLoading(true);
    setError(undefined);

    try {
      const config = parseResponse(agentResponse);
      setInterfaceConfig(config);
    } catch (err) {
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
    }
  }, [agentResponse, parseResponse, options.logger]);

  return {
    interfaceConfig,
    isLoading,
    error,
  };
};
