import React from "react";
import type { ErrorInfo } from "react";

interface DebugInfoProps {
  error: Error;
  errorInfo?: ErrorInfo;
  performanceImpact: number;
  retryCount: number;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({
  error,
  errorInfo,
  performanceImpact,
  retryCount,
}) => (
  <div className="border-t border-red-200 p-3 dark:border-red-800">
    <details className="text-xs text-red-600 dark:text-red-400">
      <summary className="mb-2 cursor-pointer font-medium">
        Debug Information
      </summary>
      <div className="space-y-2">
        <div>
          <span className="font-medium">Error:</span> {error.message}
        </div>
        <div>
          <span className="font-medium">Performance Impact:</span>{" "}
          {performanceImpact}ms
        </div>
        <div>
          <span className="font-medium">Retry Count:</span> {retryCount}
        </div>
        {errorInfo && (
          <div>
            <span className="font-medium">Component Stack:</span>
            <pre className="mt-1 overflow-x-auto rounded bg-red-100 p-2 dark:bg-red-900/50">
              {errorInfo.componentStack}
            </pre>
          </div>
        )}
      </div>
    </details>
  </div>
);
