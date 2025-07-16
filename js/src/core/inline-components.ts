import { z } from "zod";
import { InterfaceData, InterfaceType } from "../types";

// Inline component syntax: {{type:slug|label=Custom|mode=expand}}
export const InlineComponentConfigSchema = z.object({
  type: z.enum([
    'card-grid',
    'expandable-section', 
    'key-insights',
    'timeline',
    'markdown',
    'inline-reference',
    'blog-post',
    'code-snippet'
  ]),
  slug: z.string().min(1),
  label: z.string().optional(),
  mode: z.enum(['expand', 'collapse', 'preview', 'link']).default('expand'),
  className: z.string().optional(),
});

export type InlineComponentConfig = z.infer<typeof InlineComponentConfigSchema>;

// Component resolution result
export interface ResolvedInlineComponent {
  config: InlineComponentConfig;
  data: InterfaceData | null;
  fallback?: {
    type: 'link' | 'text' | 'error';
    content: string;
    href?: string;
  };
}

// Component resolver function type
export type ComponentResolver = (
  type: InterfaceType,
  slug: string
) => Promise<InterfaceData | null>;

// Parse inline component syntax
export function parseInlineComponent(syntax: string): InlineComponentConfig | null {
  // Match {{type:slug|label=Custom|mode=expand}}
  const match = syntax.match(/^\{\{([^:]+):([^|}]+)(?:\|([^}]+))?\}\}$/);
  if (!match) return null;

  const [, type, slug, params = ''] = match;
  
  // Parse parameters
  const paramPairs = params.split('|').filter(Boolean);
  const parsed: Record<string, string> = {};
  
  for (const pair of paramPairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      parsed[key] = value;
    }
  }

  try {
    return InlineComponentConfigSchema.parse({
      type,
      slug,
      label: parsed.label,
      mode: parsed.mode || 'expand',
      className: parsed.className,
    });
  } catch {
    return null;
  }
}

// Resolve inline component with fallback
export async function resolveInlineComponent(
  config: InlineComponentConfig,
  resolver: ComponentResolver
): Promise<ResolvedInlineComponent> {
  try {
    const data = await resolver(config.type, config.slug);
    
    if (!data) {
      return {
        config,
        data: null,
        fallback: {
          type: 'link',
          content: config.label || config.slug,
          href: `/components/${config.type}/${config.slug}`,
        },
      };
    }

    return { config, data };
  } catch (error) {
    console.error('Failed to resolve inline component:', error);
    
    return {
      config,
      data: null,
      fallback: {
        type: 'error',
        content: config.label || config.slug,
      },
    };
  }
}

// Create fallback content based on mode
export function createFallbackContent(
  resolved: ResolvedInlineComponent
): string {
  const { config, fallback } = resolved;
  
  if (!fallback) return config.label || config.slug;
  
  switch (fallback.type) {
    case 'link':
      return `[${fallback.content}](${fallback.href})`;
    case 'error':
      return `⚠️ ${fallback.content}`;
    default:
      return fallback.content;
  }
}