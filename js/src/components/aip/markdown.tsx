import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export const MarkdownSchema = {
  type: "object",
  properties: {
    content: { type: "string" },
    className: { type: "string" },
    onSendMessage: { type: "object" }
  },
  required: ["content"]
} as const;

export const metadata = {
  type: "markdown",
  description: "Render markdown content with support for interactive elements and agent callbacks",
  schema: MarkdownSchema,
  category: "interface",
  tags: ["text", "formatting", "content"]
} as const;

const MarkdownValidator = z.object({
  content: z.string(),
  className: z.string().optional(),
  onSendMessage: z.any().optional()
});

export interface InterfaceProps {
  content: string;
  className?: string;
  onSendMessage?: (message: string) => void;
}

export function Markdown({
  content,
  className,
  onSendMessage,
}: InterfaceProps) {
  return (
    <MarkdownRenderer
      content={content}
      className={className}
      onSendMessage={onSendMessage}
    />
  );
}

// Register with unified registry
registerComponent({
  type: 'markdown',
  schema: MarkdownValidator,
  render: Markdown
});