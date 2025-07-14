import { MarkdownRenderer } from "../render/MarkdownRenderer";

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
