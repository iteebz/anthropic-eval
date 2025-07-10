import { useState } from "react";

import { type InlineLinkData } from "../types";
import { MarkdownRenderer } from "./MarkdownRenderer";

export interface InterfaceProps {
  content: string;
  interfaceData?: InlineLinkData;
  className?: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "essay": {
      return "📖";
    }
    case "belief": {
      return "💭";
    }
    case "log": {
      return "📝";
    }
    case "system_doc": {
      return "⚙️";
    }
    default: {
      return "🔗";
    }
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "essay": {
      return "text-blue-400";
    }
    case "belief": {
      return "text-purple-400";
    }
    case "log": {
      return "text-green-400";
    }
    case "system_doc": {
      return "text-orange-400";
    }
    default: {
      return "text-zinc-400";
    }
  }
};

export function InlineLink({
  content,
  interfaceData,
  className,
}: InterfaceProps) {
  const data = interfaceData as InlineLinkData;
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

  // Create lookup map for references
  const refMap: Record<string, (typeof references)[0]> = {};
  for (const ref of references) {
    refMap[ref.id] = ref;
  }

  // Parse content to find reference patterns and replace them
  const parseContentWithReferences = (text: string) => {
    // Match pattern like [Display Text](ref:reference-id)
    const refPattern = /\[([^\]]+)\]\(ref:([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = refPattern.exec(text)) !== null) {
      const [fullMatch, displayText, refId] = match;
      const reference = refMap[refId];

      // Add text before the reference
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index));
      }

      if (reference) {
        parts.push(
          <span key={refId} className="inline-block">
            <button
              onClick={() => toggleExpanded(refId)}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-zinc-800/50 ${getTypeColor(reference.type)} hover:text-white`}
              title={`${reference.type}: ${reference.title}`}
            >
              <span className="text-xs">{getTypeIcon(reference.type)}</span>
              {displayText}
            </button>
            {expandedRefs.has(refId) && (
              <div className="mb-4 mt-2 rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-lg">{getTypeIcon(reference.type)}</span>
                  <h4 className="font-semibold text-zinc-100">
                    {reference.title}
                  </h4>
                  <span
                    className={`rounded-full bg-zinc-700 px-2 py-1 text-xs ${getTypeColor(reference.type)}`}
                  >
                    {reference.type}
                  </span>
                </div>

                <p className="mb-3 text-sm italic text-zinc-400">
                  {reference.excerpt}
                </p>

                <div className="text-zinc-300">
                  <MarkdownRenderer content={reference.content} />
                </div>

                {reference.url && (
                  <div className="mt-3 border-t border-zinc-700 pt-3">
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 hover:underline"
                    >
                      View full source →
                    </a>
                  </div>
                )}
              </div>
            )}
          </span>,
        );
      } else {
        // If reference not found, just show the display text
        parts.push(displayText);
      }

      lastIndex = match.index + fullMatch.length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  return (
    <div className={className}>
      <div className="prose prose-invert max-w-none">
        {parseContentWithReferences(content).map((part, index) =>
          typeof part === "string" ? (
            <MarkdownRenderer key={index} content={part} />
          ) : (
            part
          ),
        )}
      </div>
    </div>
  );
}
