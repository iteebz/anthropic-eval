import React, { useState } from 'react';
import { z } from 'zod';
import { ai } from '../../ai';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export const TreeSchema = {
  type: 'object',
  properties: {
    nodes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          content: { type: 'string' },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                label: { type: 'string' },
                nextNodeId: { type: 'string' },
              },
              required: ['id', 'label'],
            },
          },
        },
        required: ['id', 'title', 'content'],
      },
    },
    rootNodeId: { type: 'string' },
    title: { type: 'string' },
    className: { type: 'string' },
    onSendMessage: { type: 'object' },
  },
  required: ['nodes', 'rootNodeId'],
} as const;

export const metadata = {
  type: 'tree',
  description:
    'Interactive decision tree with branching options and MCP callback support',
  schema: TreeSchema,
  category: 'interface',
  tags: ['decision', 'interactive', 'branching'],
} as const;

const TreeValidator = z.object({
  nodes: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
      options: z
        .array(
          z.object({
            id: z.string(),
            label: z.string(),
            nextNodeId: z.string().optional(),
          }),
        )
        .optional(),
    }),
  ),
  rootNodeId: z.string(),
  title: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.any().optional(),
});

type TreeData = z.infer<typeof TreeValidator>;

function TreeComponent(props: TreeData) {
  const { nodes, rootNodeId, title, className, onSendMessage } = props;
  const [currentNodeId, setCurrentNodeId] = useState(rootNodeId);

  const currentNode = nodes.find((node) => node.id === currentNodeId);

  if (!currentNode) {
    return <div className={className}>Node not found: {currentNodeId}</div>;
  }

  return (
    <div className={className}>
      {title && <h2 className="mb-4 text-xl font-bold">{title}</h2>}
      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>❓</span>
            {currentNode.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{currentNode.content}</p>

          {currentNode.options && currentNode.options.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Choose an option:</div>
              {currentNode.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.nextNodeId) {
                      setCurrentNodeId(option.nextNodeId);
                    }
                    onSendMessage?.(
                      JSON.stringify({
                        type: 'decision-tree-selection',
                        nodeId: currentNodeId,
                        optionId: option.id,
                        optionLabel: option.label,
                      }),
                    );
                  }}
                  className="bg-background hover:bg-muted/50 w-full rounded-md border p-3 text-left transition-colors"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// CANONICAL: AI() wrapper with auto-registration
export const Tree = ai(
  'tree',
  'Interactive decision tree with branching options',
  TreeComponent
);
