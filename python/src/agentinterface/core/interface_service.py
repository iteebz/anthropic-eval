"""
Core interface selection service for Agent Interface Protocol.

This module provides the complete AIP implementation including:
- Interface component selection
- Response parsing and validation
- Extension points for domain-specific components
"""

import logging
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class InterfaceStrategy(Enum):
    """Different interface selection strategies."""
    CONTENT_DRIVEN = "content_driven"
    INTENT_DRIVEN = "intent_driven"
    HYBRID = "hybrid"
    ADAPTIVE = "adaptive"


@dataclass
class InterfaceResult:
    """Result of interface processing."""
    interface_type: str
    interface_data: Dict[str, Any]
    confidence: float
    fallback_type: str = "markdown"
    metadata: Dict[str, Any] = None

    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class InterfaceService:
    """Core interface selection service."""
    
    def __init__(self, components: Dict[str, Any] = None):
        self.components = components or self._get_default_components()
        self.default_strategy = InterfaceStrategy.HYBRID
        self.fallback_interface = "markdown"
    
    def _get_default_components(self) -> Dict[str, Any]:
        """Get default AIP core components."""
        return {
            "markdown": {
                "suitability": ["text", "explanation", "simple_response"],
                "complexity": "simple",
                "data_requirements": []
            },
            "timeline": {
                "suitability": ["chronological", "events", "progression"],
                "complexity": "rich",
                "data_requirements": ["events"]
            },
            "expandable_detail": {
                "suitability": ["detailed_explanation", "long_form"],
                "complexity": "moderate",
                "data_requirements": ["sections"]
            },
            "key_insights": {
                "suitability": ["principles", "frameworks", "categorized_info"],
                "complexity": "moderate",
                "data_requirements": ["insights"]
            },
            "inline_link": {
                "suitability": ["references", "citations"],
                "complexity": "simple",
                "data_requirements": ["references"]
            }
        }
    
    def process_agent_response(
        self,
        response_text: str,
        intent: str = "general",
        strategy: Optional[InterfaceStrategy] = None,
        **kwargs
    ) -> InterfaceResult:
        """
        Complete AIP processing: parse response and select interface.
        
        This is the main entry point for AIP processing.
        
        Args:
            response_text: Full agent response text
            intent: User intent
            strategy: Interface selection strategy
            **kwargs: Additional context
            
        Returns:
            InterfaceResult with selected component and parsed data
        """
        # Parse the response for interface directives
        interface_type, interface_data = self._parse_response(response_text)
        
        # Extract content for analysis
        content = self._extract_content(response_text)
        
        # If no interface directive found, select based on content
        if interface_type == "markdown":
            selection = self.select_interface(content, intent, strategy, **kwargs)
            interface_type = selection.interface_type
            # Keep parsed data if available, otherwise use selection metadata
            if not interface_data:
                interface_data = selection.metadata.get("suggested_data", {})
        
        return InterfaceResult(
            interface_type=interface_type,
            interface_data=interface_data,
            confidence=0.9 if interface_data else 0.7,
            fallback_type=self.fallback_interface,
            metadata={"content": content, "parsed_response": True}
        )
    
    def select_interface(
        self,
        content: str,
        intent: str = "general",
        strategy: Optional[InterfaceStrategy] = None,
        **kwargs
    ) -> InterfaceResult:
        """
        Select the most appropriate interface component.
        
        Args:
            content: Content to be presented
            intent: User intent
            strategy: Interface selection strategy
            **kwargs: Additional context
            
        Returns:
            InterfaceResult with selected component and data
        """
        selected_strategy = strategy or self.default_strategy
        
        # Analyze content
        content_analysis = self._analyze_content(content, intent)
        
        # Score components
        component_scores = {}
        for component_name, component_info in self.components.items():
            score = self._calculate_component_score(
                component_name, 
                component_info, 
                content_analysis,
                selected_strategy
            )
            component_scores[component_name] = score
        
        # Select best component
        best_component = max(component_scores, key=component_scores.get)
        confidence = component_scores[best_component]
        
        # Fallback to markdown if score is too low
        if confidence < 0.3:
            best_component = self.fallback_interface
            confidence = 0.5
        
        return InterfaceResult(
            interface_type=best_component,
            interface_data={},  # To be populated by domain-specific logic
            confidence=confidence,
            fallback_type=self.fallback_interface,
            metadata={
                "strategy": selected_strategy.value,
                "content_analysis": content_analysis,
                "alternatives": sorted(component_scores.items(), key=lambda x: x[1], reverse=True)[:3]
            }
        )
    
    def _analyze_content(self, content: str, intent: str) -> Dict[str, Any]:
        """Analyze content for interface selection."""
        return {
            "content_type": self._determine_content_type(content),
            "content_length": len(content),
            "structure": self._analyze_structure(content),
            "intent": intent,
            "complexity_score": self._calculate_complexity(content)
        }
    
    def _determine_content_type(self, content: str) -> str:
        """Determine the type of content."""
        if len(content) > 2000:
            return "long_form"
        elif len(content.split('\n')) > 10:
            return "structured"
        elif '```' in content:
            return "code"
        else:
            return "text"
    
    def _analyze_structure(self, content: str) -> Dict[str, Any]:
        """Analyze content structure."""
        lines = content.split('\n')
        return {
            "has_lists": any(line.strip().startswith(('-', '*', '•')) for line in lines),
            "has_headings": any(line.strip().startswith('#') for line in lines),
            "has_code": '```' in content,
            "line_count": len(lines),
            "paragraph_count": len([line for line in lines if line.strip() and not line.strip().startswith('#')])
        }
    
    def _calculate_complexity(self, content: str) -> float:
        """Calculate content complexity score."""
        base_score = min(len(content) / 1000, 1.0)  # Length component
        structure_score = 0.0
        
        if '```' in content:
            structure_score += 0.3
        if content.count('\n') > 10:
            structure_score += 0.2
        if content.count('#') > 3:
            structure_score += 0.2
        
        return min(base_score + structure_score, 1.0)
    
    def _calculate_component_score(
        self,
        component_name: str,
        component_info: Dict[str, Any],
        content_analysis: Dict[str, Any],
        strategy: InterfaceStrategy
    ) -> float:
        """Calculate suitability score for a component."""
        score = 0.0
        
        # Base suitability
        if content_analysis["content_type"] in component_info["suitability"]:
            score += 0.4
        
        # Complexity matching
        content_complexity = content_analysis["complexity_score"]
        if component_info["complexity"] == "simple" and content_complexity < 0.3:
            score += 0.3
        elif component_info["complexity"] == "moderate" and 0.3 <= content_complexity < 0.7:
            score += 0.3
        elif component_info["complexity"] == "rich" and content_complexity >= 0.7:
            score += 0.3
        
        # Strategy adjustments
        if strategy == InterfaceStrategy.CONTENT_DRIVEN:
            score += 0.1 if content_analysis["content_type"] in component_info["suitability"] else 0
        elif strategy == InterfaceStrategy.ADAPTIVE:
            score += 0.1 if component_info["complexity"] in ["moderate", "rich"] else 0
        
        return min(score, 1.0)
    
    def _parse_response(self, response_text: str) -> tuple[str, Dict[str, Any]]:
        """
        Parse agent response for interface directives.
        
        Looks for patterns like:
        INTERFACE_TYPE: component_name
        INTERFACE_DATA: {"key": "value"}
        """
        interface_type = "markdown"
        interface_data = {}
        
        # Look for interface type directive
        type_match = re.search(r'INTERFACE_TYPE:\s*(\w+)', response_text)
        if type_match:
            interface_type = type_match.group(1)
        
        # Look for interface data directive
        data_match = re.search(r'INTERFACE_DATA:\s*({.*?})', response_text, re.DOTALL)
        if data_match:
            try:
                import json
                interface_data = json.loads(data_match.group(1))
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse INTERFACE_DATA: {data_match.group(1)}")
        
        return interface_type, interface_data
    
    def _extract_content(self, response_text: str) -> str:
        """Extract the main content from agent response."""
        # Remove interface directives
        content = re.sub(r'INTERFACE_TYPE:.*?\n', '', response_text)
        content = re.sub(r'INTERFACE_DATA:.*?(?=\n\n|\n[A-Z]|\Z)', '', content, flags=re.DOTALL)
        
        # Extract RESPONSE: section if present
        response_match = re.search(r'RESPONSE:\s*(.*)', content, re.DOTALL)
        if response_match:
            content = response_match.group(1).strip()
        
        return content.strip()