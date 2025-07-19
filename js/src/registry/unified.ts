/**
 * Unified AIP Registry - Clean, Extensible, Robust
 * 
 * Registry-driven schema and renderer pattern.
 * Each component type registers itself with optional validation + render function.
 */

import React from 'react';
import { z, type ZodSchema } from 'zod';

export interface ComponentRegistration<T = any> {
  type: string;
  schema?: ZodSchema<T>;
  render: (props: T) => React.JSX.Element;
}

// Global registry - single source of truth
const AIP_REGISTRY: Record<string, ComponentRegistration<any>> = {};

/**
 * Get all registered component types
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(AIP_REGISTRY);
}

/**
 * Get all component registrations
 */
export function getAllRegistrations(): Record<string, ComponentRegistration<any>> {
  return { ...AIP_REGISTRY };
}

/**
 * Register a component with the AIP system
 */
export function registerComponent<T>(registration: ComponentRegistration<T>): void {
  AIP_REGISTRY[registration.type] = registration;
}

/**
 * Check if a component type is registered
 */
export function isRegistered(type: string): boolean {
  return type in AIP_REGISTRY;
}

/**
 * Render an AIP component with validation
 */
export function renderAIPComponent(component: { type: string; data: any }): React.JSX.Element | null {
  const registration = AIP_REGISTRY[component.type];
  
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

  const { schema, render } = registration;

  // Optional validation with safeParse
  if (schema) {
    const result = schema.safeParse(component.data);
    if (!result.success) {
      console.error(`Validation failed for ${component.type}:`, result.error.format());
      return React.createElement('div', {
        style: { 
          padding: '1rem', 
          border: '1px solid #f00', 
          color: '#f00', 
          backgroundColor: '#fee' 
        }
      }, `Invalid data for ${component.type}: ${result.error.issues.map(i => i.message).join(', ')}`);
    }
    return render(result.data);
  }

  // No schema = pass raw data
  return render(component.data);
}

