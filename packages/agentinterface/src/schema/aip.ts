/**
 * AIP Schema - Component composition structure
 */

export interface AIPBlock {
  type: string;
  [key: string]: any;
}

export interface AIPContainer extends AIPBlock {
  children?: AIPBlock[];
  items?: AIPBlock[];
  content?: AIPBlock | AIPBlock[];
}

export interface ComponentMetadata {
  type: string;
  description: string;
  category: 'container' | 'atomic';
  tags: string[];
  schema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// Base schemas for common patterns
export const ATOMIC_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: { type: 'string' }
  },
  required: ['type']
};

export const CONTAINER_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: { type: 'string' },
    children: {
      type: 'array',
      items: { type: 'object' }
    }
  },
  required: ['type']
};

export const TABS_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: { type: 'string', enum: ['tabs'] },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          label: { type: 'string' },
          content: { type: 'array', items: { type: 'object' } }
        },
        required: ['id', 'label', 'content']
      }
    }
  },
  required: ['type', 'items']
};

export const CARD_SCHEMA = {
  type: 'object' as const,
  properties: {
    type: { type: 'string', enum: ['card'] },
    variant: { type: 'string', enum: ['default', 'outlined', 'elevated'] },
    header: { type: 'array', items: { type: 'object' } },
    body: { type: 'array', items: { type: 'object' } },
    footer: { type: 'array', items: { type: 'object' } }
  },
  required: ['type']
};