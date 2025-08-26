"""Core Registry - Zero ceremony component registry"""

import json
from pathlib import Path
from typing import Dict, Optional

# Simple component registry - just type -> description
_components: Dict[str, str] = {}

def _load_registry():
    """Load components from registry.json"""
    global _components
    if _components:
        return
    
    registry_file = Path(__file__).parent.parent / "registry.json"
    if registry_file.exists():
        try:
            data = json.loads(registry_file.read_text())
            if "components" in data:
                for comp_type, comp_data in data["components"].items():
                    _components[comp_type] = comp_data.get("description", comp_type)
        except:
            pass

def register(component_type: str, description: str) -> None:
    """Register component"""
    _components[component_type] = description

def get_available_components() -> list[str]:
    """Get component types"""
    _load_registry()
    return list(_components.keys())

def get_format_instructions() -> str:
    """Get format instructions"""
    _load_registry()
    if not _components:
        return "No components available."
    
    lines = ["Available components:"]
    for comp_type in _components:
        lines.append(f"- {comp_type}: {{'type': '{comp_type}', ...}}")
    
    return "\n".join(lines)
