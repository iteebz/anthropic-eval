# Interface Component Registry

## Overview

Agent Interface Protocol (AIP) component registry defining Interface components available to conversational agents for dynamic interface rendering.

## Architecture

- **Core Package**: `@agentinterface` - Core protocol logic and schemas
- **UI Package**: `@tysonchan/ui` - Shared UI components
- **Domain-Aware**: Components adapt presentation based on context (portfolio vs protocol)

## Package Structure

```
packages/
├── agentinterface/          # Core protocol
│   ├── src/
│   │   ├── components/      # Core UI components only
│   │   ├── core/            # Core schemas and validation
│   │   ├── protocol/        # Protocol definitions and registry
│   │   ├── react/           # React-specific wrappers
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Parsing and performance utilities
│   │   └── portfolio/       # Legacy portfolio schemas (deprecated)
│   └── package.json
└── ui/                     # Shared UI components
    ├── src/components/
    │   ├── common/         # Common UI components
    │   └── chat/           # Chat components
    └── package.json

apps/
├── portfolio/               # Portfolio-specific implementation
│   ├── src/
│   │   ├── components/
│   │   │   └── agent-interface/  # Domain-specific components
│   │   └── schemas/         # Domain-specific schemas
│   └── package.json
└── protocol/                # Protocol-specific implementation
    └── ...
```

## Component Definitions

### markdown

**Usage**: Default content renderer for conversations, explanations, and general text  
**Selection Criteria**:

- Short responses and explanations
- Code discussions and philosophy
- General conversation flow
- When no structured data is available

**INTERFACE_DATA Schema**:

```json
{}
```

**Example Usage**: Standard conversational responses, explanations, philosophical discussions

---

### project_cards (Domain-Specific)

**Usage**: Structured project display with metadata and visual cards  
**Domain**: Portfolio applications only (not available in core protocol)
**Selection Criteria**:

- User asks about projects, portfolio, or "what you've built"
- Multiple projects need to be showcased
- Portfolio items with structured metadata
- When you have project data with titles, descriptions, technologies

**INTERFACE_DATA Schema**:

```json
{
  "projects": [
    {
      "title": "string",
      "description": "string",
      "technologies": ["string"],
      "url": "string (optional)",
      "status": "string (optional)"
    }
  ]
}
```

**Implementation**: Domain-specific component, implemented in consuming application
**Example Usage**:

- "Show me your projects"
- "What have you built?"
- Portfolio showcase requests

---

### expandable_detail

**Usage**: Collapsible content sections for detailed information  
**Selection Criteria**:

- Long-form detailed content (>300 words)
- Multiple sections that benefit from organization
- Information that should be collapsible for better UX
- Detailed explanations with multiple parts

**INTERFACE_DATA Schema**:

```json
{
  "sections": [
    {
      "title": "string",
      "content": "string (markdown supported)",
      "defaultExpanded": "boolean (optional, defaults to false)"
    }
  ]
}
```

**Example Usage**:

- Detailed explanations with multiple topics
- Long-form content that needs organization
- Multi-part answers

---

### key_insights

**Usage**: Categorized insights, lessons learned, and principles  
**Selection Criteria**:

- Lessons learned or key takeaways
- Personal philosophy and principles
- Categorized insights and observations
- Framework or methodology explanations

**INTERFACE_DATA Schema**:

```json
{
  "insights": [
    {
      "title": "string",
      "description": "string",
      "category": "lesson|principle|framework|observation"
    }
  ]
}
```

**Categories**:

- `lesson`: Things learned from experience
- `principle`: Core beliefs and values
- `framework`: Methodologies and approaches
- `observation`: General observations and thoughts

**Example Usage**:

- "What have you learned?"
- "What are your principles?"
- Philosophy and framework discussions

---

### timeline

**Usage**: Chronological events and career progression  
**Selection Criteria**:

- Career progression questions
- Journey over time narratives
- Chronological events or milestones
- "How did you get here?" type questions

**INTERFACE_DATA Schema**:

```json
{
  "events": [
    {
      "date": "string (YYYY-MM format preferred)",
      "title": "string",
      "description": "string",
      "type": "project|milestone|learning|pivot"
    }
  ]
}
```

**Event Types**:

- `project`: Project launches or completions
- `milestone`: Career or personal milestones
- `learning`: Educational or skill development events
- `pivot`: Direction changes or new focuses

**Example Usage**:

- "Tell me about your career journey"
- "How did you get into tech?"
- Timeline of experiences

---

### tech_deep_dive

**Usage**: Technical explanations with implementation details and code examples  
**Selection Criteria**:

