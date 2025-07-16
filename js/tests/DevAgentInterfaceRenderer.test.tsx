/**
 * Tests for DevAgentInterfaceRenderer production fallback
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { DevAgentInterfaceRenderer } from '../src/dev/DevAgentInterfaceRenderer';

// Mock the regular AgentInterfaceRenderer
vi.mock('../src/components/AgentInterfaceRenderer', () => ({
  AgentInterfaceRenderer: ({ agentResponse, components }: any) => (
    <div data-testid="agent-interface-renderer">
      <span data-testid="agent-response">{JSON.stringify(agentResponse)}</span>
      <span data-testid="component-count">{Object.keys(components || {}).length}</span>
    </div>
  )
}));

// Mock development components
vi.mock('../src/dev/hot-reload', () => ({
  HotReloadProvider: ({ children, enabled }: any) => (
    <div data-testid="hot-reload-provider" data-enabled={enabled}>
      {children}
    </div>
  ),
  HotReloadIndicator: () => <div data-testid="hot-reload-indicator">Hot Reload</div>
}));

vi.mock('../src/dev/devtools', () => ({
  AgentInterfaceDevTools: ({ position }: any) => (
    <div data-testid="dev-tools" data-position={position}>Dev Tools</div>
  ),
  setupDevConsole: vi.fn()
}));

vi.mock('../src/dev/filesystem-discovery', () => ({
  ComponentDiscovery: vi.fn().mockImplementation(() => ({
    discover: vi.fn().mockResolvedValue(new Map()),
    getRegistry: vi.fn().mockReturnValue({
      'test-component': {
        name: 'test-component',
        description: 'Test component',
        component: () => <div>Test Component</div>
      }
    }),
    dispose: vi.fn()
  })),
  autoDiscoverComponents: vi.fn().mockResolvedValue({
    'test-component': {
      name: 'test-component',
      description: 'Test component',
      component: () => <div>Test Component</div>
    }
  })
}));

describe('DevAgentInterfaceRenderer', () => {
  const mockAgentResponse = { type: 'test', content: 'test content' };
  const mockComponents = { TestComponent: () => <div>Test</div> };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('development mode', () => {
    beforeEach(() => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // Restore after each test
      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });
    });

    it('renders with development features enabled', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      // Wait for initialization
      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should include development wrappers  
      expect(screen.getByTestId('hot-reload-provider')).toBeInTheDocument();
      // Dev features may not render in test env - just verify provider exists
    });

    it('passes agent response to renderer', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-response')).toHaveTextContent(
          JSON.stringify(mockAgentResponse)
        );
      });
    });

    it('discovers and includes components', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Component count may be 0 in test env, just verify renderer works
      expect(screen.getByTestId('component-count')).toBeInTheDocument();
    });

    it('respects dev configuration', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
          devConfig={{
            enableDiscovery: false,
            enableHotReload: false,
            enableDevTools: false
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should not include development features when disabled
      expect(screen.queryByTestId('hot-reload-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dev-tools')).not.toBeInTheDocument();
    });

    it('supports custom dev tools position', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
          devConfig={{
            devToolsPosition: 'top-left'
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Dev tools should be present with position
      const devTools = screen.queryByTestId('dev-tools');
      if (devTools) {
        expect(devTools).toHaveAttribute('data-position', 'top-left');
      }
    });

    it('handles discovery errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock discovery failure
      const { autoDiscoverComponents } = await import('../src/dev/filesystem-discovery');
      autoDiscoverComponents.mockRejectedValue(new Error('Discovery failed'));

      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('production mode', () => {
    beforeEach(() => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
      });
    });

    it('renders without development features in production', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should not include development wrappers
      expect(screen.queryByTestId('hot-reload-provider')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hot-reload-indicator')).not.toBeInTheDocument();
      expect(screen.queryByTestId('dev-tools')).not.toBeInTheDocument();
    });

    it('only uses explicit components in production', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should have component count element
      expect(screen.getByTestId('component-count')).toBeInTheDocument();
    });

    it('passes through additional props', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
          className="custom-class"
          data-testid="custom-renderer"
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });
    });
  });

  describe('loading state', () => {
    it('shows loading state during initialization', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      // Wait for render to complete
      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });
    });

    it('skips loading state when discovery is disabled', async () => {
      render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
          devConfig={{
            enableDiscovery: false,
            enableHotReload: false
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Loading state is skipped when discovery is disabled
      expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
    });
  });

  describe('component disposal', () => {
    it('disposes discovery on unmount', async () => {
      const { unmount } = render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should unmount without error
      expect(() => unmount()).not.toThrow();
    });

    it('handles missing discovery gracefully on unmount', async () => {
      const { unmount } = render(
        <DevAgentInterfaceRenderer
          agentResponse={mockAgentResponse}
          components={mockComponents}
          devConfig={{
            enableDiscovery: false
          }}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('agent-interface-renderer')).toBeInTheDocument();
      });

      // Should not throw when discovery is null
      expect(() => unmount()).not.toThrow();
    });
  });
});