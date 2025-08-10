"""Response shaper - component selection with zero ceremony."""

import json
from typing import Any, Dict, List, Optional

from ..registry import get_available_components, get_format_instructions


class ResponseShaper:
    """Single-call response shaper with rich context."""
    
    def __init__(self, llm_provider: Optional[Any] = None):
        self.llm = llm_provider or self._get_default_llm()
        self.components = get_available_components()
        self.registry_instructions = get_format_instructions()
    
    async def shape(self, response: str, context: Dict[str, Any] = None) -> str:
        """
        Shape agent response with rich context in single LLM call.
        
        Args:
            response: Agent's final response
            context: Rich context including query, domain, retrieval_data, etc.
            
        Returns:
            Original response or AIP component JSON
        """
        context = context or {}
        
        try:
            # Single call that does analysis + extraction
            aip_component = await self._generate_component(response, context)
            return aip_component if aip_component else response
            
        except Exception:
            # Graceful fallback
            return response
    
    async def _generate_component(self, response: str, context: Dict[str, Any]) -> Optional[str]:
        """Generate AIP component in single call with rich context."""
        
        # Extract rich context
        query = context.get("query", "")
        domain = context.get("domain", "general")
        retrieval_data = context.get("retrieval_data", "")
        user_id = context.get("user_id", "")
        
        # Build comprehensive prompt that does both analysis and extraction
        prompt = f"""You are an AgentInterface Protocol (AIP) component generator. Your job is to:
1. Analyze the agent response and context
2. Select the most appropriate AIP component type 
3. Extract structured data and return complete AIP component JSON

=== AGENT RESPONSE ===
{response}

=== RICH CONTEXT ===
Query: {query}
Domain: {domain}
User: {user_id}
{f"Retrieval Data: {retrieval_data}" if retrieval_data else ""}

=== COMPONENT SELECTION RULES ===
- Multiple projects/items/examples → cards
- Code blocks/snippets/commands → code  
- Analysis/insights/key points → insights
- Chronological events/dates/timeline → timeline
- Structured comparisons/data → table
- FAQ/Q&A/expandable sections → accordion
- Images/screenshots/visual content → gallery
- Interactive suggestions/next steps → suggestions
- Citation/reference content → reference
- Navigation/multi-view content → tabs
- Simple text/explanations → markdown

=== AVAILABLE COMPONENTS ===
{self._get_component_list()}

=== INSTRUCTIONS ===
1. Analyze the response content and context
2. Choose the MOST appropriate component type
3. Extract ALL relevant data from the response
4. Return complete AIP JSON with this structure:

{{
  "type": "component_name",
  "data": {{
    // Component-specific structured data extracted from response
  }},
  "meta": {{
    "generated_by": "agentinterface_response_shaper_v2",
    "confidence": 0.8,
    "reasoning": "why this component was chosen"
  }}
}}

IMPORTANT:
- If no component fits well, return: {{"skip": true, "reason": "content too simple/generic"}}
- Extract ALL details from the response, don't summarize or lose information
- Use rich context to understand intent and preserve semantic meaning
- Be specific with data extraction - include titles, descriptions, tags, links, etc.

Generate the AIP component now:"""

        try:
            result = await self.llm.generate(prompt)
            
            # Clean up result
            if result.startswith("```json"):
                result = result.split("```json")[1].split("```")[0].strip()
            elif result.startswith("```"):
                result = result.split("```")[1].strip()
                
            # Parse and validate
            component = json.loads(result)
            
            # Check if LLM decided to skip
            if component.get("skip"):
                return None
                
            # Validate component structure
            if "type" in component and "data" in component:
                component_type = component["type"]
                if component_type in self.components:
                    return json.dumps(component, indent=2)
            
            return None
            
        except Exception:
            return None
    
    def _get_component_list(self) -> str:
        """Get simplified component list for selection."""
        components = []
        
        # Hardcode the key ones with clear triggers
        component_rules = {
            "cards": "Multiple items, projects, examples, lists with titles/descriptions",
            "code": "Code blocks, commands, snippets, programming examples", 
            "insights": "Key points, analysis results, important findings, bullet insights",
            "timeline": "Chronological events, dates, project phases, historical sequence",
            "table": "Structured data, comparisons, feature matrices, specifications",
            "accordion": "FAQ, Q&A sections, expandable/collapsible content",
            "gallery": "Images, screenshots, visual content, photo collections",
            "suggestions": "Next steps, action items, interactive suggestions",
            "tabs": "Multiple views, categorized content, tabbed navigation",
            "markdown": "Simple text, explanations, basic content without special structure"
        }
        
        for comp_type, description in component_rules.items():
            if comp_type in self.components:
                components.append(f"- {comp_type}: {description}")
        
        return "\n".join(components)
    
    def _get_default_llm(self):
        """Get default LLM provider."""
        try:
            import openai
            
            class DefaultLLM:
                def __init__(self):
                    self.client = openai.AsyncOpenAI()
                    
                async def generate(self, prompt: str) -> str:
                    response = await self.client.chat.completions.create(
                        model="gpt-4o-mini",
                        messages=[{"role": "user", "content": prompt}],
                        temperature=0.1
                    )
                    return response.choices[0].message.content
            
            return DefaultLLM()
            
        except ImportError:
            raise ImportError("OpenAI package required for default LLM. Install with: pip install openai")