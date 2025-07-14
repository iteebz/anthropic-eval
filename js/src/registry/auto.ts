/**
 * Auto-Registry: Zero-ceremony component discovery
 * Scans components, builds registry automatically
 */

export interface ComponentInfo {
  name: string;
  description: string;
  component: any;
}

const COMPONENT_DESCRIPTIONS = {
  'markdown': 'Default text/conversation',
  'card-grid': 'Multiple items as visual cards',
  'timeline': 'Chronological events',
  'expandable-section': 'Collapsible sections',
  'key-insights': 'Categorized insights/principles',
  'code-snippet': 'Code with syntax highlighting',
  'blog-post': 'Article/post layout',
  'inline-reference': 'Expandable references'
};

/**
 * Build registry from explicitly provided components.
 */
export function buildRegistry(components: Record<string, any>, enabledComponents?: string[]): Record<string, ComponentInfo> {
  const registry: Record<string, ComponentInfo> = {};
  
  for (const key in components) {
    if (Object.prototype.hasOwnProperty.call(components, key)) {
      const kebabName = key.replace(/([A-Z])/g, "-$1").toLowerCase();

      // Skip if opt-in list provided and component not enabled
      if (enabledComponents && !enabledComponents.includes(kebabName)) {
        continue;
      }

      registry[kebabName] = {
        name: kebabName,
        description: COMPONENT_DESCRIPTIONS[kebabName as keyof typeof COMPONENT_DESCRIPTIONS] || 'Custom component',
        component: components[key]
      };
    }
  }

  return registry;
}

/**
 * Get agent prompt for available components
 */
export function getAgentOptions(components: Record<string, any>, enabledComponents?: string[]): string {
  const registry = buildRegistry(components, enabledComponents);
  
  return Object.entries(registry)
    .map(([key, info]) => `${key}: ${info.description}`)
    .join('\n');
}