/**
 * Hierarchical tree data display.
 */
import React, { useState } from 'react';

export interface TreeOption {
  id: string;
  label: string;
  nextNodeId?: string;
}

export interface TreeNode {
  id: string;
  title: string;
  content: string;
  options?: TreeOption[];
}

export interface TreeProps {
  nodes: TreeNode[];
  rootNodeId: string;
  title?: string;
  className?: string;
  onSendMessage?: (message: string) => void;
}

function TreeComponent({
  nodes,
  rootNodeId,
  title,
  className,
  onSendMessage,
}: TreeProps) {
  const [currentNodeId, setCurrentNodeId] = useState(rootNodeId);

  const currentNode = nodes.find((node) => node.id === currentNodeId);

  if (!currentNode) {
    return (
      <div className={className}>
        <div className="text-red-600">Error: Node not found</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {title && <h3 className="text-lg font-bold mb-4">{title}</h3>}
      
      <div className="border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-4">
          <span>❓</span>
          <h4 className="font-medium">{currentNode.title}</h4>
        </div>
        
        <p className="text-gray-600 mb-4">{currentNode.content}</p>

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
                className="w-full border rounded p-3 text-left hover:bg-gray-50 transition-colors"
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

export const Tree = TreeComponent;

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'tree',
  description: 'Interactive decision tree or flow',
  schema: {
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
                  nextNodeId: { type: 'string', optional: true }
                },
                required: ['id', 'label']
              },
              optional: true
            }
          },
          required: ['id', 'title', 'content']
        }
      },
      rootNodeId: { type: 'string' },
      title: { type: 'string', optional: true },
      className: { type: 'string', optional: true }
    },
    required: ['nodes', 'rootNodeId']
  },
  category: 'interactive'
};