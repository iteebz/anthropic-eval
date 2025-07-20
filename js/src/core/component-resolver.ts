/**
 * Component Resolver - Core pattern for resolving inline components
 * 
 * This should be the standard way any app resolves {{type:slug}} syntax
 */

import { InterfaceData, InterfaceType } from "../types";
import { parseInlineComponent, resolveInlineComponent, createFallbackContent, type ComponentResolver } from "./inline-components";

/**
 * Process text containing inline components
 */
export async function processInlineComponents(
  text: string,
  resolver: ComponentResolver,
  fallbackRenderer?: (type: InterfaceType, slug: string) => string
): Promise<{
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
  const defaultFallback = fallbackRenderer || ((type: InterfaceType, slug: string) => 
    `[${slug}](/components/${type}/${slug})`
  );

  for (const match of matches) {
    const [fullMatch] = match;
    const config = parseInlineComponent(fullMatch);
    
    if (!config) continue;

    try {
      const resolved = await resolveInlineComponent(config, resolver);
      const fallback = resolved.fallback ? 
        createFallbackContent(resolved) : 
        defaultFallback(config.type, config.slug);

      components.push({
        original: fullMatch,
        resolved: resolved.data,
        fallback
      });

      // Replace in text
      processedText = processedText.replace(fullMatch, fallback);
    } catch (error) {
      const fallback = defaultFallback(config.type, config.slug);
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