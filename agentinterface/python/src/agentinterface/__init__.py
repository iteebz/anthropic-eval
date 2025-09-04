"""AgentInterface - AI agents choose UI components with zero ceremony"""

__version__ = "1.0.0"
from .ai import ai, protocol, shape
from .llms import LLM, llm

__all__ = ["ai", "protocol", "shape", "llm", "LLM"]
