/**
 * AgentInterface Schemas
 */
import { z } from "zod";

// Card Grid
export const CardGridDataSchema = z.object({
  cards: z.array(z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    links: z.array(z.object({
      label: z.string(),
      url: z.string(),
      type: z.string()
    })),
    media: z.object({
      type: z.string().optional(),
      url: z.string().optional(),
      alt: z.string().optional()
    }).optional(),
    metadata: z.record(z.any())
  })),
  layout: z.string(),
  columns: z.number()
});

// Timeline
export const TimelineDataSchema = z.object({
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
    type: z.string().optional()
  }))
});

// Expandable Detail
export const ExpandableDetailDataSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    defaultExpanded: z.boolean().optional()
  }))
});

// Key Insights
export const KeyInsightsDataSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    category: z.string().optional()
  }))
});

// Tech Deep Dive
export const TechDeepDiveDataSchema = z.object({
  title: z.string(),
  overview: z.string(),
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    code_example: z.string().optional(),
    insight: z.string().optional()
  }))
});

// Inline Link
export const InlineLinkDataSchema = z.object({
  references: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string(),
    excerpt: z.string(),
    content: z.string(),
    url: z.string().optional(),
    metadata: z.record(z.any()).optional()
  }))
});

// Markdown (empty)
export const MarkdownDataSchema = z.object({});

export const INTERFACE_SCHEMAS = {
  markdown: MarkdownDataSchema,
  card_grid: CardGridDataSchema,
  timeline: TimelineDataSchema,
  expandable_detail: ExpandableDetailDataSchema,
  key_insights: KeyInsightsDataSchema,
  tech_deep_dive: TechDeepDiveDataSchema,
  inline_link: InlineLinkDataSchema
};
