/**
 * AgentInterface CLI - Build tools for SSR registry generation
 */

export { RegistryGenerator } from './registry/generator';
export { RegistryBuilder } from './registry/builder';
export { MetadataValidator } from './registry/validator';
export { RegistrySync } from './registry/sync';

export type {
  RegistryOutput,
  ComponentRegistryEntry,
} from './registry/generator';
export type { RegistryEntry, ComponentMetadata } from './registry/builder';
