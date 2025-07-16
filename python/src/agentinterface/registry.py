"""Component registry - Auto-discoverable and extensible."""

from typing import Dict, Any, Callable, List
from pydantic import BaseModel


class ComponentConfig(BaseModel):
    """Base configuration for AIP components."""
    type: str
    props: Dict[str, Any] = {}
    
    def to_json(self) -> Dict[str, Any]:
        return {"type": self.type, "props": self.props}

# Component registry - auto-discoverable and extensible
COMPONENT_REGISTRY: Dict[str, Dict[str, Any]] = {
    # AIP Core Components
    "markdown": {
        "default_props": {"content": ""},
        "prop_generators": {"content": lambda signals, content: content}
    },
    "card-grid": {
        "default_props": {"cards": []},
        "prop_generators": {"cards": lambda signals, content: []}
    },
    "expandable-section": {
        "default_props": {"title": "Details", "content": ""},
        "prop_generators": {
            "title": lambda signals, content: signals.get("title", "Details"),
            "content": lambda signals, content: content
        }
    },
    "timeline": {
        "default_props": {"events": []},
        "prop_generators": {
            "events": lambda signals, content: [{"date": "Now", "title": "Current", "description": content}]
        }
    },
    "key-insights": {
        "default_props": {"insights": []},
        "prop_generators": {
            "insights": lambda signals, content: [line.strip()[2:] for line in content.split('\n') if line.strip().startswith(('- ', '* ', '• '))] or [content[:100]]
        }
    },
    "code-snippet": {
        "default_props": {"code": "", "language": "python"},
        "prop_generators": {
            "code": lambda signals, content: content,
            "language": lambda signals, content: signals.get("language", "python")
        }
    },
    "contact-form": {
        "default_props": {"fields": [], "action": "/contact"},
        "prop_generators": {
            "fields": lambda signals, content: [
                {"name": "name", "type": "text", "label": "Name", "required": True},
                {"name": "email", "type": "email", "label": "Email", "required": True},
                {"name": "message", "type": "textarea", "label": "Message", "required": True}
            ]
        }
    },
    "image-gallery": {
        "default_props": {"images": [], "layout": "grid"},
        "prop_generators": {
            "images": lambda signals, content: [{"src": "/placeholder.jpg", "alt": "Portfolio work", "title": "Project"}]
        }
    },
    # Extension Components (can be registered by consumers)
    "project-card": {
        "default_props": {"title": "", "description": "", "technologies": [], "links": {}},
        "prop_generators": {
            "title": lambda signals, content: content.split('\n')[0][:50] if content else "Project",
            "description": lambda signals, content: content[:200] + "..." if len(content) > 200 else content,
            "technologies": lambda signals, content: [],
            "links": lambda signals, content: {"github": "#", "demo": "#"}
        }
    },
    "skills-display": {
        "default_props": {"skills": [], "display_type": "grid"},
        "prop_generators": {
            "skills": lambda signals, content: [{"name": "Full Stack Development", "level": "Advanced", "category": "Technical"}]
        }
    },
    "blog-post": {
        "default_props": {"title": "Untitled", "content": "", "metadata": {}},
        "prop_generators": {
            "title": lambda signals, content: signals.get("title", "Untitled"),
            "content": lambda signals, content: content,
            "metadata": lambda signals, content: signals.get("metadata", {})
        }
    }
}

def register_component_type(component_type: str, default_props: Dict[str, Any] = None, prop_generators: Dict[str, Callable] = None):
    """Register a new component type with the registry."""
    COMPONENT_REGISTRY[component_type] = {
        "default_props": default_props or {},
        "prop_generators": prop_generators or {}
    }

def make_component_config(component_type: str, signals: Dict[str, Any], content: str) -> ComponentConfig:
    """Create a component config using the registry."""
    if component_type not in COMPONENT_REGISTRY:
        raise ValueError(f"Unknown component type: {component_type}")
    
    config = COMPONENT_REGISTRY[component_type]
    props = config["default_props"].copy()
    
    # Apply prop generators
    for prop_name, generator in config["prop_generators"].items():
        try:
            props[prop_name] = generator(signals, content)
        except Exception:
            # Keep default if generator fails
            pass
    
    return ComponentConfig(type=component_type, props=props)

def get_available_components() -> List[str]:
    """Get list of all available component types."""
    return list(COMPONENT_REGISTRY.keys())