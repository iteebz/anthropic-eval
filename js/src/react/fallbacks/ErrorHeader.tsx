import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorHeaderProps {
  interfaceType: string;
  retryCount: number;
  recoveryMessage: string;
  onRetry?: () => void;
}

export const ErrorHeader: React.FC<ErrorHeaderProps> = ({
  interfaceType,
  retryCount,
  recoveryMessage,
  onRetry,
}) => (
  <div className="flex items-center justify-between border-b border-red-200 p-3 dark:border-red-800">
    <div className="flex items-center gap-2">
      <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
      <div>
        <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
          {interfaceType
            .replace("_", " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
          Error
        </h3>
        <p className="text-xs text-red-600 dark:text-red-400">
          {recoveryMessage}
        </p>
      </div>
    </div>

    {retryCount < 3 && onRetry && (
      <button
        onClick={onRetry}
        className="flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
      >
        <RefreshCw className="size-3" />
        Retry ({3 - retryCount} left)
      </button>
    )}
  </div>
);
