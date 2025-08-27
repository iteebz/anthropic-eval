"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🔥 CANONICAL AI INTERFACE - Dynamic component access
from .ai import ai

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
from .protocol import get_format_instructions

# 🎯 CANONICAL REGISTRY - Zero ceremony component discovery  
from .registry.core import get_available_components

# 🎯 CANONICAL API - Clean .register() method
from .registry.core import register

# 🎯 RESPONSE SHAPING - Transform agent text into UI components
from .shaper import shape


__all__ = [
    # 🔥 CANONICAL AI INTERFACE - The one true way
    "ai",
    # AI Components - Legacy functions
    "ai_block",
    "ai_text",
    "ai_markdown",
    "ai_card",
    "ai_tabs",
    "ai_accordion",
    "ai_code",
    "ai_response",
    # CANONICAL REGISTRY - Zero ceremony
    "register",
    "get_available_components",
    # Inline Resolver - Progressive disclosure
    "create_inline_resolver",
    "InlineComponentResolver",
    "ResolvedComponent",
    # Protocol Interface
    "get_format_instructions",
    # Response Shaping
    "shape",
]
