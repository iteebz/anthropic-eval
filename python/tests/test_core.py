"""
Core functionality tests for AgentInterface Python package
"""

import json
from agentinterface import (
    aip_response, aip_markdown, aip_card, aip_tabs, aip_accordion, aip_code,
    get_available_components, register_component, ComponentSpec, ComponentCategory,
    get_format_instructions
)


def test_aip_complex_structures():
    """Test complex nested AIP structures"""
    tab_content = aip_tabs([
        {"id": "tab1", "label": "First", "content": [aip_markdown("# Tab 1")]},
        {"id": "tab2", "label": "Second", "content": [aip_card(body="Card in tab")]}
    ])
    
    assert tab_content["type"] == "tabs"
    assert len(tab_content["items"]) == 2
    assert tab_content["items"][0]["label"] == "First"


def test_aip_accordion():
    """Test accordion component"""
    accordion = aip_accordion([
        {"title": "Section 1", "content": [aip_markdown("Content 1")]},
        {"title": "Section 2", "content": [aip_code("print('hello')", "python")]}
    ])
    
    assert accordion["type"] == "accordion"
    assert len(accordion["sections"]) == 2
    assert accordion["sections"][0]["title"] == "Section 1"


def test_aip_code_block():
    """Test code block generation"""
    code = aip_code("def hello():\n    return 'world'", "python", "Example Function")
    
    assert code["type"] == "code"
    assert code["code"] == "def hello():\n    return 'world'"
    assert code["language"] == "python"
    assert code["title"] == "Example Function"


def test_component_registry():
    """Test component registration and retrieval"""
    # Register a custom component
    register_component(
        "custom-test",
        "Test component", 
        category=ComponentCategory.INTERFACE,
        schema={"type": "object", "properties": {"text": {"type": "string"}}},
        tags=["test"]
    )
    
    components = get_available_components()
    
    # Should return a list
    assert isinstance(components, list)
    assert len(components) >= 0


def test_format_instructions():
    """Test protocol format instructions"""
    instructions = get_format_instructions()
    
    assert isinstance(instructions, str)
    assert len(instructions) > 0
    assert "AIP" in instructions or "component" in instructions.lower()


def test_json_serialization():
    """Test that AIP blocks serialize properly to JSON"""
    nested_structure = aip_card(
        header=[aip_markdown("# Header")],
        body=[
            aip_tabs([
                {"id": "t1", "label": "Tab 1", "content": [aip_code("print('test')", "python")]}
            ])
        ]
    )
    
    # Should serialize without errors
    json_str = aip_response(nested_structure)
    parsed = json.loads(json_str)
    
    assert parsed["type"] == "card"
    assert parsed["header"][0]["type"] == "markdown"
    assert parsed["body"][0]["type"] == "tabs"


def test_component_variants():
    """Test different component variants"""
    default_card = aip_card(body="Default", variant="default")
    outlined_card = aip_card(body="Outlined", variant="outlined")
    
    assert default_card["variant"] == "default"
    assert outlined_card["variant"] == "outlined"