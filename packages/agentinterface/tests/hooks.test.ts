/**
 * AgentInterface Hooks Tests
 * Tests the React hooks that bridge agent responses to UI components
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAgentResponseParser } from '../src/hooks/useAgentResponseParser';

describe('AgentInterface Hooks', () => {
  describe('useAgentResponseParser', () => {
    it('should parse valid agent responses', () => {
      const { result } = renderHook(() => useAgentResponseParser());
      
      const response = JSON.stringify({
        type: 'timeline',
        props: { 
          events: [
            { date: '2024-01-01', title: 'Event 1', description: 'Description 1' }
          ]
        },
        content: 'Timeline content'
      });

      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('timeline');
      expect(parsed.data?.events).toHaveLength(1);
      expect(parsed.content).toBe('Timeline content');
    });

    it('should fallback to markdown for invalid responses', () => {
      const { result } = renderHook(() => useAgentResponseParser());
      
      const response = 'Plain text response';
      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('markdown');
      expect(parsed.data).toBeUndefined();
      expect(parsed.content).toBe('Plain text response');
    });

    it('should handle unknown interface types', () => {
      const mockLogger = {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn()
      };

      const { result } = renderHook(() => 
        useAgentResponseParser({ logger: mockLogger })
      );
      
      const response = JSON.stringify({
        type: 'unknown-type',
        props: { data: 'test' },
        content: 'Content'
      });

      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('markdown');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Unknown interface type: unknown-type')
      );
    });

    it('should handle parsing errors gracefully', () => {
      const mockOnError = vi.fn();
      
      const { result } = renderHook(() => 
        useAgentResponseParser({ onError: mockOnError })
      );
      
      // parseAgentResponse handles malformed JSON gracefully, falling back to markdown
      const response = '{"type": "timeline", "malformed": }';
      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('markdown');
      expect(parsed.content).toBe(response);
      // onError won't be called since parseAgentResponse handles this gracefully
    });

    it('should enable performance monitoring when requested', () => {
      const mockLogger = {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn()
      };

      const { result } = renderHook(() => 
        useAgentResponseParser({ 
          enablePerformanceMonitoring: true,
          logger: mockLogger
        })
      );
      
      const response = JSON.stringify({
        type: 'timeline',
        props: { events: [] },
        content: 'Test'
      });

      result.current.parseResponse(response);
      
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('Agent response parsed in'),
        expect.objectContaining({
          interfaceType: 'timeline',
          parseTime: expect.any(Number)
        })
      );
    });

    it('should validate interface data and handle validation errors', () => {
      const mockLogger = {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn()
      };

      const { result } = renderHook(() => 
        useAgentResponseParser({ logger: mockLogger })
      );
      
      const response = JSON.stringify({
        type: 'timeline',
        props: { 
          events: 'invalid-data-should-be-array'
        },
        content: 'Test'
      });

      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('timeline');
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Interface data validation failed')
      );
    });

    it('should handle partial response data gracefully', () => {
      const { result } = renderHook(() => useAgentResponseParser());
      
      const response = JSON.stringify({
        type: 'markdown'
        // Missing props and content
      });

      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('markdown');
      expect(parsed.data).toBeUndefined();
      expect(parsed.content).toBe('');
    });

    it('should parse card-grid interface successfully', () => {
      const { result } = renderHook(() => useAgentResponseParser());
      
      const response = JSON.stringify({
        type: 'card-grid',
        props: {
          cards: [
            {
              title: 'Card 1',
              description: 'Description',
              tags: ['tag1'],
              links: [],
              metadata: {}
            }
          ],
          layout: 'grid',
          columns: 3
        },
        content: 'Card grid content'
      });

      const parsed = result.current.parseResponse(response);
      
      expect(parsed.type).toBe('card-grid');
      expect(parsed.data?.cards).toHaveLength(1);
      expect(parsed.data?.cards[0].title).toBe('Card 1');
      expect(parsed.content).toBe('Card grid content');
    });
  });
});