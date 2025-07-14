/**
 * Core AIP Primitives
 *
 * Domain-agnostic interface components that form the foundation of the Agent Interface Protocol.
 * These components are designed to be extracted as a standalone package.
 */

export * from "./schemas";
export * from "./validation";

// Core primitive components
export { CardGrid } from "../components/interface/card-grid";
export { ExpandableSection } from "../components/interface/expandable-section";
export { InlineReference } from "../components/interface/inline-reference";
export { KeyInsights } from "../components/interface/key-insights";
export { MarkdownRenderer } from "../components/render/MarkdownRenderer";
export { Timeline } from "../components/interface/timeline";

// Core primitive registry
import { CardGrid } from "../components/interface/card-grid";
import { ExpandableSection } from "../components/interface/expandable-section";
import { InlineReference } from "../components/interface/inline-reference";
import { KeyInsights } from "../components/interface/key-insights";
import { MarkdownRenderer } from "../components/render/MarkdownRenderer";
import { Timeline } from "../components/interface/timeline";
import { RendererComponentProps } from "../utils/componentProps";
import {
  type CardGridData,
  type ExpandableSectionData,
  type KeyInsightsData,
  type TimelineData,
  type MarkdownData,
  type InlineReferencesData,
} from "../types";

export const CoreComponentRegistry = {
  markdown: MarkdownRenderer as React.ComponentType<
    RendererComponentProps<MarkdownData>
  >,
  "card-grid": CardGrid as React.ComponentType<
    RendererComponentProps<CardGridData>
  >,
  "expandable-section": ExpandableSection as React.ComponentType<
    RendererComponentProps<ExpandableSectionData>
  >,
  "key-insights": KeyInsights as React.ComponentType<
    RendererComponentProps<KeyInsightsData>
  >,
  timeline: Timeline as React.ComponentType<
    RendererComponentProps<TimelineData>
  >,
  "inline-reference": InlineReference as React.ComponentType<
    RendererComponentProps<InlineReferencesData>
  >,
} as const;

export type CoreComponentType = keyof typeof CoreComponentRegistry;
