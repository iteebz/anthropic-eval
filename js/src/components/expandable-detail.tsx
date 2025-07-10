import { type ExpandableDetailData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export interface InterfaceProps {
  content: string;
  interfaceData?: ExpandableDetailData;
  className?: string;
}

export function ExpandableDetail({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  // interface_data should already be validated by the registry
  const data = interfaceData as ExpandableDetailData;
  const sections = data?.sections || [];

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-2">
          {sections.map((section, index) => (
            <Collapsible key={index} defaultOpen={section.defaultExpanded}>
              <div className="rounded-lg border border-zinc-700 bg-zinc-800/30">
                <CollapsibleTrigger className="flex w-full items-center justify-between p-3 text-left transition-colors hover:bg-zinc-800/50 [&[data-state=open]>span:last-child]:rotate-90">
                  <span className="font-medium text-zinc-100">
                    {section.title}
                  </span>
                  <span className="text-zinc-400 transition-transform duration-200">
                    ▶
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent className="border-t border-zinc-700">
                  <div className="p-3">
                    <MarkdownRenderer content={section.content} />
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
