import React from 'react';

export interface MarkdownRendererProps {
  content: string;
  className?: string;
  options?: any;
  onSendMessage?: (message: string) => void;
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div 
      className={`aip-markdown ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}