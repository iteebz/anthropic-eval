import React from 'react';
import { useAIP } from '../registry/magic';
import { type InterfaceType } from '../types';
import { createRecursiveProps } from '../utils/componentProps';

export interface RecursiveRendererProps {
  content: any;
  depth?: number;
  maxDepth?: number;
  onSendMessage?: (message: string) => void;
  className?: string;
}

export const RecursiveRenderer: React.FC<RecursiveRendererProps> = ({
  content,
  depth = 0,
  maxDepth = 10,
  onSendMessage,
  className = ''
}) => {
  const aip = useAIP();

  if (depth >= maxDepth) {
    return (
      <div className={`max-depth-reached ${className}`}>
        <span className="text-gray-500 text-sm">Max nesting depth reached</span>
      </div>
    );
  }

  if (!content || typeof content !== 'object') {
    return <span className={className}>{String(content)}</span>;
  }

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
          />
        ))}
      </div>
    );
  }

  if (content.type && content.data) {
    const Component = aip.getComponent(content.type as InterfaceType);
    
    if (Component) {
      const nestedProps = {
        content: content.content || '',
        interfaceData: content.data,
        onSendMessage,
        className,
        children: content.children ? (
          <RecursiveRenderer
            content={content.children}
            depth={depth + 1}
            maxDepth={maxDepth}
            onSendMessage={onSendMessage}
          />
        ) : undefined
      };

      return <Component {...nestedProps} />;
    }
  }

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
        />
      </div>
    );
  }

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
          />
        </div>
      ))}
    </div>
  );
};