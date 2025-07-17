"""Registry - Auto-magical component discovery and selection"""

# 🎯 MAGICAL SINGLE IMPORT - Everything you need
from .magic import select_component, get_component_options, MagicSelector
from .auto import (
    get_interface_options,
    make_component_config,
    register_component,
    get_available_components,
    ComponentConfig,
    ComponentMetadata,
    ComponentCategory
)

__all__ = [
    # Magic interface
    "select_component",
    "get_component_options", 
    "MagicSelector",
    
    # Auto registry
    "get_interface_options",
    "make_component_config",
    "register_component",
    "get_available_components",
    "ComponentConfig",
    "ComponentMetadata",
    "ComponentCategory"
]