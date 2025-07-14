import React from 'react';

interface LoadingStateProps {
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ className }) => (
  <div className={`text-gray-500 ${className}`}>Loading...</div>
);
