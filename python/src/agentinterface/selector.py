"""ComponentSelector - Maps intent signals to AIP components."""

from typing import Dict, Any, List
from .registry import make_component_config, get_available_components, ComponentConfig


class ComponentSelector:
    """Maps intent signals to appropriate AIP components."""
    
    def __init__(self):
        # Intent -> component type mapping
        self.mappings = {
            # Content types (highest priority)
            "project_list": "project-card",
            "code_sample": "code-snippet",
            "essay": "blog-post",
            "timeline": "timeline",
            "summary": "key-insights",
            "explanation": "expandable-section",
            "contact_info": "contact-form",
            "skills_data": "skills-display",
            "gallery_images": "image-gallery",
            
            # Primary intents
            "showcase_work": "project-card",
            "show_projects": "project-card",
            "explain_concept": "expandable-section",
            "show_timeline": "timeline",
            "show_code": "code-snippet",
            "show_writing": "blog-post",
            "summarize": "key-insights",
            "show_contact": "contact-form",
            "show_skills": "skills-display",
            "show_gallery": "image-gallery",
        }
    
    def select(self, intent_signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Select appropriate component based on intent signals and content."""
        # Try content_type first, then primary_intent, then heuristics
        for key in ["content_type", "primary_intent"]:
            if key in intent_signals and intent_signals[key] in self.mappings:
                component_type = self.mappings[intent_signals[key]]
                return make_component_config(component_type, intent_signals, content)
        
        return self._heuristic_selection(intent_signals, content)
    
    def _heuristic_selection(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Fallback heuristic selection."""
        if "```" in content or "def " in content:
            return make_component_config("code-snippet", signals, content)
        if len(content) > 1000:
            return make_component_config("blog-post", signals, content)
        return make_component_config("markdown", signals, content)
    
    def register_intent_mapping(self, intent: str, component_type: str):
        """Register a new intent -> component mapping."""
        self.mappings[intent] = component_type
    
    def get_available_components(self) -> List[str]:
        """Get list of all available component types."""
        return get_available_components()