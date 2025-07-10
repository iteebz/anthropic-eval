export interface ErrorStateProps {
  error: Error | string;
  agentResponse: string;
  showErrorDetails?: boolean;
  className?: string;
}

export const ErrorState = ({
  error,
  agentResponse,
  showErrorDetails = false,
  className = "",
}: ErrorStateProps) => {
  const errorMessage = typeof error === "string" ? error : error.message;
  return (
    <div className={`rounded border border-red-200 bg-red-50 p-4 ${className}`}>
      <h3 className="mb-2 font-medium text-red-800">AgentInterface Error</h3>
      <p className="text-sm text-red-700">{errorMessage}</p>
      {showErrorDetails && (
        <details className="mt-2 text-xs text-red-600">
          <summary className="cursor-pointer">Raw Response</summary>
          <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2">
            {agentResponse}
          </pre>
        </details>
      )}
    </div>
  );
};
