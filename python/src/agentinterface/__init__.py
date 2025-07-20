"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🎯 AIP PROTOCOL - Nested component hierarchy
from .aip import (
    aip_block,
    aip_text,
    aip_markdown,
    aip_card,
    aip_tabs,
    aip_accordion,
    aip_code,
    aip_response
)

# 🎯 AUTO-REGISTRY - Zero ceremony component discovery
from .registry import (
    register_component,
    get_available_components,
    ComponentSpec,
    ComponentCategory
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
    "aip_block",
    "aip_text",
    "aip_markdown", 
    "aip_card",
    "aip_tabs",
    "aip_accordion",
    "aip_code",
    "aip_response",
    
    # Auto-Registry (keep the good stuff)
    "register_component",
    "get_available_components",
    "ComponentSpec",
    "ComponentCategory",
    
    # Inline Resolver - Progressive disclosure
    "create_inline_resolver",
    "InlineComponentResolver",
    "InlineComponentConfig", 
    "ResolvedComponent",
    
    # Protocol Interface
    "get_format_instructions",
    "register_format_extension",
]