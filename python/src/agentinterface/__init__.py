"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# 🔥 CANONICAL AI INTERFACE - Dynamic component access  
from .ai import ai

# Export ai methods at module level for clean import
card = ai.card
protocol = ai.protocol  
shape = ai.shape
interactive = ai.interactive





# 🎯 RESPONSE SHAPING - Transform agent text into UI components
from .shaper import shape

# 🎯 INTERACTIVE AGENTS - Two-way UI communication
from .interactive import Interactive


__all__ = [
    # 🔥 CANONICAL AI INTERFACE - The one true way
    "ai",
    # Response Shaping
    "shape",
    # Interactive Agents
    "Interactive",
]
