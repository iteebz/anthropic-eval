
While building agent infrastructure, I kept thinking about something that seemed blatantly obvious but nobody was doing:

Agents reason about which tools to use based on available options and task requirements. Why can't they reason about which UI components to display using the same cognitive pattern?

## The Tool → UI Insight

The inspiration came from MCP (Model Context Protocol) and its registry patterns. Agents examine available tools, choose the right ones for the task, and execute with parameters. Clean, simple, extensible.

What if UI components could work the same way?

Instead of manually parsing agent responses into tables, charts, and cards, what if agents could select components directly? 

```python
# Traditional: Manual parsing hell
if "timeline" in response:
    render_timeline(parse_timeline_data(response))
elif "table" in response:
    render_table(parse_table_data(response))

# Agent Interface Protocol: Component reasoning
result = await ai(agent).query("Show Q3 sales data")
# Returns: [{"type": "table", "data": {...}}, {"type": "insights", "data": {...}}]
```

## The Architecture

Three core patterns emerged:

**1. Response Shaper Pattern**
- Domain agent generates natural response about sales data
- Shaper LLM transforms text into component selections  
- Renderer creates React components from JSON
- Clean separation between domain logic and UI intelligence

**2. Registry Autodiscovery**
```bash
npx agentinterface discover
```
Scans your components, extracts metadata, generates `ai.json` registry. Agents automatically know about new components without code changes.

**3. Array-Based Composition**
```json
[
  {"type": "card", "data": {"title": "Results"}},
  [
    {"type": "table", "data": {...}},
    {"type": "insights", "data": {...}}
  ]
]
```

Arrays = horizontal layout. Nested arrays = infinite composition depth. The structure reads like layout intention. No verbose XML ceremony, no complex DSL - just nested arrays that make visual sense.

## Bidirectional Communication

The real insight wasn't just agent → UI. Full bidirectional communication means users can interact with components and trigger agent continuations.

```python
# Agent generates interactive component
callback_id = await ai(agent).interactive("Choose next action")

# User clicks button in UI → HTTP POST to callback endpoint
# Agent receives selection, continues conversation
continuation = await agent.handle_callback(user_selection)
```

Multi-step reasoning becomes genuinely interactive. Agents can ask questions visually, receive structured responses, and continue conversations with user choices.

## Universal Agent Wrapper

Any agent becomes artifact-capable through a single wrapper:

```python
# Works with any agent
result = await ai(your_agent).query("Analyze user behavior")
result = await ai(openai_assistant).query("Show project timeline")  
result = await ai(custom_function).query("Create product overview")
```

The wrapper handles response shaping, component registry lookup, callback servers, and graceful fallbacks to text. All the complexity hidden behind a simple interface.

## When Karpathy Caught Up

A few weeks after I built this, I discovered Andrej Karpathy had mentioned in his YC talk back in June:

**"No one's built the GUI for agents."**

He'd articulated a similar gap I was trying to solve - the missing layer between agent reasoning and interface generation.

## Protocol vs Template Architecture

Anthropic built curated artifact templates - five artifact types with predetermined layouts and quality control.

I built dynamic component composition - agents select specific components and define relationships through registry protocols rather than fixed templates.

**Template approach**: Agent decides artifact vs plain text, system renders predetermined layout  
**Protocol approach**: Agent composes specific components and relationships, system renders dynamic composition

Both solve different aspects of agent visual communication. Templates ensure consistency. Protocols enable extensibility.

## The Foundation

Three functions handle the entire protocol:

```python
# Transform any agent into UI-capable
components = await ai(agent).query("Show data")

# Shape text responses into component JSON  
shaped = await ai.shape(response, context, llm)

# Generate protocol instructions for LLMs
instructions = ai.protocol(available_components)
```

Registry autodiscovery, callback servers, component composition - all handled transparently. The complexity exists so the interface can be simple.

## What This Actually Means

I built visual vocabulary for agents. Components become words in a visual language that agents can speak fluently.

The deeper insight: UI selection is another form of reasoning. Agents already demonstrate sophisticated tool reasoning - when to search, when to calculate, when to analyze. UI reasoning is the same cognitive pattern applied to presentation decisions.

As agents handle complex analysis and interactive workflows, they need richer expression than text. Visual components become vocabulary. Composition becomes syntax. Interaction becomes dialogue.

