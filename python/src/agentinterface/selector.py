"""ComponentSelector - Maps intent signals to AIP components."""

from typing import Dict, Any, List
from pydantic import BaseModel


class ComponentConfig(BaseModel):
    """Base configuration for AIP components."""
    type: str
    props: Dict[str, Any] = {}
    
    def to_json(self) -> Dict[str, Any]:
        return {"type": self.type, "props": self.props}


# Component configs - auto-generated from type + props
def _make_config(component_type: str, **props):
    """Factory for component configs."""
    return ComponentConfig(type=component_type, props=props)

# Specific component configs for type safety
MarkdownComponentConfig = lambda content, **props: _make_config("markdown", content=content, **props)
CardGridComponentConfig = lambda cards, **props: _make_config("card-grid", cards=cards, **props)
ExpandableSectionComponentConfig = lambda title, content, **props: _make_config("expandable-section", title=title, content=content, **props)
TimelineComponentConfig = lambda events, **props: _make_config("timeline", events=events, **props)
KeyInsightsComponentConfig = lambda insights, **props: _make_config("key-insights", insights=insights, **props)
CodeSnippetComponentConfig = lambda code, language="python", **props: _make_config("code-snippet", code=code, language=language, **props)
ContactFormComponentConfig = lambda fields, action="/contact", **props: _make_config("contact-form", fields=fields, action=action, **props)
ProjectCardComponentConfig = lambda title, description, technologies, links, image=None, **props: _make_config("project-card", title=title, description=description, technologies=technologies, links=links, image=image, **props)
SkillsDisplayComponentConfig = lambda skills, display_type="grid", **props: _make_config("skills-display", skills=skills, display_type=display_type, **props)
ImageGalleryComponentConfig = lambda images, layout="grid", **props: _make_config("image-gallery", images=images, layout=layout, **props)
BlogPostComponentConfig = lambda title, content, metadata=None, **props: _make_config("blog-post", title=title, content=content, metadata=metadata or {}, **props)


class ComponentSelector:
    """Maps intent signals to appropriate AIP components."""
    
    def __init__(self):
        # Intent -> component mapping
        self.mappings = {
            # Content types (highest priority)
            "project_list": self._project_card,
            "code_sample": self._code_snippet,
            "essay": self._blog_post,
            "timeline": self._timeline,
            "summary": self._key_insights,
            "explanation": self._expandable_section,
            "contact_info": self._contact_form,
            "skills_data": self._skills_display,
            "gallery_images": self._image_gallery,
            
            # Primary intents
            "showcase_work": self._project_card,
            "show_projects": self._project_card,
            "explain_concept": self._expandable_section,
            "show_timeline": self._timeline,
            "show_code": self._code_snippet,
            "show_writing": self._blog_post,
            "summarize": self._key_insights,
            "show_contact": self._contact_form,
            "show_skills": self._skills_display,
            "show_gallery": self._image_gallery,
        }
    
    def select(self, intent_signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Select appropriate component based on intent signals and content."""
        # Try content_type first, then primary_intent, then heuristics
        for key in ["content_type", "primary_intent"]:
            if key in intent_signals and intent_signals[key] in self.mappings:
                return self.mappings[intent_signals[key]](intent_signals, content)
        
        return self._heuristic_selection(intent_signals, content)
    
    def _heuristic_selection(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Fallback heuristic selection."""
        if "```" in content or "def " in content:
            return self._code_snippet(signals, content)
        if len(content) > 1000:
            return self._blog_post(signals, content)
        return MarkdownComponentConfig(content=content)
    
    # Component generators - simple and focused
    def _project_card(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        title = content.split('\n')[0][:50] if content else "Project"
        return ProjectCardComponentConfig(
            title=title,
            description=content[:200] + "..." if len(content) > 200 else content,
            technologies=[],
            links={"github": "#", "demo": "#"}
        )
    
    def _expandable_section(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        return ExpandableSectionComponentConfig(
            title=signals.get("title", "Details"),
            content=content
        )
    
    def _timeline(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        events = [{"date": "Now", "title": "Current", "description": content}]
        return TimelineComponentConfig(events=events)
    
    def _code_snippet(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        return CodeSnippetComponentConfig(
            code=content,
            language=signals.get("language", "python")
        )
    
    def _blog_post(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        return BlogPostComponentConfig(
            title=signals.get("title", "Untitled"),
            content=content,
            metadata=signals.get("metadata", {})
        )
    
    def _key_insights(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        insights = [line.strip()[2:] for line in content.split('\n') 
                   if line.strip().startswith(('- ', '* ', '• '))]
        return KeyInsightsComponentConfig(insights=insights or [content[:100]])
    
    def _contact_form(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        fields = [
            {"name": "name", "type": "text", "label": "Name", "required": True},
            {"name": "email", "type": "email", "label": "Email", "required": True},
            {"name": "message", "type": "textarea", "label": "Message", "required": True}
        ]
        return ContactFormComponentConfig(fields=fields)
    
    def _skills_display(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        skills = [{"name": "Full Stack Development", "level": "Advanced", "category": "Technical"}]
        return SkillsDisplayComponentConfig(skills=skills)
    
    def _image_gallery(self, signals: Dict[str, Any], content: str) -> ComponentConfig:
        images = [{"src": "/placeholder.jpg", "alt": "Portfolio work", "title": "Project"}]
        return ImageGalleryComponentConfig(images=images)