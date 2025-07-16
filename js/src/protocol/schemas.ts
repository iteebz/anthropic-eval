import { z } from 'zod';

export const MarkdownSchema = z.object({
  content: z.string(),
});

export const BlogPostSchema = z.object({
  title: z.string(),
  content: z.string(),
  metadata: z.record(z.any()).optional(),
});

export const CardGridSchema = z.object({
  cards: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    links: z.array(z.object({
      url: z.string().url(),
      text: z.string(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
  })),
});

export const CodeSnippetSchema = z.object({
  code: z.string(),
  language: z.string().optional(),
});

export const ExpandableSectionSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    content: z.string(),
    defaultExpanded: z.boolean().optional(),
  })),
});

export const InlineReferenceSchema = z.object({
  references: z.array(z.object({
    id: z.string(),
    title: z.string(),
    type: z.string().optional(),
    excerpt: z.string().optional(),
    content: z.string().optional(),
  })),
});

export const KeyInsightsSchema = z.object({
  insights: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    category: z.string().optional(),
  })),
});

export const TimelineSchema = z.object({
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })),
});

export const InterfaceDataSchema = z.union([
  MarkdownSchema,
  BlogPostSchema,
  CardGridSchema,
  CodeSnippetSchema,
  ExpandableSectionSchema,
  InlineReferenceSchema,
  KeyInsightsSchema,
  TimelineSchema,
]);

export type InterfaceData = z.infer<typeof InterfaceDataSchema>;
