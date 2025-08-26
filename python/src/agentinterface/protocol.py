"""Protocol - Static format instructions"""

def get_format_instructions() -> str:
    """Static format instructions"""
    return """Format as JSON objects:
- card: {"type": "card", "header": "...", "body": "..."}
- tabs: {"type": "tabs", "items": [...]}  
- code: {"type": "code", "code": "...", "language": "..."}
- text: {"type": "text", "content": "..."}
- markdown: {"type": "markdown", "content": "..."}"""
