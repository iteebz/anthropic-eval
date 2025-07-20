# AIP Architecture

## Overview

The Agent Interface Protocol (AIP) enables direct agent-to-component communication through structured JSON, allowing AI agents to reason about optimal UI presentation without interpretation layers.

## Core Architecture

### Protocol Flow
```
Agent Analysis → Component Selection → Structured Data → Direct Rendering
```

### Key Components
1. **Core Primitives** - Universal UI patterns
2. **Extension System** - Domain-specific components
3. **Validation Layer** - Schema validation and error handling
4. **Rendering Engine** - Component instantiation and rendering

## Package Structure

```
agentinterface/
├── docs/                    # Architecture documentation
│   ├── README.md
│   ├── architecture.md
│   └── primitives-vs-extensions.md
├── js/                      # JavaScript/TypeScript implementation
│   ├── src/
│   │   ├── components/      # Core primitive components
│   │   ├── core/           # Schemas and validation
│   │   ├── protocol/       # Protocol definitions
│   │   └── react/          # React renderer
│   └── package.json
├── python/                  # Python implementation
│   ├── src/
│   │   └── agentinterface/  # Python package
│   └── package.json
└── examples/               # Usage examples
```

## Design Principles

### 1. Primitive-First Design
- Focus on universal UI patterns
- Clear separation between core and extensions
- Composable architecture

### 2. Agent-Centric
- Designed for AI agent reasoning
- Clear selection criteria for each component
- Structured data output for reliable parsing

### 3. Framework Agnostic
- Core protocol independent of UI framework
- React implementation as reference
- Extensible to other frameworks

### 4. Graceful Degradation
- Fallback to markdown for invalid data
- Error boundaries for component failures
- Progressive enhancement approach

## Integration Points

### With Cogency
- Skills can use AIP for presentation decisions
- `visualize()` skill consumes AIP component registry
- Clear separation between cognitive and presentation layers

### With Host Applications
- Extensions define domain-specific components
- Host applications register extension packs
- Core primitives remain stable across domains

## Implementation Architecture

### Component Registration System

**Build-Time Discovery**: Components discovered through configuration, ensuring SSR-safe extensibility.

```typescript
// src/components/aip/timeline.tsx

// JSON Schema - directly serializable
export const TimelineSchema = {
  type: "object",
  properties: {
    events: {
      type: "array",
      items: {
        type: "object",
        properties: {
          date: { type: "string" },
          title: { type: "string" },
          description: { type: "string" }
        },
        required: ["date", "title"]
      }
    }
  },
  required: ["events"]
} as const;

// Discoverable metadata export
export const metadata = {
  type: "timeline",
  description: "Chronological events with rich details",
  schema: TimelineSchema,
  category: "interface",
  tags: ["chronological", "events"]
} as const;

export function Timeline({ events }) {
  return <div className="timeline">...</div>
}
```

### Build-Time Registry Generation

**Component Discovery** (Build-time scanning):
```javascript
// agentinterface build script
async function buildRegistry(config) {
  const registry = { version: "0.1.0", components: {} };
  
  // Scan all configured component paths
  for (const pattern of config.components) {
    const files = await glob(pattern);
    
    for (const file of files) {
      const content = await readFile(file, 'utf8');
      
      // Extract metadata export
      const metadataMatch = content.match(/export const metadata = ({[\s\S]*?}) as const/);
      if (metadataMatch) {
        const metadata = eval(`(${metadataMatch[1]})`);
        registry.components[metadata.type] = metadata;
      }
    }
  }
  
  await writeFile('./agentinterface-registry.json', JSON.stringify(registry, null, 2));
}
```

### Python Protocol Integration

**Static Registry Loading**:
```python
# python/src/agentinterface/registry/core.py
def _load_core_registry(self):
    """Load core components from package registry"""
    registry_file = Path(__file__).parent / "registry.json"
    
    if registry_file.exists():
        with open(registry_file, 'r') as f:
            registry_data = json.load(f)
            
        for component_type, component_data in registry_data["components"].items():
            spec = ComponentSpec.from_dict(component_data)
            self._components[component_type] = spec

def register_component(component_type: str, description: str, **kwargs):
    """Register custom components at runtime"""
    get_registry().register(component_type, description, **kwargs)
```

## Agent Interface Protocol (AIP) v0.1.0

### Message Format

**Success Response**:
```json
{
  "type": "component-type",
  "data": {
    // Component-specific data
  }
}
```

**Error Response**:
```json
{
  "type": "error",
  "data": {
    "code": "unknown_component",
    "message": "Component type 'invalid-type' is not registered",
    "available_types": ["markdown", "timeline", "card-grid"]
  }
}
```

### Validation Strategy

- **Build-time**: Schema validation during registry generation
- **Runtime**: Component props validated against JSON Schema before rendering

**Validation Error Response**:
```json
{
  "type": "error",
  "data": {
    "code": "validation_error",
    "message": "Invalid data for component 'timeline'",
    "details": ["events is required", "events[0].date must be a string"]
  }
}
```

### Environment Configuration

```bash
# Set custom registry path
export AGENTINTERFACE_REGISTRY=/path/to/registry.json

# Default: ./node_modules/agentinterface/dist/registry.json
```

## Evolution Strategy

1. **Phase 1**: Establish core primitives with build-time registry
2. **Phase 2**: Create extension ecosystem with filesystem scanning
3. **Phase 3**: Framework integrations with configurable loading
4. **Phase 4**: Cognitive framework integration with AIP v0.1.0

This architecture ensures clean separation of concerns while enabling rich, domain-specific functionality through composable primitives and robust build-time discovery.