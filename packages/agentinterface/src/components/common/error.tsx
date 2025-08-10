import React from 'react';

interface ErrorStateProps {
  error: Error;
  agentResponse: string;
  showErrorDetails?: boolean;
  className?: string;
}

export const Error: React.FC<ErrorStateProps> = ({
  error,
  agentResponse,
  showErrorDetails,
  className,
}) => (
  <div className={`text-red-500 ${className}`}>
    <p>Error: {error.message}</p>
    {showErrorDetails && (
      <pre className="mt-2 rounded bg-gray-100 p-2 text-xs">
        {error.stack}
        <br />
        Agent Response: {agentResponse}
      </pre>
    )}
  </div>
);
