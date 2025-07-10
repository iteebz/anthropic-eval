import { z } from "zod";

// Define Zod schemas for each interface type
const MarkdownSchema = z.object({
  // Markdown doesn't have specific interface data beyond content
});

const CardGridDataSchema = z.object({
  cards: z.array(
    z.object({
      title: z.string(),
      links: z.array(
        z.object({
          type: z.string(),
          label: z.string(),
          url: z.string(),
        }),
      ),
      metadata: z.record(z.any()),
      description: z.string(),
      tags: z.array(z.string()),
      media: z
        .object({
          type: z.string().optional(),
          url: z.string().optional(),
          alt: z.string().optional(),
        })
        .optional(),
    }),
  ),
  layout: z.string(),
  columns: z.number(),
});

const ExpandableDetailDataSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      defaultExpanded: z.boolean(),
    }),
  ),
});

const KeyInsightsDataSchema = z.object({
  insights: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      icon: z.string().optional(),
    }),
  ),
});

const TimelineDataSchema = z.object({
  events: z.array(
    z.object({
      title: z.string(),
      date: z.string(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }),
  ),
});

const TechDeepDiveDataSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      content: z.string(),
      codeExample: z.string().optional(),
      language: z.string().optional(),
    }),
  ),
});

const InlineLinkDataSchema = z.object({
  url: z.string(),
  text: z.string().optional(),
});

export const INTERFACE_SCHEMAS = {
  markdown: MarkdownSchema,
  card_grid: CardGridDataSchema,
  expandable_detail: ExpandableDetailDataSchema,
  key_insights: KeyInsightsDataSchema,
  timeline: TimelineDataSchema,
  tech_deep_dive: TechDeepDiveDataSchema,
  inline_link: InlineLinkDataSchema,
};

export type InterfaceType = keyof typeof INTERFACE_SCHEMAS;

export type InterfaceData = {
  [K in InterfaceType]: z.infer<(typeof INTERFACE_SCHEMAS)[K]>;
}[InterfaceType];

export interface Logger {
  debug: (message: string, context?: LogContext) => void;
  info: (message: string, context?: LogContext) => void;
  warn: (message: string, context?: LogContext) => void;
  error: (message: string, context?: LogContext) => void;
  componentError?: (
    interfaceType: InterfaceType,
    error: Error,
    context?: LogContext,
  ) => void;
  uiRender?: (
    interfaceType: InterfaceType,
    renderTime: number,
    context?: LogContext,
  ) => void;
}

export interface LogContext {
  [key: string]: unknown;
  component?: string;
  userJourney?: Record<string, unknown>;
  error?: {
    details?: Record<string, unknown>;
    originalData?: unknown;
  };
  performance?: {
    renderTime?: number;
  };
}
