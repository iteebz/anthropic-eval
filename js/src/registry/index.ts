/**
 * AIP Component Registry - Auto-magical component discovery and registration
 * ZERO CEREMONY - everything auto-discovered via filesystem reflection
 */

// NEW: Auto-magical imports
export { useAIP, getMagicRegistry, MagicRegistry } from './magic';
export { getDiscoveredComponents, buildRegistry, getAgentOptions, getComponent } from './auto';
export type { ComponentInfo, ComponentMetadata, MagicRegistryConfig } from './magic';

// Legacy support - gradually migrate consumers to useAIP()
import { getMagicRegistry } from './magic';
import type { RendererComponentProps } from '../utils/componentProps';

/**
 * Legacy: Get all registered components (core + extensions)
 * @deprecated Use useAIP() instead for magical zero-ceremony experience
 */
export const getComponentRegistry = () => {
  const registry = getMagicRegistry();
  const components: Record<string, React.ComponentType<RendererComponentProps>> = {};
  
  for (const [name, info] of Object.entries(registry.components)) {
    components[name] = info.component;
  }
  
  return components;
};

/**
 * Legacy: Register extension components with AIP
 * @deprecated Use useAIP().register() instead
 */
export const registerComponents = (components: Record<string, React.ComponentType<RendererComponentProps>>) => {
  const registry = getMagicRegistry();
  
  for (const [name, component] of Object.entries(components)) {
    registry.register(name, component);
  }
};

/**
 * Legacy: Check if a component type is valid
 * @deprecated Use useAIP().availableComponents.includes() instead
 */
export const isValidInterfaceType = (type: string): boolean => {
  const registry = getMagicRegistry();
  return registry.availableComponents.includes(type);
};

/**
 * Legacy: Get component names for each category
 * @deprecated Use useAIP().availableComponents instead
 */
export const getComponentTypes = () => {
  const registry = getMagicRegistry();
  const all = registry.availableComponents;
  
  return {
    core: all.filter(name => registry.components[name]?.metadata?.category !== 'custom'),
    extensions: all.filter(name => registry.components[name]?.metadata?.category === 'custom'),
    all
  };
};

// Export for convenience - but prefer useAIP()
export const AIP_CORE_COMPONENTS = getComponentRegistry();