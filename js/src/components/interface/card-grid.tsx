import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { MarkdownRenderer } from "../render/MarkdownRenderer";

const CardSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string().optional(),
    type: z.enum(['action', 'external']).optional()
  })).optional()
});

const CardGridSchema = z.object({
  cards: z.array(CardSchema),
  content: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.function().optional()
});

type CardGridData = z.infer<typeof CardGridSchema>;

export function CardGrid(props: CardGridData) {
  const { cards = [], content, className, onSendMessage } = props;

  return (
    <div className={className}>
      {content && <MarkdownRenderer content={content} className="mb-4" />}
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <div key={i} className="border rounded-lg p-4">
            <h3 className="font-medium mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600 mb-3">{card.description}</p>
            {card.tags && (
              <div className="flex flex-wrap gap-1 mb-3">
                {card.tags.map((tag, j) => (
                  <span key={j} className="text-xs bg-gray-100 px-2 py-1 rounded">{tag}</span>
                ))}
              </div>
            )}
            {card.links && (
              <div className="flex gap-2">
                {card.links.map((link, k) => (
                  <button
                    key={k}
                    onClick={() => {
                      if (link.type === "action" && onSendMessage) {
                        onSendMessage(`Tell me more about ${card.title}`);
                      } else if (link.url) {
                        window.open(link.url, "_blank", "noopener noreferrer");
                      }
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'card-grid',
  schema: CardGridSchema,
  render: CardGrid
});