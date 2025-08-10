"""Registry - Component discovery and protocol generation"""

from .core import (
    ComponentCategory,
    ComponentSpec,
    get_available_components,
    get_format_instructions,
    register_component,
)

__all__ = [
    "register_component",
    "get_available_components",
    "get_format_instructions",
    "ComponentSpec",
    "ComponentCategory",
]
