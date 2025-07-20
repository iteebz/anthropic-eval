/**
 * Timeline Component - Chronological events with rich details
 */

import React from 'react';

// JSON Schema definition - directly serializable
export const TimelineSchema = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["date", "title"]
      }
    }
  },
  required: ["events"]
} as const;

// Component metadata - co-located with component
export const TimelineMetadata = {
  type: "timeline",
  description: "Chronological events with rich details",
  schema: TimelineSchema,
  category: "interface",
  tags: ["chronological", "events", "history"]
} as const;

// TypeScript type inference from schema
type TimelineProps = {
  events: Array<{
    date: string;
    title: string;
    description?: string;
  }>;
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="timeline">
      {events.map((event, index) => (
        <div key={index} className="timeline-event">
          <time className="timeline-date">{event.date}</time>
          <div className="timeline-content">
            <h3 className="timeline-title">{event.title}</h3>
            {event.description && (
              <p className="timeline-description">{event.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}