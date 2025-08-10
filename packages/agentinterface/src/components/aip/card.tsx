import React from 'react';
import { z } from 'zod';
import { render, register } from '../../registry';
import type { AIPBlock } from '../../schema/aip';

export interface CardProps {
  header?: AIPBlock[];
  body?: AIPBlock[];
  footer?: AIPBlock[];
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({
  header,
  body,
  footer,
  className = '',
  variant = 'default',
}: CardProps) {
  const variantClasses = {
    default: 'aip-card',
    outlined: 'aip-card aip-border',
    elevated: 'aip-card aip-shadow-lg',
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {header && (
        <div className="aip-card-header aip-border-primary aip-p-md border-b">
          {header.map((block, index) => render(block, `header-${index}`))}
        </div>
      )}
      {body && (
        <div className="aip-card-body aip-p-md">
          {body.map((block, index) => render(block, `body-${index}`))}
        </div>
      )}
      {footer && (
        <div className="aip-card-footer aip-border-primary aip-p-md border-t">
          {footer.map((block, index) => render(block, `footer-${index}`))}
        </div>
      )}
    </div>
  );
}

// AIP metadata for agent discovery
export const metadata = {
  type: 'card',
  description:
    'Structured content container with header, body, and footer sections',
  category: 'container',
  tags: ['container', 'layout', 'structured'],
  schema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['card'] },
      variant: {
        type: 'string',
        enum: ['default', 'outlined', 'elevated'],
        default: 'default',
      },
      header: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of AIP blocks for card header',
      },
      body: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of AIP blocks for card body',
      },
      footer: {
        type: 'array',
        items: { type: 'object' },
        description: 'Array of AIP blocks for card footer',
      },
    },
    required: ['type'],
  },
} as const;

const CardValidator = z.object({
  header: z.array(z.any()).optional(),
  body: z.array(z.any()).optional(),
  footer: z.array(z.any()).optional(),
  className: z.string().optional(),
  variant: z.enum(['default', 'outlined', 'elevated']).optional(),
});

// Register with AIP registry
register({
  type: 'card',
  schema: CardValidator,
  render: Card,
});
