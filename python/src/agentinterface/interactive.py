"""Two-way agent communication via HTTP callbacks"""

import asyncio
import json
import uuid
from threading import Thread
from typing import Any, AsyncGenerator, Dict, List, Optional

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
except ImportError:
    FastAPI = None


class Interactive:
    """Agent + UI callbacks"""
    
    def __init__(self, agent: Any, llm: Any = None, components: Optional[List[str]] = None, port: int = 8228):
        self.agent = agent
        self.llm = llm
        self.components = components
        self.port = port
        self._pending_callbacks = {}  # {callback_id: Future}
        self._server = None
        self._start_callback_server()
    
    def _start_callback_server(self):
        """HTTP callback server"""
        if not FastAPI:
            raise ImportError("pip install fastapi uvicorn for interactive agents")
            
        app = FastAPI()
        app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])
        
        @app.post("/callback/{callback_id}")
        async def handle_callback(callback_id: str, request: dict):
            self.resolve_callback(callback_id, request.get("action"), request.get("data"))
            return {"status": "continued"}
        
        # Run server in background thread
        def run_server():
            uvicorn.run(app, host="0.0.0.0", port=self.port, log_level="critical")
        
        self._server = Thread(target=run_server, daemon=True)
        self._server.start()
    
    def resolve_callback(self, callback_id: str, action: str, data: Any):
        """Resolve pending callback"""
        if callback_id in self._pending_callbacks and not self._pending_callbacks[callback_id].done():
            self._pending_callbacks[callback_id].set_result({"action": action, "data": data})
    
    async def stream(self, query: str, **context) -> AsyncGenerator[Dict, None]:
        """Stream agent responses with UI callbacks"""
        
        # Get agent response  
        response = await self._get_agent_response(query)
        
        # Try to shape into interactive component
        if self.llm:
            shaped = await self._try_shape(response, query, {**context, "components": self.components})
            if shaped:
                # Add callback info
                callback_id = str(uuid.uuid4())
                shaped["callback_id"] = callback_id
                shaped["callback_url"] = f"http://localhost:{self.port}/callback/{callback_id}"
                
                # Register callback waiter
                self._pending_callbacks[callback_id] = asyncio.Future()
                
                yield {"type": "component", "data": shaped}
                
                # Wait for user interaction via HTTP callback
                try:
                    user_event = await asyncio.wait_for(
                        self._pending_callbacks[callback_id], 
                        timeout=300
                    )
                    
                    # Continue agent with user choice
                    continuation = f"{query}\n\nUser selected: {user_event['data']}"
                    next_response = await self._get_agent_response(continuation)
                    yield {"type": "text", "content": next_response}
                    
                except asyncio.TimeoutError:
                    yield {"type": "text", "content": "Interaction timed out"}
            else:
                # Regular text
                yield {"type": "text", "content": response}
        else:
            yield {"type": "text", "content": response}
    
    async def _get_agent_response(self, query: str) -> str:
        """Get agent response"""
        if hasattr(self.agent, 'run') and asyncio.iscoroutinefunction(self.agent.run):
            return await self.agent.run(query)
        elif hasattr(self.agent, 'run'):
            return self.agent.run(query)
        elif callable(self.agent):
            return await self.agent(query)
        else:
            raise ValueError("Agent must have .run() method or be callable")
    
    async def _try_shape(self, response: str, query: str, context: Dict) -> Dict:
        """Shape text → component"""
        from .shaper import shape
        
        shaped = await shape(response, {"query": query, **context}, self.llm)
        
        try:
            return json.loads(shaped)
        except json.JSONDecodeError:
            return None


