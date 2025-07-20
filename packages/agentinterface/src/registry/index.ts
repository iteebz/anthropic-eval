/**
 * Component Registry
 */

import React from 'react';
import type { ComponentMetadata } from '../schema/aip';

export type { ComponentMetadata };

export interface ComponentRegistration {
  metadata: ComponentMetadata;
  component: React.ComponentType<any>;
}

const registry = new Map<string, ComponentRegistration>();

export function register({ type, schema, render }: { 
  type: string; 
  schema: any; 
  render: React.ComponentType<any>; 
}): void {
  registry.set(type, { 
    metadata: { 
      type, 
      schema, 
      description: `${type} component`,
      category: 'interface',
      tags: [type]
    }, 
    component: render 
  });
}

export function render(block: any, key?: string): React.ReactElement | null {
  const registration = registry.get(block.type);
  if (!registration) {
    console.warn(`Unknown component type: ${block.type}`);
    return React.createElement('div', { key }, `Unknown component: ${block.type}`);
  }

  return React.createElement(registration.component, { ...block, key });
}

export function getRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}

export function getAllMetadata(): ComponentMetadata[] {
  return Array.from(registry.values()).map(reg => reg.metadata);
}

export function extendRegistry(extensions: Map<string, ComponentRegistration>): void {
  extensions.forEach((registration, type) => {
    registry.set(type, registration);
  });
}

export function isRegistered(type: string): boolean {
  return registry.has(type);
}