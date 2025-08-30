/**
 * Agent JSON to React components.
 */

import React from 'react';
import { Card } from './ai/card';
import { Timeline } from './ai/timeline';
import { Markdown } from './ai/markdown';
import { Accordion } from './ai/accordion';
import { Code } from './ai/code';
import { Gallery } from './ai/gallery';
import { Reference } from './ai/reference';
import { Suggestions } from './ai/suggestions';
import { Table } from './ai/table';
import { Tabs } from './ai/tabs';
import { Tree } from './ai/tree';


// Component registry - auto-generated via discovery
const COMPONENTS = {
  accordion: Accordion,
  card: Card,
  code: Code,
  gallery: Gallery,
  markdown: Markdown,
  reference: Reference,
  suggestions: Suggestions,
  table: Table,
  tabs: Tabs,
  timeline: Timeline,
  tree: Tree,
} as const;

// Metadata registry - imported directly for now
import { metadata as accordionMetadata } from './ai/accordion';
import { metadata as cardMetadata } from './ai/card';
import { metadata as codeMetadata } from './ai/code';
import { metadata as galleryMetadata } from './ai/gallery';
import { metadata as markdownMetadata } from './ai/markdown';
import { metadata as referenceMetadata } from './ai/reference';
import { metadata as suggestionsMetadata } from './ai/suggestions';
import { metadata as tableMetadata } from './ai/table';
import { metadata as tabsMetadata } from './ai/tabs';
import { metadata as timelineMetadata } from './ai/timeline';
import { metadata as treeMetadata } from './ai/tree';

const COMPONENT_METADATA = {
  accordion: accordionMetadata,
  card: cardMetadata,
  code: codeMetadata,
  gallery: galleryMetadata,
  markdown: markdownMetadata,
  reference: referenceMetadata,
  suggestions: suggestionsMetadata,
  table: tableMetadata,
  tabs: tabsMetadata,
  timeline: timelineMetadata,
  tree: treeMetadata,
} as const;

function processData(data: any): any {
  if (data && typeof data === 'object' && data.type) {
    return renderItem(data, 0); // Nested component
  }
  if (Array.isArray(data)) {
    return data.map((item, i) => processData(item)); // Nested arrays
  }
  return data; // Regular data passthrough
}

function renderItem(item: any, key: number): React.ReactNode {
  if (Array.isArray(item)) {
    // Horizontal stack
    return (
      <div key={key} className="flex gap-4">
        {item.map((subItem, i) => renderItem(subItem, i))}
      </div>
    );
  }
  
  // Single component
  const { type, data } = item;
  
  // Process all data props for nesting
  const processedData = Object.fromEntries(
    Object.entries(data || {}).map(([k, v]) => [k, processData(v)])
  );
  
  // Schema-aware validation: ensure required props exist
  const metadata = COMPONENT_METADATA[type as keyof typeof COMPONENT_METADATA];
  if (metadata?.schema?.required) {
    for (const requiredProp of metadata.schema.required) {
      if (!(requiredProp in processedData)) {
        console.warn(`Missing required prop '${requiredProp}' for component '${type}'`);
        return <div key={key}>Error: Missing required data for {type}</div>;
      }
    }
  }
  
  const Component = COMPONENTS[type as keyof typeof COMPONENTS];
  return Component ? (
    <Component key={key} {...(processedData as any)} />
  ) : (
    <div key={key}>Unknown: {type}</div>
  );
}

export function render(agentJSON: string): React.ReactNode {
  const parsed = JSON.parse(agentJSON);
  
  if (Array.isArray(parsed)) {
    // Vertical stack
    return (
      <div className="flex flex-col gap-4">
        {parsed.map((item, i) => renderItem(item, i))}
      </div>
    );
  }
  
  // Single component (backwards compatible)
  return renderItem(parsed, 0);
}

