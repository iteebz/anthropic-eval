/**
 * AgentInterface Development Tools
 * 
 * Provides filesystem-based component discovery, hot-reload capabilities,
 * and comprehensive dev tools for building AgentInterface components.
 */

export * from './filesystem-discovery';
export * from './hot-reload';
export * from './devtools';

// Re-export key types for convenience
export type { ComponentInfo } from '../registry/auto';

/**
 * Development mode utilities
 */
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

/**
 * Development configuration
 */
export interface DevConfig {
  /** Enable filesystem-based component discovery */
  enableDiscovery?: boolean;
  /** Enable hot reload */
  enableHotReload?: boolean;
  /** Enable dev tools UI */
  enableDevTools?: boolean;
  /** Component discovery options */
  discoveryOptions?: {
    baseDir?: string;
    scanDirs?: string[];
    pattern?: RegExp;
  };
  /** Dev tools position */
  devToolsPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const defaultDevConfig: DevConfig = {
  enableDiscovery: isDevelopment,
  enableHotReload: isDevelopment,
  enableDevTools: isDevelopment,
  discoveryOptions: {
    scanDirs: ['components/interface', 'components/render'],
    pattern: /^(?!.*\.(test|spec|d)\.tsx?$).*\.tsx?$/
  },
  devToolsPosition: 'bottom-right'
};