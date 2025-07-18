# AgentInterface Python

[![PyPI version](https://badge.fury.io/py/agentinterface.svg)](https://badge.fury.io/py/agentinterface)
[![Python 3.9+](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

> **Explicit component specification for AI agents.**

```python
from agentinterface import aip_response

response = aip_response("card-grid", {"cards": sales_data})
# Returns: JSON spec for card-grid component
```

## 🎛️ Specifying Components

AgentInterface provides explicit protocol for component specification:

- **AIP Protocol** - `aip_response()` creates JSON spec for any component
- **Component helpers** - `aip_card()`, `aip_markdown()`, `aip_chart()` convenience functions
- **Component registry** - Extensible catalog of available interfaces
- **Zero ceremony** - Auto-discovery keeps DX magical

## ✨ Example Usage

**Explicit Component Specification**

```python
from agentinterface import aip_response, aip_card

# Direct specification
response = aip_response("card-grid", {"cards": dashboard_data})

# Convenience helpers
response = aip_card("Sales Team Q4", {
    "metrics": sales_metrics,
    "trend": "up"
})
```

**Component Registry for Discovery**

```python
from agentinterface import get_available_components

# Get all registered components
components = get_available_components()

# Returns component metadata:
# {"markdown": {"description": "Default text/conversation", ...},
#  "card-grid": {"description": "Multiple items as visual cards", ...}}
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
