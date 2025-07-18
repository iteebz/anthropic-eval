# AgentInterface

[![PyPI version](https://badge.fury.io/py/agentinterface.svg)](https://badge.fury.io/py/agentinterface)
[![npm version](https://badge.fury.io/js/agentinterface.svg)](https://badge.fury.io/js/agentinterface)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

> **Let agents compose interfaces.**

```python
# Agent describes intent
from agentinterface import select_component

component = select_component("Show quarterly sales trends")
# Returns: timeline component with structured data
```

```typescript
// React renders the interface
import { AgentInterfaceRenderer } from "agentinterface";

<AgentInterfaceRenderer agentResponse={response} components={registry} />;
```

## 🚀 What It Solves

- **🎯 Intent to interface** - Agents describe what they want, get the right UI component
- **🔄 Auto-discovery** - Components register themselves, no manual wiring
- **🎨 Rich rendering** - Timeline, cards, code, forms, galleries out of the box
- **🧩 Composable** - Slot-based architecture for complex layouts
- **🛡️ Resilient** - Error boundaries and graceful fallbacks
- **📱 Cross-platform** - Python selects, React renders

## 📐 How It Works

**Agent Side (Python)** - Intent to component selection

```python
from agentinterface import select_component

# Agent describes what it wants to show
result = select_component("Display user analytics dashboard")
# Returns: appropriate component with structured data
```

**Client Side (React)** - Component to rendered interface

```typescript
import { AgentInterfaceRenderer } from "agentinterface";

// Render whatever the agent selected
<AgentInterfaceRenderer
  agentResponse={response}
  components={registry}
  onSendMessage={handleMessage}
/>;
```

## 📦 Installation

### Python Library

```bash
pip install agentinterface
```

### JavaScript/React Library

```bash
npm install agentinterface
# or
pnpm add agentinterface
```

## ✨ Example Usage

**Agent Intent → Component Selection**

```python
from agentinterface import select_component

# Agent expresses what it wants to show
result = select_component("Show user engagement metrics over time")
# Returns: timeline component with engagement data

result = select_component("Display top performing products")
# Returns: card-grid component with product cards
```

**Component → Rendered Interface**

```typescript
import { AgentInterfaceRenderer } from "agentinterface";

function ChatMessage({ response }) {
  return (
    <AgentInterfaceRenderer
      agentResponse={response}
      components={registry}
      onSendMessage={sendMessage}
    />
  );
}
```

## 🧩 Available Interfaces

**Core Components**

- `markdown` - Rich text with formatting and syntax highlighting
- `card-grid` - Visual card layouts with actions and metadata
- `timeline` - Chronological events with rich details
- `key-insights` - Categorized insights with expandable sections
- `expandable-section` - Collapsible content areas

**Rich Components**

- `blog-post` - Article layouts with headers, images, and formatting
- `code-snippet` - Syntax-highlighted code blocks with copy functionality
- `contact-form` - Interactive forms with validation
- `image-gallery` - Responsive photo grids with lightbox
- `comparison-table` - Data tables with sorting and filtering

**Interactive Components**

- `conversation-thread` - Nested conversation displays
- `decision-tree` - Interactive decision flows
- `progress-tracker` - Step-by-step progress indicators
- `inline-reference` - Expandable reference links

## 🔧 Extensibility

**Custom Components**

```typescript
// Register your own interfaces
registerComponents({
  "my-dashboard": MyDashboardComponent,
});
```

**Custom Selection Logic**

```python
from agentinterface import register_component, ComponentConfig

register_component(ComponentConfig(
    name="custom-viz",
    description="Data visualization interface",
    triggers=["chart", "graph", "analytics"]
))
```

## 📚 Documentation

- [Python Library Documentation](./python/README.md)
- [JavaScript/React Library Documentation](./js/README.md)
- [Component Gallery](./docs/components.md)
- [Architecture Guide](./docs/architecture.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

## 📄 License

MIT - Build whatever you want.

---

**AgentInterface: Let agents compose interfaces.**
