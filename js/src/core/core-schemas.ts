/**
 * Core AIP Primitive Schemas
 *
 * Domain-agnostic validation schemas for core AIP components.
 * These schemas are designed to be extracted as a standalone package.
 */
import { z } from "zod";

// Expandable Detail Schema
export const SectionDataSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  defaultExpanded: z.boolean().default(false),
});

export const ExpandableDetailDataSchema = z.object({
  sections: z.array(SectionDataSchema).max(20).default([]),
});

// Key Insights Schema
export const InsightDataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  category: z.string().max(50).default("general"),
});

export const KeyInsightsDataSchema = z.object({
  insights: z.array(InsightDataSchema).max(20).default([]),
});

// Timeline Schema
export const TimelineEventDataSchema = z.object({
  date: z.string().min(1).max(50),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  type: z.string().max(50).default("default"),
});

export const TimelineDataSchema = z.object({
  events: z.array(TimelineEventDataSchema).max(50).default([]),
});

// Tech Deep Dive Schema
export const TechDeepDiveSectionDataSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
  code_example: z.string().max(10_000).optional(),
  insight: z.string().max(1000).optional(),
});

export const TechDeepDiveDataSchema = z.object({
  title: z.string().min(1).max(200),
  overview: z.string().min(1).max(2000),
  sections: z.array(TechDeepDiveSectionDataSchema).max(20).default([]),
});

// Markdown Schema (empty by design)
export const MarkdownDataSchema = z.object({});

// Generic Card Grid Schema
export const CardDataSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  tags: z.array(z.string()).max(20).default([]),
  links: z
    .array(
      z.object({
        label: z.string().min(1).max(50),
        url: z.string().max(500),
        type: z.string().max(20).default("external"), // external, internal, action
      }),
    )
    .max(10)
    .default([]),
  media: z
    .object({
      type: z.string().max(20).optional(), // image, video, icon
      url: z.string().max(500).optional(),
      alt: z.string().max(200).optional(),
    })
    .optional(),
  metadata: z.record(z.any()).default({}),
});

export const CardGridDataSchema = z.object({
  cards: z.array(CardDataSchema).max(50).default([]),
  layout: z.string().max(20).default("grid"), // grid, list, masonry
  columns: z.number().min(1).max(6).default(2),
});

// Reference Link Schema
export const ReferenceDataSchema = z.object({
  id: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  type: z.string().min(1).max(50), // essay, belief, log, system_doc
  excerpt: z.string().min(1).max(500),
  content: z.string().min(1).max(10_000),
  url: z.string().max(500).optional(),
  metadata: z.record(z.any()).default({}),
});

export const InlineLinkDataSchema = z.object({
  references: z.array(ReferenceDataSchema).max(10).default([]),
});

// Core primitive schema mapping
export const CORE_VALIDATION_SCHEMAS = {
  markdown: MarkdownDataSchema,
  card_grid: CardGridDataSchema,
  expandable_detail: ExpandableDetailDataSchema,
  key_insights: KeyInsightsDataSchema,
  timeline: TimelineDataSchema,
  tech_deep_dive: TechDeepDiveDataSchema,
  inline_link: InlineLinkDataSchema,
} as const;

/**
 * Get safe default data for core AIP components.
 */
export function getCoreSafeDefaults<
  T extends keyof typeof CORE_VALIDATION_SCHEMAS,
>(uiType: T): z.infer<(typeof CORE_VALIDATION_SCHEMAS)[T]> {
  const defaults = {
    markdown: {},
    card_grid: { cards: [], layout: "grid", columns: 2 },
    expandable_detail: { sections: [] },
    key_insights: { insights: [] },
    timeline: { events: [] },
    tech_deep_dive: {
      title: "Technical Overview",
      overview: "Content not available",
      sections: [],
    },
    inline_link: { references: [] },
  } as const;

  return defaults[uiType] as z.infer<(typeof CORE_VALIDATION_SCHEMAS)[T]>;
}
