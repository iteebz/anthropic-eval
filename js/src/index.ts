/**
 * @agentinterface/react - Main entry point
 *
 * Agent-driven dynamic UI selection system for React applications.
 * AUTO-MAGICAL: Zero ceremony component discovery and registration.
 */

// 🎯 MAGICAL SINGLE IMPORT - Everything you need
export { useAIP } from "./registry/magic";
export type { MagicRegistryConfig, ComponentInfo, ComponentMetadata } from "./registry/magic";

// Core exports
export * from "./core/validation";
export * from "./core/inline-components";
export * from "./core/component-resolver";
export type { InterfaceType, InterfaceData, ComponentConfig } from "./types";

// React component exports
export { AgentInterfaceRenderer } from "./components/AgentInterfaceRenderer";
export { RecursiveRenderer } from "./components/RecursiveRenderer";
export { InterfaceErrorBoundary } from "./components/common/InterfaceErrorBoundary";
export type { InterfaceErrorBoundaryProps, InterfaceErrorContext } from "./components/common/InterfaceErrorBoundary";
export { ThemeProvider, ThemeToggle, ThemeSelect, CustomPropertyEditor, useAIPTheme } from "./components/common/ThemeProvider";
export { useTheme } from "./hooks/useTheme";
export type { ThemeMode, ThemeConfig, UseThemeResult } from "./hooks/useTheme";

// Component exports (auto-discovered, but available for tree-shaking)
export * from "./components/interface";
export * from "./components/compound/CompoundComponents";
export { MarkdownRenderer } from "./components/render/MarkdownRenderer";
export { InlineComponentFallback } from "./components/common/InlineComponentFallback";

// Utility exports
export * from "./utils";

// Parser exports - PRODUCTION-READY RECURSIVE SYNTAX
export { RecursiveComponentParser, createParser, parseComponent, parseWithValidation } from "./parser/recursive";
export type { InterfaceComponent, ParserOptions } from "./parser/recursive";

// Protocol exports
export * from "./protocol";

// Registry exports - AUTO-MAGICAL
export * from "./registry";

// Re-export commonly used items for convenience
export { validateInterfaceData, isValidInterfaceType } from "./core/validation";
export { INTERFACE_SCHEMAS } from "./core/schemas";

// Development exports (only available in development)
export * from "./dev";

// Testing exports - COMPREHENSIVE TESTING SUITE
export { createThemeIntegrationTester, testComponentThemes } from "./testing/theme-integration";
export { ThemeTestingPanel } from "./testing/ThemeTestingPanel";
export { runThemeTests, runComponentTest } from "./testing/run-theme-tests";
export { createDarkModeValidator, validateDarkMode } from "./testing/dark-mode-validator";
export { runDarkModeValidation } from "./testing/run-dark-mode-tests";
export { ErrorHandler, globalErrorHandler, withErrorHandling, withAsyncErrorHandling, logError, logWarning, logInfo, logDebug } from "./testing/error-handler";
export { TestCoverageAnalyzer, createTestCoverageAnalyzer, analyzeTestCoverage } from "./testing/test-coverage";
export type { ThemeTestResult, ThemeTestConfig, DarkModeValidation, ErrorLog, ErrorContext, TestCoverage, TestResult } from "./testing/theme-integration";

// Playground exports
export { ComponentPlayground } from "./playground";

// Error handling exports
export * from "./core/error-handling";
