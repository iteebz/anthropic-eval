import { type TimelineData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface InterfaceProps {
  content: string;
  interfaceData?: TimelineData;
  className?: string;
}

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
          {events.map((event, index) => (
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