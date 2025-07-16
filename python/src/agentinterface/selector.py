"""ComponentSelector - Maps intent signals to AIP components."""

from typing import Dict, Any, Optional, List
from pydantic import BaseModel


class ComponentConfig(BaseModel):
    """Base configuration for AIP components."""
    type: str
    props: Dict[str, Any] = {}
    
    def to_json(self) -> Dict[str, Any]:
        """Convert to AIP JSON format."""
        return {
            "type": self.type,
            "props": self.props
        }


class MarkdownComponentConfig(ComponentConfig):
    """Configuration for markdown components."""
    
    def __init__(self, content: str, **props):
        super().__init__(
            type="markdown",
            props={"content": content, **props}
        )


class CardGridComponentConfig(ComponentConfig):
    """Configuration for card grid components."""
    
    def __init__(self, cards: List[Dict[str, Any]], **props):
        super().__init__(
            type="card-grid", 
            props={"cards": cards, **props}
        )


class ExpandableSectionComponentConfig(ComponentConfig):
    """Configuration for expandable section components."""
    
    def __init__(self, title: str, content: str, **props):
        super().__init__(
            type="expandable-section",
            props={"title": title, "content": content, **props}
        )


class TimelineComponentConfig(ComponentConfig):
    """Configuration for timeline components."""
    
    def __init__(self, events: List[Dict[str, Any]], **props):
        super().__init__(
            type="timeline",
            props={"events": events, **props}
        )


class KeyInsightsComponentConfig(ComponentConfig):
    """Configuration for key insights components."""
    
    def __init__(self, insights: List[str], **props):
        super().__init__(
            type="key-insights",
            props={"insights": insights, **props}
        )


class CodeSnippetComponentConfig(ComponentConfig):
    """Configuration for code snippet components."""
    
    def __init__(self, code: str, language: str = "python", **props):
        super().__init__(
            type="code-snippet",
            props={"code": code, "language": language, **props}
        )


class BlogPostComponentConfig(ComponentConfig):
    """Configuration for blog post components."""
    
    def __init__(self, title: str, content: str, metadata: Optional[Dict] = None, **props):
        super().__init__(
            type="blog-post",
            props={"title": title, "content": content, "metadata": metadata or {}, **props}
        )


