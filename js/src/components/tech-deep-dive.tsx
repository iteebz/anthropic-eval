import { Lightbulb, ChevronRight } from "lucide-react";

import { type TechDeepDiveData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Badge } from "./ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export interface InterfaceProps {
  content: string;
  interfaceData?: TechDeepDiveData;
  className?: string;
}

export function TechDeepDive({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  // interface_data should already be validated by the registry
  const data = interfaceData as TechDeepDiveData;
  const sections = data?.sections || [];

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {data?.title && (
        <div className="mb-4 rounded-lg border border-blue-700/50 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 p-4 shadow-lg">
          <h2 className="mb-2 text-xl font-bold text-blue-100">{data.title}</h2>
          {data.overview && (
            <p className="text-sm leading-relaxed text-blue-200/80">
              {data.overview}
            </p>
          )}
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-3">
          {sections.map((section, index) => (
            <Collapsible key={index} defaultOpen={index === 0}>
              <div className="rounded-lg border border-zinc-700 bg-gradient-to-br from-zinc-800/30 to-zinc-900/30 shadow-lg transition-all duration-300 hover:shadow-xl">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-all duration-300 hover:bg-gradient-to-br hover:from-zinc-800/50 hover:to-zinc-900/50 [&[data-state=open]>span:last-child]:rotate-90">
                  <span className="font-medium text-zinc-100">
                    {section.title}
                  </span>
                  <ChevronRight className="size-4 text-zinc-400 transition-transform duration-200" />
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t border-zinc-700">
                  <div className="p-4">
                    <MarkdownRenderer content={section.content} />

                    {section.code_example && (
                      <div className="mt-4">
                        <div className="rounded-lg border border-zinc-600 bg-zinc-900/50">
                          <div className="flex items-center gap-2 border-b border-zinc-600 bg-zinc-800 px-4 py-2 text-xs text-zinc-400">
                            <span>Code Example</span>
                            <Badge
                              variant="outline"
                              className="border-zinc-600 text-xs text-zinc-400"
                            >
                              Example
                            </Badge>
                          </div>
                          <pre className="overflow-x-auto p-4">
                            <code className="font-mono text-sm text-zinc-300">
                              {section.code_example}
                            </code>
                          </pre>
                        </div>
                      </div>
                    )}

                    {section.insight && (
                      <div className="mt-4 rounded-lg border border-amber-700/50 bg-gradient-to-br from-amber-900/20 to-yellow-900/20 p-3 shadow-lg">
                        <div className="flex items-start gap-3">
                          <div className="rounded-lg bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-2 text-amber-400">
                            <Lightbulb className="size-4" />
                          </div>
                          <div>
                            <Badge
                              variant="secondary"
                              className="mb-2 border border-amber-600/30 bg-gradient-to-r from-amber-600/20 to-yellow-600/20 text-amber-300"
                            >
                              Key Insight
                            </Badge>
                            <p className="text-sm leading-relaxed text-amber-100/90">
                              {section.insight}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </div>
      )}
    </div>
  );
}
