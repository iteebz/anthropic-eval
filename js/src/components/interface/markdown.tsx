import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const MarkdownSchema = z.object({
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
  schema: MarkdownSchema,
  render: Markdown
});
