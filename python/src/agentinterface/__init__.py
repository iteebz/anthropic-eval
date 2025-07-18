"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🎯 EXPLICIT AIP PROTOCOL - Zero ceremony, pure function
from .aip import (
    aip_response,
    aip_markdown,
    aip_card,
    aip_chart
)

# 🎯 AUTO-REGISTRY - Zero ceremony component discovery
from .registry import (
    register_component,
    get_available_components,
    ComponentConfig,
    ComponentMetadata,
    ComponentCategory,
    AutoRegistry
)

# 🎯 INLINE RESOLVER - Progressive disclosure narrative→components
from .inline_resolver import (
    create_inline_resolver,
    InlineComponentResolver,
    InlineComponentConfig,
    ResolvedComponent
)

# 🎯 PROTOCOL INTERFACE - Format instructions for external systems
from .protocol import get_format_instructions, register_format_extension

__all__ = [
    # AIP Protocol
    "aip_response",
    "aip_markdown", 
    "aip_card",
    "aip_chart",
    
    # Auto-Registry (keep the good stuff)
    "register_component",
    "get_available_components",
    "ComponentConfig",
    "ComponentMetadata",
    "ComponentCategory",
    "AutoRegistry",
    
    # Inline Resolver - Progressive disclosure
    "create_inline_resolver",
    "InlineComponentResolver",
    "InlineComponentConfig", 
    "ResolvedComponent",
    
    # Protocol Interface
    "get_format_instructions",
    "register_format_extension",
]