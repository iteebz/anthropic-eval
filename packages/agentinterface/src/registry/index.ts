/**
 * Component Registry
 */

import React from 'react';
import type { ComponentMetadata } from '../schema/aip';

export interface ComponentRegistration {
  metadata: ComponentMetadata;
  component: React.ComponentType<any>;
}

const registry = new Map<string, ComponentRegistration>();

export function registerComponent(metadata: ComponentMetadata, component: React.ComponentType<any>): void {
  registry.set(metadata.type, { metadata, component });
}

export function renderAIPComponent(block: any, key?: string): React.ReactElement | null {
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