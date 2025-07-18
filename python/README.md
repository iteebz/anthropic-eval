# AgentInterface Python

[![PyPI version](https://badge.fury.io/py/agentinterface.svg)](https://badge.fury.io/py/agentinterface)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

> **Component selection for AI agents.**

```python
from agentinterface import select_component

result = select_component("Show quarterly sales by region")
# Returns: card-grid component with structured data
```

## 🎛️ Choosing Components

AgentInterface analyzes agent intent and selects the appropriate UI component:

- **Magic selection** - `select_component()` picks the right interface automatically
- **Intent analysis** - Understands what agents want to display
- **Component registry** - Extensible catalog of available interfaces
- **Prompt integration** - `get_interface_options()` for agent prompting

## ✨ Example Usage

**Magic Component Selection**

```python
from agentinterface import select_component

# Automatic selection
result = select_component("Display user analytics dashboard")

# With preferences
result = select_component(
    "Q4 sales performance by team",
    preferred_types=['card-grid', 'timeline']
)
```

**Component Options for Prompting**

```python
from agentinterface import get_interface_options

# Get clean descriptions for agent prompts
options = get_interface_options(['markdown', 'card-grid', 'timeline'])

# Returns:
# markdown: Default text/conversation
# card-grid: Multiple items as visual cards
# timeline: Chronological events
```

**Custom Components**

```python
from agentinterface import register_component, ComponentConfig

register_component(ComponentConfig(
    name="custom-viz",
    description="Custom data visualization",
    triggers=["chart", "graph", "visualization"]
))
```

## 📦 Installation

```bash
pip install agentinterface
```

## 🧩 Supported Components

**Core Components** - markdown, card-grid, timeline, key-insights, expandable-section  
**Rich Components** - blog-post, code-snippet, contact-form, image-gallery, comparison-table  
**Interactive Components** - conversation-thread, decision-tree, progress-tracker, inline-reference

## 🔧 Extensibility

```python
# Custom components auto-register
from agentinterface import ComponentConfig

config = ComponentConfig(
    name="my-component",
    description="Custom component",
    triggers=["keyword1", "keyword2"]
)

register_component(config)
```

## 📄 License

MIT - Build whatever you want.

---

**AgentInterface Python: Component selection for AI agents.**
