import React from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { MarkdownRenderer } from "../render/MarkdownRenderer";
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

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
  onSendMessage: z.any().optional()
});

type CardGridData = z.infer<typeof CardGridSchema>;

export function CardGrid(props: CardGridData) {
  const { cards = [], content, className, onSendMessage } = props;

  return (
    <div className={className}>
      {content && <MarkdownRenderer content={content} className="mb-4" />}
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{card.description}</p>
              {card.tags && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, j) => (
                    <Badge key={j} variant="secondary">{tag}</Badge>
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
                          onSendMessage(JSON.stringify({
                            type: 'card-action',
                            cardTitle: card.title,
                            actionLabel: link.label
                          }));
                        } else if (link.url) {
                          window.open(link.url, "_blank", "noopener noreferrer");
                        }
                      }}
                      className="text-sm text-primary hover:text-primary/80 underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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