import { z } from 'zod';
import { register } from '../../registry';
import { Prose } from '../prose';

export const CodeSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    description: { type: 'string' },
    language: { type: 'string' },
    code: { type: 'string' },
    caption: { type: 'string' },
    content: { type: 'string' },
    className: { type: 'string' },
  },
  required: ['language', 'code'],
} as const;

export const metadata = {
  type: 'code',
  description:
    'Syntax-highlighted code snippets with optional titles and descriptions',
  schema: CodeSchema,
  category: 'interface',
  tags: ['code', 'syntax', 'snippet'],
} as const;

const CodeValidator = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
  content: z.string().optional(),
  className: z.string().optional(),
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
        <div className="bg-muted/30 rounded-lg border p-4">
          {title && <div className="mb-2 text-sm font-medium">{title}</div>}
          {language && (
            <div className="text-muted-foreground mb-2 text-xs uppercase tracking-wide">
              {language}
            </div>
          )}
          <pre className="bg-background/50 overflow-x-auto rounded border p-3">
            <code className="font-mono text-sm">{code}</code>
          </pre>
          {description && (
            <div className="text-muted-foreground mt-2 text-sm">
              {description}
            </div>
          )}
          {caption && (
            <div className="text-muted-foreground mt-2 text-xs">{caption}</div>
          )}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
register({
  type: 'code',
  schema: CodeValidator,
  render: Code,
});
