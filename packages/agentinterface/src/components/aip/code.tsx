import { z } from 'zod';
import { registerComponent } from '../../registry';
import { type CodeSnippetData } from "../../types";
import { Prose } from "../prose";

export const CodeSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    language: { type: "string" },
    code: { type: "string" },
    caption: { type: "string" },
    content: { type: "string" },
    className: { type: "string" }
  },
  required: ["language", "code"]
} as const;

export const metadata = {
  type: "code",
  description: "Syntax-highlighted code snippets with optional titles and descriptions",
  schema: CodeSchema,
  category: "interface",
  tags: ["code", "syntax", "snippet"]
} as const;

const CodeValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
  content: z.string().optional(),
  className: z.string().optional()
});

type CodeData = z.infer<typeof CodeValidator>;

export function Code({
  title,
  description,
  language,
  code,
  caption,
  content,
  className,
}: CodeData) {

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <Prose content={content} />
        </div>
      )}

      {code && (
        <div className="border rounded-lg bg-muted/30 p-4">
          {title && (
            <div className="text-sm font-medium mb-2">{title}</div>
          )}
          {language && (
            <div className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">{language}</div>
          )}
          <pre className="overflow-x-auto bg-background/50 rounded p-3 border">
            <code className="text-sm font-mono">{code}</code>
          </pre>
          {description && (
            <div className="text-sm text-muted-foreground mt-2">{description}</div>
          )}
          {caption && (
            <div className="text-xs text-muted-foreground mt-2">{caption}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'code',
  schema: CodeValidator,
  render: Code
});