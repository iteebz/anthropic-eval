/**
 * Component Resolver - Core pattern for resolving inline components
 * 
 * This should be the standard way any app resolves {{type:slug}} syntax
 */

import { InterfaceData, InterfaceType } from "../types";
import { parseInlineComponent, resolveInlineComponent, createFallbackContent } from "./inline-components";

export interface ComponentResolverConfig {
  resolver: (type: InterfaceType, slug: string) => Promise<InterfaceData | null>;
  fallbackRenderer?: (type: InterfaceType, slug: string) => string;
}

export class ComponentResolver {
  private resolver: (type: InterfaceType, slug: string) => Promise<InterfaceData | null>;
  private fallbackRenderer: (type: InterfaceType, slug: string) => string;

  constructor(config: ComponentResolverConfig) {
    this.resolver = config.resolver;
    this.fallbackRenderer = config.fallbackRenderer || this.defaultFallbackRenderer;
  }

  /**
   * Process text containing inline components
   */
  async processText(text: string): Promise<{
    processedText: string;
    components: Array<{
      original: string;
      resolved: InterfaceData | null;
      fallback: string;
    }>;
  }> {
    const regex = /\{\{([^:]+):([^|}]+)(?:\|([^}]+))?\}\}/g;
    const matches = [...text.matchAll(regex)];
    
    const components = [];
    let processedText = text;

    for (const match of matches) {
      const [fullMatch] = match;
      const config = parseInlineComponent(fullMatch);
      
      if (!config) continue;

      try {
        const resolved = await resolveInlineComponent(config, this.resolver);
        const fallback = resolved.fallback ? 
          createFallbackContent(resolved) : 
          this.fallbackRenderer(config.type, config.slug);

        components.push({
          original: fullMatch,
          resolved: resolved.data,
          fallback
        });

        // Replace in text
        processedText = processedText.replace(fullMatch, fallback);
      } catch (error) {
        const fallback = this.fallbackRenderer(config.type, config.slug);
        components.push({
          original: fullMatch,
          resolved: null,
          fallback
        });
        processedText = processedText.replace(fullMatch, fallback);
      }
    }

    return { processedText, components };
  }

  private defaultFallbackRenderer(type: InterfaceType, slug: string): string {
    return `[${slug}](/components/${type}/${slug})`;
  }
}

/**
 * Utility for apps to create their own resolver
 */
export function createComponentResolver(
  resolver: (type: InterfaceType, slug: string) => Promise<InterfaceData | null>
): ComponentResolver {
  return new ComponentResolver({ resolver });
}