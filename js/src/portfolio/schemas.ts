/**
 * Portfolio-Specific Component Schemas
 *
 * Domain-specific validation schemas for portfolio components.
 * These schemas extend the core AIP primitives with portfolio-specific functionality.
 */
import { z } from "zod";
import { CORE_VALIDATION_SCHEMAS } from "../core/core-schemas";

// Portfolio-specific validation schemas (core only now)
export const PORTFOLIO_VALIDATION_SCHEMAS = {
  ...CORE_VALIDATION_SCHEMAS,
} as const;

/**
 * Get safe default data for portfolio components.
 */
export function getPortfolioSafeDefaults<
  T extends keyof typeof PORTFOLIO_VALIDATION_SCHEMAS,
>(uiType: T): z.infer<(typeof PORTFOLIO_VALIDATION_SCHEMAS)[T]> {
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

  return defaults[uiType] as z.infer<(typeof PORTFOLIO_VALIDATION_SCHEMAS)[T]>;
}
