from agentinterface import AgentResponse, InterfaceType, ResponseParser

def test_basic_agent_response_parsing():
    raw_response = """
THINKING: Test thought
RESPONSE: Test response
INTERFACE_TYPE: markdown
INTERFACE_DATA: {}
"""
    parsed = ResponseParser.parse(raw_response)
    assert parsed.thinking == "Test thought"
    assert parsed.response == "Test response"
    assert parsed.interface_type == InterfaceType.MARKDOWN
    assert parsed.interface_data == {}

def test_agent_response_formatting():
    response = AgentResponse(
        thinking="Another thought",
        response="Another response",
        interface_type=InterfaceType.MARKDOWN,
        interface_data={"key": "value"}
    )
    formatted = ResponseParser.format(response)
    expected_output = """
THINKING: Another thought
RESPONSE: Another response
INTERFACE_TYPE: markdown
INTERFACE_DATA: {"key": "value"}
"""
    assert formatted.strip() == expected_output.strip()
