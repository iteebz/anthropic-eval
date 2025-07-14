"""Agent Interface Protocol - Minimal Interface Options"""

# Available interface types for agent selection
INTERFACE_OPTIONS = {
    "markdown": "Default text/conversation",
    "card_grid": "Multiple items as visual cards", 
    "timeline": "Chronological events",
    "expandable_detail": "Collapsible sections",
    "key_insights": "Categorized insights/principles",
    "tech_deep_dive": "Technical explanations with code",
    "inline_link": "Expandable references"
}

def get_interface_prompt() -> str:
    """Simple interface options for agent to choose from."""
    return f"Available interfaces: {', '.join(INTERFACE_OPTIONS.keys())}"