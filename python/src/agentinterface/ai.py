"""
CANONICAL AI() INTERFACE - Dynamic Python wrapper for React components

Usage:
    import agentinterface as ai
    
    # Dynamic component creation
    card = ai.card(header="Title", body="Content")
    markdown = ai.markdown(content="# Hello World")
    tabs = ai.tabs(items=[{"label": "Tab 1", "content": "Content"}])
    
All React components auto-discoverable via __getattr__ magic.
"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from .aip import ai_block


def _load_component_registry() -> Dict[str, Dict[str, str]]:
    """Load component registry from ecosystem autodiscovery"""
    registry_paths = [
        # Try ai.json first (canonical masterplay)
        Path(__file__).parent.parent.parent.parent / "ai.json",
        # Legacy support
        Path(__file__).parent.parent.parent.parent / "ai-ecosystem-registry.json",
        Path(__file__).parent.parent.parent.parent / "packages/agentinterface/src/ai-registry.json",
        # Try current directory
        Path.cwd() / "ai.json",
        Path.cwd() / "ai-ecosystem-registry.json",
        Path.cwd() / "ai-registry.json",
        # Fallback to local registry 
        Path(__file__).parent / "ai-registry.json"
    ]
    
    for registry_path in registry_paths:
        if registry_path.exists():
            try:
                data = json.loads(registry_path.read_text())
                components = data.get("components", {})
                if components:
                    print(f"✓ Loaded {len(components)} components from {registry_path.name}")
                    return components
            except Exception as e:
                continue
    
    # Fallback to empty registry
    print("⚠️  No component registry found - using fallback")
    return {}


class AIInterface:
    """Dynamic interface to all AI components"""
    
    def __init__(self):
        self._registry = _load_component_registry()
    
    def __getattr__(self, component_type: str) -> callable:
        """
        Magic method to create components dynamically
        
        ai.card() -> Creates card component
        ai.markdown() -> Creates markdown component
        ai.timeline() -> Creates timeline component
        
        Returns a function that creates the component when called
        """
        def create_component(**kwargs) -> Dict[str, Any]:
            """Create component with given props"""
            return ai_block(component_type, **kwargs)
        
        # Set function name for better debugging
        create_component.__name__ = f"ai_{component_type}"
        
        # Use autodiscovered description if available
        if component_type in self._registry:
            create_component.__doc__ = f"Create {component_type} component: {self._registry[component_type]['description']}"
        else:
            create_component.__doc__ = f"Create {component_type} component"
        
        return create_component
    
    def __dir__(self) -> List[str]:
        """Show available components in IDE autocomplete"""
        if self._registry:
            return sorted(self._registry.keys())
        
        # Fallback to hardcoded list if registry not found
        return [
            'accordion', 'card', 'cards', 'code', 'gallery', 
            'insights', 'markdown', 'reference', 'suggestions',
            'table', 'tabs', 'timeline', 'tree'
        ]
    
    def components(self) -> Dict[str, str]:
        """Get all components with descriptions"""
        return {
            comp_type: comp_data.get("description", "No description")
            for comp_type, comp_data in self._registry.items()
        }
    
    def sources(self) -> Dict[str, List[str]]:
        """Get components grouped by source (for ecosystem analysis)"""
        sources = {}
        for comp_type, comp_data in self._registry.items():
            source = comp_data.get("source", "unknown")
            if source not in sources:
                sources[source] = []
            sources[source].append(comp_type)
        return sources
    
    def refresh(self) -> None:
        """Refresh component registry (re-scan ecosystem)"""
        self._registry = _load_component_registry()
    
    def protocol(self) -> str:
        """Generate LLM format instructions from registry"""
        if not self._registry:
            return "No components available"
        
        component_types = sorted(self._registry.keys())
        return f"Use ```aip blocks with these components: {', '.join(component_types)}"
    
    async def shape(self, response: str, context: dict = None, llm = None) -> str:
        """Transform agent response into UI components"""
        from .shaper import shape
        return await shape(response, context, llm)
    
    def interactive(self, agent, llm = None):
        """Make any agent interactive with UI callbacks"""
        from .interactive import Interactive
        return Interactive(agent, llm)


# Create singleton instance
ai = AIInterface()

# Export the magic interface
__all__ = ['ai']