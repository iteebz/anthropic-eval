import json

from agentinterface import (
    aip_card,
    aip_markdown,
    aip_response,
    create_inline_resolver,
    get_available_components,
    register_component,
)


def test_aip_response_basic():
    """Test basic AIP response generation"""
    block = aip_markdown("Hello world")
    response = aip_response(block)
    assert "Hello world" in response
    assert "markdown" in response


def test_aip_markdown():
    """Test markdown component generation"""
    md = aip_markdown("# Test Header\nContent")
    assert md["type"] == "markdown"
    assert md["content"] == "# Test Header\nContent"


def test_aip_card():
    """Test card component generation"""
    card = aip_card(body="Test content", header="Test Title")
    assert card["type"] == "card"
    assert card["body"] == "Test content"
    assert card["header"] == "Test Title"


def test_registry_functionality():
    """Test component registry"""
    components = get_available_components()
    assert isinstance(components, list)
    assert len(components) > 0


def test_inline_resolver():
    """Test inline component resolver"""

    def mock_resolver(component_type, slug):
        return {"type": component_type, "data": f"resolved-{slug}"}

    resolver = create_inline_resolver(mock_resolver)
    assert resolver is not None
