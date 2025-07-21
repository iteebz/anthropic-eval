"""
Integration tests for JS↔Python pipeline
"""

import json
from agentinterface import aip_response, aip_markdown, aip_card, aip_tabs


def test_js_python_render_pipeline():
    """Test that Python generates JSON consumable by JS renderer"""
    
    # Create a complex nested structure like an agent would
    card_with_tabs = aip_card(
        header=[aip_markdown("# Analysis Results")],
        body=[
            aip_tabs([
                {
                    "id": "overview", 
                    "label": "Overview", 
                    "content": [aip_markdown("Key findings from analysis")]
                },
                {
                    "id": "details",
                    "label": "Details", 
                    "content": [aip_card(body="Detailed breakdown")]
                }
            ])
        ]
    )
    
    # Generate AIP response
    response_json = aip_response(card_with_tabs)
    
    # Verify it's valid JSON
    parsed = json.loads(response_json)
    
    # Verify structure matches what JS renderer expects
    assert parsed["type"] == "card"
    assert "header" in parsed
    assert "body" in parsed
    
    # Verify nested components
    header_block = parsed["header"][0]
    assert header_block["type"] == "markdown"
    assert "Analysis Results" in header_block["content"]
    
    # Verify tabs structure
    tabs_block = parsed["body"][0]
    assert tabs_block["type"] == "tabs"
    assert len(tabs_block["items"]) == 2
    assert tabs_block["items"][0]["id"] == "overview"
    assert tabs_block["items"][1]["id"] == "details"


def test_agent_response_format():
    """Test the format agents would actually use"""
    
    # Simulate what an agent might generate
    agent_blocks = [
        aip_markdown("## Summary\nProcessed 1,234 records"),
        aip_card(
            header=[aip_markdown("**Status**: Complete")],
            body=[aip_markdown("All records processed successfully")]
        )
    ]
    
    response = aip_response(agent_blocks)
    parsed = json.loads(response)
    
    # Should be a list of blocks
    assert isinstance(parsed, list)
    assert len(parsed) == 2
    
    # First block should be markdown
    assert parsed[0]["type"] == "markdown"
    assert "Summary" in parsed[0]["content"]
    
    # Second block should be card
    assert parsed[1]["type"] == "card"
    assert parsed[1]["header"][0]["content"] == "**Status**: Complete"


def test_minimal_agent_response():
    """Test minimal response format"""
    
    simple_response = aip_response(aip_markdown("Hello, world!"))
    parsed = json.loads(simple_response)
    
    assert parsed["type"] == "markdown"
    assert parsed["content"] == "Hello, world!"


def test_empty_response():
    """Test edge case of empty response"""
    
    empty_response = aip_response([])
    parsed = json.loads(empty_response)
    
    assert parsed == []