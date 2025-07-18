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
        <div className="border rounded bg-gray-50 p-4">
          {data.title && (
            <div className="text-sm font-medium mb-2">{data.title}</div>
          )}
          {data.language && (
            <div className="text-xs text-gray-500 mb-2">{data.language}</div>
          )}
          <pre className="overflow-x-auto">
            <code className="text-sm">{data.code}</code>
          </pre>
          {data.description && (
            <div className="text-sm text-gray-600 mt-2">{data.description}</div>
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