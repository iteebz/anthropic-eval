/**
 * Tests for HotReloadProvider React behavior
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HotReloadProvider, useHotReload, useComponentHotReload } from '../src/dev/hot-reload';
import { ComponentDiscovery } from '../src/dev/filesystem-discovery';

// Mock ComponentDiscovery
vi.mock('../src/dev/filesystem-discovery', () => ({
  ComponentDiscovery: vi.fn().mockImplementation(() => ({
    discover: vi.fn().mockResolvedValue(new Map()),
    getRegistry: vi.fn().mockReturnValue({})
  }))
}));

const MockComponentDiscovery = vi.mocked(ComponentDiscovery);

describe('HotReloadProvider', () => {
  const mockDiscovery = {
    discover: vi.fn().mockResolvedValue(new Map()),
    getRegistry: vi.fn().mockReturnValue({})
  };

  beforeEach(() => {
    vi.clearAllMocks();
    MockComponentDiscovery.mockClear();
  });

  it('provides reload functions to children', () => {
    function TestComponent() {
      const hotReload = useHotReload();
      
      return (
        <div>
          <button onClick={hotReload.reloadAll}>Reload All</button>
          <button onClick={() => hotReload.reloadComponent('test')}>Reload Component</button>
          <span>{hotReload.isEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByText('Reload All')).toBeInTheDocument();
    expect(screen.getByText('Reload Component')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('maintains component registry state', async () => {
    const mockRegistry = {
      'test-component': {
        name: 'test-component',
        description: 'Test component',
        component: () => <div>Test</div>
      }
    };

    mockDiscovery.getRegistry.mockReturnValue(mockRegistry);

    function TestComponent() {
      const hotReload = useHotReload();
      
      return (
        <div>
          <div data-testid="registry-count">
            {Object.keys(hotReload.registry).length}
          </div>
          <button onClick={hotReload.reloadAll}>Reload All</button>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    fireEvent.click(screen.getByText('Reload All'));

    await waitFor(() => {
      expect(mockDiscovery.discover).toHaveBeenCalled();
      expect(mockDiscovery.getRegistry).toHaveBeenCalled();
    });
  });

  it('handles reload errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDiscovery.discover.mockRejectedValue(new Error('Discovery failed'));

    function TestComponent() {
      const hotReload = useHotReload();
      
      return (
        <div>
          <button onClick={hotReload.reloadAll}>Reload All</button>
          <div data-testid="error-count">{hotReload.errors.length}</div>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    fireEvent.click(screen.getByText('Reload All'));

    await waitFor(() => {
      expect(screen.getByTestId('error-count')).toHaveTextContent('1');
    });

    consoleErrorSpy.mockRestore();
  });

  it('can be enabled and disabled', () => {
    function TestComponent() {
      const hotReload = useHotReload();
      
      return (
        <div>
          <span data-testid="enabled">{hotReload.isEnabled ? 'true' : 'false'}</span>
          <button onClick={() => hotReload.setEnabled(!hotReload.isEnabled)}>
            Toggle
          </button>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByTestId('enabled')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Toggle'));

    expect(screen.getByTestId('enabled')).toHaveTextContent('false');
  });

  it('initializes with no last reload timestamp', async () => {
    function TestComponent() {
      const hotReload = useHotReload();
      
      return (
        <div>
          <div data-testid="last-reload">
            {hotReload.lastReload ? hotReload.lastReload.toISOString() : 'never'}
          </div>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByTestId('last-reload')).toHaveTextContent('never');
  });

  it('throws error when used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    function TestComponent() {
      useHotReload();
      return <div>Test</div>;
    }

    expect(() => render(<TestComponent />)).toThrow(
      'useHotReload must be used within a HotReloadProvider'
    );

    consoleErrorSpy.mockRestore();
  });

  it('defaults to development environment detection', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    function TestComponent() {
      const hotReload = useHotReload();
      return <span data-testid="enabled">{hotReload.isEnabled ? 'true' : 'false'}</span>;
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByTestId('enabled')).toHaveTextContent('true');

    process.env.NODE_ENV = originalEnv;
  });
});

describe('useComponentHotReload', () => {
  const mockDiscovery = {
    discover: vi.fn().mockResolvedValue(new Map()),
    getRegistry: vi.fn().mockReturnValue({})
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('provides component-specific reload functionality', async () => {
    function TestComponent() {
      const componentHotReload = useComponentHotReload('test-component');
      
      return (
        <div>
          <button onClick={componentHotReload.reload}>Reload Component</button>
          <span data-testid="error">{componentHotReload.isError ? 'true' : 'false'}</span>
          <span data-testid="enabled">{componentHotReload.isEnabled ? 'true' : 'false'}</span>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByTestId('error')).toHaveTextContent('false');
    expect(screen.getByTestId('enabled')).toHaveTextContent('true');

    fireEvent.click(screen.getByText('Reload Component'));

    await waitFor(() => {
      expect(mockDiscovery.discover).toHaveBeenCalled();
    });
  });

  it('detects component-specific errors', async () => {
    function TestComponent() {
      const { reloadAll } = useHotReload();
      const componentHotReload = useComponentHotReload('test-component');
      
      return (
        <div>
          <button onClick={reloadAll}>Trigger Error</button>
          <span data-testid="error">{componentHotReload.isError ? 'true' : 'false'}</span>
        </div>
      );
    }

    // Mock an error that includes the component name
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDiscovery.discover.mockRejectedValue(new Error('Failed to reload component test-component'));

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    fireEvent.click(screen.getByText('Trigger Error'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('true');
    });

    consoleErrorSpy.mockRestore();
  });

  it('initializes with no last reload timestamp', async () => {
    function TestComponent() {
      const componentHotReload = useComponentHotReload('test-component');
      
      return (
        <div>
          <div data-testid="last-reload">
            {componentHotReload.lastReload ? componentHotReload.lastReload.toISOString() : 'never'}
          </div>
        </div>
      );
    }

    render(
      <HotReloadProvider discovery={mockDiscovery as any} enabled={true}>
        <TestComponent />
      </HotReloadProvider>
    );

    expect(screen.getByTestId('last-reload')).toHaveTextContent('never');
  });
});