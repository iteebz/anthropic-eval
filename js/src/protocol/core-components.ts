/**
 * Core AIP Component Definitions
 *
 * Registers all core components that are universally available
 * across all domains and applications.
 */
import { componentRegistry } from "./registry";
import { CORE_VALIDATION_SCHEMAS } from "../core/core-schemas";

// Register core components
componentRegistry.register({
  name: "markdown",
  description:
    "Default content renderer for conversations, explanations, and general text",
  selectionCriteria: [
    "Short responses and explanations",
    "Code discussions and philosophy",
    "General conversation flow",
    "When no structured data is available",
  ],
  schema: CORE_VALIDATION_SCHEMAS.markdown,
  safeDefaults: {},
  category: "core",
  examples: [
    "Standard conversational responses",
    "Explanations",
    "Philosophical discussions",
  ],
});

componentRegistry.register({
  name: "expandable_detail",
  description: "Collapsible content sections for detailed information",
  selectionCriteria: [
    "Long-form detailed content (>300 words)",
    "Multiple sections that benefit from organization",
    "Information that should be collapsible for better UX",
    "Detailed explanations with multiple parts",
  ],
  schema: CORE_VALIDATION_SCHEMAS.expandable_detail,
  safeDefaults: { sections: [] },
  category: "core",
  examples: [
    "Detailed explanations with multiple topics",
    "Long-form content that needs organization",
    "Multi-part answers",
  ],
});

componentRegistry.register({
  name: "key_insights",
  description: "Categorized insights, lessons learned, and principles",
  selectionCriteria: [
    "Lessons learned or key takeaways",
    "Personal philosophy and principles",
    "Categorized insights and observations",
    "Framework or methodology explanations",
  ],
  schema: CORE_VALIDATION_SCHEMAS.key_insights,
  safeDefaults: { insights: [] },
  category: "core",
  examples: [
    "What have you learned?",
    "What are your principles?",
    "Philosophy and framework discussions",
  ],
});

componentRegistry.register({
  name: "timeline",
  description: "Chronological events and career progression",
  selectionCriteria: [
    "Career progression questions",
    "Journey over time narratives",
    "Chronological events or milestones",
    "How did you get here? type questions",
  ],
  schema: CORE_VALIDATION_SCHEMAS.timeline,
  safeDefaults: { events: [] },
  category: "core",
  examples: [
    "Tell me about your career journey",
    "How did you get into tech?",
    "Timeline of experiences",
  ],
});

componentRegistry.register({
  name: "tech_deep_dive",
  description:
    "Technical explanations with implementation details and code examples",
  selectionCriteria: [
    "Technical explanations requiring depth",
    "Implementation details and architecture",
    "Code examples and technical insights",
    "How does X work? technical questions",
  ],
  schema: CORE_VALIDATION_SCHEMAS.tech_deep_dive,
  safeDefaults: {
    title: "Technical Overview",
    overview: "Content not available",
    sections: [],
  },
  category: "core",
  examples: [
    "Technical architecture explanations",
    "Implementation deep dives",
    "Code examples with context",
    "How did you build X? questions",
  ],
});

componentRegistry.register({
  name: "inline_link",
  description: "Inline expandable references to persistent artifacts",
  selectionCriteria: [
    "Conversational responses that reference specific artifacts",
    "Need for inline source material without breaking flow",
    "When agent references essays, beliefs, or documentation",
    "Citations that benefit from immediate expansion",
  ],
  schema: CORE_VALIDATION_SCHEMAS.inline_link,
  safeDefaults: { references: [] },
  category: "core",
  examples: [
    "As I mentioned in my essay on X...",
    "This relates to my belief about Y...",
    "The system documentation explains Z...",
    "Any reference to persistent artifacts that should be expandable",
  ],
});
