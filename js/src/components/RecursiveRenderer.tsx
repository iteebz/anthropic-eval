import React from 'react';
// import { useAIP } from '../registry/magic';
import { type InterfaceType } from '../types';
// import { createRecursiveProps } from '../utils/componentProps';
import { RecursiveComponentParser, InterfaceComponent, ParserOptions } from '../parser/recursive';

export interface RecursiveRendererProps {
  content: any;
  depth?: number;
  maxDepth?: number;
  onSendMessage?: (message: string) => void;
  className?: string;
  parserOptions?: ParserOptions;
  slots?: Record<string, any>;
}

export const RecursiveRenderer: React.FC<RecursiveRendererProps> = ({
  content,
  depth = 0,
  maxDepth = 10,
  onSendMessage,
  className,
  parserOptions,
  slots
}) => {
  // Simple stub implementation
  return (
    <div className={className}>
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  );
};