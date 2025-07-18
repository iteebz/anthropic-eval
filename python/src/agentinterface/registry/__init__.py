"""Registry - Auto-magical component discovery (no AI magic)"""

# 🎯 AUTO-REGISTRY - Zero ceremony component discovery
from .auto import (
    get_interface_options,
    make_component_config,
    register_component,
    get_available_components,
    ComponentConfig,
    ComponentMetadata,
    ComponentCategory,
    AutoRegistry
)

__all__ = [
    # Auto registry (keep the good stuff)
    "get_interface_options",
    "make_component_config",
    "register_component",
    "get_available_components",
    "ComponentConfig",
    "ComponentMetadata",
    "ComponentCategory",
    "AutoRegistry"
]