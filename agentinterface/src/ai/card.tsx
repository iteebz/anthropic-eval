/**
 * Generic card layout component.
 */
import React from 'react';

export interface CardProps {
  title?: string;
  content?: string;
  actions?: any[];
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

function CardComponent({
  title,
  content,
  actions,
  className = '',
  variant = 'default',
}: CardProps) {
  return (
    <div className={`card ${variant} ${className}`}>
      {title && <div className="card-header">{title}</div>}
      {content && <div className="card-content">{content}</div>}
      {actions && (
        <div className="card-actions">
          {actions.map((action, i) => <button key={i}>{action}</button>)}
        </div>
      )}
    </div>
  );
}

export const Card = CardComponent;

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'card',
  description: 'Generic card with title, content and actions',
  schema: {
    type: 'object',
    properties: {
      title: { type: 'string', optional: true },
      content: { type: 'string', optional: true },
      actions: { type: 'array', items: { type: 'string' }, optional: true },
      variant: { type: 'string', enum: ['default', 'outlined', 'elevated'], optional: true },
      className: { type: 'string', optional: true }
    },
    required: []
  },
  category: 'layout'
};
