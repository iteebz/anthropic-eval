"""
AI Components - ZEALOT VERSION: Core functions + essential helpers
"""

import json
from typing import Any, Dict, List, Optional, Union

# Type definitions for AI component blocks
AIBlock = Dict[str, Any]
AIContent = Union[AIBlock, List[AIBlock]]


def ai_block(block_type: str, **props) -> AIBlock:
    """
    Create an AI component block with the specified type and properties.

    Args:
        block_type: Component type (e.g., 'text', 'card', 'tabs')
        **props: Component properties

    Returns:
        AI component block dictionary
    """
    return {"type": block_type, **props}


# ESSENTIAL HELPERS - provide real DX value with type safety and convenience

def ai_text(content: str) -> AIBlock:
    """Create a text block."""
    return ai_block("text", content=content)


def ai_markdown(content: str) -> AIBlock:
    """Create a markdown block."""
    return ai_block("markdown", content=content)


def ai_code(code: str, language: str = "", title: str = "") -> AIBlock:
    """Create a code block with syntax highlighting."""
    props = {"code": code}
    if language:
        props["language"] = language
    if title:
        props["title"] = title
    return ai_block("code", **props)


def ai_card(
    header: Optional[List[AIBlock]] = None,
    body: Optional[List[AIBlock]] = None,
    footer: Optional[List[AIBlock]] = None,
    variant: str = "default",
) -> AIBlock:
    """Create a card container with header, body, and footer sections."""
    props = {"variant": variant}
    if header:
        props["header"] = header
    if body:
        props["body"] = body
    if footer:
        props["footer"] = footer
    return ai_block("card", **props)


def ai_tabs(items: List[Dict[str, Any]]) -> AIBlock:
    """Create a tabs container with multiple tab items."""
    return ai_block("tabs", items=items)


def ai_accordion(sections: List[Dict[str, Any]]) -> AIBlock:
    """Create an accordion with collapsible sections."""
    return ai_block("accordion", sections=sections)


def ai_response(blocks: Union[AIBlock, List[AIBlock]]) -> str:
    """
    Generate AI component response from blocks.

    Args:
        blocks: Single AI block or list of AI blocks

    Returns:
        JSON string for direct consumption by React renderer
    """
    return json.dumps(blocks)