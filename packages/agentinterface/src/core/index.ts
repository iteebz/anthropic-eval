/**
 * Core AIP Primitives
 *
 * Domain-agnostic interface components that form the foundation of the Agent Interface Protocol.
 * These components are designed to be extracted as a standalone package.
 */

export * from './schemas';
export * from './validation';

// Core primitive components - now using AIP structure
export { Cards } from '../components/aip/cards';
export { Accordion } from '../components/aip/accordion';
export { Reference } from '../components/aip/reference';
export { Insights } from '../components/aip/insights';
export { Prose } from '../components/prose';
export { Timeline } from '../components/aip/timeline';

// Core primitive registry
import { Cards } from '../components/aip/cards';
import { Accordion } from '../components/aip/accordion';
import { Reference } from '../components/aip/reference';
import { Insights } from '../components/aip/insights';
import { Prose } from '../components/prose';
import { Timeline } from '../components/aip/timeline';
import { RendererComponentProps } from '../utils/componentProps';
import {
  type CardGridData,
  type ExpandableSectionData,
  type KeyInsightsData,
  type TimelineData,
  type MarkdownData,
  type InlineReferencesData,
} from '../types';

export const CoreComponentRegistry = {
  markdown: Prose as React.ComponentType<RendererComponentProps<MarkdownData>>,
  'card-grid': Cards as React.ComponentType<
    RendererComponentProps<CardGridData>
  >,
  'expandable-section': Accordion as React.ComponentType<
    RendererComponentProps<ExpandableSectionData>
  >,
  'key-insights': Insights as React.ComponentType<
    RendererComponentProps<KeyInsightsData>
  >,
  timeline: Timeline as React.ComponentType<
    RendererComponentProps<TimelineData>
  >,
  'inline-reference': Reference as React.ComponentType<
    RendererComponentProps<InlineReferencesData>
  >,
} as const;

export type CoreComponentType = keyof typeof CoreComponentRegistry;
