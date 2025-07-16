/**
 * @agentinterface/react - Main entry point
 *
 * Agent-driven dynamic UI selection system for React applications.
 * Analyzes content and selects appropriate UI components automatically.
 */

// Core exports
export * from "./core/validation";
export type { InterfaceType, InterfaceData } from "./types";

// React component exports
export { AgentInterfaceRenderer } from "./components/AgentInterfaceRenderer";
export { InterfaceErrorBoundary } from "./components/common/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps, InterfaceErrorContext } from "./components/common/InterfaceErrorBoundary";

// Component exports
export * from "./components/interface";

// Utility exports
export * from "./utils";

// Protocol exports
export * from "./protocol";

// Registry exports - AUTO-MAGICAL
export * from "./registry";

// Re-export commonly used items for convenience
export { validateInterfaceData, isValidInterfaceType } from "./core/validation";
export { INTERFACE_SCHEMAS } from "./core/schemas";
