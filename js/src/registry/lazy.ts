/**
 * Lazy Loading Registry: Dynamic imports with caching
 * Zero-ceremony component discovery with performance optimization
 */

import { ComponentType } from 'react';
import { z } from 'zod';
import { InterfaceType } from '../types';

export interface LazyComponentInfo {
  name: string;
  description: string;
  type: InterfaceType;
  metadata?: ComponentMetadata;
  loader: () => Promise<ComponentType<any>>;
}

export interface ComponentMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  examples?: string[];
  props?: Record<string, any>;
  schema?: z.ZodSchema<any>;
}

// Component cache for loaded components
const _loadedComponents = new Map<string, ComponentType<any>>();

/**
 * Lazy discovery: scan filesystem but don't load components until needed
 */
function _discoverLazyComponents(): Record<string, LazyComponentInfo> {
  const registry: Record<string, LazyComponentInfo> = {};
  
  // Lazy discovery: scan filesystem but don't load components
  const componentModules = import.meta.glob('../components/interface/*.tsx');
  
  for (const [path, moduleLoader] of Object.entries(componentModules)) {
    const filename = path.split('/').pop()?.replace('.tsx', '') || '';
    const kebabName = filename.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    registry[kebabName] = {
      name: kebabName,
      description: _inferDescription(kebabName),
      type: kebabName as InterfaceType,
      loader: async () => {
        // Check cache first
        if (_loadedComponents.has(kebabName)) {
          return _loadedComponents.get(kebabName)!;
        }
        
        // Load component dynamically
        const module = await moduleLoader() as any;
        const componentName = Object.keys(module).find(key => 
          key !== 'default' && typeof module[key] === 'function'
        );
        
        if (componentName && module[componentName]) {
          const component = module[componentName];
          const metadata = _extractComponentMetadata(component, filename);
          
          // Update registry metadata
          registry[kebabName].metadata = metadata;
          
          // Cache the loaded component
          _loadedComponents.set(kebabName, component);
          
          return component;
        }
        
        throw new Error(`Component ${kebabName} not found in ${path}`);
      }
    };
  }
  
  return registry;
}

/**
 * Extract component metadata from JSDoc or component properties
 */
function _extractComponentMetadata(component: ComponentType<any>, filename: string): ComponentMetadata {
  // Look for JSDoc comments or component.meta property
  const meta = (component as any).meta || {};
  
  return {
    description: meta.description,
    category: meta.category || 'interface',
    tags: meta.tags || [],
    examples: meta.examples || [],
    props: meta.props || {},
    schema: meta.schema
  };
}

/**
 * Infer description from component name using heuristics
 */
function _inferDescription(kebabName: string): string {
  const descriptions: Record<string, string> = {
    'markdown': 'Default text/conversation',
    'card-grid': 'Multiple items as visual cards',
    'timeline': 'Chronological events',
    'expandable-section': 'Collapsible sections',
    'key-insights': 'Categorized insights/principles',
    'code-snippet': 'Code with syntax highlighting',
    'blog-post': 'Article/post layout',
    'inline-reference': 'Expandable references',
    'contact-form': 'Contact form with validation',
    'image-gallery': 'Image gallery with accessibility'
  };
  
  return descriptions[kebabName] || `${kebabName.replace(/-/g, ' ')} component`;
}

// Cache the discovered lazy components
let _lazyComponentCache: Record<string, LazyComponentInfo> | null = null;

/**
 * Get lazy component registry (cached)
 */
export function getLazyComponents(): Record<string, LazyComponentInfo> {
  if (!_lazyComponentCache) {
    _lazyComponentCache = _discoverLazyComponents();
  }
  return _lazyComponentCache;
}

/**
 * Load component by name with caching
 */
export async function loadComponent(name: string): Promise<ComponentType<any> | null> {
  const lazyComponents = getLazyComponents();
  const componentInfo = lazyComponents[name];
  
  if (!componentInfo) {
    return null;
  }
  
  try {
    return await componentInfo.loader();
  } catch (error) {
    console.error(`Failed to load component ${name}:`, error);
    return null;
  }
}

/**
 * Preload components for faster access
 */
export async function preloadComponents(names: string[]): Promise<void> {
  const loadPromises = names.map(name => loadComponent(name));
  await Promise.all(loadPromises);
}

/**
 * Get component synchronously if already loaded
 */
export function getLoadedComponent(name: string): ComponentType<any> | null {
  return _loadedComponents.get(name) || null;
}

/**
 * Check if component is already loaded
 */
export function isComponentLoaded(name: string): boolean {
  return _loadedComponents.has(name);
}

/**
 * Build lazy registry with optional filtering
 */
export function buildLazyRegistry(enabledComponents?: string[]): Record<string, LazyComponentInfo> {
  const discovered = getLazyComponents();
  
  if (!enabledComponents) {
    return discovered;
  }
  
  const filtered: Record<string, LazyComponentInfo> = {};
  for (const name of enabledComponents) {
    if (discovered[name]) {
      filtered[name] = discovered[name];
    }
  }
  
  return filtered;
}

/**
 * Get agent prompt for available components
 */
export function getLazyAgentOptions(enabledComponents?: string[]): string {
  const registry = buildLazyRegistry(enabledComponents);
  
  return Object.entries(registry)
    .map(([key, info]) => `${key}: ${info.description}`)
    .join('\n');
}

/**
 * Force refresh lazy component cache (for development)
 */
export function refreshLazyComponentCache(): void {
  _lazyComponentCache = null;
  _loadedComponents.clear();
}

/**
 * Get bundle size optimization stats
 */
export function getBundleStats(): {
  totalComponents: number;
  loadedComponents: number;
  loadedPercentage: number;
  availableComponents: string[];
  loadedComponentNames: string[];
} {
  const total = Object.keys(getLazyComponents()).length;
  const loaded = _loadedComponents.size;
  
  return {
    totalComponents: total,
    loadedComponents: loaded,
    loadedPercentage: total > 0 ? (loaded / total) * 100 : 0,
    availableComponents: Object.keys(getLazyComponents()),
    loadedComponentNames: Array.from(_loadedComponents.keys())
  };
}