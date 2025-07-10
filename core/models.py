"""
Models for the agent's UI state.
"""
from typing import Any, Dict

from pydantic import BaseModel


class InterfaceState(BaseModel):
    """The state of the agent's UI."""

    interface_type: str = "markdown"
    interface_data: Dict[str, Any] = {}