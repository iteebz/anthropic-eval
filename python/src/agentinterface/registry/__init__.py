"""Registry - Component discovery and protocol generation"""

from .core import (
    get_available_components,
    register,
)

__all__ = [
    "register", 
    "get_available_components",
]
