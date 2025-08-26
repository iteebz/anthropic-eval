# Schema Architecture Update

## Unified Schema Approach

The AgentInterface architecture has been updated to use a single schema definition per component, eliminating duplication and improving maintainability.

### Previous Architecture Issues
- **Dual Schema Definitions**: Both JSON Schema and Zod schema per component
- **Duplication Maintenance**: Changes required in multiple places
- **Validation Inconsistency**: Potential mismatches between schema formats

### Updated Architecture Benefits
- **Single Source of Truth**: Zod schema serves as canonical definition
- **Type Safety**: Direct TypeScript inference from Zod schemas
- **Simplified Maintenance**: One schema definition per component
- **Consistent Validation**: Single validation path eliminates inconsistencies

## Component Structure Pattern

All AIP components now follow this standardized pattern:

```typescript
import { z } from 'zod';
import { register } from '../../registry';

// Single Zod schema definition
const ComponentValidator = z.object({
  requiredField: z.string(),
  optionalField: z.string().optional(),
});

// Metadata for agent discovery
export const metadata = {
  type: 'component-name',
  description: 'Component description with usage context',
  schema: ComponentValidator,
  category: 'interface',
  tags: ['relevant', 'keywords'],
} as const;

// TypeScript inference from schema
type ComponentProps = z.infer<typeof ComponentValidator>;

// Component implementation
export function Component(props: ComponentProps) {
  return <div>...</div>;
}

// Registry registration
register({
  type: 'component-name',
  schema: ComponentValidator,
  render: Component,
});
```

## Agent Training Integration

The updated architecture supports improved agent training through:

### Enhanced Metadata
- **Descriptive context**: Components include usage context in descriptions
- **Selection triggers**: Metadata includes when to use each component
- **Composition guidance**: Information about component combinations

### Validation Consistency
- **Predictable errors**: Single validation path produces consistent error messages
- **Clear requirements**: Zod schemas provide clear data structure requirements
- **Type safety**: Full TypeScript support for component development

## Documentation Synchronization

This architectural update aligns with documentation improvements:

1. **Protocol Documentation**: Updated to reflect Zod-based validation
2. **Agent Training Guide**: Leverages consistent component metadata
3. **Component Registry**: Single schema source enables automated documentation

## Migration Status

- ✅ **Timeline Component**: Updated to single Zod schema
- ✅ **Markdown Component**: Updated to single Zod schema  
- 🔄 **Remaining Components**: To be updated following same pattern
- 🔄 **Documentation**: Updated to reflect architectural changes

This architecture update provides the foundation for reliable agent training and consistent developer experience across the AgentInterface ecosystem.