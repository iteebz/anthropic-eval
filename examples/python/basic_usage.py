"""
Basic usage examples for the agentinterface Python package.
"""

from agentinterface import AgentResponse, InterfaceType, ResponseParser


def basic_response_creation():
    """Create a basic agent response."""
    response = AgentResponse(
        thinking="User is asking about my background, should provide a markdown response",
        response="I'm an AI agent specialized in conversational interfaces and dynamic UI selection.",
        interface_type=InterfaceType.MARKDOWN
    )
    
    print("Basic Response:")
    print(ResponseParser.format(response))
    print()


def project_cards_example():
    """Create a project cards response."""
    response = AgentResponse(
        thinking="User wants to see my projects, should display project cards",
        response="Here are my latest projects:",
        interface_type=InterfaceType.PROJECT_CARDS,
        interface_data={
            "projects": [
                {
                    "title": "AI Agent System",
                    "description": "Multi-node reasoning system for conversational AI",
                    "technologies": ["Python", "FastAPI", "React", "TypeScript"],
                    "status": "active",
                    "link": "https://github.com/user/ai-agent"
                },
                {
                    "title": "Portfolio Website", 
                    "description": "Dynamic portfolio with agent-driven UI selection",
                    "technologies": ["React", "TanStack Start", "Tailwind"],
                    "status": "completed",
                    "link": "https://tysonchan.com"
                }
            ]
        }
    )
    
    print("Project Cards Response:")
    print(ResponseParser.format(response))
    print()


def timeline_example():
    """Create a timeline response."""
    response = AgentResponse(
        response="Here's my professional timeline:",
        interface_type=InterfaceType.TIMELINE,
        interface_data={
            "events": [
                {
                    "title": "Started AI Research",
                    "date": "2023-01-01",
                    "description": "Began research into conversational AI systems",
                    "type": "milestone"
                },
                {
                    "title": "Launched AgentInterface Protocol",
                    "date": "2024-06-15", 
                    "description": "Released open-source agent-to-UI communication protocol",
                    "type": "achievement"
                }
            ]
        }
    )
    
    print("Timeline Response:")
    print(ResponseParser.format(response))
    print()


def parsing_example():
    """Parse a raw agent response string."""
    raw_response = """
THINKING: User wants to see technical details, should use tech deep dive
RESPONSE: Here's how the Agent Interface Protocol works:
INTERFACE_TYPE: tech_deep_dive
INTERFACE_DATA: {
  "sections": [
    {
      "title": "Protocol Overview",
      "content": "The Agent Interface Protocol enables dynamic UI selection based on content analysis.",
      "code": "from agentinterface import AgentResponse, InterfaceType\\n\\nresponse = AgentResponse(\\n    response='Hello world',\\n    interface_type=InterfaceType.MARKDOWN\\n)",
      "language": "python"
    }
  ]
}
"""
    
    parsed = ResponseParser.parse(raw_response)
    
    print("Parsed Response:")
    print(f"Thinking: {parsed.thinking}")
    print(f"Response: {parsed.response}")
    print(f"Interface Type: {parsed.interface_type}")
    print(f"Interface Data: {parsed.interface_data}")
    print()


if __name__ == "__main__":
    print("=== AgentInterface Python Examples ===\\n")
    
    basic_response_creation()
    project_cards_example()
    timeline_example()
    parsing_example()
    
    print("=== All examples completed! ===")