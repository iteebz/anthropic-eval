import React from 'react';

interface ComponentNotFoundProps {
  interfaceType: string;
  content: string;
  className?: string;
}

export const ComponentNotFound: React.FC<ComponentNotFoundProps> = ({
  interfaceType,
  content,
  className,
}) => (
  <div className={`text-red-500 ${className}`}>
    <p>Error: Component for type "{interfaceType}" not found.</p>
    <p className="text-sm text-gray-600">Content: {content}</p>
  </div>
);
