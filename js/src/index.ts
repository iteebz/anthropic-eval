/**
 * @agentic/react - AI-native UI components that just work
 */

// Types that folio needs
export type { InterfaceType, InterfaceData } from "./types";
export type { RendererComponentProps } from "./utils/componentProps";

// Main AIP renderer - the one true renderer
export { AIPRenderer } from "./components/renderer";
export type { AIPRendererProps } from "./components/renderer";

// Registry system  
export { 
  registerComponent, 
  renderAIPComponent, 
  getRegisteredTypes, 
  getAllMetadata,
  extendRegistry,
  isRegistered 
} from "./registry/unified";
export type { ComponentMetadata, ComponentRegistration } from "./registry/unified";

// Framework integrations
export { vitePlugin, withAgentInterface, AgentInterfaceWebpackPlugin } from "./integrations";
export type { AgentInterfaceViteOptions, AgentInterfaceNextOptions, AgentInterfaceWebpackOptions } from "./integrations";

// Auto-register core components by importing
import "./components";

// Error boundary for folio chat
export { InterfaceErrorBoundary } from "./core/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps } from "./core/InterfaceErrorBoundary";

// Built-in components that folio uses
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