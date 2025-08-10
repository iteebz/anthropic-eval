import React from 'react';

export interface ProseProps {
  content: string;
  className?: string;
  options?: any;
  onSendMessage?: (message: string) => void;
}

export function Prose({ content, className = '' }: ProseProps) {
  return (
    <div
      className={`aip-markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
