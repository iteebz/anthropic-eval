"""Agent JSON → React components"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


def _load_registry() -> Dict[str, Dict[str, str]]:
    """Load component registry"""
    registry_paths = [
        Path(__file__).parent.parent.parent.parent / "ai.json",
        Path.cwd() / "ai.json",
        Path(__file__).parent / "ai-registry.json"
    ]
    
    for registry_path in registry_paths:
        if registry_path.exists():
            try:
                data = json.loads(registry_path.read_text())
                components = data.get("components", {})
                if components:
                    return components
            except Exception:
                continue
    
    return {}


def protocol(components: Optional[List[str]] = None) -> str:
    """LLM format instructions"""
    if not components:
        # Built-in component types
        components = ['card', 'timeline', 'accordion', 'code', 'gallery', 'insights', 'reference', 'suggestions', 'table', 'tabs', 'tree', 'markdown']
    elif 'markdown' not in components:
        # Always ensure markdown fallback
        components = components + ['markdown']
    
    return f"Available components: {', '.join(sorted(components))}\n\nSupports arrays for composition: [comp1, [comp2, comp3], comp4] = vertical stack with horizontal row"


async def shape(response: str, context: dict = None, llm = None) -> str:
    """Transform text → components"""
    if not llm:
        from .providers import create_llm
        llm = await create_llm()
    from .shaper import shape
    return await shape(response, context, llm)


def ai(agent, llm = None, components: Optional[List[str]] = None, port: int = 8228):
    """Universal agent wrapper - THE CANONICAL INTERFACE"""
    from .interactive import Interactive
    return Interactive(agent, llm, components, port)


__all__ = ['ai', 'protocol', 'shape']