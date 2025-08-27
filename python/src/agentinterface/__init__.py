"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "0.1.0"

# The canonical interface
from .ai import ai, protocol, shape

__all__ = ['ai', 'protocol', 'shape']