/**
 * Registry - Runtime component registration and rendering
 * 
 * Clean extensibility via runtime composition.
 */

import React from 'react';

export interface ComponentMetadata {
  type: string;
  description: string;
  schema: any; // JSON Schema
  category?: string;
  tags?: string[];
}

export interface ComponentRegistration {
  metadata: ComponentMetadata;
  render: (props: any) => React.JSX.Element;
}

class ComponentRegistry {
  private components = new Map<string, ComponentRegistration>();

  register(metadata: ComponentMetadata, render: (props: any) => React.JSX.Element) {
    this.components.set(metadata.type, { metadata, render });
  }

  get(type: string): ComponentRegistration | undefined {
    return this.components.get(type);
  }

  getAll(): Record<string, ComponentMetadata> {
    const result: Record<string, ComponentMetadata> = {};
    for (const [type, registration] of this.components) {
      result[type] = registration.metadata;
    }
    return result;
  }

  getTypes(): string[] {
    return Array.from(this.components.keys());
  }

  isRegistered(type: string): boolean {
    return this.components.has(type);
  }
}

// Global registry instance
export const registry = new ComponentRegistry();

// Public API
export function registerComponent(metadata: ComponentMetadata, render: (props: any) => React.JSX.Element) {
  registry.register(metadata, render);
}

export function getRegisteredTypes(): string[] {
  return registry.getTypes();
}

export function getAllMetadata(): Record<string, ComponentMetadata> {
  return registry.getAll();
}

export function isRegistered(type: string): boolean {
  return registry.isRegistered(type);
}

/**
 * Render an AIP component with validation
 */
export function renderAIPComponent(component: { type: string; data: any }): React.JSX.Element | null {
  const registration = registry.get(component.type);
  
  if (!registration) {
    console.warn(`No registration found for component type: ${component.type}`);
    return React.createElement('div', { 
      style: { 
        padding: '1rem', 
        border: '1px dashed #ccc', 
        color: '#666' 
      } 
    }, `Unknown component: ${component.type}`);
  }

  // TODO: Add JSON Schema validation here
  return registration.render(component.data);
}

/**
 * Extension API - register multiple components at once
 */
export function extendRegistry(components: Array<{
  metadata: ComponentMetadata;
  render: (props: unknown) => React.JSX.Element;
}>) {
  for (const component of components) {
    registry.register(component.metadata, component.render);
  }
}

