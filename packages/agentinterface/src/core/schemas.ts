/**
 * AgentInterface Schemas
 */
import { z } from 'zod';

// Card Grid
export const CardGridDataSchema = z.object({
  cards: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      tags: z.array(z.string()),
      links: z.array(
        z.object({
          label: z.string(),
          url: z.string(),
          type: z.string(),
        }),
      ),
      media: z
        .object({
          type: z.string().optional(),
          url: z.string().optional(),
          alt: z.string().optional(),
        })
        .optional(),
      metadata: z.record(z.any()),
    }),
  ),
  layout: z.string(),
  columns: z.number(),
});

// Timeline
export const TimelineDataSchema = z.object({
  events: z.array(
    z.object({
      date: z.string(),
      title: z.string(),
      description: z.string(),
      type: z.string().optional(),
    }),
  ),
});

// Expandable Section
export const ExpandableSectionDataSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      defaultExpanded: z.boolean().optional(),
    }),
  ),
});

// Key Insights
export const KeyInsightsDataSchema = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      category: z.string().optional(),
    }),
  ),
});

// Inline References
export const InlineReferencesDataSchema = z.object({
  references: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      excerpt: z.string(),
      content: z.string(),
      url: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    }),
  ),
});

// Blog Post
export const BlogPostDataSchema = z.object({
  title: z.string(),
  author: z.string(),
  date: z.string(),
  summary: z.string().optional(),
  content: z.string(),
  tags: z.array(z.string()).optional(),
});

// Code Snippet
export const CodeSnippetDataSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  language: z.string(),
  code: z.string(),
  caption: z.string().optional(),
});

// Markdown (empty)
export const MarkdownDataSchema = z.object({});

export const INTERFACE_SCHEMAS = {
  markdown: MarkdownDataSchema,
  'card-grid': CardGridDataSchema,
  timeline: TimelineDataSchema,
  'expandable-section': ExpandableSectionDataSchema,
  'key-insights': KeyInsightsDataSchema,
  'inline-reference': InlineReferencesDataSchema,
  'blog-post': BlogPostDataSchema,
  'code-snippet': CodeSnippetDataSchema,
};
