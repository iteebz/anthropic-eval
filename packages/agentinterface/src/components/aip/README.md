# AIP Components Directory

This directory contains AgentInterface Protocol (AIP) components that follow the standardized metadata pattern for build-time discovery and registry generation.

## Component Structure

Each AIP component should follow this standardized pattern:

```typescript
// Component schema using JSON Schema
export const ComponentNameSchema = {
  type: "object",
  properties: {
    // Schema definition
  },
  required: ["field1", "field2"]
} as const;

// Discoverable metadata export
export const metadata = {
  type: "component-name",
  description: "Component description for agents",
  schema: ComponentNameSchema,
  category: "interface" | "custom",
  tags: ["tag1", "tag2"]
} as const;

// Component implementation
export function ComponentName(props: ComponentProps) {
  return <div>...</div>;
}
```

## Build-Time Discovery

Components in this directory are automatically:
1. Scanned during the build process
2. Validated for proper metadata structure
3. Included in the generated registry
4. Synchronized with the Python package

## Requirements

- Each component must export a `metadata` object
- Metadata must include: `type`, `description`, `schema`, `category`
- Schema must be valid JSON Schema format
- Component type names must use kebab-case format
- Components should be self-contained with minimal dependencies

## Categories

- `interface`: Standard AgentInterface components
- `custom`: User-defined custom components

## Migration

Components from the `../interface/` directory will be migrated here following the standardized pattern.