"""
Core schemas and types for the Agent Interface Protocol.
"""

from enum import Enum
from typing import Any, Dict, Optional, Union
from pydantic import BaseModel, Field


class InterfaceType(str, Enum):
    """Available interface types for agent responses."""
    
    MARKDOWN = "markdown"
    PROJECT_CARDS = "project_cards"
    EXPANDABLE_DETAIL = "expandable_detail"
    KEY_INSIGHTS = "key_insights"
    TIMELINE = "timeline"
    TECH_DEEP_DIVE = "tech_deep_dive"
    INLINE_LINK = "inline_link"


class InterfaceData(BaseModel):
    """Generic interface data container."""
    
    model_config = {"extra": "allow"}
    
    def __init__(self, **data: Any) -> None:
        super().__init__(**data)


class AgentResponse(BaseModel):
    """Complete agent response with interface specification."""
    
    thinking: Optional[str] = Field(None, description="Agent's reasoning process")
    response: str = Field(..., description="Conversational response content")
    interface_type: InterfaceType = Field(InterfaceType.MARKDOWN, description="UI component type")
    interface_data: InterfaceData = Field(default_factory=InterfaceData, description="Component-specific data")


class ResponseParser:
    """Parser for agent response strings into structured format."""
    
    @staticmethod
    def parse(response_text: str) -> AgentResponse:
        """
        Parse a raw agent response string into structured AgentResponse.
        
        Expected format:
        THINKING: [optional reasoning]
        RESPONSE: [conversational content]
        INTERFACE_TYPE: [component name]
        INTERFACE_DATA: [JSON object]
        """
        lines = response_text.strip().split('\n')
        
        thinking = None
        response = ""
        interface_type = InterfaceType.MARKDOWN
        interface_data = InterfaceData()
        
        current_section = None
        current_content = []
        
        for line in lines:
            line = line.strip()
            
            if line.startswith("THINKING:"):
                if current_section:
                    # Process previous section
                    content = '\n'.join(current_content).strip()
                    if current_section == "THINKING":
                        thinking = content
                    elif current_section == "RESPONSE":
                        response = content
                
                current_section = "THINKING"
                current_content = [line[9:].strip()]
                
            elif line.startswith("RESPONSE:"):
                if current_section:
                    # Process previous section
                    content = '\n'.join(current_content).strip()
                    if current_section == "THINKING":
                        thinking = content
                    elif current_section == "RESPONSE":
                        response = content
                
                current_section = "RESPONSE"
                current_content = [line[9:].strip()]
                
            elif line.startswith("INTERFACE_TYPE:"):
                if current_section:
                    # Process previous section
                    content = '\n'.join(current_content).strip()
                    if current_section == "THINKING":
                        thinking = content
                    elif current_section == "RESPONSE":
                        response = content
                
                interface_type_str = line[15:].strip()
                try:
                    interface_type = InterfaceType(interface_type_str)
                except ValueError:
                    interface_type = InterfaceType.MARKDOWN
                current_section = None
                current_content = []
                
            elif line.startswith("INTERFACE_DATA:"):
                if current_section:
                    # Process previous section
                    content = '\n'.join(current_content).strip()
                    if current_section == "THINKING":
                        thinking = content
                    elif current_section == "RESPONSE":
                        response = content
                
                import json
                try:
                    data_str = line[15:].strip()
                    data_dict = json.loads(data_str)
                    interface_data = InterfaceData(**data_dict)
                except (json.JSONDecodeError, TypeError):
                    interface_data = InterfaceData()
                current_section = None
                current_content = []
                
            else:
                if current_section:
                    current_content.append(line)
        
        # Process final section
        if current_section and current_content:
            content = '\n'.join(current_content).strip()
            if current_section == "THINKING":
                thinking = content
            elif current_section == "RESPONSE":
                response = content
        
        return AgentResponse(
            thinking=thinking,
            response=response,
            interface_type=interface_type,
            interface_data=interface_data
        )
    
    @staticmethod
    def format(agent_response: AgentResponse) -> str:
        """
        Format an AgentResponse back into the standard string format.
        """
        lines = []
        
        if agent_response.thinking:
            lines.append(f"THINKING: {agent_response.thinking}")
        
        lines.append(f"RESPONSE: {agent_response.response}")
        lines.append(f"INTERFACE_TYPE: {agent_response.interface_type.value}")
        
        if agent_response.interface_data:
            import json
            data_dict = agent_response.interface_data.model_dump()
            lines.append(f"INTERFACE_DATA: {json.dumps(data_dict)}")
        
        return '\n'.join(lines)