- Technical explanations requiring depth
- Implementation details and architecture
- Code examples and technical insights
- "How does X work?" technical questions

**INTERFACE_DATA Schema**:

```json
{
  "title": "string",
  "overview": "string",
  "sections": [
    {
      "title": "string",
      "content": "string (markdown supported)",
      "code_example": "string (optional)",
      "insight": "string (optional)"
    }
  ]
}
```

**Example Usage**:

- Technical architecture explanations
- Implementation deep dives
- Code examples with context
- "How did you build X?" questions

---

### inline_link

**Usage**: Inline expandable references to persistent artifacts (essays, beliefs, logs, system docs)  
**Selection Criteria**:

- Conversational responses that reference specific artifacts
- Need for inline source material without breaking flow
- When agent references essays, beliefs, or documentation
- Citations that benefit from immediate expansion

**INTERFACE_DATA Schema**:

```json
{
  "references": [
    {
      "id": "string",
      "title": "string",
      "type": "essay|belief|log|system_doc",
      "excerpt": "string",
      "content": "string (markdown supported)",
      "url": "string (optional)",
      "metadata": "object (optional)"
    }
  ]
}
```

**Markdown Syntax**: Use `[Display Text](ref:reference-id)` in content  
**Example**: `As I explored in [The Existential Creed](ref:essays/existential-creed), the fundamental question isn't whether we have free will...`

**Example Usage**:

- "As I mentioned in my essay on X..."
- "This relates to my belief about Y..."
- "The system documentation explains Z..."
- Any reference to persistent artifacts that should be expandable

## Selection Guidelines

### Priority Order

1. **Analyze content structure**: What type of information is being presented?
2. **Match selection criteria**: Does the content fit the component's intended use case?
3. **Consider user intent**: What is the user asking for and how should it be presented?
4. **Default to markdown**: When in doubt or for general conversation

### Content Analysis Framework

**CONTENT_TYPE Analysis**:

- `projects`: Multiple project items with metadata
- `technical_explanation`: Implementation details and architecture
- `personal_philosophy`: Insights, lessons, principles
- `chronological`: Timeline or journey narrative
- `detailed_explanation`: Long-form content with sections
- `conversational`: General responses and discussion

**STRUCTURE Analysis**:

- `list_of_items`: Multiple related items (projects, insights, events)
- `detailed_explanation`: Long-form content with subsections
- `mixed_content`: Combination of text and structured data
- `general_response`: Standard conversational response

### Usage Patterns

**When NOT to use structured components**:

- Short responses (< 100 words)
- Simple explanations without structured data
- General conversation and clarifications
- When you don't have data matching the component schema

**When TO use structured components**:

- Content naturally fits the component's data structure
- Enhanced presentation would improve user experience
- Multiple related items need organized display
- Technical content benefits from sectioned presentation

## Integration Notes

### Backend Agent Integration

- Load this registry at agent initialization
- Reference component definitions in interface selection logic
- Use schemas for INTERFACE_DATA validation (located in `packages/agentinterface/src/core/schemas.ts`)
- Include selection criteria in content analysis

### Frontend Component Integration

- Ensure TypeScript interfaces match schemas exactly (schemas in `packages/agentinterface/src/core/schemas.ts`)
- Handle optional fields gracefully
- Maintain backwards compatibility with existing INTERFACE_DATA formats
- Provide fallback to markdown for invalid data
- Use `AgentInterfaceRenderer` from `packages/agentinterface/src/react/AgentInterfaceRenderer.tsx`

### Extensibility

- New components can be added by defining:
  - Clear usage criteria
  - Complete data schema (in `packages/agentinterface/src/core/schemas.ts`)
  - Frontend implementation (in `packages/agentinterface/src/components/`)
  - Backend selection logic (in `apps/backend/src/core/interface_system.py`)

## Implementation Notes

### Import Structure

```typescript
// Core protocol
import { AgentInterfaceRenderer } from "@agentinterface";

// UI components
import { Chat } from "@tysonchan/ui/components/chat";
import { Badge } from "@tysonchan/ui/components/common/badge";
```

### Domain Detection

Both applications use the same core protocol but detect domain context:

- **Portfolio app**: Enhanced project display, personal context
- **Protocol app**: Technical documentation, protocol focus

### Component Fallback

All components gracefully degrade to markdown on errors or missing data.

## Version

Registry Version: 1.2.0  
Last Updated: 2025-07-07  
Components: 7 (markdown, project_cards, expandable_detail, key_insights, timeline, tech_deep_dive, inline_link)
Architecture: Monorepo with shared packages
