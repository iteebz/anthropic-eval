"""Agent UI component generation."""

import asyncio
import json
import uuid
from contextlib import asynccontextmanager
from pathlib import Path
from threading import Thread
from typing import Dict, List, Optional

from .logger import logger


def _load_registry() -> Dict[str, Dict[str, str]]:
    """Load component registry"""
    registry_paths = [
        Path(__file__).parent.parent.parent.parent / "ai.json",
        Path.cwd() / "ai.json",
        Path(__file__).parent / "ai-registry.json",
    ]

    for registry_path in registry_paths:
        if registry_path.exists():
            try:
                data = json.loads(registry_path.read_text())
                components = data.get("components", {})
                if components:
                    return components
            except Exception:
                continue

    return {}


def protocol(components: Optional[List[str]] = None) -> str:
    """LLM format instructions"""
    if not components:
        components = [
            "card",
            "timeline",
            "accordion",
            "code",
            "gallery",
            "reference",
            "suggestions",
            "table",
            "tabs",
            "tree",
            "markdown",
        ]
    elif "markdown" not in components:
        components = components + ["markdown"]

    return f"Available components: {', '.join(sorted(components))}\n\nSupports arrays for composition: [comp1, [comp2, comp3], comp4] = vertical stack with horizontal row"


async def shape(response: str, context: dict = None, llm=None) -> str:
    """Transform text → components"""
    if not llm:
        from .llms import llm as create_llm

        llm = create_llm()
    from .shaper import shape

    return await shape(response, context, llm)


class CallbackServer:
    """Isolated callback server for agent interactions"""

    def __init__(self, port: int = 8228):
        self.port = port
        self.callbacks: Dict[str, asyncio.Future] = {}
        self._server_started = False

    def start_server(self):
        """Start callback server if not already running"""
        if self._server_started:
            return

        try:
            import uvicorn
            from fastapi import FastAPI
            from fastapi.middleware.cors import CORSMiddleware
        except ImportError:
            raise ImportError("pip install fastapi uvicorn for ai() function") from None

        app = FastAPI()
        app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])

        @app.post("/callback/{callback_id}")
        async def handle_callback(callback_id: str, request: dict):
            if callback_id in self.callbacks and not self.callbacks[callback_id].done():
                self.callbacks[callback_id].set_result(
                    {"action": request.get("action"), "data": request.get("data")}
                )
            return {"status": "continued"}

        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=self.port, log_level="critical")

        Thread(target=run_server, daemon=True).start()
        self._server_started = True

    @asynccontextmanager
    async def callback_context(self, callback_id: str):
        """Context manager for isolated callback handling"""
        self.callbacks[callback_id] = asyncio.Future()
        try:
            yield self.callbacks[callback_id]
        finally:
            self.callbacks.pop(callback_id, None)


_callback_server = CallbackServer()


async def _get_agent_response(agent, query: str) -> str:
    """Get response from agent"""
    if callable(agent):
        return await agent(query) if asyncio.iscoroutinefunction(agent) else agent(query)
    elif hasattr(agent, "run"):
        return (
            await agent.run(query) if asyncio.iscoroutinefunction(agent.run) else agent.run(query)
        )
    else:
        raise ValueError("Agent must be callable or have .run() method")


def _extract_text(event) -> str:
    """Extract text from any event format - zero coupling."""
    if isinstance(event, str):
        return event

    if isinstance(event, dict):
        for key in ["content", "text", "message", "output", "data"]:
            if key in event and event[key]:
                return str(event[key])

    for attr in ["content", "text", "message", "output"]:
        if hasattr(event, attr):
            value = getattr(event, attr)
            if value:
                return str(value)

    str_value = str(event)
    if str_value and str_value not in ["None", "<object>", "{}"]:
        return str_value

    return ""


def ai(agent, llm, components: Optional[List[str]] = None, port: int = 8228):
    """Agent → UI components"""

    def agent_fn(*agent_args, **agent_kwargs):
        agent_output = agent(*agent_args, **agent_kwargs)

        if hasattr(agent_output, "__aiter__"):
            return _stream(agent, agent_output, llm, components, port, agent_args)

        elif asyncio.iscoroutine(agent_output):
            return _async(agent, agent_output, llm, components, port, agent_args)

        else:
            return _sync(agent, agent_output, llm, components, port, agent_args)

    return agent_fn


async def _stream(agent, stream, llm, components, port, agent_args):
    """Streaming: Passthrough + Collect + Tack-on"""
    global _callback_server
    _callback_server.port = port
    _callback_server.start_server()

    collected_text = ""

    async for event in stream:
        yield event

        text = _extract_text(event)
        if text:
            collected_text += text + " "

    if collected_text.strip():
        try:
            query_context = str(agent_args[0]) if agent_args else "User request"

            shaped = await shape(
                collected_text.strip(), {"query": query_context, "components": components}, llm
            )
            component_array = json.loads(shaped)
            callback_id = str(uuid.uuid4())

            component_data = {
                "components": component_array,
                "callback_id": callback_id,
                "callback_url": f"http://localhost:{port}/callback/{callback_id}",
            }

            async with _callback_server.callback_context(callback_id) as callback_future:
                yield {"type": "component", "data": component_data}

                try:
                    user_event = await asyncio.wait_for(callback_future, timeout=300)
                    continuation_query = f"{query_context}\n\nUser selected: {user_event['data']}"
                    continuation_agent = ai(agent, llm, components, port)
                    async for event in continuation_agent(continuation_query, *agent_args[1:]):
                        yield event
                except asyncio.TimeoutError:
                    logger.warning("User interaction timed out")

        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Component generation failed: {e}")


async def _async(agent, coroutine, llm, components, port, agent_args):
    """Async - always returns (text, components) tuple"""
    response = await coroutine

    try:
        query_context = str(agent_args[0]) if agent_args else "User request"
        shaped = await shape(str(response), {"query": query_context, "components": components}, llm)
        component_array = json.loads(shaped)
        return (response, component_array)
    except Exception as e:
        logger.error(f"Component generation failed: {e}")
        return (response, [])


def _sync(agent, response, llm, components, port, agent_args):
    """Sync - always returns coroutine that resolves to (text, components) tuple"""

    async def _async_shape():
        try:
            query_context = str(agent_args[0]) if agent_args else "User request"
            shaped = await shape(
                str(response), {"query": query_context, "components": components}, llm
            )
            component_array = json.loads(shaped)
            return (response, component_array)
        except Exception as e:
            logger.error(f"Component generation failed: {e}")
            return (response, [])

    return _async_shape()


__all__ = ["ai", "protocol", "shape"]
