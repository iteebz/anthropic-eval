"""Smoke test: Tool failure recovery with Result pattern."""

import asyncio
from unittest.mock import AsyncMock, patch

import pytest

from cogency.agents.base import BaseAgent
from cogency.utils.results import Result


class MockLLM:
    """Mock LLM that returns predictable responses."""

    def __init__(self):
        self.call_count = 0

    async def run(self, messages, **kwargs):
        self.call_count += 1
        last_msg = messages[-1]["content"].lower()

        if self.call_count == 1:
            # Initial response - try risky command
            return Result.ok("I'll run a command that might fail: cat /nonexistent/file.txt")
        elif "error" in last_msg and "failed" in last_msg:
            # Recovery response after tool failure
            return Result.ok("I see the command failed. Let me try a simpler approach: ls -la")
        elif "total" in last_msg:
            # Got successful output - finish
            return Result.ok("Perfect! I can see the directory contents. The task is complete.")
        else:
            # Fallback
            return Result.ok("Task completed successfully.")


class MockBashTool:
    """Mock bash tool that fails predictably."""

    def __init__(self):
        self.call_count = 0

    async def call(self, command):
        self.call_count += 1

        if "nonexistent" in command:
            # First call fails
            return Result.fail("cat: /nonexistent/file.txt: No such file or directory")
        else:
            # Recovery call succeeds
            return Result.ok("total 48\ndrwxr-xr-x  12 user  staff   384 Jul 25 10:30 .")


@pytest.mark.asyncio
async def test_tool_failure_recovery():
    """Test agent recovers gracefully when tools fail."""

    # Setup mocks
    mock_llm = MockLLM()
    mock_bash = MockBashTool()

    # Create agent with mocked dependencies
    agent = BaseAgent(llm=mock_llm, tools=[mock_bash], max_iterations=5)

    # Run agent with initial prompt
    result = await agent.run("List the contents of the current directory")

    # Verify recovery happened
    assert result.success, f"Agent should recover from tool failure: {result.error}"
    assert mock_bash.call_count >= 1, "Tool should be called at least once"

    # Verify final result indicates completion
    assert "complete" in result.data.lower() or "perfect" in result.data.lower()


@pytest.mark.asyncio
async def test_multiple_tool_failures():
    """Test agent handles multiple consecutive tool failures."""

    class FailingBashTool:
        def __init__(self):
            self.call_count = 0

        async def call(self, command):
            self.call_count += 1
            return Result.fail(f"Command failed (attempt {self.call_count})")

    class PersistentLLM:
        async def run(self, messages, **kwargs):
            return Result.ok("Let me try another command: echo 'hello'")

    agent = BaseAgent(llm=PersistentLLM(), tools=[FailingBashTool()], max_iterations=3)

    result = await agent.run("Run a command")

    # Agent should eventually give up gracefully
    assert not result.success or "tried multiple approaches" in result.data.lower()


if __name__ == "__main__":
    asyncio.run(test_tool_failure_recovery())
    print("✓ Tool failure recovery smoke test passed")
