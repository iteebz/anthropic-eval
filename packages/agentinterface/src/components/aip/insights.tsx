import { z } from 'zod';
import { register } from '../../registry';
import { Prose } from '../prose';

export const InsightsSchema = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
        },
        required: ['title', 'description'],
      },
    },
    content: { type: 'string' },
    className: { type: 'string' },
  },
  required: ['insights'],
} as const;

export const metadata = {
  type: 'insights',
  description:
    'Highlight key insights and important information with categorized callouts',
  schema: InsightsSchema,
  category: 'interface',
  tags: ['highlights', 'callouts', 'important'],
} as const;

const InsightsValidator = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string().optional(),
    }),
  ),
  content: z.string().optional(),
  className: z.string().optional(),
});

type InsightsData = z.infer<typeof InsightsValidator>;

export function Insights({ insights, content, className }: InsightsData) {
  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <Prose content={content} />
        </div>
      )}

      {insights && insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="border-primary/30 bg-muted/20 rounded-r border-l-4 py-2 pl-4"
            >
              <div className="mb-1 font-medium">{insight.title}</div>
              {insight.category && (
                <div className="text-muted-foreground mb-1 text-xs">
                  {insight.category}
                </div>
              )}
              <div className="text-muted-foreground text-sm">
                {insight.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
register({
  type: 'insights',
  schema: InsightsValidator,
  render: Insights,
});
