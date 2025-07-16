/**
 * TypeScript type definitions for AgentInterface
 */
import { z } from "zod";
import {
  ExpandableSectionDataSchema,
  KeyInsightsDataSchema,
  TimelineDataSchema,
  MarkdownDataSchema,
  InlineReferencesDataSchema,
  CardGridDataSchema,
  BlogPostDataSchema,
  CodeSnippetDataSchema,
} from "../core/schemas";
import { InlineComponentConfig } from "../core/inline-components";

// Core data types
export type ExpandableSectionData = z.infer<typeof ExpandableSectionDataSchema>;
export type KeyInsightsData = z.infer<typeof KeyInsightsDataSchema>;
export type TimelineData = z.infer<typeof TimelineDataSchema>;
export type TimelineEvent = z.infer<typeof TimelineDataSchema.shape.events.element>;
export type MarkdownData = z.infer<typeof MarkdownDataSchema>;
export type InlineReferencesData = z.infer<typeof InlineReferencesDataSchema>;
export type CardGridData = z.infer<typeof CardGridDataSchema>;
export type BlogPostData = z.infer<typeof BlogPostDataSchema>;
export type CodeSnippetData = z.infer<typeof CodeSnippetDataSchema>;

// UI Component Type Union
export type InterfaceData =
  | CardGridData
  | ExpandableSectionData
  | KeyInsightsData
  | TimelineData
  | MarkdownData
  | InlineReferencesData
  | BlogPostData
  | CodeSnippetData;

// Interface type
export type InterfaceType = 'markdown' | 'card-grid' | 'expandable-section' | 'key-insights' | 'timeline' | 'inline-reference' | 'blog-post' | 'code-snippet';

// Base props for all interface components
export interface InterfaceComponentProps {
  content: string;
  className?: string;
}

// Legacy interface for backward compatibility
export interface InterfaceProps {
  content: string;
  interfaceData?: InterfaceData;
  className?: string;
  onSendMessage?: (message: string) => void;
}

// Specific component prop types
export interface CardGridProps extends InterfaceComponentProps {
  interfaceData: CardGridData;
}

export interface ExpandableSectionProps extends InterfaceComponentProps {
  interfaceData: ExpandableSectionData;
}

export interface KeyInsightsProps extends InterfaceComponentProps {
  interfaceData: KeyInsightsData;
}

export interface TimelineProps extends InterfaceComponentProps {
  interfaceData: TimelineData;
}

export interface BlogPostProps extends InterfaceComponentProps {
  interfaceData: BlogPostData;
}

export interface MarkdownProps extends InterfaceComponentProps {
  interfaceData: MarkdownData;
}

export interface InlineReferenceProps extends InterfaceComponentProps {
  interfaceData: InlineReferencesData;
}

export interface CodeSnippetProps extends InterfaceComponentProps {
  interfaceData: CodeSnippetData;
}

// Union type for all component props
export type ComponentProps =
  | CardGridProps
  | ExpandableSectionProps
  | KeyInsightsProps
  | TimelineProps
  | BlogPostProps
  | MarkdownProps
  | InlineReferenceProps
  | CodeSnippetProps;

// Discriminated union for component configuration
export type ComponentConfig = 
  | { type: 'card-grid'; data: CardGridData; config: InlineComponentConfig }
  | { type: 'expandable-section'; data: ExpandableSectionData; config: InlineComponentConfig }
  | { type: 'key-insights'; data: KeyInsightsData; config: InlineComponentConfig }
  | { type: 'timeline'; data: TimelineData; config: InlineComponentConfig }
  | { type: 'blog-post'; data: BlogPostData; config: InlineComponentConfig }
  | { type: 'markdown'; data: MarkdownData; config: InlineComponentConfig }
  | { type: 'inline-reference'; data: InlineReferencesData; config: InlineComponentConfig }
  | { type: 'code-snippet'; data: CodeSnippetData; config: InlineComponentConfig };

// Enhanced interface props with inline component support
export interface EnhancedInterfaceProps extends InterfaceProps {
  inlineComponents?: Map<string, ComponentConfig>;
  componentResolver?: (type: InterfaceType, slug: string) => Promise<InterfaceData | null>;
}

// Logger interface
export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  componentError?: (
    interfaceType: InterfaceType,
    error: Error,
    context?: LogContext,
  ) => void;
  uiRender?: (
    interfaceType: InterfaceType,
    renderTime: number,
    context?: LogContext,
  ) => void;
}

export interface LogContext {
  [key: string]: unknown;
  component?: string;
  userJourney?: Record<string, unknown>;
  error?: {
    details?: Record<string, unknown>;
    originalData?: unknown;
  };
  performance?: {
    renderTime?: number;
  };
}
