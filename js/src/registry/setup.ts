/**
 * AIP Auto-Discovery System
 * 
 * Automatically discovers and registers all AIP components.
 * Just import this module and everything works automagically.
 */

import { getRegisteredTypes } from './unified';

// Import all core AIP components (triggers registration)
import '../components/interface/markdown';
import '../components/interface/key-insights';
import '../components/interface/expandable-section';
import '../components/interface/card-grid';
import '../components/interface/code-snippet';
import '../components/interface/comparison-table';
import '../components/interface/contact-form';
import '../components/interface/conversation-thread';
import '../components/interface/conversation-suggestions';
import '../components/interface/decision-tree';
import '../components/interface/image-gallery';
import '../components/interface/inline-reference';
import '../components/interface/progress-tracker';
import '../components/interface/timeline';

/**
 * Initialize agentic components and log what's available
 */
export function setup() {
  const components = getRegisteredTypes();
  console.log('🤖 Agentic components:', components);
  console.log('✅ Ready to render AI responses');
  return components;
}

// Auto-setup on import
setup();