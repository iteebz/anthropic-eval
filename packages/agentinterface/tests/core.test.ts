/**
 * Core Business Logic Tests
 * Tests the essential AgentInterface parsing, validation, and component resolution
 */

import { describe, it, expect, vi } from 'vitest';
import { processInlineComponents } from '../src/core/component-resolver';
import { parseAgentResponse } from '../src/utils/parsing';
import {
  validateInterfaceData,
  isValidInterfaceType,
} from '../src/core/validation';
import {
  RecursiveComponentParser,
  createParser,
  parseComponent,
} from '../src/parser/recursive';

describe('Core Business Logic', () => {
  describe('Agent Response Parser', () => {
    it('should parse valid JSON responses', () => {
      const response = JSON.stringify({
        type: 'timeline',
        props: { events: [{ date: '2024-01-01', title: 'Test' }] },
        content: 'Timeline content',
      });

      const result = parseAgentResponse(response);

      expect(result.interface_type).toBe('timeline');
      expect(result.interface_data).toEqual({
        events: [{ date: '2024-01-01', title: 'Test' }],
      });
      expect(result.raw_content).toBe('Timeline content');
    });

    it('should fallback to markdown for invalid JSON', () => {
      const response = 'This is plain text';

      const result = parseAgentResponse(response);

      expect(result.interface_type).toBe('markdown');
      expect(result.interface_data).toEqual({});
      expect(result.raw_content).toBe('This is plain text');
    });

    it('should handle partial JSON responses', () => {
      const response = JSON.stringify({
        type: 'table',
        // Missing props and content
      });

      const result = parseAgentResponse(response);

      expect(result.interface_type).toBe('table');
      expect(result.interface_data).toEqual({});
      expect(result.raw_content).toBe('');
    });
  });

  describe('Interface Type Validation', () => {
    it('should validate known interface types', () => {
      expect(isValidInterfaceType('timeline')).toBe(true);
      expect(isValidInterfaceType('card-grid')).toBe(true);
      expect(isValidInterfaceType('markdown')).toBe(true);
    });

    it('should reject unknown interface types', () => {
      expect(isValidInterfaceType('unknown-type')).toBe(false);
      expect(isValidInterfaceType('')).toBe(false);
      expect(isValidInterfaceType('table')).toBe(false);
    });
  });

  describe('Interface Data Validation', () => {
    it('should validate timeline data successfully', () => {
      const timelineData = {
        events: [
          {
            date: '2024-01-01',
            title: 'Event 1',
            description: 'Description 1',
          },
          {
            date: '2024-01-02',
            title: 'Event 2',
            description: 'Description 2',
          },
        ],
      };

      const result = validateInterfaceData('timeline', timelineData);

      expect(result.success).toBe(true);
      expect(result.data.events).toHaveLength(2);
      expect(result.error).toBeNull();
    });

    it('should validate card-grid data successfully', () => {
      const cardGridData = {
        cards: [
          {
            title: 'Test Card',
            description: 'Test description',
            tags: ['tag1'],
            links: [],
            metadata: {},
          },
        ],
        layout: 'grid',
        columns: 3,
      };

      const result = validateInterfaceData('card-grid', cardGridData);

      expect(result.success).toBe(true);
      expect(result.data.cards).toHaveLength(1);
      expect(result.error).toBeNull();
    });

    it('should handle validation errors gracefully', () => {
      const invalidData = {
        events: 'not-an-array',
      };

      const result = validateInterfaceData('timeline', invalidData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });
  });

  describe('Inline Component Processing', () => {
    it('should process valid inline components', async () => {
      const text = 'Check out this {{timeline:events}} for more info.';

      const mockResolver = vi.fn().mockResolvedValue({
        events: [{ date: '2024-01-01', title: 'Test Event' }],
      });

      const result = await processInlineComponents(text, mockResolver);

      expect(result.components).toHaveLength(1);
      expect(result.components[0].original).toBe('{{timeline:events}}');
      expect(result.components[0].resolved).toBeTruthy();
      expect(mockResolver).toHaveBeenCalledWith('timeline', 'events');
    });

    it('should skip invalid component syntax', async () => {
      const text = 'Invalid {{invalid syntax}} here.';

      const mockResolver = vi.fn();

      const result = await processInlineComponents(text, mockResolver);

      expect(result.components).toHaveLength(0);
      expect(mockResolver).not.toHaveBeenCalled();
    });

    it('should use fallback for failed resolution', async () => {
      const text = 'Missing {{timeline:events}} here.';

      const mockResolver = vi
        .fn()
        .mockRejectedValue(new Error('Component not found'));

      const result = await processInlineComponents(text, mockResolver);

      expect(result.components).toHaveLength(1);
      expect(result.components[0].resolved).toBeNull();
      expect(result.components[0].fallback).toBe('⚠️ events');
    });

    it('should handle empty components gracefully', async () => {
      const text = 'No components here.';

      const mockResolver = vi.fn();

      const result = await processInlineComponents(text, mockResolver);

      expect(result.components).toHaveLength(0);
      expect(result.processedText).toBe('No components here.');
      expect(mockResolver).not.toHaveBeenCalled();
    });
  });

  describe('Recursive Component Parser', () => {
    it('should parse simple component tokens', () => {
      const parser = new RecursiveComponentParser();
      const input = 'Simple text';

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('Simple text');
    });

    it('should handle text content mixed with components', () => {
      const parser = new RecursiveComponentParser();
      const input = 'Before {{timeline}} after';

      const result = parser.parse(input);

      expect(result).toHaveLength(3);
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('Before ');
      expect(result[1].type).toBe('timeline');
      expect(result[2].type).toBe('text');
      expect(result[2].content).toBe(' after');
    });

    it('should parse nested components within limits', () => {
      const parser = new RecursiveComponentParser({ maxDepth: 5 });
      const input = '{{a|{{b}}}}';

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('a');
      expect(result[0].children).toHaveLength(1);
      expect(result[0].children[0].type).toBe('b');
    });

    it('should validate component structure', () => {
      const parser = new RecursiveComponentParser();
      const components = [
        {
          type: 'timeline',
          data: { events: [] },
          content: '',
          children: [],
          raw: '{{timeline}}',
        },
      ];

      const validation = parser.validate(components);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should handle unmatched braces gracefully', () => {
      const parser = new RecursiveComponentParser();
      const input = '{{timeline missing close';

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('text');
      expect(result[0].content).toBe('{{timeline missing close');
    });

    it('should process simple components', () => {
      const parser = new RecursiveComponentParser();
      const input = '{{timeline}}';

      const result = parser.parse(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('timeline');
      expect(result[0].data).toEqual({});
    });
  });

  describe('Factory Functions', () => {
    it('should create parser with options', () => {
      const parser = createParser({
        maxDepth: 5,
        strictMode: true,
        allowedComponents: ['timeline', 'cards'],
      });

      expect(parser).toBeInstanceOf(RecursiveComponentParser);
    });

    it('should parse simple components', () => {
      const input = '{{timeline}}';

      const result = parseComponent(input);

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('timeline');
    });
  });
});