class ComponentSelector:
    """Maps intent signals to appropriate AIP components."""
    
    def __init__(self):
        self.intent_mappings = {
            # Project showcase intents
            "showcase_work": self._select_card_grid,
            "show_projects": self._select_card_grid,
            "project_overview": self._select_card_grid,
            
            # Content explanation intents
            "explain_concept": self._select_expandable_section,
            "show_details": self._select_expandable_section,
            "deep_dive": self._select_expandable_section,
            
            # Timeline/chronological intents
            "show_timeline": self._select_timeline,
            "show_progress": self._select_timeline,
            "show_history": self._select_timeline,
            
            # Code-related intents
            "show_code": self._select_code_snippet,
            "technical_example": self._select_code_snippet,
            
            # Writing/essay intents
            "show_writing": self._select_blog_post,
            "long_form": self._select_blog_post,
            
            # Key insights
            "summarize": self._select_key_insights,
            "key_points": self._select_key_insights,
            "takeaways": self._select_key_insights,
        }
        
        self.content_type_mappings = {
            "project_list": self._select_card_grid,
            "code_sample": self._select_code_snippet,
            "essay": self._select_blog_post,
            "timeline": self._select_timeline,
            "summary": self._select_key_insights,
            "explanation": self._select_expandable_section,
        }
    
    def select(self, intent_signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Select appropriate component based on intent signals and content."""
        
        # Primary selection: Check explicit content_type
        if "content_type" in intent_signals:
            content_type = intent_signals["content_type"]
            if content_type in self.content_type_mappings:
                return self.content_type_mappings[content_type](intent_signals, content)
        
        # Secondary selection: Check primary_intent
        if "primary_intent" in intent_signals:
            primary_intent = intent_signals["primary_intent"]
            if primary_intent in self.intent_mappings:
                return self.intent_mappings[primary_intent](intent_signals, content)
        
        # Tertiary selection: Heuristic analysis of content
        return self._select_by_heuristics(intent_signals, content)
    
    def _select_card_grid(self, intent_signals: Dict[str, Any], content: str) -> CardGridComponentConfig:
        """Generate card grid configuration."""
        # Extract project cards from content (simplified parsing)
        cards = self._extract_cards_from_content(content)
        return CardGridComponentConfig(cards=cards)
    
    def _select_expandable_section(self, intent_signals: Dict[str, Any], content: str) -> ExpandableSectionComponentConfig:
        """Generate expandable section configuration."""
        title = intent_signals.get("title", "Details")
        return ExpandableSectionComponentConfig(title=title, content=content)
    
    def _select_timeline(self, intent_signals: Dict[str, Any], content: str) -> TimelineComponentConfig:
        """Generate timeline configuration."""
        events = self._extract_timeline_from_content(content)
        return TimelineComponentConfig(events=events)
    
    def _select_code_snippet(self, intent_signals: Dict[str, Any], content: str) -> CodeSnippetComponentConfig:
        """Generate code snippet configuration."""
        language = intent_signals.get("language", "python")
        return CodeSnippetComponentConfig(code=content, language=language)
    
    def _select_blog_post(self, intent_signals: Dict[str, Any], content: str) -> BlogPostComponentConfig:
        """Generate blog post configuration."""
        title = intent_signals.get("title", "Untitled")
        metadata = intent_signals.get("metadata", {})
        return BlogPostComponentConfig(title=title, content=content, metadata=metadata)
    
    def _select_key_insights(self, intent_signals: Dict[str, Any], content: str) -> KeyInsightsComponentConfig:
        """Generate key insights configuration."""
        insights = self._extract_insights_from_content(content)
        return KeyInsightsComponentConfig(insights=insights)
    
    def _select_by_heuristics(self, intent_signals: Dict[str, Any], content: str) -> ComponentConfig:
        """Fallback selection using content heuristics."""
        
        # Code detection
        if "```" in content or "def " in content or "class " in content:
            return self._select_code_snippet(intent_signals, content)
        
        # List detection (potential cards)
        if content.count("\n- ") > 2 or content.count("\n* ") > 2:
            return self._select_card_grid(intent_signals, content)
        
        # Long content (potential blog post)
        if len(content) > 1000:
            return self._select_blog_post(intent_signals, content)
        
        # Default to markdown
        return MarkdownComponentConfig(content=content)
    
    def _extract_cards_from_content(self, content: str) -> List[Dict[str, Any]]:
        """Extract card data from content - simplified implementation."""
        # This is a simplified version - in practice, would use more sophisticated parsing
        lines = content.split('\n')
        cards = []
        
        current_card = {}
        for line in lines:
            line = line.strip()
            if line.startswith('### ') or line.startswith('## '):
                if current_card:
                    cards.append(current_card)
                current_card = {"title": line.replace('#', '').strip(), "content": ""}
            elif line and current_card:
                current_card["content"] += line + " "
        
        if current_card:
            cards.append(current_card)
        
        return cards if cards else [{"title": "Content", "content": content}]
    
    def _extract_timeline_from_content(self, content: str) -> List[Dict[str, Any]]:
        """Extract timeline events from content."""
        # Simplified timeline extraction
        events = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if line and ('2024' in line or '2023' in line or '2025' in line):
                events.append({
                    "date": "2024",  # Would extract actual date
                    "title": line,
                    "description": ""
                })
        
        return events if events else [{"date": "Now", "title": "Current", "description": content}]
    
    def _extract_insights_from_content(self, content: str) -> List[str]:
        """Extract key insights from content."""
        # Simple extraction - look for bullet points or numbered lists
        insights = []
        lines = content.split('\n')
        
        for line in lines:
            line = line.strip()
            if line.startswith('- ') or line.startswith('* ') or line.startswith('• '):
                insights.append(line[2:])
            elif line and len(line) < 100:  # Short, insight-like sentences
                insights.append(line)
        
        return insights[:5] if insights else [content[:100] + "..."]