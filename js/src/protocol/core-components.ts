/**
 * Core AIP Component Definitions
 *
 * Registers all core components that are universally available
 * across all domains and applications.
 */
import { componentRegistry } from "./registry";
import { INTERFACE_SCHEMAS } from "../core/schemas";

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
  schema: INTERFACE_SCHEMAS.markdown,
  safeDefaults: {},
  category: "core",
  examples: [
    "Standard conversational responses",
    "Explanations",
    "Philosophical discussions",
  ],
});

componentRegistry.register({
  name: "expandable-sections",
  description: "Collapsible content sections for detailed information",
  selectionCriteria: [
    "Long-form detailed content (>300 words)",
    "Multiple sections that benefit from organization",
    "Information that should be collapsible for better UX",
    "Detailed explanations with multiple parts",
  ],
  schema: INTERFACE_SCHEMAS["expandable-section"],
  safeDefaults: { sections: [] },
  category: "core",
  examples: [
    "Detailed explanations with multiple topics",
    "Long-form content that needs organization",
    "Multi-part answers",
  ],
});

componentRegistry.register({
  name: "key-insights",
  description: "Categorized insights, lessons learned, and principles",
  selectionCriteria: [
    "Lessons learned or key takeaways",
    "Personal philosophy and principles",
    "Categorized insights and observations",
    "Framework or methodology explanations",
  ],
  schema: INTERFACE_SCHEMAS["key-insights"],
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
  schema: INTERFACE_SCHEMAS.timeline,
  safeDefaults: { events: [] },
  category: "core",
  examples: [
    "Tell me about your career journey",
    "How did you get into tech?",
    "Timeline of experiences",
  ],
});

componentRegistry.register({
  name: "blog-post",
  description:
    "A structured blog post or article layout",
  selectionCriteria: [
    "When the response is a self-contained article or blog post",
    "Long-form content that reads like an essay or article",
  ],
  schema: INTERFACE_SCHEMAS["blog-post"],
  safeDefaults: {
    title: "",
    author: "",
    date: "",
    content: "",
  },
  category: "core",
  examples: [
    "Write a blog post about X",
    "Summarize this topic as an article",
  ],
});

componentRegistry.register({
  name: "code-snippet",
  description:
    "A code snippet with optional title, description, and language",
  selectionCriteria: [
    "When providing code examples",
    "When explaining technical concepts with code",
  ],
  schema: INTERFACE_SCHEMAS["code-snippet"],
  safeDefaults: {
    language: "",
    code: "",
  },
  category: "core",
  examples: [
    "Show me an example of X code",
    "How do I implement Y in Python?",
  ],
});

componentRegistry.register({
  name: "inline-reference",
  description: "Inline expandable references to persistent artifacts",
  selectionCriteria: [
    "Conversational responses that reference specific artifacts",
    "Need for inline source material without breaking flow",
    "When agent references essays, beliefs, or documentation",
    "Citations that benefit from immediate expansion",
  ],
  schema: INTERFACE_SCHEMAS["inline-reference"],
  safeDefaults: { references: [] },
  category: "core",
  examples: [
    "As I mentioned in my essay on X...",
    "This relates to my belief about Y...",
    "The system documentation explains Z...",
    "Any reference to persistent artifacts that should be expandable",
  ],
});
