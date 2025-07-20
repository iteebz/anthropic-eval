import React, { useState } from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const DecisionTreeSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    title: z.string(),
    content: z.string(),
    options: z.array(z.object({
      id: z.string(),
      label: z.string(),
      nextNodeId: z.string().optional()
    })).optional()
  })),
  rootNodeId: z.string(),
  title: z.string().optional(),
  className: z.string().optional(),
  onSendMessage: z.any().optional()
});

type DecisionTreeData = z.infer<typeof DecisionTreeSchema>;

export function DecisionTree(props: DecisionTreeData) {
  const { nodes, rootNodeId, title, className, onSendMessage } = props;
  const [currentNodeId, setCurrentNodeId] = useState(rootNodeId);
  
  const currentNode = nodes.find(node => node.id === currentNodeId);
  
  if (!currentNode) {
    return <div className={className}>Node not found: {currentNodeId}</div>;
  }

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
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
              {currentNode.options.map(option => (
                <button
                  key={option.id}
                  onClick={() => {
                    if (option.nextNodeId) {
                      setCurrentNodeId(option.nextNodeId);
                    }
                    onSendMessage?.(JSON.stringify({
                      type: 'decision-tree-selection',
                      nodeId: currentNodeId,
                      optionId: option.id,
                      optionLabel: option.label
                    }));
                  }}
                  className="w-full text-left p-3 border rounded-md bg-background hover:bg-muted/50 transition-colors"
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

// Register with unified registry
registerComponent({
  type: 'decision-tree',
  schema: DecisionTreeSchema,
  render: DecisionTree
});