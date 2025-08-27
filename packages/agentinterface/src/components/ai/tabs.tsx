import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: string;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  className?: string;
}

function TabsComponent({ items = [], defaultTab, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id || '');

  const activeContent =
    items.find((item) => item.id === activeTab)?.content || '';

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
        <div>{activeContent}</div>
      </div>
    </div>
  );
}

export const Tabs = TabsComponent;
