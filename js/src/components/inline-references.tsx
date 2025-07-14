import { useState } from "react";
import { type InlineReferencesData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface InterfaceProps {
  content: string;
  interfaceData?: InlineReferencesData;
  className?: string;
}

export function InlineReferences({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as InlineReferencesData;
  const references = data?.references || [];
  const [expandedRefs, setExpandedRefs] = useState<Set<string>>(new Set());

  const toggleExpanded = (refId: string) => {
    setExpandedRefs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(refId)) {
        newSet.delete(refId);
      } else {
        newSet.add(refId);
      }
      return newSet;
    });
  };

  return (
    <div className={className}>
      <div className="mb-4">
        <MarkdownRenderer content={content} />
      </div>

      {references.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">References:</div>
          {references.map((reference) => (
            <div key={reference.id}>
              <button
                onClick={() => toggleExpanded(reference.id)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                {reference.title}
              </button>
              
              {expandedRefs.has(reference.id) && (
                <div className="mt-2 ml-4 p-3 border-l-2 border-blue-200 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-1">{reference.type}</div>
                  <div className="text-sm text-gray-600 mb-2">{reference.excerpt}</div>
                  <MarkdownRenderer content={reference.content} />
                  {reference.url && (
                    <div className="mt-2">
                      <a
                        href={reference.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-xs"
                      >
                        View source →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}