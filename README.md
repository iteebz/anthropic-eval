# AgentInterface

[![PyPI version](https://badge.fury.io/py/agentinterface.svg)](https://badge.fury.io/py/agentinterface)
[![npm version](https://badge.fury.io/js/agentinterface.svg)](https://badge.fury.io/js/agentinterface)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

> **Let agents compose interfaces.**

```python
# Agent specifies interface explicitly
from agentinterface import aip_response

response = aip_response("timeline", {"events": sales_data})
# Returns: JSON spec for timeline component
```

```typescript
// React renders the interface
import { AgentInterfaceRenderer } from "agentinterface";

<AgentInterfaceRenderer agentResponse={response} components={registry} />;
```

## 🚀 What It Solves

- **🎯 Explicit protocol** - Agents specify components via AIP (Agent Interface Protocol)
- **🔄 Auto-discovery** - Components register themselves, no manual wiring
- **🎨 Rich rendering** - Timeline, cards, code, forms, galleries out of the box
- **🧩 Composable** - Slot-based architecture for complex layouts
- **🛡️ Resilient** - Error boundaries and graceful fallbacks
- **📱 Cross-platform** - Python responds, React renders
- **🔥 Zero-ceremony extensibility** - Write component, register, done
- **🚀 Infinite domain customization** - Portfolio, e-commerce, analytics, docs
- **🧠 Agentic AI power** - Agents automatically use new components

## 📐 How It Works

**Agent Side (Python)** - Explicit component specification

```python
from agentinterface import aip_response

# Agent specifies component and data
response = aip_response("card-grid", {"cards": dashboard_data})
# Returns: JSON spec for card-grid component
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

**Agent Response → Component Specification**

```python
from agentinterface import aip_response

# Agent specifies timeline for engagement data
response = aip_response("timeline", {"events": engagement_data})

# Agent specifies card-grid for products
response = aip_response("card-grid", {"cards": product_data})
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

## 🔥 Why AIP is Revolutionary for Agentic AI

**Zero-Ceremony Extensibility** - The game-changer for AI agents

```typescript
// Step 1: Write a React component (5 minutes)
export function ProjectCard({ data }) {
  return <div className="project-card">{data.title}</div>
}

// Step 2: Register it (1 line)
registerComponents({ 'project-card': ProjectCard })

// Step 3: Agent automatically uses it (0 code changes)
// Agent: aip_response("project-card", {title: "My Project"})
```

**Infinite Domain Customization** - Build for any vertical

```python
# Portfolio Domain
aip_response("technical-competencies", {"skills": expert_skills})
aip_response("project-card", {"title": "AI Platform", "tech": ["Python", "React"]})

# E-commerce Domain  
aip_response("product-catalog", {"products": inventory})
aip_response("shopping-cart", {"items": cart_items})

# Analytics Domain
aip_response("dashboard-metrics", {"kpis": performance_data})
aip_response("trend-analysis", {"timeseries": metrics})
```

**Scalable Complexity** - Same API, any complexity

```typescript
// Simple: 61-line BlogPost component
<BlogPost data={{title: "Post", content: "Content"}} />

// Complex: 260-line TechnicalCompetencies with matrix/timeline views
<TechnicalCompetencies data={{displayFormat: "matrix", competencies: skills}} />

// Agent doesn't care - identical API for both
```

**Agentic AI Superpowers** - Agents get smarter automatically

- **Context-aware rendering** - Technical vs casual audience
- **Multi-turn conversations** - Remember user preferences  
- **Personalized experiences** - No hardcoded logic required
- **Domain expertise** - Agents choose optimal interfaces

## 🔧 Extensibility

**The Power Pattern** - Write once, agents use forever

```python
# Register domain-specific components
register_component(ComponentConfig(
    name="financial-dashboard",
    description="Real-time financial metrics",
    triggers=["portfolio", "stocks", "trading"]
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
