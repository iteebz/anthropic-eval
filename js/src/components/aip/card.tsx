import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outlined' | 'elevated';
}

export interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ 
  children, 
  className = '',
  variant = 'default'
}: CardProps) {
  const variantClasses = {
    default: 'aip-card',
    outlined: 'aip-card aip-border',
    elevated: 'aip-card aip-shadow-lg'
  };

  return (
    <div className={`${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ 
  children, 
  className = '' 
}: CardSectionProps) {
  return (
    <div className={`aip-card-header border-b aip-border-primary aip-p-md ${className}`}>
      {children}
    </div>
  );
};

Card.Body = function CardBody({ 
  children, 
  className = '' 
}: CardSectionProps) {
  return (
    <div className={`aip-card-body aip-p-md ${className}`}>
      {children}
    </div>
  );
};

Card.Footer = function CardFooter({ 
  children, 
  className = '' 
}: CardSectionProps) {
  return (
    <div className={`aip-card-footer border-t aip-border-primary aip-p-md ${className}`}>
      {children}
    </div>
  );
};

// AIP metadata for agent discovery
export const CardMetadata = {
  name: 'card',
  description: 'Structured content container with header, body, and footer sections',
  category: 'containers',
  schema: {
    type: 'object',
    properties: {
      variant: {
        type: 'string',
        enum: ['default', 'outlined', 'elevated'],
        default: 'default'
      },
      header: {
        type: 'string',
        description: 'Optional header content'
      },
      body: {
        type: 'string',
        description: 'Main card content'
      },
      footer: {
        type: 'string',
        description: 'Optional footer content'
      }
    },
    required: ['body']
  },
  examples: [
    {
      variant: 'outlined',
      header: 'Analysis Results',
      body: 'Key findings and insights from data analysis',
      footer: 'Generated at 2025-01-15 14:30'
    }
  ]
};