import { BookOpen, Scale, Building, Eye, Lightbulb } from "lucide-react";

import { type KeyInsightsData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Badge } from "./ui/badge";

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
  // interfaceData should already be validated by the registry
  const data = interfaceData as KeyInsightsData;
  const insights = data?.insights || [];

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 18, className: "text-current" };
    switch (category) {
      case "lesson": {
        return <BookOpen {...iconProps} />;
      }
      case "principle": {
        return <Scale {...iconProps} />;
      }
      case "framework": {
        return <Building {...iconProps} />;
      }
      case "observation": {
        return <Eye {...iconProps} />;
      }
      default: {
        return <Lightbulb {...iconProps} />;
      }
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "lesson": {
        return "bg-gradient-to-r from-amber-600/20 to-yellow-600/20 text-amber-400 border-amber-500/30";
      }
      case "principle": {
        return "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border-blue-500/30";
      }
      case "framework": {
        return "bg-gradient-to-r from-purple-600/20 to-violet-600/20 text-purple-400 border-purple-500/30";
      }
      case "observation": {
        return "bg-gradient-to-r from-green-600/20 to-emerald-600/20 text-green-400 border-green-500/30";
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

      {insights.length > 0 && (
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 p-4 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-600 hover:bg-gradient-to-br hover:from-zinc-800/50 hover:to-zinc-900/50 hover:shadow-lg"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg p-2 ${getCategoryColor(insight.category)}`}
                >
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-zinc-100">
                      {insight.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={`border capitalize ${getCategoryColor(insight.category)}`}
                    >
                      {insight.category}
                    </Badge>
                  </div>
                  <p className="text-sm leading-relaxed text-zinc-300">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
