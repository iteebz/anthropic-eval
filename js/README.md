# agentinterface (React)

[![NPM version](https://img.shields.io/npm/v/agentinterface)](https://www.npmjs.com/package/agentinterface)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/iteebz/agentinterface/blob/main/LICENSE)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/iteebz/agentinterface/javascript.yml?branch=main)](https://github.com/iteebz/agentinterface/actions?query=workflow%3Ajavascript.yml)

Agent-driven dynamic UI selection system for React applications. Analyzes content and selects appropriate UI components automatically based on agent responses.

## Overview

The AgentInterface system enables AI agents to dynamically choose the most appropriate UI components for their responses. Instead of static interfaces, agents can analyze their output content and select from a library of specialized components like project cards, timelines, technical deep dives, and more.

## Core Innovation

- **Content-Aware UI Selection**: Agents choose UI components based on response content analysis
- **Type-Safe Component Registry**: Zod validation ensures reliable data structures
- **Graceful Degradation**: Safe defaults and error boundaries maintain functionality
- **Performance Monitoring**: Built-in tracking and optimization tools
- **Developer Experience**: Comprehensive debugging and visualization tools

## Architecture

```
src/
├── core/           # Validation, schemas, core interfaces
├── react/          # React-specific components and hooks
├── components/     # UI component library (kebab-case files)
├── types/          # TypeScript definitions
├── utils/          # Utilities, parsers, performance monitoring
└── index.ts        # Main package exports
```

## Quick Start

### Installation

```bash
npm install agentinterface
```

### Basic Usage

```tsx
import { AgentInterfaceRenderer, ComponentRegistry } from "agentinterface";

function App() {
  const agentResponse = `
    THINKING: User is asking about projects, should show project cards
    RESPONSE: Here are my latest projects
    INTERFACE_TYPE: project_cards
    INTERFACE_DATA: {
      "projects": [
        {
          "title": "AI Agent System", 
          "description": "Multi-node reasoning system",
          "technologies": ["Python", "React"],
          "status": "active"
        }
      ]
    }
  `;

  return (
    <AgentInterfaceRenderer
      agentResponse={agentResponse}
      components={ComponentRegistry}
      onSendMessage={(msg) => console.log("User message:", msg)}
    />
  );
}
```

## Agent Response Format

Agents structure their responses with special markers:

```
THINKING: [internal reasoning - optional]
RESPONSE: [user-facing content]
INTERFACE_TYPE: [component_name]
INTERFACE_DATA: [JSON data for component]
```

### Supported Interface Types

- `markdown` - Default conversational renderer
- `project_cards` - Portfolio display with metadata
- `timeline` - Chronological progression with events
- `key_insights` - Categorized insights/principles/frameworks
- `tech_deep_dive` - Technical explanations with code examples
- `expandable_detail` - Collapsible long-form content
- `inline_link` - Inline expandable references

## Component Development

### Creating New Components

Components follow a standard interface:

```tsx
import { InterfaceComponentProps } from "agentinterface";

interface MyComponentData {
  title: string;
  items: string[];
}

interface MyComponentProps extends InterfaceComponentProps {
  interfaceData: MyComponentData;
}

export function MyComponent({
  content,
  interfaceData,
  className,
}: MyComponentProps) {
  return (
    <div className={className}>
      <h2>{interfaceData.title}</h2>
      {/* Component implementation */}
    </div>
  );
}
```

### Adding Validation Schema

```tsx
import { z } from "zod";

export const MyComponentDataSchema = z.object({
  title: z.string().min(1).max(200),
  items: z.array(z.string()).max(10).default([]),
});

// Add to INTERFACE_VALIDATION_SCHEMAS
export const INTERFACE_VALIDATION_SCHEMAS = {
  // ... existing schemas
  my_component: MyComponentDataSchema,
} as const;
```

## Error Handling

### Component-Aware Error Boundaries

```tsx
import { ComponentErrorBoundary } from "agentinterface";

<ComponentErrorBoundary
  interfaceType="project_cards"
  content={content}
  interfaceData={data}
  showDebugInfo={isDev}
  onError={(error, errorInfo, context) => {
    // Custom error handling
  }}
>
  <MyComponent {...props} />
</ComponentErrorBoundary>;
```

### Error Boundary Features

- **Component-Specific Fallbacks**: Each interface type has tailored error UI
- **Performance Tracking**: Monitors render performance impact
- **Smart Retry Logic**: Automatic retry with backoff
- **Development Debugging**: Detailed error information in dev mode

## Development Tools

### Development Debugging

Use browser dev tools and console logging to debug agent response parsing and component validation.

### Component Playground

Interactive development environment for testing components with live JSON editing and schema validation.

## Performance

### Built-in Monitoring

```tsx
import { createPerformanceTracker } from "agentinterface/utils";

const tracker = createPerformanceTracker();

// Track operations
tracker.track("validation", validationTime);
tracker.track("render", renderTime);

// Get statistics
const stats = tracker.getAllStats();
```

### Performance Categories

- **Low Impact**: < 16ms (< 1 frame at 60fps)
- **Medium Impact**: 16-100ms
- **High Impact**: > 100ms

## API Reference

### Core Exports

```tsx
// Main renderer
export { AgentInterfaceRenderer } from "./react";

// Error boundaries
export { ComponentErrorBoundary } from "./react";

// Validation
export { validateInterfaceData, isValidInterfaceType } from "./core";

// Types
export type { InterfaceType, InterfaceData } from "./types";

// Components
export { ComponentRegistry } from "./components";

// Utilities
export { parseAgentResponse, createPerformanceTracker } from "./utils";
```

### TypeScript Support

Full TypeScript support with strict type checking:

```tsx
import type {
  InterfaceType,
  InterfaceData,
  ProjectCardsData,
  TimelineData,
} from "agentinterface";
```

## Migration Guide

### From Legacy System

1. **Update Imports**:

   ```tsx
   // Before
   import { ComponentRegistry } from "@/components/registry";

   // After
   import { ComponentRegistry } from "agentinterface";
   ```

2. **Component Updates**:

   ```tsx
   // Before
   import { validateInterfaceData } from "@/types/interface-validation";

   // After
   import { validateInterfaceData } from "agentinterface/core";
   ```

3. **Error Boundary Changes**:

   ```tsx
   // Before
   import { ReactErrorBoundary } from "@/components/common/ErrorBoundary";

   // After
   import { ComponentErrorBoundary } from "agentinterface";
   ```

## Contributing

1. **Component Naming**: Files use kebab-case, exports use PascalCase
2. **Registry Keys**: Use snake_case for consistency with backend
3. **Validation**: All components must have Zod schemas
4. **Error Handling**: Implement graceful degradation
5. **Performance**: Monitor and optimize render times

## License

MIT - See LICENSE file for details.

## Links

- [GitHub Repository](https://github.com/iteebz/agentinterface)
- [Documentation](https://docs.agentinterface.dev)
- [Examples](https://examples.agentinterface.dev)
