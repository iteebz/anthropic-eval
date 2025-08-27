import React from 'react';

export interface CardProps {
  title?: string;
  content?: string;
  actions?: string[];
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
