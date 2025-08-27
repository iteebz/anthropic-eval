"""Agent JSON → React components"""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


def _load() -> Dict[str, Dict[str, str]]:
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
            except Exception as e:
                continue
    
    return {}


class AIInterface:
    """AI component factory"""
    
    def __init__(self):
        self._registry = _load()
    
    
    def protocol(self) -> str:
        """LLM format instructions"""
        if not self._registry:
            return "No components available"
        
        types = sorted(self._registry.keys())
        return f"Use ```aip blocks: {', '.join(types)}"
    
    async def shape(self, response: str, context: dict = None, llm = None) -> str:
        """Transform text → components"""
        from .shaper import shape
        return await shape(response, context, llm)
    
    def interactive(self, agent, llm = None):
        """Two-way UI communication"""
        from .interactive import Interactive
        return Interactive(agent, llm)


ai = AIInterface()

__all__ = ['ai']