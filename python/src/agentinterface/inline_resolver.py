"""Inline Component Resolver - Core pattern for resolving {{type:slug}} syntax

This is the standard way any Python app resolves inline components.
"""

import re
from typing import Dict, Any, List, Optional, Callable, Awaitable
from dataclasses import dataclass


@dataclass
class InlineComponentConfig:
    """Parsed inline component configuration"""
    type: str
    slug: str
    label: Optional[str] = None
    mode: str = "expand"
    params: Dict[str, str] = None
    original: str = ""
    
    def __post_init__(self):
        if self.params is None:
            self.params = {}


@dataclass
class ResolvedComponent:
    """Resolved inline component with data or fallback"""
    config: InlineComponentConfig
    data: Optional[Dict[str, Any]] = None
    fallback: Optional[str] = None
    error: Optional[str] = None


class InlineComponentResolver:
    """Resolves inline components using pluggable resolver functions"""
    
    def __init__(self, resolver: Callable[[str, str], Awaitable[Optional[Dict[str, Any]]]]):
        """
        Initialize with a resolver function.
        
        Args:
            resolver: Async function that takes (type, slug) and returns component data or None
        """
        self.resolver = resolver
        self.pattern = re.compile(r'\{\{([^:]+):([^|}]+)(?:\|([^}]+))?\}\}')
    
    def parse_inline_component(self, syntax: str) -> Optional[InlineComponentConfig]:
        """Parse inline component syntax: {{type:slug|label=Custom|mode=expand}}"""
        match = self.pattern.match(syntax)
        if not match:
            return None
        
        component_type, slug, params_str = match.groups()
        
        # Parse parameters
        params = {}
        if params_str:
            for param in params_str.split('|'):
                if '=' in param:
                    key, value = param.split('=', 1)
                    params[key] = value
        
        return InlineComponentConfig(
            type=component_type,
            slug=slug,
            label=params.get('label'),
            mode=params.get('mode', 'expand'),
            params=params,
            original=syntax
        )
    
    def find_inline_components(self, text: str) -> List[InlineComponentConfig]:
        """Find all inline components in text"""
        matches = self.pattern.finditer(text)
        components = []
        
        for match in matches:
            config = self.parse_inline_component(match.group(0))
            if config:
                components.append(config)
        
        return components
    
    async def resolve_component(self, config: InlineComponentConfig) -> ResolvedComponent:
        """Resolve a single inline component"""
        try:
            data = await self.resolver(config.type, config.slug)
            
            if data:
                return ResolvedComponent(
                    config=config,
                    data=data
                )
            else:
                # Generate fallback
                fallback = self._create_fallback(config)
                return ResolvedComponent(
                    config=config,
                    fallback=fallback
                )
                
        except Exception as e:
            fallback = self._create_error_fallback(config, str(e))
            return ResolvedComponent(
                config=config,
                fallback=fallback,
                error=str(e)
            )
    
    async def process_text(self, text: str) -> Dict[str, Any]:
        """Process text containing inline components"""
        components = self.find_inline_components(text)
        
        if not components:
            return {
                "processed_text": text,
                "components": [],
                "has_components": False
            }
        
        resolved_components = []
        processed_text = text
        
        for config in components:
            resolved = await self.resolve_component(config)
            resolved_components.append(resolved)
            
            # Replace in text with fallback
            replacement = resolved.fallback or resolved.config.label or resolved.config.slug
            processed_text = processed_text.replace(resolved.config.original, replacement)
        
        return {
            "processed_text": processed_text,
            "components": resolved_components,
            "has_components": True,
            "original_text": text
        }
    
    def _create_fallback(self, config: InlineComponentConfig) -> str:
        """Create fallback text for unresolved components"""
        label = config.label or config.slug
        
        if config.mode == "link":
            return f"[{label}](/components/{config.type}/{config.slug})"
        elif config.mode == "preview":
            return f"📋 {label}"
        else:
            return f"💡 {label}"
    
    def _create_error_fallback(self, config: InlineComponentConfig, error: str) -> str:
        """Create fallback text for errored components"""
        label = config.label or config.slug
        return f"⚠️ {label}"


def create_inline_resolver(resolver_fn: Callable[[str, str], Awaitable[Optional[Dict[str, Any]]]]) -> InlineComponentResolver:
    """Convenience function to create resolver"""
    return InlineComponentResolver(resolver_fn)