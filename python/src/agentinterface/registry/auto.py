"""Auto-Registry: Zero-ceremony component discovery via reflection"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional

from pydantic import BaseModel, validator


class ComponentCategory(str, Enum):
    """Component categories for auto-discovery"""

    CORE = "core"
    INTERFACE = "interface"
    EXTENSION = "extension"
    CUSTOM = "custom"


@dataclass
class ComponentMetadata:
    """Type-safe component metadata"""

    description: str = ""
    category: ComponentCategory = ComponentCategory.CORE
    tags: List[str] = field(default_factory=list)
    examples: List[str] = field(default_factory=list)
    props_schema: Optional[Dict[str, Any]] = None

    @classmethod
    def from_docstring(cls, docstring: str) -> "ComponentMetadata":
        """Extract metadata from component docstring"""
        if not docstring:
            return cls()

        lines = docstring.strip().split("\n")
        description = lines[0] if lines else ""

        # Parse structured metadata (future enhancement)
        return cls(description=description)


class ComponentConfig(BaseModel):
    """Type-safe component configuration"""

    type: str
    props: Dict[str, Any] = {}
    metadata: ComponentMetadata = ComponentMetadata()

    @validator("type")
    def validate_type(self, v):
        """Ensure component type is valid"""
        if not v or not isinstance(v, str):
            raise ValueError("Component type must be a non-empty string")
        return v.lower().replace("_", "-")

    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "type": self.type,
            "props": self.props,
            "metadata": {
                "description": self.metadata.description,
                "category": self.metadata.category.value,
                "tags": self.metadata.tags,
            },
        }


class AutoRegistry:
    """Auto-magical component registry with type safety"""

    def __init__(self):
        self._components: Dict[str, ComponentConfig] = {}
        self._prop_generators: Dict[str, Dict[str, Callable]] = {}
        self._cache_dirty = True

    def _discover_components(self) -> Dict[str, ComponentConfig]:
        """Auto-discover components via reflection"""
        if not self._cache_dirty:
            return self._components

        # Core AIP components with magical prop inference
        core_components = {
            "markdown": ComponentConfig(
                type="markdown",
                metadata=ComponentMetadata(
                    description="Default text/conversation", category=ComponentCategory.CORE
                ),
            ),
            "card-grid": ComponentConfig(
                type="card-grid",
                metadata=ComponentMetadata(
                    description="Multiple items as visual cards",
                    category=ComponentCategory.INTERFACE,
                ),
            ),
            "timeline": ComponentConfig(
                type="timeline",
                metadata=ComponentMetadata(
                    description="Chronological events", category=ComponentCategory.INTERFACE
                ),
            ),
            "expandable-section": ComponentConfig(
                type="expandable-section",
                metadata=ComponentMetadata(
                    description="Collapsible sections", category=ComponentCategory.INTERFACE
                ),
            ),
            "key-insights": ComponentConfig(
                type="key-insights",
                metadata=ComponentMetadata(
                    description="Categorized insights/principles",
                    category=ComponentCategory.INTERFACE,
                ),
            ),
            "code-snippet": ComponentConfig(
                type="code-snippet",
                metadata=ComponentMetadata(
                    description="Code with syntax highlighting",
                    category=ComponentCategory.INTERFACE,
                ),
            ),
            "contact-form": ComponentConfig(
                type="contact-form",
                metadata=ComponentMetadata(
                    description="Contact form with validation", category=ComponentCategory.INTERFACE
                ),
            ),
            "image-gallery": ComponentConfig(
                type="image-gallery",
                metadata=ComponentMetadata(
                    description="Image gallery with accessibility",
                    category=ComponentCategory.INTERFACE,
                ),
            ),
            "blog-post": ComponentConfig(
                type="blog-post",
                metadata=ComponentMetadata(
                    description="Article/post layout", category=ComponentCategory.INTERFACE
                ),
            ),
            "inline-reference": ComponentConfig(
                type="inline-reference",
                metadata=ComponentMetadata(
                    description="Expandable references", category=ComponentCategory.INTERFACE
                ),
            ),
        }

        self._components = core_components
        self._cache_dirty = False
        return self._components

    def register(self, component_type: str, metadata: Optional[ComponentMetadata] = None) -> None:
        """Register a component with type safety"""
        if not metadata:
            metadata = ComponentMetadata()

        config = ComponentConfig(type=component_type, metadata=metadata)

        self._components[component_type] = config
        self._cache_dirty = True

    def get_component(self, component_type: str) -> Optional[ComponentConfig]:
        """Get component configuration by type"""
        components = self._discover_components()
        return components.get(component_type)

    def get_available_components(self) -> List[str]:
        """Get list of all available component types"""
        components = self._discover_components()
        return list(components.keys())

    def get_agent_options(self, enabled_components: Optional[List[str]] = None) -> str:
        """Get agent options with optional filtering"""
        components = self._discover_components()

        if enabled_components:
            components = {k: v for k, v in components.items() if k in enabled_components}

        return "\\n".join(
            f"{comp_type}: {config.metadata.description}"
            for comp_type, config in components.items()
        )

    def infer_props(
        self, component_type: str, signals: Dict[str, Any], content: str
    ) -> Dict[str, Any]:
        """Magical prop inference based on component type and signals"""
        # Smart prop inference based on component type
        if component_type == "markdown":
            return {"content": content}
        elif component_type == "code-snippet":
            return {
                "code": content,
                "language": signals.get("language", "python"),
                "title": signals.get("title", ""),
            }
        elif component_type == "key-insights":
            # Extract bullet points or split by lines
            insights = []
            if "•" in content or "*" in content or "-" in content:
                insights = [
                    line.strip().lstrip("•*- ")
                    for line in content.split("\\n")
                    if line.strip().startswith(("•", "*", "-"))
                ]
            else:
                insights = [content[:100] + "..." if len(content) > 100 else content]
            return {"insights": insights}
        elif component_type == "timeline":
            return {"events": [{"date": "Now", "title": "Current", "description": content[:200]}]}
        elif component_type == "expandable-section":
            return {"title": signals.get("title", "Details"), "content": content}
        elif component_type == "contact-form":
            return {
                "fields": [
                    {"name": "name", "type": "text", "label": "Name", "required": True},
                    {"name": "email", "type": "email", "label": "Email", "required": True},
                    {"name": "message", "type": "textarea", "label": "Message", "required": True},
                ]
            }
        else:
            # Default fallback
            return {"content": content}

    def make_component_config(
        self, component_type: str, signals: Dict[str, Any], content: str
    ) -> ComponentConfig:
        """Create a component config with inferred props"""
        config = self.get_component(component_type)
        if not config:
            raise ValueError(f"Unknown component type: {component_type}")

        props = self.infer_props(component_type, signals, content)

        return ComponentConfig(type=component_type, props=props, metadata=config.metadata)


# Global registry instance
_global_registry: Optional[AutoRegistry] = None


def get_registry() -> AutoRegistry:
    """Get global registry instance"""
    global _global_registry
    if not _global_registry:
        _global_registry = AutoRegistry()
    return _global_registry


# Magical single import functions
def get_interface_options(enabled_components: Optional[List[str]] = None) -> str:
    """Get interface options for agents"""
    return get_registry().get_agent_options(enabled_components)


def make_component_config(
    component_type: str, signals: Dict[str, Any], content: str
) -> ComponentConfig:
    """Create component config with magical prop inference"""
    return get_registry().make_component_config(component_type, signals, content)


def register_component(component_type: str, metadata: Optional[ComponentMetadata] = None) -> None:
    """Register a new component type"""
    get_registry().register(component_type, metadata)


def get_available_components() -> List[str]:
    """Get all available component types"""
    return get_registry().get_available_components()
