/**
 * Simple error boundary - graceful degradation to markdown
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { MarkdownRenderer } from "../components/MarkdownRenderer";

interface Props {
  children: ReactNode;
  content: string;
}

interface State {
  hasError: boolean;
}

export class ComponentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Component error, falling back to markdown:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return <MarkdownRenderer content={this.props.content} />;
    }
    return this.props.children;
  }
}