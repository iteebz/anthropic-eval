"""AgentInterface Protocol - Format instructions for external systems"""

from typing import Dict, Any, List, Callable, Optional
from .registry import get_available_components


# Global extension registry for format instructions
_format_extensions: List[Callable[[], str]] = []


def register_format_extension(extension_fn: Callable[[], str]):
    """Register a format extension function (e.g., from folio)."""
    _format_extensions.append(extension_fn)


def get_format_instructions() -> str:
    """Get dynamic AIP format instructions based on registered components."""
    
    # Get all available components dynamically
    components = get_available_components()
    
    instructions = ["- Format as MULTI-AIP JSON - series of AIP-compliant JSON objects, each on its own line"]
    instructions.append("")
    instructions.append("Available interface types:")
    
    for component_name in components:
        # Build example based on component metadata
        example = _build_component_example(component_name)
        instructions.append(f"- {component_name}: {example}")
    
    # Add extension instructions
    for extension_fn in _format_extensions:
        try:
            extension_instructions = extension_fn()
            if extension_instructions:
                instructions.append("")
                instructions.append(extension_instructions)
        except Exception:
            # Skip failed extensions
            pass
    
    instructions.append("")
    instructions.append("Use expandable-section for CoT reasoning, key-insights for analysis, and mix narrative with structured data.")
    
    return "\n".join(instructions)


def _build_component_example(component_name: str) -> str:
    """Build JSON example for a component."""
    
    # Basic structure
    example = {"type": component_name}
    
    # Add data structure based on component type
    if component_name == "markdown":
        example["content"] = "text"
    elif component_name == "blog-post":
        example["data"] = {"title": "Title", "content": "Content", "metadata": {}}
    elif component_name == "card-grid":
        example["data"] = {"cards": [{"title": "Name", "description": "Desc", "tags": [], "links": [], "metadata": {}}]}
    elif component_name == "code-snippet":
        example["data"] = {"code": "console.log('hello')", "language": "javascript"}
    elif component_name == "expandable-section":
        example["data"] = {"sections": [{"title": "Title", "content": "Content", "defaultExpanded": False}]}
    elif component_name == "inline-reference":
        example["data"] = {"references": [{"id": "ref1", "title": "Title", "type": "project", "excerpt": "Brief", "content": "Full content"}]}
    elif component_name == "key-insights":
        example["data"] = {"insights": [{"title": "Insight", "description": "Description", "category": "category"}]}
    elif component_name == "timeline":
        example["data"] = {"events": [{"date": "2025", "title": "Event", "description": "Desc"}]}
    else:
        # Generic data structure
        example["data"] = {"content": "Component data"}
    
    return str(example).replace("'", '"').replace("False", "false").replace("True", "true")