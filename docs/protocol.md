# Agent Interface Protocol (AIP) v0.1.0

## Overview

The Agent Interface Protocol (AIP) is a JSON-based communication standard that allows AI agents to specify UI components for rendering. Inspired by the Model Context Protocol (MCP), AIP provides a structured way for agents to choose optimal user interfaces based on context and data.

## Message Format

### Success Response
```json
{
  "type": "component-type",
  "data": {
    // Component-specific data
  }
}
```

### Error Response
```json
{
  "type": "error",
  "data": {
    "code": "error_code",
    "message": "Human readable error message",
    // Additional error-specific fields
  }
}
```

## Example Messages

### Timeline Component
```json
{
  "type": "timeline",
  "data": {
    "events": [
      {
        "date": "2024-01-15",
        "title": "Project Started",
        "description": "Initial repository setup and planning"
      },
      {
        "date": "2024-02-01", 
        "title": "First Release",
        "description": "MVP launched with core features"
      }
    ]
  }
}
```

### Card Grid Component
```json
{
  "type": "card-grid",
  "data": {
    "cards": [
      {
        "title": "React Project",
        "description": "Modern web application built with React and TypeScript",
        "tags": ["React", "TypeScript", "Vite"],
        "links": [
          {"type": "github", "url": "https://github.com/user/project"},
          {"type": "demo", "url": "https://project.demo.com"}
        ]
      }
    ]
  }
}
```

### Markdown Component
```json
{
  "type": "markdown",
  "data": {
    "content": "# Hello World\n\nThis is **bold** text with [links](https://example.com)."
  }
}
```

## Error Handling

### Unknown Component Type
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

### Validation Error
```json
{
  "type": "error",
  "data": {
    "code": "validation_error",
    "message": "Invalid data for component 'timeline'",
    "component_type": "timeline",
    "details": [
      "events is required",
      "events[0].date must be a string"
    ]
  }
}
```

### Registry Error
```json
{
  "type": "error",
  "data": {
    "code": "registry_error",
    "message": "Component registry could not be loaded",
    "registry_path": "/path/to/registry.json"
  }
}
```

## Validation

### Build-time Validation
- Component schemas validated during registry generation
- Invalid schemas prevent build completion
- Type safety enforced through TypeScript/Zod

### Runtime Validation
- Component props validated against JSON Schema before rendering
- Invalid data results in validation error response
- Graceful degradation to error component

## Core Components

### markdown
- **Description**: Rich text with formatting and syntax highlighting
- **Required**: `content` (string)

### timeline
- **Description**: Chronological events with rich details
- **Required**: `events` (array of objects with `date`, `title`)
- **Optional**: `description` per event

### card-grid
- **Description**: Visual card layouts with actions and metadata
- **Required**: `cards` (array of objects with `title`)
- **Optional**: `description`, `tags`, `links` per card

### key-insights
- **Description**: Categorized insights with expandable sections
- **Required**: `insights` (array of objects with `title`, `description`)
- **Optional**: `category` per insight

### expandable-section
- **Description**: Collapsible content areas
- **Required**: `sections` (array of objects with `title`, `content`)
- **Optional**: `defaultExpanded` per section

### code-snippet
- **Description**: Syntax-highlighted code blocks
- **Required**: `code` (string)
- **Optional**: `language`, `title`

## Extension Pattern

Custom components can be registered by adding `.aip` metadata:

```typescript
export function CustomComponent(props) {
  return <div>...</div>
}

CustomComponent.aip = {
  type: "custom-component",
  description: "Custom component description",
  schema: zodToJsonSchema(CustomSchema),
  category: "custom"
}
```

## Python SDK Usage

```python
from agentinterface import get_format_instructions, aip_response, aip_error

# Get available components for agent
instructions = get_format_instructions()

# Generate success response
response = aip_response("timeline", {
    "events": [{"date": "2024", "title": "Event"}]
})

# Generate error response
error = aip_error("validation_error", "Invalid data", details=["field required"])
```

## JavaScript SDK Usage

```typescript
import { AIPRenderer } from 'agentinterface'

function Chat() {
  return <AIPRenderer response={agentResponse} />
}
```

## Configuration

### Registry Path
```bash
export AGENTINTERFACE_REGISTRY=/path/to/registry.json
```

Default: `./node_modules/agentinterface/dist/registry.json`

## Versioning

- **Current Version**: 0.1.0
- **Backward Compatibility**: Maintained within minor versions
- **Breaking Changes**: Require major version bump