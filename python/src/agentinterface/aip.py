"""
AIP Protocol - Nested component hierarchy with containers
"""

import json
from typing import Dict, Any, Optional, List, Union


# Type definitions for AIP blocks
AIPBlock = Dict[str, Any]
AIPContent = Union[AIPBlock, List[AIPBlock]]


def aip_block(block_type: str, **props) -> AIPBlock:
    """
    Create an AIP block with the specified type and properties.
    
    Args:
        block_type: Component type (e.g., 'text', 'card', 'tabs')
        **props: Component properties
        
    Returns:
        AIP block dictionary
    """
    return {"type": block_type, **props}


def aip_text(content: str) -> AIPBlock:
    """Create a text block."""
    return aip_block("text", content=content)


def aip_markdown(content: str) -> AIPBlock:
    """Create a markdown block."""
    return aip_block("markdown", content=content)


def aip_card(
    header: Optional[List[AIPBlock]] = None,
    body: Optional[List[AIPBlock]] = None,
    footer: Optional[List[AIPBlock]] = None,
    variant: str = "default"
) -> AIPBlock:
    """
    Create a card container with header, body, and footer sections.
    
    Args:
        header: List of AIP blocks for card header
        body: List of AIP blocks for card body  
        footer: List of AIP blocks for card footer
        variant: Card variant ('default', 'outlined', 'elevated')
        
    Returns:
        Card AIP block
    """
    card_props = {"variant": variant}
    if header:
        card_props["header"] = header
    if body:
        card_props["body"] = body
    if footer:
        card_props["footer"] = footer
    
    return aip_block("card", **card_props)


def aip_tabs(items: List[Dict[str, Any]]) -> AIPBlock:
    """
    Create a tabs container with multiple tab items.
    
    Args:
        items: List of tab items, each with 'id', 'label', and 'content'
               content should be a list of AIP blocks
        
    Returns:
        Tabs AIP block
    """
    return aip_block("tabs", items=items)


def aip_accordion(sections: List[Dict[str, Any]]) -> AIPBlock:
    """
    Create an accordion with collapsible sections.
    
    Args:
        sections: List of sections with 'title' and 'content'
        
    Returns:
        Accordion AIP block
    """
    return aip_block("accordion", sections=sections)


def aip_code(code: str, language: str = "", title: str = "") -> AIPBlock:
    """
    Create a code block with syntax highlighting.
    
    Args:
        code: Code content
        language: Programming language for syntax highlighting
        title: Optional title for the code block
        
    Returns:
        Code AIP block
    """
    props = {"code": code}
    if language:
        props["language"] = language
    if title:
        props["title"] = title
    
    return aip_block("code", **props)


def aip_response(blocks: Union[AIPBlock, List[AIPBlock]]) -> str:
    """
    Generate AIP response from blocks.
    
    Args:
        blocks: Single AIP block or list of AIP blocks
        
    Returns:
        JSON string for direct consumption by React renderer
    """
    if isinstance(blocks, dict):
        return json.dumps(blocks)
    else:
        return json.dumps(blocks)