"""Agent Interface Protocol - Zero Bullshit"""

INTERFACE_OPTIONS = {
    "markdown": "Default text/conversation",
    "card_grid": "Multiple items as visual cards", 
    "timeline": "Chronological events",
    "expandable_sections": "Collapsible sections",
    "key_insights": "Categorized insights/principles",
    "code_snippet": "Code with syntax highlighting",
    "blog_post": "Article/post layout",
    "inline_reference": "Expandable references"
}

def get_interface_options(enabled_components=None):
    """Get agent options with opt-in filtering."""
    if enabled_components:
        filtered = {k: v for k, v in INTERFACE_OPTIONS.items() if k in enabled_components}
        return "\n".join(f"{k}: {v}" for k, v in filtered.items())
    return "\n".join(f"{k}: {v}" for k, v in INTERFACE_OPTIONS.items())