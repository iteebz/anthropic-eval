"""
Minimal canonical tests for AgentInterface v1.0.0
Tests only what actually exists in the API.
"""

import json
from pathlib import Path

from agentinterface import ai, protocol, shape


def test_imports():
    """Test that core functions import correctly"""
    assert callable(ai)
    assert callable(protocol)
    assert callable(shape)


def test_protocol_generation():
    """Test protocol instruction generation"""
    instructions = protocol()

    assert isinstance(instructions, str)
    assert len(instructions) > 0
    assert "json" in instructions.lower() or "component" in instructions.lower()


def test_protocol_with_component_list():
    """Test protocol with specific components"""
    instructions = protocol(["card", "markdown"])

    assert isinstance(instructions, str)
    assert len(instructions) > 0


def test_registry_loading():
    """Test that registry can be loaded if it exists"""
    # Create a test registry
    test_registry = {
        "components": {
            "test": {
                "description": "Test component",
                "schema": {"type": "object"},
                "category": "test",
            }
        }
    }

    registry_path = Path("test-registry.json")
    registry_path.write_text(json.dumps(test_registry))

    try:
        # This tests internal registry loading indirectly
        instructions = protocol(["test"])
        assert isinstance(instructions, str)
    finally:
        registry_path.unlink()  # cleanup


def test_shape_function_exists():
    """Test that shape function is callable"""
    # shape function requires async but we can test it's importable
    assert callable(shape)


def test_ai_function_exists():
    """Test that ai function is callable"""
    # ai function is the main entry point
    assert callable(ai)
