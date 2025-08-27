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

from typing import Any, Dict, List, Optional, Union
from .aip import ai_block


class AIInterface:
    """Dynamic interface to all AI components"""
    
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
        create_component.__doc__ = f"Create {component_type} component"
        
        return create_component
    
    def __dir__(self) -> List[str]:
        """Show available components in IDE autocomplete"""
        # TODO: Get this from React registry dynamically
        return [
            'accordion', 'card', 'cards', 'code', 'gallery', 
            'insights', 'markdown', 'reference', 'suggestions',
            'table', 'tabs', 'timeline', 'tree'
        ]


# Create singleton instance
ai = AIInterface()

# Export the magic interface
__all__ = ['ai']