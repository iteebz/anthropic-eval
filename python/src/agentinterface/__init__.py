"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🎯 MAGICAL SINGLE IMPORT - Everything you need
from .registry import (
    select_component,
    get_component_options, 
    MagicSelector,
    get_interface_options,
    make_component_config,
    register_component,
    get_available_components,
    ComponentConfig,
    ComponentMetadata,
    ComponentCategory
)

# Legacy compatibility (gradually migrate to magic imports)
from .inline_resolver import InlineComponentResolver, create_inline_resolver

__all__ = [
    # 🎯 MAGICAL INTERFACE - Use these!
    "select_component",
    "get_component_options", 
    "MagicSelector",
    "get_interface_options",
    "make_component_config",
    "register_component",
    "get_available_components",
    "ComponentConfig",
    "ComponentMetadata", 
    "ComponentCategory",
    
    # Inline component support
    "InlineComponentResolver",
    "create_inline_resolver",
]