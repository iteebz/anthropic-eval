/**
 * Markdown Component - Rich text with formatting
 */

import React from 'react';

// JSON Schema definition
export const MarkdownSchema = {
  type: "object",
  properties: {
    content: { type: "string" }
  },
  required: ["content"]
} as const;

// Component metadata
export const MarkdownMetadata = {
  type: "markdown",
  description: "Rich text with formatting and syntax highlighting",
  schema: MarkdownSchema,
  category: "core",
  tags: ["text", "content", "default"]
} as const;

// TypeScript type from schema
type MarkdownProps = {
  content: string;
};

export function Markdown({ content }: MarkdownProps) {
  return (
    <div className="markdown">
      {/* In practice, would use a markdown parser like react-markdown */}
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}