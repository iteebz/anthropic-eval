import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { type CodeSnippetData } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const CodeSnippetSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
  content: z.string().optional(),
  className: z.string().optional()
});

export interface InterfaceProps {
  content: string;
  interfaceData?: CodeSnippetData;
  className?: string;
}

export function CodeSnippet({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as CodeSnippetData;

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {data?.code && (
        <div className="border rounded-lg bg-muted/30 p-4">
          {data.title && (
            <div className="text-sm font-medium mb-2">{data.title}</div>
          )}
          {data.language && (
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{data.language}</div>
          )}
          <pre className="overflow-x-auto bg-background/50 rounded p-3 border">
            <code className="text-sm font-mono">{data.code}</code>
          </pre>
          {data.description && (
            <div className="text-sm text-muted-foreground mt-2">{data.description}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'code-snippet',
  schema: CodeSnippetSchema,
  render: (props) => <CodeSnippet title={props.title} description={props.description} language={props.language} code={props.code} content={props.content} className={props.className} />
});