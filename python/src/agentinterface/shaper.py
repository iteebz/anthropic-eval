"""Response shaper - Transform agent text into UI components"""

import json
from typing import Any, Dict, Optional



async def shape(response: str, context: Dict[str, Any] = None, llm = None) -> str:
    """
    Transform agent response into AIP components
    
    Args:
        response: Agent's text response
        context: Query context (query, domain, user_id, etc.)
        llm: LLM provider (optional)
        
    Returns:
        AIP component JSON or original response
    """
    if not llm:
        return response  # No LLM = no shaping
        
    context = context or {}
    
    try:
        # Generate component using protocol instructions
        component = await _generate_component(response, context, llm)
        return component if component else response
    except Exception:
        return response  # Graceful fallback


async def _generate_component(response: str, context: Dict[str, Any], llm) -> Optional[str]:
    """Generate AIP component from response"""
    
    query = context.get("query", "")
    domain = context.get("domain", "general")
    
    # Get component instructions based on available components
    from .ai import protocol
    available_components = context.get("components")
    instructions = protocol(available_components)
    
    prompt = f"""Transform this agent response into UI components.

=== AGENT RESPONSE ===
{response}

=== CONTEXT ===
Query: {query}
Domain: {domain}

=== AVAILABLE COMPONENTS ===
{instructions}

ALWAYS return JSON array. Examples:

Single: [{{"type": "insights", "data": {{"title": "Analysis", "insights": ["Key finding 1", "Key finding 2"]}}}}]
Multiple: [{{"type": "markdown", "data": {{"content": "# Results"}}}}, {{"type": "table", "data": {{"headers": ["Metric", "Value"], "rows": [["Speed", "95%"]]}}}}]
Composition: [{{"type": "markdown", "data": {{"content": "Overview:"}}}}, [{{"type": "card", "data": {{"title": "A"}}}}, {{"type": "card", "data": {{"title": "B"}}}}], {{"type": "markdown", "data": {{"content": "Summary"}}}}]

Return JSON array. Never return "SKIP"."""

    try:
        result = await llm.generate(prompt)
            
        # Clean JSON
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].strip()
            
        # Validate - must be array
        components = json.loads(result)
        if isinstance(components, list):
            return json.dumps(components, indent=2)
            
    except Exception:
        pass
        
    return None