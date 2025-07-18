/**
 * @agentinterface/react - Minimal working version for folio
 */

// Types that folio needs
export type { InterfaceType, InterfaceData } from "./types";
export type { RendererComponentProps } from "./utils/componentProps";

// Main component that folio uses
export { AgentInterfaceRenderer } from "./components/AgentInterfaceRenderer";

// Registry functions that folio imports
export { registerComponents, getComponentRegistry, isValidInterfaceType } from "./registry/simple";

// Error boundary for folio chat
export { InterfaceErrorBoundary } from "./components/common/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps } from "./components/common/InterfaceErrorBoundary";