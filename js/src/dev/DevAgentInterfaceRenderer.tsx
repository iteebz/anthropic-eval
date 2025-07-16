/**
 * Development-enhanced AgentInterface Renderer
 * Includes hot-reload, filesystem discovery, and dev tools
 */

import React, { useEffect, useState } from 'react';
import { AgentInterfaceRenderer } from '../components/AgentInterfaceRenderer';
import { HotReloadProvider, HotReloadIndicator } from './hot-reload';
import { AgentInterfaceDevTools, setupDevConsole } from './devtools';
import { ComponentDiscovery, autoDiscoverComponents } from './filesystem-discovery';
import { ComponentInfo } from '../registry/auto';
import { DevConfig, defaultDevConfig } from './index';

export interface DevAgentInterfaceRendererProps {
  /** Agent response to render */
  agentResponse: any;
  /** Explicit components to include */
  components?: Record<string, React.ComponentType<any>>;
  /** Development configuration */
  devConfig?: DevConfig;
  /** Additional props for the base renderer */
  [key: string]: any;
}

export function DevAgentInterfaceRenderer({
  agentResponse,
  components = {},
  devConfig = defaultDevConfig,
  ...props
}: DevAgentInterfaceRendererProps) {
  const [discovery, setDiscovery] = useState<ComponentDiscovery | null>(null);
  const [registry, setRegistry] = useState<Record<string, ComponentInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  const config = { ...defaultDevConfig, ...devConfig };

  // Initialize development tools
  useEffect(() => {
    if (!config.enableDiscovery && !config.enableHotReload) {
      setIsLoading(false);
      return;
    }

    const initDev = async () => {
      try {
        // Set up console commands
        setupDevConsole();

        // Initialize component discovery
        let discoveryInstance: ComponentDiscovery | null = null;
        if (config.enableDiscovery) {
          discoveryInstance = new ComponentDiscovery({
            watch: config.enableHotReload,
            ...config.discoveryOptions
          });
          setDiscovery(discoveryInstance);
        }

        // Auto-discover components
        const discoveredRegistry = config.enableDiscovery
          ? await autoDiscoverComponents(components, config.discoveryOptions)
          : Object.fromEntries(
              Object.entries(components).map(([key, component]) => [
                key.toLowerCase().replace(/([A-Z])/g, '-$1'),
                {
                  name: key.toLowerCase().replace(/([A-Z])/g, '-$1'),
                  description: 'Explicit component',
                  component
                }
              ])
            );

        setRegistry(discoveredRegistry);
      } catch (error) {
        console.error('Failed to initialize AgentInterface development tools:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initDev();

    // Cleanup on unmount
    return () => {
      if (discovery) {
        discovery.dispose();
      }
    };
  }, [config.enableDiscovery, config.enableHotReload]);

  // Convert ComponentInfo registry to component registry
  const componentRegistry = Object.fromEntries(
    Object.entries(registry).map(([key, info]) => [key, info.component])
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading AgentInterface...</span>
      </div>
    );
  }

  const renderer = (
    <AgentInterfaceRenderer
      agentResponse={agentResponse}
      components={componentRegistry}
      {...props}
    />
  );

  // In production, just return the renderer
  if (process.env.NODE_ENV === 'production') {
    return renderer;
  }

  // In development, wrap with hot reload and dev tools
  return (
    <HotReloadProvider
      discovery={discovery}
      initialRegistry={registry}
      enabled={config.enableHotReload}
    >
      {renderer}
      
      {config.enableHotReload && <HotReloadIndicator />}
      
      {config.enableDevTools && (
        <AgentInterfaceDevTools position={config.devToolsPosition} />
      )}
    </HotReloadProvider>
  );
}

/**
 * Hook for accessing development registry
 */
export function useDevRegistry() {
  const [registry, setRegistry] = useState<Record<string, ComponentInfo>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRegistry = async () => {
      try {
        const discovery = new ComponentDiscovery();
        await discovery.discover();
        setRegistry(discovery.getRegistry());
      } catch (error) {
        console.error('Failed to load development registry:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRegistry();
  }, []);

  return { registry, isLoading };
}

/**
 * Component for testing individual components
 */
export function ComponentPlayground({ componentName }: { componentName: string }) {
  const { registry, isLoading } = useDevRegistry();
  const [testProps, setTestProps] = useState<any>({});

  if (isLoading) {
    return <div>Loading component...</div>;
  }

  const componentInfo = registry[componentName];
  if (!componentInfo) {
    return <div>Component "{componentName}" not found</div>;
  }

  const Component = componentInfo.component;
  if (!Component) {
    return <div>Component "{componentName}" has no implementation</div>;
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">{componentName}</h3>
      <p className="text-sm text-gray-600 mb-4">{componentInfo.description}</p>
      
      <div className="border-t pt-4">
        <Component {...testProps} />
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded">
        <h4 className="font-medium mb-2">Test Props</h4>
        <textarea
          value={JSON.stringify(testProps, null, 2)}
          onChange={(e) => {
            try {
              setTestProps(JSON.parse(e.target.value));
            } catch (error) {
              // Invalid JSON, ignore
            }
          }}
          className="w-full h-32 p-2 border rounded font-mono text-sm"
          placeholder="Enter test props as JSON"
        />
      </div>
    </div>
  );
}