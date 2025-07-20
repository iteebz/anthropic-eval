/**
 * AIP Components Index
 * 
 * This directory contains AgentInterface Protocol (AIP) components that follow
 * the standardized metadata pattern for build-time discovery and registry generation.
 * 
 * Each component in this directory should:
 * 1. Export a metadata object with type, description, schema, and category
 * 2. Follow the standardized naming convention
 * 3. Include proper JSON Schema for validation
 * 
 * Components are automatically discovered during build time and included
 * in the generated registry for Python consumption.
 */

// Core AIP Components
export { Timeline, metadata as TimelineMetadata } from './timeline';
export { Markdown, metadata as MarkdownMetadata } from './markdown';
export { Table, metadata as TableMetadata } from './table';
export { Reference, metadata as ReferenceMetadata } from './reference';
export { Insights, metadata as InsightsMetadata } from './insights';
export { Gallery, metadata as GalleryMetadata } from './gallery';
export { Accordion, metadata as AccordionMetadata } from './accordion';

// Additional AIP Components
export { CardGrid, metadata as CardsMetadata } from './cards';
export { DecisionTree, metadata as TreeMetadata } from './tree';
export { ConversationSuggestions, metadata as SuggestionsMetadata } from './suggestions';
export { CodeSnippet, metadata as CodeMetadata } from './code';