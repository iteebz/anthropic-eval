/**
 * Auto-Registry: Zero-ceremony component discovery
 * Scans components, builds registry automatically
 */

import { readdirSync } from 'fs';
import { join } from 'path';

export interface ComponentInfo {
  name: string;
  description: string;
  component: any;
}

const COMPONENT_DESCRIPTIONS = {
  'markdown': 'Default text/conversation',
  'card-grid': 'Multiple items as visual cards',
  'timeline': 'Chronological events',
  'expandable-sections': 'Collapsible sections',
  'key-insights': 'Categorized insights/principles',
  'code-snippet': 'Code with syntax highlighting',
  'blog-post': 'Article/post layout',
  'inline-reference': 'Expandable references'
};

/**
 * Auto-discover components via filesystem reflection
 */
export function buildRegistry(componentsPath = './components', enabledComponents?: string[]): Record<string, ComponentInfo> {
  const registry: Record<string, ComponentInfo> = {};
  
  try {
    const files = readdirSync(componentsPath).filter(f => 
      f.endsWith('.tsx') && 
      f !== 'index.ts' && 
      f !== 'MarkdownRenderer.tsx' &&
      !f.startsWith('ui/')
    );

    for (const file of files) {
      const name = file.replace('.tsx', '').replace('-', '_');
      const kebabName = file.replace('.tsx', '');
      
      // Skip if opt-in list provided and component not enabled
      if (enabledComponents && !enabledComponents.includes(kebabName)) {
        continue;
      }

      try {
        const component = require(join(componentsPath, file));
        const componentExport = component[Object.keys(component)[0]]; // Get first export
        
        registry[kebabName] = {
          name: kebabName,
          description: COMPONENT_DESCRIPTIONS[kebabName as keyof typeof COMPONENT_DESCRIPTIONS] || 'Custom component',
          component: componentExport
        };
      } catch (error) {
        console.warn(`Failed to load component ${file}:`, error);
      }
    }
  } catch (error) {
    console.warn('Failed to build auto-registry:', error);
  }

  return registry;
}

/**
 * Get agent prompt for available components
 */
export function getAgentOptions(enabledComponents?: string[]): string {
  const registry = buildRegistry('./components', enabledComponents);
  
  return Object.entries(registry)
    .map(([key, info]) => `${key}: ${info.description}`)
    .join('\n');
}