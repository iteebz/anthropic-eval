/**
 * AgentInterface Development Tools
 *
 * Provides filesystem-based component discovery, hot-reload capabilities,
 * and comprehensive dev tools for building AgentInterface components.
 */

export * from './dev-renderer';
export * from './hot-reload';
export * from './dev-panel';

// Core devkit exports

/**
 * Development mode utilities
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Development configuration
 */
export interface DevConfig {
  /** Enable component discovery via agentinterface registry */
  enableDiscovery?: boolean;
  /** Enable hot reload */
  enableHotReload?: boolean;
  /** Enable dev tools UI */
  enableDevTools?: boolean;
  /** Dev tools position */
  devToolsPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const defaultDevConfig: DevConfig = {
  enableDiscovery: isDevelopment,
  enableHotReload: isDevelopment,
  enableDevTools: isDevelopment,
  devToolsPosition: 'bottom-right',
};
