"""
Explicit AIP Protocol - Zero ceremony, pure function
"""

import json
from typing import Dict, Any, Optional


def aip_response(component_type: str, props: Dict[str, Any], content: str = "") -> str:
    """
    Generate AIP response with explicit component specification.
    
    Args:
        component_type: Component type (e.g., 'card', 'chart', 'form')
        props: Component properties 
        content: Optional content string
        
    Returns:
        JSON string for direct consumption by React renderer
    """
    return json.dumps({
        "type": component_type,
        "props": props,
        "content": content
    })


def aip_markdown(content: str) -> str:
    """Convenience function for markdown responses."""
    return aip_response("markdown", {}, content)


def aip_card(title: str, content: str, actions: Optional[list] = None) -> str:
    """Convenience function for card responses."""
    return aip_response("card", {
        "title": title,
        "actions": actions or []
    }, content)


def aip_chart(chart_type: str, data: Dict[str, Any], title: str = "") -> str:
    """Convenience function for chart responses."""
    return aip_response("chart", {
        "chartType": chart_type,
        "data": data,
        "title": title
    })