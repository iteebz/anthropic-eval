# agentinterface (Python)

AgentInterface is a protocol for building conversational AI agents with rich, dynamic user interfaces.

Python implementation of the Agent Interface Protocol for backend AI agents.

## Installation

```bash
pip install agentinterface
```

## Usage

### Basic Usage

```python
from agentinterface import AgentResponse, InterfaceType, ResponseParser

# Create a structured response
response = AgentResponse(
    thinking="User is asking about projects, should show project cards",
    response="Here are my latest projects:",
    interface_type=InterfaceType.PROJECT_CARDS,
    interface_data={
        "projects": [
            {
                "title": "AI Agent System",
                "description": "Multi-node reasoning system",
                "technologies": ["Python", "React"],
                "status": "active"
            }
        ]
    }
)

# Convert to string format for transmission
response_text = ResponseParser.format(response)
print(response_text)
```

### Parsing Agent Responses

```python
from agentinterface import ResponseParser

# Parse a raw agent response string
raw_response = """
THINKING: User wants to see their project portfolio
RESPONSE: Here are your recent projects
INTERFACE_TYPE: project_cards
INTERFACE_DATA: {"projects": [...]}
"""

parsed = ResponseParser.parse(raw_response)
print(f"Interface Type: {parsed.interface_type}")
print(f"Response: {parsed.response}")
```

### FastAPI Integration

```python
from fastapi import FastAPI
from agentinterface import AgentResponse, InterfaceType

app = FastAPI()

@app.post("/chat")
async def chat_endpoint(message: str):
    # Your agent logic here
    agent_thinking = analyze_user_intent(message)
    
    if "projects" in message.lower():
        response = AgentResponse(
            thinking=agent_thinking,
            response="Here are your projects:",
            interface_type=InterfaceType.PROJECT_CARDS,
            interface_data={"projects": get_user_projects()}
        )
    else:
        response = AgentResponse(
            response=generate_response(message),
            interface_type=InterfaceType.MARKDOWN
        )
    
    return response.model_dump()
```

## API Reference

### AgentResponse

Main response class for structured agent outputs.

```python
class AgentResponse(BaseModel):
    thinking: Optional[str] = None
    response: str
    interface_type: InterfaceType = InterfaceType.MARKDOWN
    interface_data: InterfaceData = InterfaceData()
```

### InterfaceType

Enum of available interface types:

```python
class InterfaceType(str, Enum):
    MARKDOWN = "markdown"
    PROJECT_CARDS = "project_cards"
    EXPANDABLE_DETAIL = "expandable_detail"
    KEY_INSIGHTS = "key_insights"
    TIMELINE = "timeline"
    TECH_DEEP_DIVE = "tech_deep_dive"
    INLINE_LINK = "inline_link"
```

### ResponseParser

Utility for parsing and formatting agent responses:

```python
class ResponseParser:
    @staticmethod
    def parse(response_text: str) -> AgentResponse:
        """Parse raw response string into AgentResponse object"""
        
    @staticmethod
    def format(agent_response: AgentResponse) -> str:
        """Format AgentResponse back to string format"""
```

## Interface Data Schemas

### Project Cards

```python
interface_data = {
    "projects": [
        {
            "title": "Project Name",
            "description": "Project description",
            "technologies": ["Python", "React"],
            "status": "active",  # active, completed, archived
            "link": "https://github.com/user/project"
        }
    ]
}
```

### Timeline

```python
interface_data = {
    "events": [
        {
            "title": "Event Title",
            "date": "2024-01-15",
            "description": "Event description",
            "type": "milestone"  # milestone, event, achievement
        }
    ]
}
```

### Key Insights

```python
interface_data = {
    "categories": [
        {
            "category": "Technical Skills",
            "insights": [
                "Expert in Python and FastAPI",
                "Strong experience with React and TypeScript"
            ]
        }
    ]
}
```

## Error Handling

The library includes validation and error handling:

```python
from agentinterface import AgentResponse, InterfaceType
from pydantic import ValidationError

try:
    response = AgentResponse(
        response="Invalid response",
        interface_type="invalid_type"  # This will raise ValidationError
    )
except ValidationError as e:
    print(f"Validation error: {e}")
    # Fallback to markdown
    response = AgentResponse(
        response="Invalid response",
        interface_type=InterfaceType.MARKDOWN
    )
```

## Development

```bash
# Install development dependencies
pip install -e ".[dev]"

# Run tests
python -m pytest

# Type checking
mypy src/

# Linting
ruff check src/
```

## Examples

See the [Python Examples](./../../examples/python/README.md) directory for complete usage examples.

## Contributing

1. Follow PEP 8 style guidelines
2. Add type hints to all functions
3. Include tests for new functionality
4. Update documentation for API changes

## License

MIT - See LICENSE file for details.