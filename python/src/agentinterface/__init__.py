"""AgentInterface - AI agents choose UI components."""

__version__ = "0.1.0"

from agentinterface.core.interface_service import get_interface_options, INTERFACE_OPTIONS
from agentinterface.selector import ComponentSelector
from agentinterface.registry import ComponentConfig, register_component_type, make_component_config, COMPONENT_REGISTRY
from agentinterface.inline_resolver import InlineComponentResolver, create_inline_resolver

__all__ = [
    "get_interface_options", 
    "INTERFACE_OPTIONS",
    "ComponentSelector",
    "ComponentConfig",
    "register_component_type",
    "make_component_config",
    "COMPONENT_REGISTRY",
    "InlineComponentResolver",
    "create_inline_resolver",
]