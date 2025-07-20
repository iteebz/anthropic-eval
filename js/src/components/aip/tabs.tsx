import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

export function Tabs({ items, defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

  const activeContent = items.find(item => item.id === activeTab)?.content;

  return (
    <div className={`aip-tabs ${className}`}>
      <div className="aip-tabs-nav border-b aip-border-primary">
        {items.map((item) => (
          <button
            key={item.id}
            className={`aip-tab-button aip-p-sm aip-px-md ${
              activeTab === item.id 
                ? 'aip-tab-active border-b-2 aip-border-accent aip-text-accent' 
                : 'aip-text-secondary hover:aip-text-primary'
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="aip-tabs-content aip-p-md">
        {activeContent}
      </div>
    </div>
  );
}

// AIP metadata for agent discovery
export const TabsMetadata = {
  name: 'tabs',
  description: 'Multi-view content container with tab navigation',
  category: 'containers',
  schema: {
    type: 'object',
    properties: {
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            label: { type: 'string' },
            content: { type: 'string' }
          },
          required: ['id', 'label', 'content']
        }
      },
      defaultTab: {
        type: 'string',
        description: 'ID of the tab to show by default'
      }
    },
    required: ['items']
  },
  examples: [
    {
      items: [
        { id: 'overview', label: 'Overview', content: 'System status and metrics' },
        { id: 'details', label: 'Details', content: 'Detailed analysis and findings' },
        { id: 'actions', label: 'Actions', content: 'Recommended next steps' }
      ],
      defaultTab: 'overview'
    }
  ]
};