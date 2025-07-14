import React from 'react';

interface EmptyStateProps {
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ className }) => (
  <div className={`text-gray-500 ${className}`}>No content to display.</div>
);
