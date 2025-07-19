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
          <div className="text-sm font-medium">References:</div>
          {references.map((reference) => (
            <div key={reference.id}>
              <button
                onClick={() => toggleExpanded(reference.id)}
                className="text-primary hover:text-primary/80 text-sm underline-offset-4 hover:underline"
              >
                {reference.title}
              </button>
              
              {expandedRefs.has(reference.id) && (
                <div className="mt-2 ml-4 p-3 border-l-2 border-primary/30 bg-muted/30 rounded-r">
                  <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">{reference.type}</div>
                  <div className="text-sm text-muted-foreground mb-2">{reference.excerpt}</div>
                  <MarkdownRenderer content={reference.content} />
                  {reference.url && (
                    <a
                      href={reference.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 text-xs block mt-2 underline-offset-4 hover:underline"
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