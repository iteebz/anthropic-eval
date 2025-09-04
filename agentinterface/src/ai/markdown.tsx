export { Prose as Markdown } from '../prose';

// AIP Metadata - autodiscovery pattern
export const metadata = {
  type: 'markdown',
  description: 'Rendered markdown content with styling',
  schema: {
    type: 'object',
    properties: {
      content: { type: 'string' },
      className: { type: 'string', optional: true }
    },
    required: ['content']
  },
  category: 'content'
};