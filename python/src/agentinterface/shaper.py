"""Response shaper - Transform agent text into UI components"""

import json
from typing import Any, Dict, Optional

from .ai import ai


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
    
    # Use our protocol generator
    protocol_instructions = ai.protocol()
    
    prompt = f"""Transform this agent response into a UI component.

=== AGENT RESPONSE ===
{response}

=== CONTEXT ===
Query: {query}
Domain: {domain}

=== AVAILABLE COMPONENTS ===
{protocol_instructions}

=== SELECTION RULES ===
- Multiple items → cards
- Code/commands → code  
- Analysis/insights → insights
- Timeline/dates → timeline
- Data/comparisons → table
- FAQ/expandable → accordion
- Simple text → markdown

Return AIP JSON:
{{
  "type": "component_name", 
  "data": {{ ... }}
}}

Or return "SKIP" if no component fits."""

    try:
        result = await llm.generate(prompt)
        
        if "SKIP" in result:
            return None
            
        # Clean JSON
        if "```json" in result:
            result = result.split("```json")[1].split("```")[0].strip()
        elif "```" in result:
            result = result.split("```")[1].strip()
            
        # Validate
        component = json.loads(result)
        if "type" in component and "data" in component:
            return json.dumps(component, indent=2)
            
    except Exception:
        pass
        
    return None