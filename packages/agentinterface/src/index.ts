/**
 * AgentInterface - Agent JSON → React components
 */

// Main renderer - converts agent JSON to React components
export { AIPRenderer, render } from './components/renderer';

// All AI components
export { Card } from './components/ai/card';
export { Timeline } from './components/ai/timeline';
export { Markdown } from './components/ai/markdown';
export { Accordion } from './components/ai/accordion';
export { Code } from './components/ai/code';
export { Gallery } from './components/ai/gallery';
export { Insights } from './components/ai/insights';
export { Reference } from './components/ai/reference';
export { Suggestions } from './components/ai/suggestions';
export { Table } from './components/ai/table';
export { Tabs } from './components/ai/tabs';
export { Tree } from './components/ai/tree';
