# AGENTINTERFACE REQUIREMENTS

## CORE REQUIREMENTS

1. **Autodiscovery** - Components auto-discovered from React files
2. **Autoregistration** - Zero manual registration ceremony  
3. **Protocol Prompt Output** - Dynamic format instructions for agents
4. **Two-way Interactivity** - UI components communicate back to agent
5. **Response Shaping** - Agent output → UI component transformation
6. **SSR Compatible** - Works with Next.js, TanStack Start, etc.

## CANONICAL PATTERNS NEEDED

- `ai()` wrapper for React components
- `ai.card()` dynamic interface for Python
- MCP/callback system for UI → Agent communication
- Build-time component extraction (zero runtime deps)

## ZERO CEREMONY

- No manual registration
- No build steps (dev mode)
- No configuration files
- Just works everywhere