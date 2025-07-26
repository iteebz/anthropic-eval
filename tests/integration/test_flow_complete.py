"""Test the core execution flow and state transitions."""

from unittest.mock import AsyncMock

import pytest
from resilient_result import Result

from cogency import State
from cogency.context import Context
from cogency.flow import Flow
from cogency.nodes.act import act
from cogency.nodes.reason import reason
from cogency.nodes.respond import respond
from cogency.output import Output
from cogency.tools.calculator import Calculator
from tests.conftest import MockLLM


@pytest.fixture
def agent_state(context):  # Using the context fixture from conftest.py
    """Basic State fixture."""
    return State(context=context, query="Hello", output=Output())


@pytest.mark.asyncio
async def test_direct():
    """Test a simple flow: preprocess -> respond."""
    # Setup
    llm = MockLLM()
    Context("Hello")
    Output()
    flow = Flow(llm=llm, tools=[], memory=None)

    # Flow is a StateGraph now - test that it compiles
    assert flow.flow is not None


@pytest.mark.asyncio
async def test_tool():
    """Test a simple flow: preprocess -> reason -> act -> reason -> respond."""
    # Setup
    llm = MockLLM()
    tools = [Calculator()]
    Context("What is 2+2?")
    Output()
    flow = Flow(llm=llm, tools=tools, memory=None)

    # Test flow has tools and compiled graph
    assert len(flow.tools) == 1
    assert flow.flow is not None


@pytest.mark.asyncio
async def test_reason_direct_answer(agent_state, mock_llm, tools):
    mock_llm.run = AsyncMock(
        return_value=Result(data='{"reasoning": "I can answer this directly."}')
    )

    await reason(agent_state, llm=mock_llm, tools=tools)

    assert "tool_calls" not in agent_state.flow or not agent_state.flow["tool_calls"]


@pytest.mark.asyncio
async def test_reason_needs_tools(agent_state, mock_llm, tools):
    mock_llm.run = AsyncMock(
        return_value=Result(
            data='{"thinking": "I need a tool.", "tool_calls": [{"name": "mock_tool", "args": {"param": "value"}}]}'
        )
    )

    await reason(agent_state, llm=mock_llm, tools=tools)

    assert agent_state.get("tool_calls") is not None


@pytest.mark.asyncio
async def test_act_executes_tools(agent_state, tools):
    # The state passed to act_node now comes from the output of reason_node
    state_from_reason = {
        "tool_calls": [{"name": "mock_tool", "args": {"param": "value"}}],
        "selected_tools": tools,
    }
    # We need to merge this with the initial agent_state for the node to have context
    # Copy the agent_state
    full_state = agent_state
    # Add the state_from_reason items to the flow dict
    for key, value in state_from_reason.items():
        full_state.flow[key] = value

    result = await act(full_state, tools=tools)

    result_data = result.result
    assert result_data.success


@pytest.mark.asyncio
async def test_respond_formats_response(agent_state, mock_llm):
    # Respond node now gets a simple state, no complex reasoning decision needed
    result = await respond(agent_state, llm=mock_llm, tools=[])

    assert "final_response" in result
    assert result["final_response"]  # Should not be empty


@pytest.mark.asyncio
async def test_simple_direct_flow(agent_state, mock_llm, tools):
    mock_llm.run = AsyncMock(return_value=Result(data='{"reasoning": "Simple greeting."}'))

    # 1. Reason
    reason_result = await reason(agent_state, llm=mock_llm, tools=tools)

    # 2. Respond
    # Update state with the result of the reason node
    current_state = agent_state
    # Copy specific keys we know are in the result
    if "next_node" in reason_result:
        current_state.flow["next_node"] = reason_result["next_node"]
    if "reasoning" in reason_result:
        current_state.flow["reasoning"] = reason_result["reasoning"]
    if "direct_answer" in reason_result:
        current_state.flow["direct_answer"] = reason_result["direct_answer"]
    if "tool_calls" in reason_result:
        current_state.flow["tool_calls"] = reason_result["tool_calls"]
    respond_result = await respond(current_state, llm=mock_llm, tools=[])
    assert "final_response" in respond_result


@pytest.mark.asyncio
async def test_tool_flow(agent_state, mock_llm, tools):
    # 1. Reason (needs tools)
    mock_llm.run = AsyncMock(
        return_value=Result.ok(
            '{"reasoning": "I need the mock tool.", "tool_calls": [{"name": "mock_tool", "args": {"param": "test"}}]}'
        )
    )
    reason_result = await reason(agent_state, llm=mock_llm, tools=tools)

    # 2. Act
    state_for_act = agent_state
    # Copy specific keys we know are in the result
    if "next_node" in reason_result:
        state_for_act.flow["next_node"] = reason_result["next_node"]
    if "reasoning" in reason_result:
        state_for_act.flow["reasoning"] = reason_result["reasoning"]
    if "direct_answer" in reason_result:
        state_for_act.flow["direct_answer"] = reason_result["direct_answer"]
    if "tool_calls" in reason_result:
        state_for_act.flow["tool_calls"] = reason_result["tool_calls"]
    state_for_act.flow["selected_tools"] = tools
    state_for_act.flow["selected_tools"] = tools
    act_result = await act(state_for_act, tools=tools)
    result_data = act_result.result
    assert result_data.success

    # 3. Reason (reflect on results)
    mock_llm.run = AsyncMock(
        return_value=Result.ok('{"reasoning": "Got the result, now I can answer."}')
    )
    state_for_reflection = agent_state
    # Add the act_result items to the flow dict
    for key in act_result.flow:
        state_for_reflection.flow[key] = act_result.flow[key]
    reflection_result = await reason(state_for_reflection, llm=mock_llm, tools=tools)

    # 4. Respond
    state_for_respond = agent_state
    # Add the reflection_result items to the flow dict
    for key in reflection_result.flow:
        state_for_respond.flow[key] = reflection_result.flow[key]
    respond_result = await respond(state_for_respond, llm=mock_llm, tools=[])
    assert "final_response" in respond_result
