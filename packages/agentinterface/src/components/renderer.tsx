/**
 * Agent JSON → React components
 */

import React from 'react';
import { render as registryRender } from '../registry';

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

export function render(agentJSON: string): React.ReactNode {
  const component = JSON.parse(agentJSON);
  return registryRender({ type: component.type, data: component.data });
}

export function AIPRenderer({ agentResponse }: { agentResponse: string }) {
  return (
    <RenderErrorBoundary>
      {render(agentResponse)}
    </RenderErrorBoundary>
  );
}