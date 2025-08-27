# Agent Interface Protocol (AIP) Documentation

## Overview

AIP enables direct agent-to-component communication through structured JSON, allowing AI agents to reason about optimal UI presentation without interpretation layers.

## Core Documents

### Architecture & Design
- **[Primitives vs Extensions](./primitives-vs-extensions.md)** - Core philosophy and component classification
- **[Protocol Specification](./protocol-specification.md)** - Technical protocol details
- **[Extension Development](./extension-development.md)** - Creating domain-specific components

### Implementation
- **[JavaScript/TypeScript Guide](../js/README.md)** - Frontend implementation
- **[Python Guide](../python/README.md)** - Backend integration
- **[Examples](../examples/)** - Working code examples

### Reference
- **[Component Registry](../js/src/protocol/interface-registry.md)** - Available components
- **[Core Schemas](../js/src/core/schemas.ts)** - TypeScript definitions
- **[Python Schemas](../python/src/agentinterface/schemas.py)** - Python validation

## Quick Start

```json
{
  "component": "timeline",
  "data": {
    "events": [
      {"date": "2024-01-01", "title": "Project Started", "description": "..."}
    ]
  }
}
```

## Philosophy

**Agent Reasoning → UI Selection → Structured Data → Direct Rendering**

AIP transforms AI interfaces from tool-based interactions to conversational reasoning about optimal presentation, maintaining clean separation between cognitive operations and UI primitives.