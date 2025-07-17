/**
 * Magic Registry: Single import for everything
 * Zero ceremony, auto-magical component discovery with lazy loading
 */

import { ComponentType } from 'react';
import { z } from 'zod';
import { InterfaceType, InterfaceData } from '../types';
import { validateInterfaceData, isValidInterfaceType } from '../core/validation';
import { getDiscoveredComponents, ComponentInfo, buildRegistry, getAgentOptions } from './auto';
import { 
  getLazyComponents, 
  LazyComponentInfo, 
  loadComponent, 
  preloadComponents, 
  getLoadedComponent, 
  isComponentLoaded, 
  getBundleStats 
} from './lazy';

export interface MagicRegistryConfig {
  enabledComponents?: string[];
  customComponents?: Record<string, ComponentType<any>>;
  fallbackComponent?: ComponentType<any>;
  enableRuntimeValidation?: boolean;
  strictMode?: boolean;
  useLazyLoading?: boolean;
  preloadComponents?: string[];
}

export class MagicRegistry {
  private config: MagicRegistryConfig;
  private _cache: Record<string, ComponentInfo> | null = null;
  private _lazyCache: Record<string, LazyComponentInfo> | null = null;

  constructor(config: MagicRegistryConfig = {}) {
    this.config = { useLazyLoading: true, ...config };
    
    // Preload components if specified
    if (this.config.preloadComponents?.length) {
      preloadComponents(this.config.preloadComponents).catch(console.error);
    }
  }

  /**
   * Get all available components (cached)
   */
  get components(): Record<string, ComponentInfo> {
    if (this.config.useLazyLoading) {
      throw new Error('Use lazyComponents or getComponentAsync when lazy loading is enabled');
    }
    
    if (!this._cache) {
      const discovered = buildRegistry(this.config.enabledComponents);
      
      // Merge custom components
      if (this.config.customComponents) {
        for (const [name, component] of Object.entries(this.config.customComponents)) {
          const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase();
          discovered[kebabName] = {
            name: kebabName,
            description: `Custom ${kebabName.replace(/-/g, ' ')} component`,
            component,
            type: kebabName as InterfaceType,
            metadata: { category: 'custom' }
          };
        }
      }
      
      this._cache = discovered;
    }
    
    return this._cache;
  }

  /**
   * Get lazy component registry
   */
  get lazyComponents(): Record<string, LazyComponentInfo> {
    if (!this._lazyCache) {
      const discovered = getLazyComponents();
      
      // Filter if enabled components specified
      if (this.config.enabledComponents) {
        const filtered: Record<string, LazyComponentInfo> = {};
        for (const name of this.config.enabledComponents) {
          if (discovered[name]) {
            filtered[name] = discovered[name];
          }
        }
        this._lazyCache = filtered;
      } else {
        this._lazyCache = discovered;
      }
    }
    
    return this._lazyCache;
  }

  /**
   * Get component by name with runtime validation (sync)
   */
  getComponent(name: string): ComponentType<any> | null {
    if (this.config.useLazyLoading) {
      // Check if already loaded
      return getLoadedComponent(name) || this.config.fallbackComponent || null;
    }
    
    const info = this.components[name];
    return info?.component || this.config.fallbackComponent || null;
  }

  /**
   * Get component by name with lazy loading (async)
   */
  async getComponentAsync(name: string): Promise<ComponentType<any> | null> {
    if (this.config.useLazyLoading) {
      // Import error handling only when needed
      const { getErrorHandler } = await import('../core/error-handling');
      const errorHandler = getErrorHandler();
      
      return await errorHandler.handleComponentError(
        name,
        () => loadComponent(name),
        this.config.fallbackComponent
      );
    }
    
    return this.getComponent(name);
  }

  /**
   * Validate component props at runtime
   */
  validateProps(componentName: string, props: unknown): { success: boolean; error?: string; data?: any } {
    if (!this.config.enableRuntimeValidation) {
      return { success: true, data: props };
    }

    const info = this.config.useLazyLoading ? 
      this.lazyComponents[componentName]?.metadata : 
      this.components[componentName]?.metadata;
      
    if (!info?.schema) {
      return { success: true, data: props };
    }

    try {
      const validatedProps = info.schema.parse(props);
      return { success: true, data: validatedProps };
    } catch (error) {
      // Use error handler for validation errors
      const { getErrorHandler } = require('../core/error-handling');
      const errorHandler = getErrorHandler();
      
      const validationError = error instanceof z.ZodError
        ? new Error(`Props validation failed: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`)
        : new Error(`Props validation failed: ${String(error)}`);
      
      return errorHandler.handleValidationError(
        componentName,
        props,
        validationError,
        this.config.strictMode || false
      );
    }
  }

  /**
   * Get agent options string
   */
  getAgentOptions(): string {
    if (this.config.useLazyLoading) {
      return Object.entries(this.lazyComponents)
        .map(([key, info]) => `${key}: ${info.description}`)
        .join('\n');
    }
    
    return getAgentOptions(this.config.enabledComponents);
  }

  /**
   * Register custom component at runtime
   */
  register(name: string, component: ComponentType<any>, metadata?: any): void {
    if (!this.config.customComponents) {
      this.config.customComponents = {};
    }
    
    this.config.customComponents[name] = component;
    this._cache = null; // Clear cache
  }

  /**
   * Refresh component cache (for development)
   */
  refresh(): void {
    this._cache = null;
    this._lazyCache = null;
  }

  /**
   * Preload specific components
   */
  async preload(componentNames: string[]): Promise<void> {
    if (this.config.useLazyLoading) {
      await preloadComponents(componentNames);
    }
  }

  /**
   * Get bundle optimization stats
   */
  getBundleStats() {
    return getBundleStats();
  }

  /**
   * Get available component names
   */
  get availableComponents(): string[] {
    return this.config.useLazyLoading ? 
      Object.keys(this.lazyComponents) : 
      Object.keys(this.components);
  }
}

// Global magic registry instance
let _globalRegistry: MagicRegistry | null = null;

/**
 * Get or create global magic registry
 */
export function getMagicRegistry(config?: MagicRegistryConfig): MagicRegistry {
  if (!_globalRegistry) {
    _globalRegistry = new MagicRegistry(config);
  }
  return _globalRegistry;
}

/**
 * Magical single import - get everything you need
 */
export function useAIP(config?: MagicRegistryConfig) {
  const registry = getMagicRegistry(config);
  
  return {
    // Legacy sync API (works with eager loading)
    components: config?.useLazyLoading === false ? registry.components : registry.lazyComponents,
    getComponent: (name: string) => registry.getComponent(name),
    
    // Modern async API (works with lazy loading)
    getComponentAsync: (name: string) => registry.getComponentAsync(name),
    preload: (componentNames: string[]) => registry.preload(componentNames),
    
    // Common API
    getAgentOptions: () => registry.getAgentOptions(),
    register: (name: string, component: ComponentType<any>, metadata?: any) => 
      registry.register(name, component, metadata),
    availableComponents: registry.availableComponents,
    refresh: () => registry.refresh(),
    validateProps: (componentName: string, props: unknown) => 
      registry.validateProps(componentName, props),
    validateInterfaceData: (uiType: string, uiData: unknown) => {
      if (!isValidInterfaceType(uiType)) {
        return { success: false, error: `Invalid interface type: ${uiType}`, data: null };
      }
      return validateInterfaceData(uiType, uiData);
    },
    
    // Performance optimization
    getBundleStats: () => registry.getBundleStats()
  };
}

// Export for convenience
export { ComponentInfo, LazyComponentInfo, MagicRegistryConfig };
export * from './auto';
export * from './lazy';