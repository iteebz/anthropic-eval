/**
 * Chronological event timeline.
 */
import React from 'react';

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineProps {
  events?: TimelineEvent[];
  className?: string;
}

function TimelineComponent({ events = [], className }: TimelineProps) {
  return (
    <div className={className}>
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={index} className="border-l-2 border-gray-300 pl-4 relative">
            <div className="absolute -left-1.5 top-0 w-3 h-3 bg-blue-500 rounded-full"></div>
            <div className="font-medium">{event.title}</div>
            <div className="text-sm text-gray-500">{event.date}</div>
            <div className="text-sm text-gray-600 mt-1">{event.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export const Timeline = TimelineComponent;

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'timeline',
  description: 'Sequential events display with dates',
  schema: {
    type: 'object',
    properties: {
      events: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' }
          },
          required: ['date', 'title', 'description']
        }
      },
      className: { type: 'string', optional: true }
    },
    required: ['events']
  },
  category: 'data'
};