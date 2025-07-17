/**
 * Minimal sanity tests - just verify components render
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CardGrid } from '../card-grid';
// import { Markdown } from '../markdown';
import { Timeline } from '../timeline';
import { CodeSnippet } from '../code-snippet';

describe('Component Sanity Tests', () => {
  it('should render CardGrid component', () => {
    const { container } = render(
      <CardGrid
        content="Test content"
        interfaceData={{
          cards: [
            {
              title: 'Test Card',
              description: 'Test description',
              tags: ['test'],
              links: [],
              metadata: {}
            }
          ]
        }}
      />
    );
    
    expect(container.textContent).toContain('Test Card');
    expect(container.textContent).toContain('Test description');
  });

  // it('should render Markdown component', () => {
  //   const { container } = render(
  //     <Markdown 
  //       content="# Test Heading\nTest paragraph"
  //     />
  //   );
    
  //   expect(container.textContent).toContain('Test Heading');
  //   expect(container.textContent).toContain('Test paragraph');
  // });

  it('should render Timeline component', () => {
    const { container } = render(
      <Timeline
        content="Test timeline"
        interfaceData={{
          events: [
            {
              date: '2024-01-01',
              title: 'Test Event',
              description: 'Test description',
              tags: ['test'],
              metadata: {}
            }
          ]
        }}
      />
    );
    
    expect(container.textContent).toContain('Test Event');
    expect(container.textContent).toContain('Test description');
  });

  it('should render CodeSnippet component', () => {
    const { container } = render(
      <CodeSnippet
        content="Test code snippet"
        interfaceData={{
          code: 'const test = "hello";',
          language: 'javascript'
        }}
      />
    );
    
    expect(container.textContent).toContain('const test = "hello";');
  });
});