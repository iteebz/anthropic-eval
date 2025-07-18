# AgentInterface React

[![npm version](https://badge.fury.io/js/agentinterface.svg)](https://badge.fury.io/js/agentinterface)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

> **Interface rendering for AI agents.**

```typescript
import { AgentInterfaceRenderer } from 'agentinterface';

<AgentInterfaceRenderer 
  agentResponse={response} 
  components={registry}
/>
```

## 🎨 Rendering Interfaces

AgentInterface renders rich UI components selected by AI agents:

- **Component renderer** - `AgentInterfaceRenderer` handles all interface types
- **Auto registry** - Components register themselves automatically
- **Error boundaries** - Graceful fallbacks when rendering fails
- **Theme integration** - Built-in light/dark mode support

## ✨ Example Usage

**Basic Rendering**
```typescript
import { AgentInterfaceRenderer, registerComponents } from 'agentinterface';

function ChatMessage({ response }) {
  return (
    <AgentInterfaceRenderer
      agentResponse={response}
      components={getComponentRegistry()}
      onSendMessage={(msg) => sendMessage(msg)}
    />
  );
}
```

**Custom Components**
```typescript
import { RendererComponentProps } from 'agentinterface';

function MyComponent({ content, interfaceData }: RendererComponentProps) {
  return <div>{content}</div>;
}

// Register custom component
registerComponents({
  'my-component': MyComponent
});
```

**Error Boundaries**
```typescript
import { InterfaceErrorBoundary } from 'agentinterface';

<InterfaceErrorBoundary fallbackContent="Error loading component">
  <AgentInterfaceRenderer {...props} />
</InterfaceErrorBoundary>
```

## 📦 Installation

```bash
npm install agentinterface
```

**Peer Dependencies**
```bash
npm install react react-dom
```

## 🧩 Supported Components

**Core Components** - markdown, card-grid, timeline, key-insights, expandable-section  
**Rich Components** - blog-post, code-snippet, contact-form, image-gallery, comparison-table  
**Interactive Components** - conversation-thread, decision-tree, progress-tracker, inline-reference  

## 🔧 Extensibility

```typescript
// Custom components auto-register
registerComponents({
  'custom-chart': ChartComponent,
  'custom-table': TableComponent
});

// Check if component exists
if (isValidInterfaceType('custom-chart')) {
  // Component is registered
}
```

## 📄 License

MIT - Build whatever you want.

---

**AgentInterface React: Interface rendering for AI agents.**