/**
 * Component auto-registration
 * 
 * Auto-registers all AIP components using metadata exports
 */

import { registerComponent } from '../registry';

// Import all AIP components with metadata
import { 
  Timeline, TimelineMetadata,
  Markdown, MarkdownMetadata, 
  Table, TableMetadata,
  Reference, ReferenceMetadata,
  Insights, InsightsMetadata,
  Gallery, GalleryMetadata,
  Accordion, AccordionMetadata,
  Cards, CardsMetadata,
  Tree, TreeMetadata,
  Suggestions, SuggestionsMetadata,
  Code, CodeMetadata,
  Card, CardMetadata,
  Tabs, TabsMetadata
} from './aip';

// Auto-register all AIP components
registerComponent(TimelineMetadata, Timeline);
registerComponent(MarkdownMetadata, Markdown);
registerComponent(TableMetadata, Table);
registerComponent(ReferenceMetadata, Reference);
registerComponent(InsightsMetadata, Insights);
registerComponent(GalleryMetadata, Gallery);
registerComponent(AccordionMetadata, Accordion);
registerComponent(CardsMetadata, Cards);
registerComponent(TreeMetadata, Tree);
registerComponent(SuggestionsMetadata, Suggestions);
registerComponent(CodeMetadata, Code);
registerComponent(CardMetadata, Card);
registerComponent(TabsMetadata, Tabs);

console.log('✅ AgentInterface: Registered all AIP components');