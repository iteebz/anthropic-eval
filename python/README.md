# AgentInterface Python

Agent reasoning applied to UI component selection.

```python
from agentinterface import ai

# Wrap any agent
agent = ai(your_agent, llm)
result = await agent("Show sales data")
# Returns: (text, [{"type": "table", "data": {...}}])
```

## Installation

```bash
pip install agentinterface
```

## Usage

Works with any agent framework. Agent generates response, shaper LLM selects optimal UI components, renderer creates interactive interface.