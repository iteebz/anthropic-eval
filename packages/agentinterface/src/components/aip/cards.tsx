import React from 'react';
import { z } from 'zod';
import { register } from '../../registry';
import { Prose } from '../prose';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';

export const CardsSchema = {
  type: 'object',
  properties: {
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          tags: {
            type: 'array',
            items: { type: 'string' },
          },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string' },
                url: { type: 'string' },
                type: { type: 'string', enum: ['action', 'external'] },
              },
              required: ['label'],
            },
          },
        },
        required: ['title', 'description'],
      },
    },
    content: { type: 'string' },
    className: { type: 'string' },
    onSendMessage: { type: 'object' },
  },
  required: ['cards'],
} as const;

export const metadata = {
  type: 'cards',
  description: 'Interactive card grid with actions and MCP callback support',
  schema: CardsSchema,
  category: 'interface',
  tags: ['cards', 'interactive', 'grid'],
} as const;

const CardSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()).optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().optional(),
        type: z.enum(['action', 'external']).optional(),
      }),
    )
    .optional(),
});

const CardsValidator = z.object({
  cards: z.array(CardSchema),
  content: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.any().optional(),
});

type CardsData = z.infer<typeof CardsValidator>;

export function Cards(props: CardsData) {
  const { cards = [], content, className, onSendMessage } = props;

  return (
    <div className={className}>
      {content && <Prose content={content} className="mb-4" />}
      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                {card.description}
              </p>
              {card.tags && (
                <div className="flex flex-wrap gap-1">
                  {card.tags.map((tag, j) => (
                    <Badge key={j} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
              {card.links && (
                <div className="flex gap-2">
                  {card.links.map((link, k) => (
                    <button
                      key={k}
                      onClick={() => {
                        if (link.type === 'action' && onSendMessage) {
                          onSendMessage(
                            JSON.stringify({
                              type: 'card-action',
                              cardTitle: card.title,
                              actionLabel: link.label,
                            }),
                          );
                        } else if (link.url) {
                          window.open(
                            link.url,
                            '_blank',
                            'noopener noreferrer',
                          );
                        }
                      }}
                      className="text-primary hover:text-primary/80 text-sm underline-offset-4 hover:underline"
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
register({
  type: 'cards',
  schema: CardsValidator,
  render: Cards,
});
