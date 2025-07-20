/**
 * Framework Integrations for AgentInterface
 * Build-time registry generation hooks
 */

// Vite
export { agentInterface as vitePlugin } from './vite';
export type { AgentInterfaceViteOptions } from './vite';

// Next.js  
export { withAgentInterface } from './next';
export type { AgentInterfaceNextOptions } from './next';

// Webpack
export { AgentInterfaceWebpackPlugin } from './webpack';
export type { AgentInterfaceWebpackOptions } from './webpack';