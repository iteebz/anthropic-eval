# Architecture

**Key innovations:** Component reasoning via shaper LLM, autodiscovery system, bidirectional callbacks, recursive composition

## System Design

**Agent Response → Shaper LLM Analysis → Component Selection → UI Rendering**

```python
agent = ai(agent, llm)
result = await agent("Show sales data")
# Returns: (text, components) or async generator with component events
```

## Core Components

### Response Shaper
```python
# Python: agentinterface/shaper.py
async def shape(response: str, context: dict, llm) -> str:
    # Transform text → component JSON via LLM
    return await _generate_component(response, context, llm)
```

**Function:** Text → structured component selection

### Component Registry  
```typescript
// Auto-generated from component metadata
const COMPONENTS = {
  card: Card,
  table: Table,
  timeline: Timeline,
  // ... discovered via npx agentinterface discover
};
```

**Function:** Type string → React component mapping

### Recursive Renderer
```typescript
function renderItem(item: any): React.ReactNode {
  if (Array.isArray(item)) {
    return <div className="flex gap-4">{/* Horizontal */}</div>;
  }
  
  const Component = COMPONENTS[item.type];
  return <Component {...processData(item.data)} />;
}
```

**Function:** JSON → nested React components

## Component Discovery System

### Metadata Pattern
```typescript
// Every component exports metadata
export const metadata = {
  type: 'card',
  description: 'Generic card layout',
  schema: { /* JSON Schema */ },
  category: 'layout'
};
```

### Autodiscovery Process
```javascript
// scripts/discover.mjs
1. Scan .tsx files for metadata exports
2. Extract schema + description via eval()
3. Generate ai.json registry
4. Components automatically available to shaper LLM
```

## Bidirectional Communication

### Callback Architecture
```python
# ai.py callback server
@app.post("/callback/{callback_id}")
async def handle_callback(callback_id: str, request: dict):
    # User interaction → agent continuation
    if callback_id in pending_callbacks:
        callbacks[callback_id].set_result(request)
```

### Interaction Flow
```
1. Agent generates component with callback_id
2. User interacts with component
3. Component POSTs to callback endpoint  
4. Agent receives interaction data
5. Agent continues conversation with user choice
```

## Composition System

### Layout Rules
- **Arrays:** Horizontal layout (`flex gap-4`)
- **Nested objects:** Infinite component depth
- **Data processing:** Recursive component resolution

### Example Composition
```json
[
  {"type": "card", "data": {"title": "Overview"}},
  [
    {"type": "table", "data": {...}},
    {"type": "insights", "data": {...}}
  ]
]
```

**Renders:** Card above, table + insights side-by-side

## Shaper LLM Protocol

### Component Selection Logic
```python
prompt = f"""Transform agent response into UI components.

=== AGENT RESPONSE ===
{response}

=== AVAILABLE COMPONENTS ===
{component_registry}

Return JSON array. Components can contain other components.
"""
```

**Intelligence:** Shaper LLM analyzes agent response and selects optimal presentation components based on content type and user context

## Technical Elegance

**Separation of Concerns:**
- **Agent:** Domain reasoning, generates natural language response
- **Shaper LLM:** Analyzes response content, selects optimal UI components
- **Renderer:** Transforms component JSON into interactive React interface

**Universal Compatibility:**
- Works with any agent framework
- No agent modification required
- Graceful fallback to text

**Infinite Extensibility:**
- Component metadata exports
- Automatic registry generation  
- Type-safe component resolution

**Zero Integration Friction:**
- Single `ai()` wrapper function
- Automatic component discovery
- Bidirectional communication built-in