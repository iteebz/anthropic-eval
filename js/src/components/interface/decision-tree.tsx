import React, { useState } from 'react';
import { z } from 'zod';
import { registerComponent } from '../../registry/unified';

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
  className: z.string().optional()
});

type DecisionTreeData = z.infer<typeof DecisionTreeSchema>;

export function DecisionTree(props: DecisionTreeData) {
  const { nodes, rootNodeId, title, className } = props;
  const [currentNodeId, setCurrentNodeId] = useState(rootNodeId);
  
  const currentNode = nodes.find(node => node.id === currentNodeId);
  
  if (!currentNode) {
    return <div className={className}>Node not found: {currentNodeId}</div>;
  }

  return (
    <div className={className}>
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="border rounded-lg p-6 bg-blue-50">
        <h3 className="text-lg font-semibold mb-2">❓ {currentNode.title}</h3>
        <p className="mb-4">{currentNode.content}</p>
        
        {currentNode.options && currentNode.options.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Choose an option:</div>
            {currentNode.options.map(option => (
              <button
                key={option.id}
                onClick={() => option.nextNodeId && setCurrentNodeId(option.nextNodeId)}
                className="w-full text-left p-3 border rounded bg-white hover:bg-gray-50"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Register with unified registry
registerComponent({
  type: 'decision-tree',
  schema: DecisionTreeSchema,
  render: DecisionTree
});