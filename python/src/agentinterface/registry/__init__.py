"""Registry - Component discovery and protocol generation"""

from .core import (
    register_component,
    get_available_components,
    get_format_instructions,
    ComponentSpec,
    ComponentCategory
)

__all__ = [
    "register_component",
    "get_available_components", 
    "get_format_instructions",
    "ComponentSpec",
    "ComponentCategory"
]