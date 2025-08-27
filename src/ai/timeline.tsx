import React from 'react';

export interface TimelineEvent {
  date: string;
  title: string;
  description: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

function TimelineComponent({ events, className }: TimelineProps) {
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