/**
 * Agent Interface Protocol (AIP) Component Registry
 *
 * Typed registry system for AIP components. This replaces the markdown-based
 * registry to provide type safety and programmatic access to component definitions.
 */
import { type ZodSchema } from "zod";
import { type ComponentType } from "react";

export interface ComponentDefinition<T = unknown> {
  /** Component name/identifier */
  name: string;
  /** Human-readable description */
  description: string;
  /** When should the agent select this component? */
  selectionCriteria: string[];
  /** Zod schema for validation */
  schema: ZodSchema<T>;
  /** Safe default data for fallback */
  safeDefaults: T;
  /** Optional React component for rendering */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component?: ComponentType<any>;
  /** Component category */
  category: "core" | "domain-specific";
  /** Component usage examples */
  examples?: string[];
}

export interface ComponentRegistry {
  /** Get all registered components */
  getAll(): ComponentDefinition[];

  /** Get component by name */
  get(name: string): ComponentDefinition | undefined;

  /** Get components by category */
  getByCategory(category: "core" | "domain-specific"): ComponentDefinition[];

  /** Register a new component */
  register<T>(definition: ComponentDefinition<T>): void;

  /** Check if component is registered */
  has(name: string): boolean;

  /** Get component names */
  getNames(): string[];
}

export class AIPComponentRegistry implements ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();

  getAll(): ComponentDefinition[] {
    return Array.from(this.components.values());
  }

  get(name: string): ComponentDefinition | undefined {
    return this.components.get(name);
  }

  getByCategory(category: "core" | "domain-specific"): ComponentDefinition[] {
    return this.getAll().filter((comp) => comp.category === category);
  }

  register<T>(definition: ComponentDefinition<T>): void {
    this.components.set(definition.name, definition);
  }

  has(name: string): boolean {
    return this.components.has(name);
  }

  getNames(): string[] {
    return Array.from(this.components.keys());
  }
}

/** Global registry instance */
export const componentRegistry = new AIPComponentRegistry();
