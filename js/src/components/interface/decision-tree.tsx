import React, { useState } from 'react';
import { type InterfaceProps } from "../../types";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

export interface DecisionNode {
  id: string;
  title: string;
  content: string;
  type: 'question' | 'outcome' | 'branch' | 'action';
  options?: DecisionOption[];
  metadata?: {
    confidence?: number;
    reasoning?: string;
    tags?: string[];
    weight?: number;
  };
}

export interface DecisionOption {
  id: string;
  label: string;
  description?: string;
  nextNodeId?: string;
  action?: string;
  metadata?: {
    recommended?: boolean;
    risk?: 'low' | 'medium' | 'high';
    effort?: 'low' | 'medium' | 'high';
    impact?: 'low' | 'medium' | 'high';
  };
}

export interface DecisionTreeData {
  nodes: DecisionNode[];
  rootNodeId: string;
  title?: string;
  description?: string;
  showMetadata?: boolean;
  showConfidence?: boolean;
  allowBacktrack?: boolean;
  showProgress?: boolean;
}

export function DecisionTree({
  content,
  interfaceData,
  className,
  onSendMessage,
}: InterfaceProps) {
  const data = interfaceData as DecisionTreeData;
  const { 
    nodes = [], 
    rootNodeId,
    title,
    description,
    showMetadata = false,
    showConfidence = false,
    allowBacktrack = true,
    showProgress = true
  } = data || {};

  const [currentNodeId, setCurrentNodeId] = useState(rootNodeId);
  const [history, setHistory] = useState<string[]>([rootNodeId]);
  const [selectedPath, setSelectedPath] = useState<Array<{ nodeId: string; optionId: string }>>([]);

  const currentNode = nodes.find(node => node.id === currentNodeId);
  const nodesById = nodes.reduce((acc, node) => ({ ...acc, [node.id]: node }), {} as Record<string, DecisionNode>);

  const handleOptionSelect = (option: DecisionOption) => {
    if (option.nextNodeId) {
      setCurrentNodeId(option.nextNodeId);
      setHistory(prev => [...prev, option.nextNodeId!]);
      setSelectedPath(prev => [...prev, { nodeId: currentNodeId, optionId: option.id }]);
    } else if (option.action && onSendMessage) {
      onSendMessage(option.action);
    }
  };

  const handleBacktrack = () => {
    if (history.length > 1) {
      const newHistory = history.slice(0, -1);
      setHistory(newHistory);
      setCurrentNodeId(newHistory[newHistory.length - 1]);
      setSelectedPath(prev => prev.slice(0, -1));
    }
  };

  const getNodeTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return '❓';
      case 'outcome': return '🎯';
      case 'branch': return '🌳';
      case 'action': return '⚡';
      default: return '📝';
    }
  };

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'question': return 'bg-blue-50 border-blue-200';
      case 'outcome': return 'bg-green-50 border-green-200';
      case 'branch': return 'bg-purple-50 border-purple-200';
      case 'action': return 'bg-orange-50 border-orange-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getEffortColor = (effort?: string) => {
    switch (effort) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const renderProgressBreadcrumb = () => {
    if (!showProgress || history.length <= 1) return null;

    return (
      <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm text-gray-600 mb-2">Decision Path:</div>
        <div className="flex flex-wrap items-center gap-2">
          {history.map((nodeId, index) => {
            const node = nodesById[nodeId];
            const isLast = index === history.length - 1;
            const selectedOption = selectedPath.find(p => p.nodeId === nodeId);
            
            return (
              <div key={nodeId} className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (allowBacktrack && !isLast) {
                      const newHistory = history.slice(0, index + 1);
                      setHistory(newHistory);
                      setCurrentNodeId(nodeId);
                      setSelectedPath(prev => prev.slice(0, index));
                    }
                  }}
                  className={`px-2 py-1 rounded text-sm ${
                    isLast 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  disabled={isLast || !allowBacktrack}
                >
                  {getNodeTypeIcon(node?.type || '')} {node?.title || 'Unknown'}
                </button>
                
                {selectedOption && index < history.length - 1 && (
                  <>
                    <span className="text-gray-400">→</span>
                    <span className="text-xs text-gray-500">
                      {nodes.find(n => n.id === selectedOption.nodeId)?.options?.find(o => o.id === selectedOption.optionId)?.label}
                    </span>
                  </>
                )}
                
                {!isLast && <span className="text-gray-400">→</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!currentNode) {
    return (
      <div className={className}>
        <div className="text-center py-8 text-red-500">
          Decision tree node not found: {currentNodeId}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {content && (
        <div className="mb-4">
          <MarkdownRenderer content={content} />
        </div>
      )}

      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
      )}

      {description && (
        <div className="mb-4 text-gray-600">
          <MarkdownRenderer content={description} />
        </div>
      )}

      {renderProgressBreadcrumb()}

      <div className={`${getNodeTypeColor(currentNode.type)} border rounded-lg p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">{getNodeTypeIcon(currentNode.type)}</span>
          <div>
            <h3 className="text-lg font-semibold">{currentNode.title}</h3>
            <span className="text-sm text-gray-600 capitalize">{currentNode.type}</span>
          </div>
        </div>

        <div className="mb-4">
          <MarkdownRenderer 
            content={currentNode.content}
            className="prose prose-sm max-w-none"
          />
        </div>

        {showMetadata && currentNode.metadata && (
          <div className="mb-4 p-3 bg-white bg-opacity-50 border border-gray-200 rounded">
            <div className="text-sm text-gray-600 mb-2">Node Metadata:</div>
            <div className="flex flex-wrap gap-4 text-xs">
              {showConfidence && currentNode.metadata.confidence !== undefined && (
                <span>Confidence: {Math.round(currentNode.metadata.confidence * 100)}%</span>
              )}
              {currentNode.metadata.weight !== undefined && (
                <span>Weight: {currentNode.metadata.weight}</span>
              )}
              {currentNode.metadata.tags && currentNode.metadata.tags.length > 0 && (
                <span>Tags: {currentNode.metadata.tags.join(', ')}</span>
              )}
            </div>
            {currentNode.metadata.reasoning && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  View reasoning
                </summary>
                <div className="mt-2 text-sm text-gray-700">
                  <MarkdownRenderer 
                    content={currentNode.metadata.reasoning}
                    className="prose prose-sm max-w-none"
                  />
                </div>
              </details>
            )}
          </div>
        )}

        {currentNode.options && currentNode.options.length > 0 && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">Choose an option:</div>
            {currentNode.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-4 border rounded-lg transition-colors ${
                  option.metadata?.recommended 
                    ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {option.metadata?.recommended && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    {option.description && (
                      <div className="text-sm text-gray-600 mt-1">
                        {option.description}
                      </div>
                    )}
                  </div>
                  
                  {showMetadata && option.metadata && (
                    <div className="ml-4 flex flex-col gap-1 text-xs">
                      {option.metadata.risk && (
                        <span className={getRiskColor(option.metadata.risk)}>
                          Risk: {option.metadata.risk}
                        </span>
                      )}
                      {option.metadata.effort && (
                        <span className={getEffortColor(option.metadata.effort)}>
                          Effort: {option.metadata.effort}
                        </span>
                      )}
                      {option.metadata.impact && (
                        <span className={getImpactColor(option.metadata.impact)}>
                          Impact: {option.metadata.impact}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {allowBacktrack && history.length > 1 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={handleBacktrack}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              ← Go back to previous decision
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Export metadata for the component
DecisionTree.meta = {
  description: 'Interactive decision tree with branching paths and metadata',
  category: 'workflow',
  tags: ['decision', 'tree', 'workflow', 'interactive', 'choice'],
  examples: [
    `{{decision-tree:troubleshooting|title=Troubleshooting Guide|showMetadata=true}}`,
    `{{decision-tree:project-planning|showProgress=true|allowBacktrack=true}}`
  ],
  schema: {
    nodes: {
      type: 'array',
      required: true,
      description: 'Array of decision nodes'
    },
    rootNodeId: {
      type: 'string',
      required: true,
      description: 'ID of the root node to start from'
    },
    title: {
      type: 'string',
      description: 'Decision tree title'
    },
    showMetadata: {
      type: 'boolean',
      description: 'Show node and option metadata'
    },
    showProgress: {
      type: 'boolean',
      description: 'Show decision path breadcrumb'
    },
    allowBacktrack: {
      type: 'boolean',
      description: 'Allow going back to previous decisions'
    }
  }
};