import React, { useState } from "react";
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const InlineReferenceSchema = z.object({
  references: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    excerpt: z.string(),
    content: z.string(),
    url: z.string().optional()
  })),
  content: z.string().optional(),
  className: z.string().optional()
});

type InlineReferenceData = z.infer<typeof InlineReferenceSchema>;

export function InlineReference(props: InlineReferenceData) {
  const { references = [], content, className } = props;
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
      {content && <MarkdownRenderer content={content} className="mb-4" />}
      
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
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-xs block mt-2"
                    >
                      View source →
                    </a>
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

// Register with unified registry
registerComponent({
  type: 'inline-reference',
  schema: InlineReferenceSchema,
  render: InlineReference
});