import { z } from 'zod';
import { register } from '../../registry';
import {
  type TimelineData,
  type TimelineEvent,
  type InterfaceProps,
} from '../../types';
import { Prose } from '../prose';

export const TimelineSchema = {
  type: 'object',
  properties: {
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          date: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          type: { type: 'string' },
        },
        required: ['date', 'title', 'description'],
      },
    },
    content: { type: 'string' },
    className: { type: 'string' },
  },
  required: ['events'],
} as const;

export const metadata = {
  type: 'timeline',
  description:
    'Display chronological events in a vertical timeline format with dates, titles, and descriptions',
  schema: TimelineSchema,
  category: 'interface',
  tags: ['chronological', 'events', 'history'],
} as const;

const TimelineValidator = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.string().optional(),
    }),
  ),
  content: z.string().optional(),
  className: z.string().optional(),
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
          <Prose content={content} />
        </div>
      )}

      {events.length > 0 && (
        <div className="space-y-4">
          {events.map((event: TimelineEvent, index: number) => (
            <div
              key={index}
              className="border-primary/30 relative border-l-2 pl-4"
            >
              <div className="bg-primary absolute -left-1.5 top-0 size-3 rounded-full"></div>
              <div className="font-medium">{event.title}</div>
              <div className="text-muted-foreground text-sm">{event.date}</div>
              {event.description && (
                <div className="text-muted-foreground mt-1 text-sm">
                  {event.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Register with unified registry
register({
  type: 'timeline',
  schema: TimelineValidator,
  render: Timeline,
});
