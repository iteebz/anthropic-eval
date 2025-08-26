/**
 * CANONICAL AI() WRAPPER - Zero ceremony component registration
 */

import React from 'react';

interface ComponentMetadata {
  type: string;
  description: string;
  component: React.ComponentType<any>;
}

// Simple registry - collect components
const _registry = new Map<string, ComponentMetadata>();

/**
 * AI() - Canonical wrapper for auto-registering components
 * 
 * Usage:
 *   const Card = ai('card', 'Display content in card format', CardComponent);
 * 
 * @param type - Component type identifier
 * @param description - What this component does
 * @param component - React component
 * @returns Enhanced component (same as input, but registered)
 */
export function ai<T extends React.ComponentType<any>>(
  type: string,
  description: string,
  component: T
): T {
  // Register in global registry
  _registry.set(type, {
    type,
    description,
    component
  });

  // Return original component unchanged
  return component;
}

/**
 * Get all registered components
 */
export function getRegisteredComponents(): ComponentMetadata[] {
  return Array.from(_registry.values());
}

/**
 * Get component types only
 */
export function getComponentTypes(): string[] {
  return Array.from(_registry.keys());
}

/**
 * Get component by type
 */
export function getComponent(type: string): React.ComponentType<any> | undefined {
  return _registry.get(type)?.component;
}