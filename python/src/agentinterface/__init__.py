"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🎯 AI COMPONENTS - Clean and beautiful component creation
from .aip import (
    ai_accordion,
    ai_block,
    ai_card,
    ai_code,
    ai_markdown,
    ai_response,
    ai_tabs,
    ai_text,
)

# 🎯 INLINE RESOLVER - Progressive disclosure narrative→components
from .inline_resolver import (
    InlineComponentResolver,
    ResolvedComponent,
    create_inline_resolver,
)

# 🎯 PROTOCOL INTERFACE - Format instructions for external systems
from .protocol import get_format_instructions, register_format_extension

# 🎯 CANONICAL REGISTRY - Zero ceremony component discovery
from .registry import ComponentCategory, ComponentSpec, get_available_components
from .registry.core import get_registry

# 🎯 CANONICAL API - Clean .register() method
def register(component_type: str, description: str, **kwargs):
    """Canonical component registration - zero ceremony."""
    return get_registry().register(component_type, description, **kwargs)


__all__ = [
    # AI Components - Beautiful and simple
    "ai_block",
    "ai_text",
    "ai_markdown",
    "ai_card",
    "ai_tabs",
    "ai_accordion",
    "ai_code",
    "ai_response",
    # CANONICAL REGISTRY - One true way
    "register",
    "get_available_components", 
    "ComponentSpec",
    "ComponentCategory",
    # Inline Resolver - Progressive disclosure
    "create_inline_resolver",
    "InlineComponentResolver",
    "ResolvedComponent",
    # Protocol Interface
    "get_format_instructions",
]
