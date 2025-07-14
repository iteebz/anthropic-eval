import { type CodeSnippetData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

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