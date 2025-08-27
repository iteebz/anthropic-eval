# AgentInterface

Agent JSON → React components. Two-way communication.

```python
import agentinterface as ai

# Agent creates components
card = ai.card(title="Sales", data=metrics)

# Agent gets UI instructions  
instructions = ai.protocol()

# Transform text into components
shaped = await ai.shape(agent_response)

# Make agent interactive
interactive = ai.interactive(agent)
```

## Core Functions

**ai.card()** - Create component JSON  
**ai.protocol()** - Get format instructions for agents  
**ai.shape()** - Transform text into components  
**ai.interactive()** - Two-way UI communication  

## Installation

```bash
pip install agentinterface
```

## Frontend

```tsx
import { AIPRenderer } from 'agentinterface'

// Renders agent JSON as React components
<AIPRenderer agentResponse={jsonFromAgent} />
```

MIT License.
