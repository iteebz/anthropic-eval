import { type ExpandableSectionData, type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export function ExpandableSection({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as ExpandableSectionData;
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
              <div className="border rounded-lg">
                <CollapsibleTrigger className="w-full p-3 text-left border-b">
                  <div className="font-medium">{section.title}</div>
                </CollapsibleTrigger>
                <CollapsibleContent>
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