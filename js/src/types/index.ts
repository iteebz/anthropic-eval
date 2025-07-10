/**
 * TypeScript type definitions for AgentInterface
 */
import { z } from "zod";
import {
  SectionDataSchema,
  ExpandableDetailDataSchema,
  InsightDataSchema,
  KeyInsightsDataSchema,
  TimelineEventDataSchema,
  TimelineDataSchema,
  TechDeepDiveSectionDataSchema,
  TechDeepDiveDataSchema,
  MarkdownDataSchema,
  ReferenceDataSchema,
  InlineLinkDataSchema,
  CardDataSchema,
  CardGridDataSchema,
  INTERFACE_VALIDATION_SCHEMAS,
} from "../core/schemas";

// Core data types
export type SectionData = z.infer<typeof SectionDataSchema>;
export type ExpandableDetailData = z.infer<typeof ExpandableDetailDataSchema>;
export type InsightData = z.infer<typeof InsightDataSchema>;
export type KeyInsightsData = z.infer<typeof KeyInsightsDataSchema>;
export type TimelineEventData = z.infer<typeof TimelineEventDataSchema>;
export type TimelineData = z.infer<typeof TimelineDataSchema>;
export type TechDeepDiveSectionData = z.infer<
  typeof TechDeepDiveSectionDataSchema
>;
export type TechDeepDiveData = z.infer<typeof TechDeepDiveDataSchema>;
export type MarkdownData = z.infer<typeof MarkdownDataSchema>;
export type ReferenceData = z.infer<typeof ReferenceDataSchema>;
export type InlineLinkData = z.infer<typeof InlineLinkDataSchema>;
export type CardData = z.infer<typeof CardDataSchema>;
export type CardGridData = z.infer<typeof CardGridDataSchema>;

// UI Component Type Union
export type InterfaceData =
  | CardGridData
  | ExpandableDetailData
  | KeyInsightsData
  | TimelineData
  | TechDeepDiveData
  | MarkdownData
  | InlineLinkData;

// Interface type from validation schemas
export type InterfaceType = keyof typeof INTERFACE_VALIDATION_SCHEMAS;

// Base props for all interface components
export interface InterfaceComponentProps {
  content: string;
  className?: string;
}

// Legacy interface for backward compatibility
export interface InterfaceProps {
  content: string;
  interfaceData?: InterfaceData;
  className?: string;
  onSendMessage?: (message: string) => void;
}

// Specific component prop types
export interface CardGridProps extends InterfaceComponentProps {
  interfaceData: CardGridData;
}

export interface ExpandableDetailProps extends InterfaceComponentProps {
  interfaceData: ExpandableDetailData;
}

export interface KeyInsightsProps extends InterfaceComponentProps {
  interfaceData: KeyInsightsData;
}

export interface TimelineProps extends InterfaceComponentProps {
  interfaceData: TimelineData;
}

export interface TechDeepDiveProps extends InterfaceComponentProps {
  interfaceData: TechDeepDiveData;
}

export interface MarkdownProps extends InterfaceComponentProps {
  interfaceData: MarkdownData;
}

export interface InlineLinkProps extends InterfaceComponentProps {
  interfaceData: InlineLinkData;
}

// Union type for all component props
export type ComponentProps =
  | CardGridProps
  | ExpandableDetailProps
  | KeyInsightsProps
  | TimelineProps
  | TechDeepDiveProps
  | MarkdownProps
  | InlineLinkProps;
