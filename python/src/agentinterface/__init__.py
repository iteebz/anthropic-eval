"""AgentInterface - AI agents choose UI components."""

__version__ = "0.1.0"

from agentinterface.core.interface_service import get_interface_options, INTERFACE_OPTIONS
from agentinterface.selector import (
    ComponentSelector,
    ComponentConfig,
    MarkdownComponentConfig,
    CardGridComponentConfig,
    ExpandableSectionComponentConfig,
    TimelineComponentConfig,
    KeyInsightsComponentConfig,
    CodeSnippetComponentConfig,
    BlogPostComponentConfig,
)

__all__ = [
    "get_interface_options", 
    "INTERFACE_OPTIONS",
    "ComponentSelector",
    "ComponentConfig",
    "MarkdownComponentConfig",
    "CardGridComponentConfig", 
    "ExpandableSectionComponentConfig",
    "TimelineComponentConfig",
    "KeyInsightsComponentConfig",
    "CodeSnippetComponentConfig",
    "BlogPostComponentConfig",
]