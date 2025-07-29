"""Core memory interfaces and types."""

import logging
from dataclasses import dataclass, field
from datetime import UTC, datetime
from enum import Enum
from typing import Any, Dict, List
from uuid import UUID, uuid4

logger = logging.getLogger(__name__)

DEFAULT_RELEVANCE_THRESHOLD = 0.7
DEFAULT_CONFIDENCE_SCORE = 1.0


class MemoryType(Enum):
    """Types of memory for different agent use cases."""

    FACT = "fact"
    EPISODIC = "episodic"
    EXPERIENCE = "experience"
    CONTEXT = "context"


class SearchType(Enum):
    """Search methods for memory recall."""

    AUTO = "auto"
    SEMANTIC = "semantic"
    TEXT = "text"
    HYBRID = "hybrid"
    TAGS = "tags"


@dataclass
class Memory:
    """A memory artifact with content and metadata."""

    content: str
    memory_type: MemoryType = MemoryType.FACT
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    relevance_score: float = 0.0
    confidence_score: float = DEFAULT_CONFIDENCE_SCORE
    access_count: int = 0
    last_accessed: datetime = field(default_factory=lambda: datetime.now(UTC))

    def decay(self) -> float:
        """Calculate decay based on recency and confidence."""
        now = datetime.now(UTC)
        days_since_created = (now - self.created_at).days
        days_since_accessed = (now - self.last_accessed).days

        recency_factor = max(0.1, 1.0 - (days_since_created * 0.05))
        access_boost = min(2.0, 1.0 + (self.access_count * 0.1))
        staleness_penalty = max(0.5, 1.0 - (days_since_accessed * 0.02))

        return self.confidence_score * recency_factor * access_boost * staleness_penalty
