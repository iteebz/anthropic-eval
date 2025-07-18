/**
 * Simple Registry - No magic, just works
 */

import type { ComponentType } from 'react';
import type { RendererComponentProps } from '../utils/componentProps';

// Global registry
const COMPONENT_REGISTRY: Record<string, ComponentType<RendererComponentProps>> = {};

/**
 * Register extension components with AIP
 */
export const registerComponents = (components: Record<string, ComponentType<RendererComponentProps>>) => {
  Object.assign(COMPONENT_REGISTRY, components);
};

/**
 * Get all registered components (core + extensions)
 */
export const getComponentRegistry = () => {
  return { ...COMPONENT_REGISTRY };
};

/**
 * Check if a component type is valid
 */
export const isValidInterfaceType = (type: string): boolean => {
  return type in COMPONENT_REGISTRY;
};

/**
 * Get component names for each category
 */
export const getComponentTypes = () => {
  const all = Object.keys(COMPONENT_REGISTRY);
  
  return {
    core: all.filter(name => !name.includes('-')), // Simple heuristic
    extensions: all.filter(name => name.includes('-')),
    all
  };
};