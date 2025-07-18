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

import { PRIMITIVE_COMPONENTS } from './primitives';

/**
 * Auto-discover components via filesystem reflection
 */
function _discoverComponents(): Record<string, ComponentInfo> {
  const registry: Record<string, ComponentInfo> = {};
  
  for (const [name, component] of Object.entries(PRIMITIVE_COMPONENTS)) {
    const metadata = _extractComponentMetadata(component, name);
    registry[name] = {
      name,
      description: metadata.description || _inferDescription(name),
      component,
      type: name as InterfaceType,
      metadata
    };
  }
  
  return registry;
}

/**
 * Manual registry fallback for build environments
 */
function _getManualRegistry(): Record<string, ComponentInfo> {
  // Import all components manually
  const registry: Record<string, ComponentInfo> = {};
  
  // This will be populated by the build process
  try {
    const components = {
      'card-grid': require('../components/interface/card-grid.tsx'),
      'code-snippet': require('../components/interface/code-snippet.tsx'),
      'comparison-table': require('../components/interface/comparison-table.tsx'),
      'contact-form': require('../components/interface/contact-form.tsx'),
      'conversation-thread': require('../components/interface/conversation-thread.tsx'),
      'decision-tree': require('../components/interface/decision-tree.tsx'),
      'expandable-section': require('../components/interface/expandable-section.tsx'),
      'image-gallery': require('../components/interface/image-gallery.tsx'),
      'inline-reference': require('../components/interface/inline-reference.tsx'),
      'key-insights': require('../components/interface/key-insights.tsx'),
      'markdown': require('../components/interface/markdown.tsx'),
      'progress-tracker': require('../components/interface/progress-tracker.tsx'),
      'timeline': require('../components/interface/timeline.tsx')
    };
    
    for (const [name, module] of Object.entries(components)) {
      const componentName = Object.keys(module).find(key => 
        key !== 'default' && typeof module[key] === 'function'
      );
      if (componentName && module[componentName]) {
        const component = module[componentName];
        const metadata = _extractComponentMetadata(component, name);
        
        registry[name] = {
          name,
          description: metadata.description || _inferDescription(name),
          component,
          type: name as InterfaceType,
          metadata
        };
      }
    }
  } catch (error) {
    console.warn('Manual registry failed:', error);
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