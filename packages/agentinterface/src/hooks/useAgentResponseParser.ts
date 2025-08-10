import { useCallback } from 'react';
import {
  validateInterfaceData,
  isValidInterfaceType,
} from '../core/validation';
import { type InterfaceType, type InterfaceData } from '../types';
import { parseAgentResponse } from '../utils/parsing';
import type { Logger } from '../types';

export interface InterfaceConfig {
  type: InterfaceType;
  data?: InterfaceData;
  content: string;
}

export interface UseAgentResponseParserOptions {
  enablePerformanceMonitoring?: boolean;
  logger?: Logger;
  onError?: (error: Error | undefined) => void;
}

export const useAgentResponseParser = ({
  enablePerformanceMonitoring = false,
  logger,
  onError,
}: UseAgentResponseParserOptions = {}) => {
  const parseResponse = useCallback(
    (response: string): InterfaceConfig => {
      const performanceStart = enablePerformanceMonitoring
        ? performance.now()
        : 0;

      try {
        const parsed = parseAgentResponse(response);
        const interfaceType = parsed.interface_type;
        const content = parsed.raw_content;

        // Validate interface type
        if (!isValidInterfaceType(interfaceType)) {
          logger?.warn(
            `Unknown interface type: ${interfaceType}, falling back to markdown`,
          );
          return {
            type: 'markdown',
            data: {},
            content,
          };
        }

        // Validate interface data if provided
        let validatedData: InterfaceData | undefined;
        if (parsed.interface_data && interfaceType !== 'markdown') {
          const validation = validateInterfaceData(
            interfaceType,
            parsed.interface_data,
          );
          validatedData = validation.data as InterfaceData;

          if (!validation.success) {
            logger?.warn(
              `Interface data validation failed: ${validation.error}`,
            );
          }
        }

        const config: InterfaceConfig = {
          type: interfaceType as InterfaceType,
          data: validatedData,
          content,
        };

        if (enablePerformanceMonitoring) {
          const parseTime = performance.now() - performanceStart;
          logger?.debug(`Agent response parsed in ${parseTime.toFixed(2)}ms`, {
            interfaceType,
            parseTime,
            hasData: !!validatedData,
            contentLength: content.length,
          });
        }

        return config;
      } catch (err) {
        const error = err instanceof Error ? err.message : String(err);
        logger?.error(`Failed to parse agent response: ${error}`, {
          error: {
            details: { message: error },
            originalData: err,
          },
        });
        onError?.(err instanceof Error ? err : new Error(String(err)));

        // Fallback to markdown with raw content
        return {
          type: 'markdown',
          data: {},
          content: response,
        };
      }
    },
    [enablePerformanceMonitoring, logger, onError],
  );

  return { parseResponse };
};
