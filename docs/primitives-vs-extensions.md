# AIP Primitives vs Extensions

## Core Philosophy

The Agent Interface Protocol (AIP) distinguishes between **universal primitives** and **domain-specific extensions** to maintain clean OSS boundaries while enabling rich functionality.

## The Primitive Test

A component qualifies as an AIP core primitive if it passes all three criteria:

1. **Domain Agnostic** - Useful across multiple contexts and industries
2. **Structural** - Defines information organization, not content type
3. **Composable** - Can be combined with other primitives seamlessly

## AIP Core Primitives

These components belong in the base AIP package as universal UI patterns:

### `markdown`
- **Purpose**: Universal conversational renderer
- **Why Primitive**: Every domain needs basic text rendering
- **Usage**: Default fallback, general content display

### `timeline`
- **Purpose**: Chronological data structure
- **Why Primitive**: Timeline pattern applies across domains (history, events, processes)
- **Usage**: Any sequential data over time

### `expandable_detail`
- **Purpose**: Collapsible content pattern
- **Why Primitive**: Progressive disclosure is universal UX pattern
- **Usage**: Long-form content, detailed information

### `inline_link`
- **Purpose**: Expandable references
- **Why Primitive**: Contextual information display is universal
- **Usage**: Definitions, citations, related content

### `key_insights`
- **Purpose**: Categorized information display
- **Why Primitive**: Structured insights apply across domains
- **Usage**: Takeaways, principles, categories

## Domain Extensions

These components are domain-specific and should be packaged as extensions:

### Developer Tools Extension
```typescript
const DevToolsExtension = {
  tech_deep_dive // Technical explanations with code, syntax highlighting
}
```

### Portfolio Extension
```typescript
const PortfolioExtension = {
  project_cards, // Portfolio-specific project display
  work_experience, // Career timeline variant
  skill_matrix // Technical competency display
}
```

### Content Extension
```typescript
const ContentExtension = {
  blog_post, // Long-form content formatting
  article_header, // Publication-style headers
  author_bio // Content creator profiles
}
```

## Extension Pattern

Extensions should follow this pattern for clean integration:

```typescript
// AIP provides the protocol + base components
import { AgentInterfaceRenderer, CorePrimitives } from 'agentinterface'

// Domain extends with specific components
const DomainRenderer = AgentInterfaceRenderer.extend({
  ...CorePrimitives,
  ...DevToolsExtension,
  ...PortfolioExtension
})
```

## Benefits of This Approach

### Clean OSS Boundaries
- **Core AIP**: Focused on universal patterns
- **Extensions**: Domain-specific without bloating core
- **Adoption**: Easier for new users to understand and adopt

### Extensibility
- **Clear Pattern**: Well-defined extension mechanism
- **Composability**: Mix and match extension packs
- **Evolution**: New domains can create extension packs

### Future Integration
- **Cogency Integration**: Skills can consume AIP registry
- **Framework Agnostic**: Extensions work with any orchestration system
- **Maintenance**: Core remains stable while extensions evolve

## Implementation Guidelines

### For AIP Core
- Components must pass all three primitive tests
- Universal styling and behavior
- Minimal dependencies
- Comprehensive documentation

### For Extensions
- Clear domain boundaries
- Consistent with AIP patterns
- Optional dependencies for domain-specific features
- Example usage and integration patterns

## Evolution Strategy

1. **Phase 1**: Establish core primitives with solid foundation
2. **Phase 2**: Create extension packs for major domains
3. **Phase 3**: Community-driven extension ecosystem
4. **Phase 4**: Potential integration with cognitive frameworks

This architecture ensures AIP remains focused on universal UI patterns while enabling rich domain-specific functionality through clean extension mechanisms.