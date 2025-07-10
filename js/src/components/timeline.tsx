import { Rocket, Target, Brain, RefreshCw, Calendar } from "lucide-react";

import { type TimelineData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Badge } from "./ui/badge";

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
  // interfaceData should already be validated by the registry
  const data = interfaceData as TimelineData;
  const events = data?.events || [];

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 16, className: "text-current" };
    switch (type) {
      case "project": {
        return <Rocket {...iconProps} />;
      }
      case "milestone": {
        return <Target {...iconProps} />;
      }
      case "learning": {
        return <Brain {...iconProps} />;
      }
      case "pivot": {
        return <RefreshCw {...iconProps} />;
      }
      default: {
        return <Calendar {...iconProps} />;
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "project": {
        return "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30";
      }
      case "milestone": {
        return "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border-green-500/30";
      }
      case "learning": {
        return "bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-400 border-purple-500/30";
      }
      case "pivot": {
        return "bg-gradient-to-r from-orange-600/20 to-amber-600/20 text-orange-400 border-orange-500/30";
      }
      default: {
        return "bg-gradient-to-r from-zinc-600/20 to-slate-600/20 text-zinc-400 border-zinc-500/30";
      }
    }
  };

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {events.length > 0 && (
        <div className="relative">
          <div className="absolute inset-y-0 left-6 w-px bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800" />

          <div className="space-y-4">
            {events.map((event, index) => (
              <div key={index} className="relative flex items-start gap-4">
                <div
                  className={`relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${getTypeColor(event.type)}`}
                >
                  {getTypeIcon(event.type)}
                </div>

                <div className="flex-1 rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 p-4 transition-all duration-300 hover:border-zinc-600 hover:bg-gradient-to-br hover:from-zinc-800/50 hover:to-zinc-900/50 hover:shadow-lg">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-mono text-sm text-zinc-400">
                      {event.date}
                    </span>
                    <Badge
                      variant="secondary"
                      className={`border capitalize ${getTypeColor(event.type)}`}
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-100">
                    {event.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
