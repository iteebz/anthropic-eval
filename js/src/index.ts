/**
 * @agentinterface/react - Minimal working version for folio
 */

// Types that folio needs
export type { InterfaceType, InterfaceData } from "./types";
export type { RendererComponentProps } from "./utils/componentProps";

// Main component that folio uses
export { AgentInterfaceRenderer } from "./components/AgentInterfaceRenderer";
export type { AgentInterfaceRendererProps } from "./components/AgentInterfaceRenderer";

// NEW: Unified renderer using registry system
export { UnifiedRenderer } from "./components/UnifiedRenderer";
export type { UnifiedRendererProps } from "./components/UnifiedRenderer";

// Unified registry system  
export { registerComponent, renderAIPComponent } from "./registry/unified";
export type { ComponentRegistration } from "./registry/unified";

// Error boundary for folio chat
export { InterfaceErrorBoundary } from "./components/common/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps } from "./components/common/InterfaceErrorBoundary";

// Built-in components that folio uses
export { KeyInsights } from "./components/interface/key-insights";
export { ExpandableSection } from "./components/interface/expandable-section";
export { CardGrid } from "./components/interface/card-grid";
export { CodeSnippet } from "./components/interface/code-snippet";
export { ComparisonTable } from "./components/interface/comparison-table";
export { ContactForm } from "./components/interface/contact-form";
export { ConversationThread } from "./components/interface/conversation-thread";
export { DecisionTree } from "./components/interface/decision-tree";
export { ImageGallery } from "./components/interface/image-gallery";
export { InlineReference } from "./components/interface/inline-reference";
export { ProgressTracker } from "./components/interface/progress-tracker";
export { Timeline } from "./components/interface/timeline";