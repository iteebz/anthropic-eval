import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

describe('AIP Components', () => {
  describe('Timeline Component', () => {
    it('should render timeline events', async () => {
      const { Timeline } = await import('../src/components/aip/timeline');
      const props = {
        interfaceData: {
          events: [
            {
              date: '2024-01-01',
              title: 'Test Event',
              description: 'Test description'
            }
          ]
        }
      };

      const { getByText } = render(React.createElement(Timeline, props));
      
      expect(getByText('Test Event')).toBeInTheDocument();
      expect(getByText('2024-01-01')).toBeInTheDocument();
      expect(getByText('Test description')).toBeInTheDocument();
    });

    it('should export correct metadata', async () => {
      const { metadata } = await import('../src/components/aip/timeline');
      
      expect(metadata.type).toBe('timeline');
      expect(metadata.category).toBe('interface');
      expect(metadata.tags).toContain('chronological');
      expect(metadata.schema.type).toBe('object');
      expect(metadata.schema.required).toContain('events');
    });
  });

  describe('Markdown Component', () => {
    it('should export correct metadata', async () => {
      const { metadata } = await import('../src/components/aip/markdown');
      
      expect(metadata.type).toBe('markdown');
      expect(metadata.category).toBe('interface');
      expect(metadata.tags).toContain('text');
      expect(metadata.schema.required).toContain('content');
    });
  });

  describe('Table Component', () => {
    it('should render comparison table', async () => {
      const { Table } = await import('../src/components/aip/table');
      const props = {
        items: [
          {
            id: '1',
            name: 'Item 1',
            attributes: { price: '$10', rating: '5 stars' }
          }
        ],
        attributes: [
          { key: 'price', label: 'Price' },
          { key: 'rating', label: 'Rating' }
        ]
      };

      const { getByText } = render(React.createElement(Table, props));
      
      expect(getByText('Item 1')).toBeInTheDocument();
      expect(getByText('Price')).toBeInTheDocument();
      expect(getByText('$10')).toBeInTheDocument();
    });

    it('should export correct metadata', async () => {
      const { metadata } = await import('../src/components/aip/table');
      
      expect(metadata.type).toBe('table');
      expect(metadata.category).toBe('interface');
      expect(metadata.tags).toContain('data');
      expect(metadata.schema.required).toContain('items');
      expect(metadata.schema.required).toContain('attributes');
    });
  });

  describe('Component Metadata Consistency', () => {
    const componentFiles = [
      'timeline',
      'markdown', 
      'table',
      'reference',
      'insights',
      'gallery',
      'accordion'
    ];

    componentFiles.forEach(componentName => {
      it(`should have consistent metadata structure for ${componentName}`, async () => {
        const { metadata } = await import(`../src/components/aip/${componentName}`);
        
        // All components should have these required fields
        expect(metadata).toHaveProperty('type');
        expect(metadata).toHaveProperty('description');
        expect(metadata).toHaveProperty('schema');
        expect(metadata).toHaveProperty('category');
        expect(metadata).toHaveProperty('tags');
        
        // Type should match filename
        expect(metadata.type).toBe(componentName);
        
        // Description should be meaningful
        expect(metadata.description.length).toBeGreaterThan(10);
        
        // Schema should be valid
        expect(metadata.schema).toHaveProperty('type');
        expect(metadata.schema.type).toBe('object');
        
        // Category should be valid
        expect(['interface', 'custom']).toContain(metadata.category);
        
        // Tags should be array with at least one tag
        expect(Array.isArray(metadata.tags)).toBe(true);
        expect(metadata.tags.length).toBeGreaterThan(0);
      });
    });
  });
});