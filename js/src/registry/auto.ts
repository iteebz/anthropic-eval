/**
 * Auto-Registry: Zero-ceremony component discovery
 * Scans components, builds registry automatically via filesystem reflection
 */

import { ComponentType } from 'react';
import { z } from 'zod';
import { InterfaceType } from '../types';

export interface ComponentInfo {
  name: string;
  description: string;
  component: ComponentType<any>;
  type: InterfaceType;
  metadata?: ComponentMetadata;
}

export interface ComponentMetadata {
  description?: string;
  category?: string;
  tags?: string[];
  examples?: string[];
  props?: Record<string, any>;
  schema?: z.ZodSchema<any>;
}

/**
 * Auto-discover components via filesystem reflection
 */
function _discoverComponents(): Record<string, ComponentInfo> {
  const registry: Record<string, ComponentInfo> = {};
  
  // Auto-magical discovery: scan filesystem and build registry
  const componentModules = import.meta.glob('../components/interface/*.tsx', { eager: true });
  
  for (const [path, module] of Object.entries(componentModules)) {
    const filename = path.split('/').pop()?.replace('.tsx', '') || '';
    const kebabName = filename.replace(/([A-Z])/g, '-$1').toLowerCase();
    
    const moduleExports = module as any;
    const componentName = Object.keys(moduleExports).find(key => 
      key !== 'default' && typeof moduleExports[key] === 'function'
    );
    
    if (componentName && moduleExports[componentName]) {
      const component = moduleExports[componentName];
      const metadata = _extractComponentMetadata(component, filename);
      
      registry[kebabName] = {
        name: kebabName,
        description: metadata.description || _inferDescription(kebabName),
        component,
        type: kebabName as InterfaceType,
        metadata
      };
    }
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
    props: meta.props || {}
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

// Cache the discovered components
let _componentCache: Record<string, ComponentInfo> | null = null;

/**
 * Get discovered components (cached)
 */
export function getDiscoveredComponents(): Record<string, ComponentInfo> {
  if (!_componentCache) {
    _componentCache = _discoverComponents();
  }
  return _componentCache;
}

/**
 * Build registry with optional filtering
 */
export function buildRegistry(enabledComponents?: string[]): Record<string, ComponentInfo> {
  const discovered = getDiscoveredComponents();
  
  if (!enabledComponents) {
    return discovered;
  }
  
  const filtered: Record<string, ComponentInfo> = {};
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
export function getAgentOptions(enabledComponents?: string[]): string {
  const registry = buildRegistry(enabledComponents);
  
  return Object.entries(registry)
    .map(([key, info]) => `${key}: ${info.description}`)
    .join('\n');
}

/**
 * Force refresh component cache (for development)
 */
export function refreshComponentCache(): void {
  _componentCache = null;
}

/**
 * Get component by name
 */
export function getComponent(name: string): ComponentInfo | null {
  const registry = getDiscoveredComponents();
  return registry[name] || null;
}