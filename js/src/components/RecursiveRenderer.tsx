import React from 'react';
import { useAIP } from '../registry/magic';
import { type InterfaceType } from '../types';
import { createRecursiveProps } from '../utils/componentProps';
import { RecursiveComponentParser, ParsedComponent, ParserOptions } from '../parser/recursive';

export interface RecursiveRendererProps {
  content: any;
  depth?: number;
  maxDepth?: number;
  onSendMessage?: (message: string) => void;
  className?: string;
  parserOptions?: ParserOptions;
  slots?: Record<string, any>;
}

export const RecursiveRenderer: React.FC<RecursiveRendererProps> = ({
  content,
  depth = 0,
  maxDepth = 10,
  onSendMessage,
  className = '',
  parserOptions = {},
  slots = {}
}) => {
  const aip = useAIP();

  if (depth >= maxDepth) {
    return (
      <div className={`max-depth-reached ${className}`}>
        <span className="text-gray-500 text-sm">Max nesting depth reached</span>
      </div>
    );
  }

  // Handle string content with component syntax
  if (typeof content === 'string' && content.includes('{{')) {
    const parser = new RecursiveComponentParser({ ...parserOptions, maxDepth });
    const components = parser.parseWithSlots(content, slots);
    
    return (
      <div className={`recursive-parsed ${className}`}>
        {components.map((component, index) => (
          <RecursiveRenderer
            key={index}
            content={component}
            depth={depth + 1}
            maxDepth={maxDepth}
            onSendMessage={onSendMessage}
            parserOptions={parserOptions}
            slots={slots}
          />
        ))}
      </div>
    );
  }

  // Handle primitive content
  if (!content || typeof content !== 'object') {
    return <span className={className}>{String(content)}</span>;
  }

  // Handle arrays
  if (Array.isArray(content)) {
    return (
      <div className={`recursive-array ${className}`}>
        {content.map((item, index) => (
          <RecursiveRenderer
            key={index}
            content={item}
            depth={depth + 1}
            maxDepth={maxDepth}
            onSendMessage={onSendMessage}
            className="mb-2"
            parserOptions={parserOptions}
            slots={slots}
          />
        ))}
      </div>
    );
  }

  // Handle parsed components or component objects
  if (content.type && (content.data !== undefined || content.children !== undefined)) {
    const Component = aip.getComponent(content.type as InterfaceType);
    
    if (Component) {
      const nestedProps = {
        content: content.content || '',
        interfaceData: content.data || {},
        onSendMessage,
        className,
        children: content.children && content.children.length > 0 ? (
          <div className="recursive-children">
            {content.children.map((child: any, index: number) => (
              <RecursiveRenderer
                key={index}
                content={child}
                depth={depth + 1}
                maxDepth={maxDepth}
                onSendMessage={onSendMessage}
                parserOptions={parserOptions}
                slots={slots}
              />
            ))}
          </div>
        ) : undefined
      };

      return <Component {...nestedProps} />;
    }
    
    // Handle text components
    if (content.type === 'text') {
      return <span className={className}>{content.content}</span>;
    }
  }

  // Handle legacy format with children
  if (content.children) {
    return (
      <div className={`recursive-container ${className}`}>
        {content.content && (
          <div className="recursive-content mb-2">
            {content.content}
          </div>
        )}
        <RecursiveRenderer
          content={content.children}
          depth={depth + 1}
          maxDepth={maxDepth}
          onSendMessage={onSendMessage}
          parserOptions={parserOptions}
          slots={slots}
        />
      </div>
    );
  }

  // Handle generic objects
  return (
    <div className={`recursive-object ${className}`}>
      {Object.entries(content).map(([key, value]) => (
        <div key={key} className="mb-1">
          <span className="font-medium text-gray-700">{key}: </span>
          <RecursiveRenderer
            content={value}
            depth={depth + 1}
            maxDepth={maxDepth}
            onSendMessage={onSendMessage}
            className="inline"
            parserOptions={parserOptions}
            slots={slots}
          />
        </div>
      ))}
    </div>
  );
};