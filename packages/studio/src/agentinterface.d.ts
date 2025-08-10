declare module 'agentinterface' {
  import React from 'react';

  export interface CardProps {
    header?: any[];
    body?: any[];
    footer?: any[];
    className?: string;
    variant?: 'default' | 'outlined' | 'elevated';
  }

  export interface AccordionProps {
    sections: Array<{
      title: string;
      content: string;
      defaultExpanded?: boolean;
    }>;
    content?: string;
    className?: string;
  }

  export interface CardsProps {
    items: Array<{
      title?: string;
      description?: string;
      content?: any;
    }>;
    className?: string;
  }

  export const Card: React.FC<CardProps>;
  export const Accordion: React.FC<AccordionProps>;
  export const Cards: React.FC<CardsProps>;

  export function render(
    block: { type: string; [key: string]: any },
    key?: string,
  ): React.ReactElement | null;
  export function getRegisteredTypes(): string[];
}
