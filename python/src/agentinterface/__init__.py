"""
Agent Interface Protocol (AIP) - Python implementation.

This package provides Python classes and utilities for implementing
the Agent Interface Protocol in conversational AI applications.
"""

__version__ = "0.1.0"
__author__ = "Tyson Chan"
__email__ = "itsteebz@gmail.com"

from agentinterface.core.interface_service import (
    InterfaceService,
    InterfaceResult,
    InterfaceStrategy,
)

__all__ = [
    "InterfaceService",
    "InterfaceResult",
    "InterfaceStrategy",
]