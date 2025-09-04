# AgentInterface

Agents choose components. Universal agent wrapper.

**Architecture:** Agent → Shaper LLM → Component JSON → React UI

```bash
npm install agentinterface
```

```python
pip install agentinterface
```

## Tool → UI Reasoning Pattern

Agents reason about which tools to use. Same pattern for UI components:

```python
# Manual parsing: O(components × responses)
if "table" in response: render_table(parse_data(response))
if "chart" in response: render_chart(parse_data(response))

# Component reasoning: O(1)
enhanced = ai(agent, llm="gemini")
text, components = await enhanced("Show Q3 sales")
# Returns components: [{"type": "table", "data": {...}}]
```

Shaper LLM analyzes response and selects optimal components:

```python
# Works with any agent: OpenAI, Anthropic, custom
enhanced = ai(agent, llm="gemini")  
result = await enhanced("Show Q3 sales data")
# Returns: (text, components) - preserves original output
```

## Key Differentiators

**vs Claude Artifacts:**
- Works with any agent (OpenAI, Anthropic, custom)
- Bidirectional: Components → callbacks → agent continuation  
- Multi-component composition per response
- Streaming with component injection

**vs Manual Parsing:**
- Automatic component selection via LLM reasoning
- Zero parsing logic required

## Architecture

1. **Agent responds** - Domain-specific text output
2. **Shaper LLM** - Analyzes response, selects optimal UI components
3. **Components render** - JSON → interactive React interface

```python
from agentinterface import ai

# Curried pattern
enhanced = ai(your_agent, llm="gemini")
result = await enhanced("Show Q3 sales")
# Returns: [{"type": "table", "data": {...}}]
```

## Component Registry

```bash
npx agentinterface discover  # Generates ai.json
```

Scans your codebase, extracts metadata, generates LLM-readable schemas.

## Component Types

**Layout:** `card`, `accordion`, `tabs`  
**Data:** `table`, `timeline`, `tree`  
**Interactive:** `suggestions`, `gallery`

## Bidirectional Interaction

```python
# Component callbacks continue conversation
async for event in enhanced("Show sales data"):
    if event["type"] == "component":
        # User interacts with component → callback → agent continuation
        user_action = await event["callback_future"] 
        continuation = enhanced(f"User selected: {user_action}")
```

## Multi-Component Composition

```json
[
  {"type": "card", "data": {"title": "Results"}},
  [
    {"type": "table", "data": {...}},
    {"type": "insights", "data": {...}}
  ]
]
```

Arrays create vertical stacks. Nested arrays create horizontal rows.

## Custom Components

```typescript
export const metadata = {
  type: 'portfolio',
  description: 'Project showcase',
  schema: { /* JSON Schema */ }
};

export function Portfolio({ projects }) {
  return <div>{/* Component */}</div>;
}
```

```bash
npx agentinterface discover  # Auto-integrates
```

## Design Principle

**Agent**: Domain reasoning ("Show Q3 sales data")  
**Shaper LLM**: Component selection (table + insights)  
**Renderer**: UI composition

Separation of concerns: domain logic, presentation intelligence, visual rendering.

## License

MIT