/**
 * Component exports and auto-registration
 */

import { registerComponent } from '../registry/unified';

// Timeline
export { Timeline, TimelineSchema, TimelineMetadata } from './timeline';
import { Timeline, TimelineMetadata } from './timeline';

// Markdown  
export { Markdown, MarkdownSchema, MarkdownMetadata } from './markdown';
import { Markdown, MarkdownMetadata } from './markdown';

// Auto-register core components
registerComponent(TimelineMetadata, Timeline);
registerComponent(MarkdownMetadata, Markdown);

console.log('✅ AgentInterface: Registered core components');