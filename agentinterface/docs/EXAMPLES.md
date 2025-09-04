# Examples

## Response Shaping

Transform agent text into UI components:

```python
from agentinterface import shape, protocol
from your_llm import LLM

llm = LLM()
agent_response = "Q3 sales increased 15%. Key metrics: Revenue $2M, Users 10K, Churn 2%."

# Transform to components  
shaped = await shape(
    response=agent_response,
    context={"query": "Show Q3 results", "domain": "business"},
    llm=llm
)

# Returns component JSON:
# [
#   {"type": "markdown", "data": {"content": "## Q3 Results\nSales increased 15%"}},
#   {"type": "table", "data": {"headers": ["Metric", "Value"], "rows": [["Revenue", "$2M"], ["Users", "10K"]]}}
# ]
```

## Full Agent Integration

Complete agent → UI workflow with bidirectional communication:

```python
from agentinterface import ai

# Your agent (any callable)
async def agent(query: str) -> str:
    return f"Sales analysis for: {query}"

# Full integration
agent = ai(agent, llm=your_llm)
async for event in agent("Show Q3 dashboard"):
    if event["type"] == "component":
        # Render components in UI
        render(JSON.stringify(event["data"]["components"]))
    else:
        # Agent events (passthrough)
        yield event
```

## Component Registry Protocol

Generate LLM instructions for available components:

```python
from agentinterface import protocol

# Get instructions for specific components
instructions = protocol(["table", "card", "timeline"])

# Or use all available components
instructions = protocol()  # Auto-discovers from ai.json
```

## TypeScript Rendering

Render component JSON in React:

```typescript
import { render } from './renderer';

const componentData = [
  {"type": "card", "data": {"title": "Results"}},
  [
    {"type": "table", "data": {"headers": ["Metric", "Value"], "rows": [["Speed", "95%"]]}},
    {"type": "timeline", "data": {"events": [{"date": "2024", "title": "Launch"}]}}
  ]
];

function Dashboard() {
  return <div>{render(JSON.stringify(componentData))}</div>;
}
```

## Custom Components

Add domain-specific components:

```typescript
// components/Portfolio.tsx
export const metadata = {
  type: 'portfolio',
  description: 'Project showcase with skills',
  schema: {
    type: 'object',
    properties: {
      projects: { type: 'array' },
      skills: { type: 'array' }
    }
  }
};

export function Portfolio({ projects, skills }) {
  return (
    <div>
      {projects.map(p => <div key={p.name}>{p.name}</div>)}
    </div>
  );
}
```

```bash
# Discover and register
npx agentinterface discover
# Portfolio automatically available to shaper LLM
```

## Error Handling

```python
from agentinterface import shape

try:
    shaped = await shape(response, context, llm)
except Exception:
    # Graceful fallback to original text
    shaped = response
```

## Agent Compatibility

Works with any agent pattern:

```python
# Callable agents
agent = lambda q: f"Analysis: {q}"
agent = ai(agent, llm)
result = await agent("Query")

# Class-based agents  
class MyAgent:
    async def run(self, query):
        return f"Result: {query}"

agent = ai(MyAgent(), llm)
result = await agent("Query")

# Function agents
async def agent(query):
    return await do_research(query)
    
agent = ai(agent, llm)
result = await agent("Query")
```