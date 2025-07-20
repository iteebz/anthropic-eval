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
      <pre className="text-xs bg-gray-100 p-2 rounded mt-2">
        {error.stack}
        <br />
        Agent Response: {agentResponse}
      </pre>
    )}
  </div>
);
