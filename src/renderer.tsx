/**
 * Agent JSON → React components
 */

import React from 'react';
import { Card } from './ai/card';
import { Timeline } from './ai/timeline';
import { Markdown } from './ai/markdown';
import { Accordion } from './ai/accordion';
import { Code } from './ai/code';
import { Gallery } from './ai/gallery';
import { Insights } from './ai/insights';
import { Reference } from './ai/reference';
import { Suggestions } from './ai/suggestions';
import { Table } from './ai/table';
import { Tabs } from './ai/tabs';
import { Tree } from './ai/tree';

interface ErrorBoundaryState {
  error: Error | null;
}

class RenderErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: string },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div>Component failed: {this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

const COMPONENTS = {
  card: Card,
  timeline: Timeline,
  markdown: Markdown,
  accordion: Accordion,
  code: Code,
  gallery: Gallery,
  insights: Insights,
  reference: Reference,
  suggestions: Suggestions,
  table: Table,
  tabs: Tabs,
  tree: Tree,
};

export function render(agentJSON: string): React.ReactNode {
  const { type, data } = JSON.parse(agentJSON);
  const Component = COMPONENTS[type as keyof typeof COMPONENTS];
  return Component ? <Component {...data} /> : <div>Unknown: {type}</div>;
}

export function AIPRenderer({ agentResponse }: { agentResponse: string }) {
  return (
    <RenderErrorBoundary>
      {render(agentResponse)}
    </RenderErrorBoundary>
  );
}