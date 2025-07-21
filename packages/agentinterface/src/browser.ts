/**
 * Browser-only exports - no Node.js dependencies
 */

// Core rendering system
export { render, isRegistered } from "./registry";
export type { ComponentMetadata, ComponentRegistration } from "./registry";

// AIP renderer
export { AIPRenderer } from "./components/renderer";
export type { AIPRendererProps } from "./components/renderer";

// Error boundary
export { InterfaceErrorBoundary } from "./core/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps } from "./core/InterfaceErrorBoundary";

// All AIP components
export { Insights } from "./components/aip/insights";
export { Accordion } from "./components/aip/accordion";
export { Cards } from "./components/aip/cards";
export { Code } from "./components/aip/code";
export { Table } from "./components/aip/table";
export { Suggestions } from "./components/aip/suggestions";
export { Tree } from "./components/aip/tree";
export { Gallery } from "./components/aip/gallery";
export { Reference } from "./components/aip/reference";
export { Timeline } from "./components/aip/timeline";
export { Markdown } from "./components/aip/markdown";
export { Card } from "./components/aip/card";
export { Tabs } from "./components/aip/tabs";

// Auto-register components
import "./components";

// Import styles - use the built CSS file
// Note: This will be resolved via package.json exports