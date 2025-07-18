import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { KeyInsightsDataSchema } from '../../core/schemas';
import { type KeyInsightsData } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const KeyInsightsSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional()
  })),
  content: z.string().optional(),
  className: z.string().optional()
});

export interface InterfaceProps {
  content: string;
  interfaceData?: KeyInsightsData;
  className?: string;
}

export function KeyInsights({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as KeyInsightsData;
  const insights = data?.insights || [];

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
              <div className="font-medium mb-1">{insight.title}</div>
              {insight.category && (
                <div className="text-xs text-gray-500 mb-1">{insight.category}</div>
              )}
              <div className="text-sm text-gray-600">{insight.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'key-insights',
  schema: KeyInsightsSchema,
  render: (props) => <KeyInsights insights={props.insights} content={props.content} className={props.className} />
});