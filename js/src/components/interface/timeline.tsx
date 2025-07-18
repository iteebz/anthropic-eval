import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { type TimelineData, type TimelineEvent, type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const TimelineSchema = z.object({
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.string().optional()
  })),
  content: z.string().optional(),
  className: z.string().optional()
});

export function Timeline({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as TimelineData;
  const events = data?.events || [];

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-4">
          {events.map((event: TimelineEvent, index: number) => (
            <div key={index} className="border-l-2 border-gray-300 pl-4">
              <div className="font-medium">{event.title}</div>
              <div className="text-sm text-gray-600">{event.date}</div>
              {event.description && (
                <div className="text-sm mt-1">{event.description}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'timeline',
  schema: TimelineSchema,
  render: (props) => <Timeline events={props.events} content={props.content} className={props.className} />
});