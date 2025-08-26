import React, { useState } from 'react';
import { z } from 'zod';
import { render } from '../../registry';
import { ai } from '../../ai';
import type { AIPBlock } from '../../schema/aip';

export interface TabItem {
  id: string;
  label: string;
  content: AIPBlock[];
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

function TabsComponent({ items = [], defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '');

  const activeContent =
    items.find((item) => item.id === activeTab)?.content || [];

  // Handle empty items array
  if (items.length === 0) {
    return (
      <div className={`aip-tabs ${className}`}>
        <div className="aip-text-secondary aip-p-md">No tabs provided</div>
      </div>
    );
  }

  return (
    <div className={`aip-tabs ${className}`}>
      <div className="aip-tabs-nav aip-border-primary border-b">
        {items.map((item) => (
          <button
            key={item.id}
            className={`aip-tab-button aip-p-sm aip-px-md ${
              activeTab === item.id
                ? 'aip-tab-active aip-border-accent aip-text-accent border-b-2'
                : 'aip-text-secondary hover:aip-text-primary'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="aip-tabs-content aip-p-md">
        {activeContent.map((block, index) =>
          render(block, `${activeTab}-${index}`),
        )}
      </div>
    </div>
  );
}

// AIP metadata for agent discovery
export const metadata = {
  type: 'tabs',
  description: 'Multi-view content container with tab navigation',
  category: 'container',
  tags: ['navigation', 'container', 'multi-view'],
  schema: {
    type: 'object',
    properties: {
      type: { type: 'string', enum: ['tabs'] },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            content: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of AIP blocks to render in this tab',
            },
          },
          required: ['id', 'label', 'content'],
        },
      },
      defaultTab: {
        type: 'string',
        description: 'ID of the tab to show by default',
      },
    },
    required: ['type', 'items'],
  },
} as const;

const TabsValidator = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      content: z.array(z.any()),
    }),
  ),
  defaultTab: z.string().optional(),
  className: z.string().optional(),
});

// CANONICAL: AI() wrapper with auto-registration
export const Tabs = ai(
  'tabs',
  'Multi-view content container with tab navigation',
  TabsComponent
);
