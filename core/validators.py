"""
Core AIP Primitive Validation Schemas

Pydantic models for validating core AIP components data structures.
These schemas are domain-agnostic and designed for extraction.
"""

from typing import Any

from pydantic import BaseModel, Field


class SectionData(BaseModel):
    """Schema for expandable detail sections."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    defaultExpanded: bool = Field(default=False)


class ExpandableDetailData(BaseModel):
    """Schema for expandable_detail UI component."""

    sections: list[SectionData] = Field(default_factory=list)


class InsightData(BaseModel):
    """Schema for individual insight in key_insights component."""

    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category: str = Field(default="general", max_length=50)


class KeyInsightsData(BaseModel):
    """Schema for key_insights UI component."""

    insights: list[InsightData] = Field(default_factory=list)


class TimelineEventData(BaseModel):
    """Schema for individual timeline event."""

    date: str = Field(..., min_length=1, max_length=50)
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    type: str = Field(default="default", max_length=50)


class TimelineData(BaseModel):
    """Schema for timeline UI component."""

    events: list[TimelineEventData] = Field(default_factory=list)


class TechDeepDiveSectionData(BaseModel):
    """Schema for tech deep dive sections."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    code_example: str | None = Field(None, max_length=10000)
    insight: str | None = Field(None, max_length=1000)


class TechDeepDiveData(BaseModel):
    """Schema for tech_deep_dive UI component."""

    title: str = Field(..., min_length=1, max_length=200)
    overview: str = Field(..., min_length=1, max_length=2000)
    sections: list[TechDeepDiveSectionData] = Field(default_factory=list)


class MarkdownData(BaseModel):
    """Schema for markdown UI component (empty by design)."""

    pass


class ReferenceData(BaseModel):
    """Schema for individual reference in inline_link component."""

    id: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=200)
    type: str = Field(..., min_length=1, max_length=50)  # essay, belief, log, system_doc
    excerpt: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1, max_length=10000)
    url: str | None = Field(None, max_length=500)
    metadata: dict[str, Any] = Field(default_factory=dict)


class InlineLinkData(BaseModel):
    """Schema for inline_link UI component."""

    references: list[ReferenceData] = Field(default_factory=list)


# Core AIP primitive validation schemas
CORE_VALIDATION_SCHEMAS: dict[str, type[BaseModel]] = {
    "markdown": MarkdownData,
    "expandable_detail": ExpandableDetailData,
    "key_insights": KeyInsightsData,
    "timeline": TimelineData,
    "tech_deep_dive": TechDeepDiveData,
    "inline_link": InlineLinkData,
}


def def get_core_safe_defaults(ui_type: str) -> dict[str, Any]:
    """Get safe default data for core AIP components."""
    safe_defaults: dict[str, dict[str, Any]] = {
        "markdown": {},
        "expandable_detail": {"sections": []},
        "key_insights": {"insights": []},
        "timeline": {"events": []},
        "tech_deep_dive": {"title": "Technical Overview", "overview": "Content not available", "sections": []},
        "inline_link": {"references": []},
    }

    return safe_defaults.get(ui_type, {})
