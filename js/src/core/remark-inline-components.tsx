import React from 'react';
import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Text } from 'mdast';
import { 
  parseInlineComponent, 
  resolveInlineComponent, 
  createFallbackContent,
  type ComponentResolver 
} from './inline-components';

interface InlineComponentNode {
  type: 'inlineComponent';
  data: {
    hName: 'InlineComponent';
    hProperties: {
      config: string;
      resolved?: string;
    };
  };
  children: never[];
}

declare module 'mdast' {
  interface RootContentMap {
    inlineComponent: InlineComponentNode;
  }
}

export interface RemarkInlineComponentsOptions {
  resolver?: ComponentResolver;
  fallbackMode?: 'link' | 'text' | 'remove';
}

export const remarkInlineComponents: Plugin<[RemarkInlineComponentsOptions?], Root> = (
  options = {}
) => {
  const { resolver, fallbackMode = 'link' } = options;

  return async (tree: Root) => {
    const promises: Promise<void>[] = [];

    visit(tree, 'text', (node: Text, index, parent) => {
      if (!parent || index === undefined) return;

      const text = node.value;
      const inlineComponentRegex = /\{\{[^}]+\}\}/g;
      let match;
      let lastIndex = 0;
      const newNodes: Array<Text | InlineComponentNode> = [];

      while ((match = inlineComponentRegex.exec(text)) !== null) {
        // Add text before the component
        if (match.index > lastIndex) {
          newNodes.push({
            type: 'text',
            value: text.slice(lastIndex, match.index),
          });
        }

        const componentSyntax = match[0];
        const config = parseInlineComponent(componentSyntax);

        if (config && resolver) {
          const promise = resolveInlineComponent(config, resolver).then(resolved => {
            const componentNode: InlineComponentNode = {
              type: 'inlineComponent',
              data: {
                hName: 'InlineComponent',
                hProperties: {
                  config: JSON.stringify(config),
                  resolved: JSON.stringify(resolved),
                },
              },
              children: [],
            };
            newNodes.push(componentNode);
          }).catch(() => {
            // Fallback to text on error
            newNodes.push({
              type: 'text',
              value: createFallbackContent({ config, data: null }),
            });
          });
          promises.push(promise);
        } else {
          // No resolver or invalid config - create fallback
          const fallbackContent = config 
            ? createFallbackContent({ config, data: null })
            : componentSyntax;
          
          if (fallbackMode !== 'remove') {
            newNodes.push({
              type: 'text',
              value: fallbackContent,
            });
          }
        }

        lastIndex = inlineComponentRegex.lastIndex;
      }

      // Add remaining text
      if (lastIndex < text.length) {
        newNodes.push({
          type: 'text',
          value: text.slice(lastIndex),
        });
      }

      // Replace the text node with new nodes if we found components
      if (newNodes.length > 0) {
        parent.children.splice(index, 1, ...newNodes);
      }
    });

    // Wait for all component resolutions
    await Promise.all(promises);
  };
};

// React component for rendering inline components
export interface InlineComponentProps {
  config: string;
  resolved?: string;
}

export function InlineComponent({ config, resolved }: InlineComponentProps) {
  try {
    const parsedConfig = JSON.parse(config);
    const resolvedData = resolved ? JSON.parse(resolved) : null;
    
    if (!resolvedData?.data) {
      const fallback = resolvedData?.fallback;
      if (fallback?.type === 'link') {
        return (
          <a 
            href={fallback.href} 
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {fallback.content}
          </a>
        );
      }
      return <span className="text-gray-500">{fallback?.content || parsedConfig.label || parsedConfig.slug}</span>;
    }

    // Render the actual component based on type and mode
    const { type, mode } = parsedConfig;
    
    switch (mode) {
      case 'link':
        return (
          <a 
            href={`/components/${type}/${parsedConfig.slug}`}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            {parsedConfig.label || parsedConfig.slug}
          </a>
        );
      case 'preview':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            {parsedConfig.label || parsedConfig.slug}
          </span>
        );
      case 'expand':
      default:
        // This would need to be handled by the parent component
        // For now, return a placeholder
        return (
          <div className="inline-block border border-gray-300 rounded px-2 py-1 text-sm">
            <strong>{parsedConfig.label || parsedConfig.slug}</strong>
            <span className="text-gray-500 ml-1">({type})</span>
          </div>
        );
    }
  } catch (error) {
    console.error('Error rendering inline component:', error);
    return <span className="text-red-500">⚠️ Component Error</span>;
  }
}