/**
 * Simple error boundary - graceful degradation to markdown
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MarkdownRenderer } from "../render/MarkdownRenderer";

interface Props {
  children: ReactNode;
  content: string;
  interfaceType?: string;
  interfaceData?: any; // Added this line
  showDebugInfo?: boolean; // Added this line based on AgentInterfaceRenderer.tsx usage
  onError?: (
    error: Error,
    errorInfo: ErrorInfo,
    context: ComponentErrorContext,
  ) => void; // Added this line based on AgentInterfaceRenderer.tsx usage
}

interface State {
  hasError: boolean;
}

export interface ComponentErrorContext {
  componentName: string;
  interfaceType: string;
  interfaceData: any;
  content: string;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.warn("Component error, falling back to markdown:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return <MarkdownRenderer content={this.props.content} />;
    }
    return this.props.children;
  }
}