/**
 * Syntax highlighted code display.
 */
import React from 'react';

export interface CodeProps {
  language?: string;
  code?: string;
  title?: string;
  className?: string;
}

function CodeComponent({ language = '', code = '', title, className }: CodeProps) {
  return (
    <div className={className}>
      {title && <div className="text-sm font-medium mb-2">{title}</div>}
      <div className="border rounded p-4">
        <div className="text-xs text-gray-500 mb-2 uppercase">{language}</div>
        <pre className="overflow-x-auto">
          <code className="text-sm">{code}</code>
        </pre>
      </div>
    </div>
  );
}

export const Code = CodeComponent;

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'code',
  description: 'Code blocks with syntax highlighting',
  schema: {
    type: 'object',
    properties: {
      language: { type: 'string' },
      code: { type: 'string' },
      title: { type: 'string', optional: true },
      className: { type: 'string', optional: true }
    },
    required: ['language', 'code']
  },
  category: 'content'
};