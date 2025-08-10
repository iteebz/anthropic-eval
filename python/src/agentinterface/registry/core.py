"""
Core Registry - Single source of truth for component registration
"""

import json
from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional


class ComponentCategory(str, Enum):
    """Component categories"""

    CORE = "core"
    INTERFACE = "interface"
    CONTAINER = "container"
    DISPLAY = "display"
    INPUT = "input"
    LAYOUT = "layout"
    EXTENSION = "extension"
    CUSTOM = "custom"


@dataclass
class ComponentSpec:
    """Component specification from registry"""

    type: str
    description: str
    category: ComponentCategory
    tags: List[str]
    schema: Optional[Dict[str, Any]] = None
    examples: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ComponentSpec":
        """Create ComponentSpec from registry data"""
        return cls(
            type=data["type"],
            description=data["description"],
            category=ComponentCategory(data["category"]),
            tags=data.get("tags", []),
            schema=data.get("schema"),
            examples=data.get("examples", []),
        )


class ComponentRegistry:
    """Core component registry - loads from shared JSON schema"""

    def __init__(self):
        self._components: Dict[str, ComponentSpec] = {}
        self._load_core_registry()

    def _load_core_registry(self):
        """Load core components from synchronized registry"""
        # Try new synchronized location first
        registry_file = Path(__file__).parent.parent / "registry.json"

        if not registry_file.exists():
            # Fallback to old location
            registry_file = Path(__file__).parent / "registry.json"

        if registry_file.exists():
            try:
                with open(registry_file) as f:
                    registry_data = json.load(f)

                # Handle new registry format with metadata
                if "components" in registry_data:
                    for component_type, component_data in registry_data["components"].items():
                        spec = ComponentSpec.from_dict(component_data)
                        self._components[component_type] = spec

                    # Log registry info
                    version = registry_data.get("version", "unknown")
                    generated_at = registry_data.get("generatedAt", "unknown")
                    print(f"✅ Loaded {len(self._components)} components from registry v{version}")
                    print(f"   Generated: {generated_at}")
                else:
                    print("Warning: Invalid registry format - missing 'components' key")

            except json.JSONDecodeError as e:
                print(f"Error: Invalid JSON in registry file: {e}")
            except Exception as e:
                print(f"Error loading registry: {e}")
        else:
            print(f"Warning: Core registry not found at {registry_file}")
            print("Run 'npx agentinterface build' to generate the registry")

    def register(
        self,
        component_type: str,
        description: str,
        category: ComponentCategory = ComponentCategory.CUSTOM,
        tags: Optional[List[str]] = None,
        schema: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Register a new component"""
        spec = ComponentSpec(
            type=component_type,
            description=description,
            category=category,
            tags=tags or [],
            schema=schema,
        )
        self._components[component_type] = spec

    def get_component(self, component_type: str) -> Optional[ComponentSpec]:
        """Get component specification"""
        return self._components.get(component_type)

    def get_all_components(self) -> Dict[str, ComponentSpec]:
        """Get all registered components"""
        return self._components.copy()

    def get_component_types(self) -> List[str]:
        """Get list of all component types"""
        return list(self._components.keys())

    def get_format_instructions(self) -> str:
        """Generate format instructions for agents"""
        if not self._components:
            return (
                "No components available. Run 'npx agentinterface build' to generate the registry."
            )

        instructions = ["Available AgentInterface Protocol (AIP) components:", ""]

        # Group by category
        by_category = {}
        for component_type, spec in self._components.items():
            category = spec.category.value
            if category not in by_category:
                by_category[category] = []
            by_category[category].append((component_type, spec))

        for category, components in by_category.items():
            instructions.append(f"{category.upper()} COMPONENTS:")
            for component_type, spec in components:
                example = self._build_example(spec)
                instructions.append(f"- {component_type}: {spec.description}")
                instructions.append(f"  Tags: {', '.join(spec.tags)}")
                instructions.append(f"  Example: {example}")
                instructions.append("")
            instructions.append("")

        return "\n".join(instructions)

    def get_registry_stats(self) -> Dict[str, Any]:
        """Get registry statistics"""
        stats = {"total_components": len(self._components), "by_category": {}, "by_tags": {}}

        # Count by category
        for spec in self._components.values():
            category = spec.category.value
            stats["by_category"][category] = stats["by_category"].get(category, 0) + 1

        # Count by tags
        for spec in self._components.values():
            for tag in spec.tags:
                stats["by_tags"][tag] = stats["by_tags"].get(tag, 0) + 1

        return stats

    def _build_example(self, spec: ComponentSpec) -> str:
        """Build JSON example for component"""
        if spec.examples:
            return json.dumps({"type": spec.type, "data": spec.examples[0]["data"]})

        # Generate basic example from schema
        example_data = {}
        if spec.schema and "properties" in spec.schema:
            for prop, prop_schema in spec.schema["properties"].items():
                if prop_schema.get("type") == "string":
                    example_data[prop] = f"example {prop}"
                elif prop_schema.get("type") == "array":
                    example_data[prop] = []
                elif prop_schema.get("type") == "object":
                    example_data[prop] = {}

        return json.dumps({"type": spec.type, "data": example_data})


# Global registry instance
_registry: Optional[ComponentRegistry] = None


def get_registry() -> ComponentRegistry:
    """Get global registry instance"""
    global _registry
    if _registry is None:
        _registry = ComponentRegistry()
    return _registry


# Public API functions
def register_component(
    component_type: str,
    description: str,
    category: ComponentCategory = ComponentCategory.CUSTOM,
    tags: Optional[List[str]] = None,
    schema: Optional[Dict[str, Any]] = None,
) -> None:
    """Register a component with the registry"""
    get_registry().register(component_type, description, category, tags, schema)


def get_available_components() -> List[str]:
    """Get list of available component types"""
    return get_registry().get_component_types()


def get_component_spec(component_type: str) -> Optional[ComponentSpec]:
    """Get component specification"""
    return get_registry().get_component(component_type)


def get_format_instructions() -> str:
    """Get format instructions for agents"""
    return get_registry().get_format_instructions()


def get_registry_stats() -> Dict[str, Any]:
    """Get registry statistics"""
    return get_registry().get_registry_stats()
