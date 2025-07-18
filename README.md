# AgentInterface

[![PyPI version](https://badge.fury.io/py/agentinterface.svg)](https://badge.fury.io/py/agentinterface)
[![npm version](https://badge.fury.io/js/agentinterface.svg)](https://badge.fury.io/js/agentinterface)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

> **Let agents compose interfaces.**

```python
# Agent chooses UI based on context
from agentinterface import aip_response

response = aip_response("timeline", {"events": sales_data})
# Returns: {"type": "timeline", "data": {"events": [...]}}
```

```typescript
// React renders whatever agent chose
import { AgentInterfaceRenderer } from "agentinterface";

<AgentInterfaceRenderer agentResponse={response} />;
```

## 💡 The Core Insight

**Traditional**: Human codes "if sales_data then render_chart()"
**AgentInterface**: Agent decides "this sales data should be a timeline because it's event-based"

**Agents become the controller** - They choose the optimal UI based on:
- Data characteristics (events → timeline, products → cards)
- User context (technical vs casual audience)
- Conversation flow (detailed vs summary view)

## 🚀 What It Solves

- **🎯 Agent-as-controller** - Agents decide presentation layer, not just data
- **🔄 Auto-discovery** - Agents learn new components automatically
- **🎨 Rich rendering** - Timeline, cards, code, forms, galleries out of the box
- **🧩 Contextual choice** - Same data, different UI based on context
- **🛡️ Resilient** - Error boundaries and graceful fallbacks
- **📱 Cross-platform** - Python responds, React renders
- **🔥 Zero-ceremony extensibility** - Write component, register, done
- **🚀 Infinite domain customization** - Portfolio, e-commerce, analytics, docs

## 📐 How It Works

**1. Agent gets component specs** - Knows what UI components are available

```python
# Agent receives format instructions like:
# "Available components: timeline, card-grid, chart..."
# "Use timeline for chronological data, cards for collections..."
```

**2. Agent chooses optimal UI** - Based on data + context

```python
from agentinterface import aip_response

# Same sales data, different contexts:
# For analyst: "Show me Q4 performance"
response = aip_response("chart", {"data": sales_data, "type": "bar"})

# For manager: "What happened in Q4?"
response = aip_response("timeline", {"events": sales_events})

# Returns: {"type": "timeline", "data": {"events": [...]}}
```

**3. React renders agent's choice** - No hardcoded UI logic

```typescript
import { AgentInterfaceRenderer } from "agentinterface";

// Agent chose timeline? Renders timeline.
// Agent chose chart? Renders chart.
<AgentInterfaceRenderer agentResponse={response} />;
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

## ✨ Contextual Decision Making

**Same data, different UI based on context:**

```python
# User: "Show me the team"
# Agent thinks: "Names + photos = card layout"
response = aip_response("card-grid", {"cards": team_data})

# User: "When did everyone join?"
# Agent thinks: "Chronological data = timeline"
response = aip_response("timeline", {"events": join_dates})

# User: "Who's the most senior?"
# Agent thinks: "Rankings = table with sorting"
response = aip_response("table", {"data": seniority_data, "sortBy": "years"})
```

**Auto-discovery in action:**

```python
# Register new component
register_component("org-chart", description="Hierarchical team structure")

# Agent immediately starts using it:
# User: "Show me the reporting structure"
# Agent: "Hierarchy = org-chart component"
response = aip_response("org-chart", {"nodes": hierarchy_data})
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

## 🔥 Why Agent-as-Controller Changes Everything

**The Paradigm Shift** - From "display this data" to "choose how to display this data"

```python
# OLD WAY: Human hardcodes UI logic
if data_type == "events":
    return render_timeline(events)
elif data_type == "products":
    return render_cards(products)

# NEW WAY: Agent chooses based on context
# Agent automatically decides timeline vs cards vs table
# based on data characteristics + user context
response = agent.respond(user_query)  # Agent picks optimal UI
```

**Zero-Ceremony Extensibility** - Write component, agent uses it

```typescript
// Step 1: Write a React component
export function ProjectCard({ data }) {
  return <div className="project-card">{data.title}</div>
}

// Step 2: Register with semantic description
register_component("project-card", {
  description: "Showcase individual projects with tech stack",
  triggers: ["projects", "portfolio", "work"]
})

// Step 3: Agent automatically uses it (0 code changes)
// User: "Show me your projects"
// Agent: *sees "projects" trigger* → uses project-card
```

**Contextual Intelligence** - Same data, optimal UI for each context

```python
# Technical audience: "Show me the system architecture"
# Agent chooses: detailed diagram with code snippets
aip_response("architecture-diagram", {"components": system_data})

# Business audience: "Show me the system overview"
# Agent chooses: high-level flowchart with business value
aip_response("process-flow", {"steps": business_flow})

# Same underlying data, contextually optimal presentation
```

**Infinite Domain Customization** - Any vertical, any complexity

```python
# Portfolio: Agent chooses project-card for showcasing work
# E-commerce: Agent chooses product-catalog for browsing
# Analytics: Agent chooses dashboard-metrics for KPIs
# Medical: Agent chooses patient-timeline for history
# Legal: Agent chooses case-summary for documents

# Agent learns your domain and chooses appropriate UIs
```

## 🔧 Format Instructions - How Agents Learn Components

**The Secret Sauce** - Agents get dynamic component specifications

```python
# When agent starts, it receives instructions like:
"""
Available components:
- timeline: {"type": "timeline", "data": {"events": [...]}} 
  Use for chronological data, history, progress
- card-grid: {"type": "card-grid", "data": {"cards": [...]}}
  Use for collections, galleries, team members
- chart: {"type": "chart", "data": {"data": [...], "type": "bar"}}
  Use for analytics, metrics, comparisons
"""

# Agent uses these specs to make optimal choices
# No hardcoded logic - agent decides based on context
```

**Register Once, Agent Uses Forever**

```python
# Register domain-specific component
register_component(ComponentConfig(
    name="financial-dashboard",
    description="Real-time financial metrics with charts",
    triggers=["portfolio", "stocks", "trading", "performance"]
))

# Agent immediately starts using it:
# User: "How's my portfolio performing?"
# Agent: *sees "portfolio" trigger* → chooses financial-dashboard
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
