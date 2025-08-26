"""Inline Component Resolver - ZEALOT VERSION: 20 lines total."""

import re
from dataclasses import dataclass
from typing import Any, Awaitable, Callable, Dict, List, Optional


@dataclass
class ResolvedComponent:
    """Resolved component with data or fallback."""
    type: str
    slug: str
    data: Optional[Dict[str, Any]] = None
    fallback: Optional[str] = None


class InlineComponentResolver:
    """Zero-ceremony {{type:slug}} resolver."""
    
    def __init__(self, resolver: Callable[[str, str], Awaitable[Optional[Dict[str, Any]]]]):
        self.resolver = resolver
        self.pattern = re.compile(r"\{\{([^:]+):([^}]+)\}\}")

    async def process_text(self, text: str) -> Dict[str, Any]:
        """Parse and resolve all {{type:slug}} in text."""
        matches = self.pattern.finditer(text)
        components = []
        processed_text = text
        
        for match in matches:
            component_type, slug = match.groups()
            data = await self.resolver(component_type, slug)
            resolved = ResolvedComponent(
                type=component_type,
                slug=slug,
                data=data,
                fallback=f"💡 {slug}" if not data else None
            )
            components.append(resolved)
            
            # Replace with fallback
            replacement = resolved.fallback or slug
            processed_text = processed_text.replace(match.group(0), replacement)
            
        return {
            "processed_text": processed_text,
            "components": components,
            "has_components": len(components) > 0
        }


def create_inline_resolver(resolver_fn: Callable[[str, str], Awaitable[Optional[Dict[str, Any]]]]) -> InlineComponentResolver:
    """Create resolver."""
    return InlineComponentResolver(resolver_fn)