"""MagicSelector - Zero-ceremony component selection with AI-powered inference"""

from typing import Dict, Any, List, Optional
from .auto import get_registry, ComponentConfig, ComponentMetadata, ComponentCategory


class MagicSelector:
    """AI-powered component selection with zero ceremony"""
    
    def __init__(self, enabled_components: Optional[List[str]] = None):
        self.registry = get_registry()
        self.enabled_components = enabled_components
        
    def select(self, intent_signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Select component using AI-powered inference"""
        
        # 1. Direct content_type mapping (highest priority)
        if "content_type" in intent_signals:
            content_type = intent_signals["content_type"]
            if self._is_component_enabled(content_type):
                return self.registry.make_component_config(content_type, intent_signals, content)
        
        # 2. Primary intent mapping
        if "primary_intent" in intent_signals:
            component_type = self._map_intent_to_component(intent_signals["primary_intent"])
            if component_type and self._is_component_enabled(component_type):
                return self.registry.make_component_config(component_type, intent_signals, content)
        
        # 3. Smart content analysis
        inferred_type = self._analyze_content(content, intent_signals)
        if inferred_type and self._is_component_enabled(inferred_type):
            return self.registry.make_component_config(inferred_type, intent_signals, content)
        
        # 4. Fallback to markdown
        return self.registry.make_component_config("markdown", intent_signals, content)
    
    def _is_component_enabled(self, component_type: str) -> bool:
        """Check if component is enabled"""
        if not self.enabled_components:
            return True
        return component_type in self.enabled_components
    
    def _map_intent_to_component(self, intent: str) -> Optional[str]:
        """Map intent to component type using smart patterns"""
        intent_mappings = {
            # Content types
            "project_list": "card-grid",
            "code_sample": "code-snippet",
            "essay": "blog-post",
            "timeline": "timeline",
            "summary": "key-insights",
            "explanation": "expandable-section",
            "contact_info": "contact-form",
            "skills_data": "card-grid",
            "gallery_images": "image-gallery",
            
            # Action intents
            "showcase_work": "card-grid",
            "show_projects": "card-grid",
            "explain_concept": "expandable-section",
            "show_timeline": "timeline",
            "show_code": "code-snippet",
            "show_writing": "blog-post",
            "summarize": "key-insights",
            "show_contact": "contact-form",
            "show_skills": "card-grid",
            "show_gallery": "image-gallery",
            
            # Verb patterns
            "list": "card-grid",
            "explain": "expandable-section",
            "summarize": "key-insights",
            "code": "code-snippet",
            "write": "blog-post",
            "contact": "contact-form",
            "display": "card-grid",
            "show": "card-grid"
        }
        
        return intent_mappings.get(intent.lower())
    
    def _analyze_content(self, content: str, signals: Dict[str, Any]) -> Optional[str]:
        """Analyze content to infer component type"""
        content_lower = content.lower()
        
        # Code detection
        if any(marker in content for marker in ["```", "def ", "function", "class ", "import ", "from "]):
            return "code-snippet"
        
        # List/bullet detection
        if any(marker in content for marker in ["•", "- ", "* ", "1.", "2."]):
            # Check if it's insights vs regular list
            if any(keyword in content_lower for keyword in ["insight", "principle", "key", "important", "takeaway"]):
                return "key-insights"
            return "card-grid"
        
        # Timeline detection
        if any(keyword in content_lower for keyword in ["timeline", "chronological", "history", "sequence", "year", "date"]):
            return "timeline"
        
        # Long-form content
        if len(content) > 500:
            # Check for article/blog indicators
            if any(keyword in content_lower for keyword in ["article", "blog", "post", "essay", "story"]):
                return "blog-post"
            # Check for explanation indicators
            if any(keyword in content_lower for keyword in ["explain", "how to", "tutorial", "guide"]):
                return "expandable-section"
            return "blog-post"
        
        # Contact form detection
        if any(keyword in content_lower for keyword in ["contact", "email", "phone", "message", "form"]):
            return "contact-form"
        
        # Gallery detection
        if any(keyword in content_lower for keyword in ["image", "photo", "gallery", "picture", "visual"]):
            return "image-gallery"
        
        # Default to markdown for simple content
        return "markdown"
    
    def get_available_components(self) -> List[str]:
        """Get list of available components"""
        all_components = self.registry.get_available_components()
        
        if self.enabled_components:
            return [comp for comp in all_components if comp in self.enabled_components]
        
        return all_components
    
    def get_agent_options(self) -> str:
        """Get agent options string"""
        return self.registry.get_agent_options(self.enabled_components)


# Convenience functions for single-import usage
def select_component(intent_signals: Dict[str, Any], content: str, enabled_components: Optional[List[str]] = None) -> ComponentConfig:
    """Select component using magic selector"""
    selector = MagicSelector(enabled_components)
    return selector.select(intent_signals, content)


def get_component_options(enabled_components: Optional[List[str]] = None) -> str:
    """Get component options for agent prompts"""
    selector = MagicSelector(enabled_components)
    return selector.get_agent_options()


# Legacy compatibility
class ComponentSelector(MagicSelector):
    """Legacy component selector - use MagicSelector instead"""
    pass