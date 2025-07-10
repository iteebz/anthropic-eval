/**
 * Core AIP Primitives
 *
 * Domain-agnostic interface components that form the foundation of the Agent Interface Protocol.
 * These components are designed to be extracted as a standalone package.
 */

export * from "./schemas";
export * from "./validation";

// Core primitive components
export { CardGrid } from "../components/card-grid";
export { ExpandableDetail } from "../components/expandable-detail";
export { InlineLink } from "../components/inline-link";
export { KeyInsights } from "../components/key-insights";
export { MarkdownRenderer } from "../components/MarkdownRenderer";
export { TechDeepDive } from "../components/tech-deep-dive";
export { Timeline } from "../components/timeline";

// Core primitive registry
import { CardGrid } from "../components/card-grid";
import { ExpandableDetail } from "../components/expandable-detail";
import { InlineLink } from "../components/inline-link";
import { KeyInsights } from "../components/key-insights";
import { MarkdownRenderer } from "../components/MarkdownRenderer";
import { TechDeepDive } from "../components/tech-deep-dive";
import { Timeline } from "../components/timeline";
import { RendererComponentProps } from "../react/utils/componentProps";
import {
  type CardGridData,
  type ExpandableDetailData,
  type KeyInsightsData,
  type TimelineData,
  type TechDeepDiveData,
  type MarkdownData,
  type InlineLinkData,
} from "../types";

export const CoreComponentRegistry = {
  markdown: MarkdownRenderer as React.ComponentType<
    RendererComponentProps<MarkdownData>
  >,
  card_grid: CardGrid as React.ComponentType<
    RendererComponentProps<CardGridData>
  >,
  expandable_detail: ExpandableDetail as React.ComponentType<
    RendererComponentProps<ExpandableDetailData>
  >,
  key_insights: KeyInsights as React.ComponentType<
    RendererComponentProps<KeyInsightsData>
  >,
  timeline: Timeline as React.ComponentType<
    RendererComponentProps<TimelineData>
  >,
  tech_deep_dive: TechDeepDive as React.ComponentType<
    RendererComponentProps<TechDeepDiveData>
  >,
  inline_link: InlineLink as React.ComponentType<
    RendererComponentProps<InlineLinkData>
  >,
} as const;

export type CoreComponentType = keyof typeof CoreComponentRegistry;
