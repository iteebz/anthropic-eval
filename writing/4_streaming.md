
I rotate free Gemini API keys because I can't afford LLM credits. But the pattern seemed absurd enough that I had to fix it regardless of cost.

Since ChatGPT launched, we've treated language models like stateless functions. Send full context, get response, hang up. Need to continue? Call back and repeat the entire conversation from the beginning.

This is fucking insane.

It's like calling someone, having a conversation, hanging up mid-sentence, then calling back and starting over just to finish your thought. Every time an agent needs a tool, traditional frameworks restart the entire reasoning process. The longer your reasoning chain, the more expensive and slower each step becomes.

Most people accept this as the natural order of things. I couldn't.

## From XML Tags to Delimiters

I started experimenting with ways to let the language model signal its own state changes. First attempt was XML tags:

```xml
<thinking>Let me plan this out...</thinking>
<tool_call>{"name": "search", "query": "..."}</tool_call>
<response>Here's what I found...</response>
```

Too much bullshit ceremony. XML parsing is messy. Tags could collide with actual content. I needed something cleaner. Why do we need to terminate a section, when we only need the initial state change?

The delimiter system emerged organically from this:

```
§THINK: Let me plan this out...
§CALLS: [{"name": "search", "query": "..."}]
§YIELD:
[Tool execution happens here]
§RESPOND: Here's what I found...
§YIELD:
```

Simple. Unambiguous. Zero collision risk. The §YIELD delimiter became the key - this replaces the closing tag signalling state machine transitions - i.e. when tool calls have finished streaming, or the LLM is ready to end its turn. Flow: think → calls → yield, or think → respond → yield. The language model effectively drives its own execution.

But I was still thinking in HTTP terms. Pause meant ending the conversation and starting fresh - context replay with better parsing, but still replay.

Then I found the missing piece.

On my birthday, while researching streaming approaches, I discovered Gemini's Live API (released December '24) and OpenAI's Realtime API (released October '24). WebSocket connections with bidirectional streaming - I could pause the language model mid-stream, execute tools, inject results, and resume the same conversation thread. Context is preserved in the session!

I built a prototype that weekend. The agent started thinking, signaled when it needed tools, paused while tools executed, received results, and continued thinking in the same session. No restart. No replay. Holy shit, it worked.

I asked Claude if anyone else was building bidirectional streaming. Claude said no. I was relieved because finding out someone's already built something is demotivating as hell. The infrastructure existed - I just hadn't connected the dots until then.

## What This Actually Means

Traditional frameworks replay full context every tool cycle. Streaming consciousness pauses/resumes the same WebSocket conversation.

**Token efficiency scaling (see docs/proof.md for mathematical analysis):**

Traditional frameworks scale **quadratically** (O(n²)), streaming scales **linearly** (O(n)).

## The Architecture

```python
# Traditional: Context grows with each tool cycle
agent.run("Complex task") 
→ [Full context] → Tool call → [Full context + tool result] → Tool call
# Each step more expensive than the last

# Streaming consciousness: Context stays constant
agent = Agent()
async for event in agent.stream("Complex task"):
    # Stream pauses → tools execute → stream resumes
    # Same session, same context, constant token usage
```

The elegant part is dual-mode compatibility. If WebSocket streaming isn't available, Cogency falls back to traditional HTTP cycles automatically. Same API, different transport layer.

## The First Principles Approach

I didn't study existing agent frameworks and try to optimize them. The request/response pattern felt misaligned with how language models actually work - continuous token streams with state transitions.

LangChain and similar frameworks simulate state through context management in stateless HTTP architectures. I built stateless orchestration with stateful streams - the agent has no in-memory state, all state lives either in the WebSocket session or is assembled from storage on demand.

In this sense, the language model drives its own execution flow rather than being driven by framework polling. Agents simply signal when they need tools, the executor invokes the tools, results are injected back in, and streaming continues.

## Beyond Token Efficiency

Streaming consciousness enables real-time agent visibility - you see thinking, reasoning steps, and exactly where agents get stuck. Debug information becomes natural. Performance bottlenecks become obvious.

Plus, agents can ask clarifying questions mid-task without breaking context. Multi-step reasoning becomes genuinely conversational rather than simulated dialogue through context replay.

The WebSocket streaming APIs had been available for months before I connected them to agent orchestration. Sometimes infrastructure exists before the application becomes obvious.

