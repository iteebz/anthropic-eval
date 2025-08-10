/**
 * Development-enhanced AgentInterface Renderer
 * Includes hot-reload, filesystem discovery, and dev tools
 */

import React, { useEffect, useState } from 'react';
import { AIPRenderer } from 'agentinterface';
import { HotReloadProvider, HotReloadIndicator } from './hot-reload';
import { AgentInterfaceDevTools, setupDevConsole } from './dev-panel';
// Component discovery replaced with new registry system
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
  const [isLoading, setIsLoading] = useState(false);

  const config = { ...defaultDevConfig, ...devConfig };

  // Initialize development tools
  useEffect(() => {
    // Set up console commands
    setupDevConsole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading AgentInterface...</span>
      </div>
    );
  }

  const renderer = <AIPRenderer agentResponse={agentResponse} {...props} />;

  // In production, just return the renderer
  if (process.env.NODE_ENV === 'production') {
    return renderer;
  }

  // In development, wrap with hot reload and dev tools
  return (
    <HotReloadProvider enabled={config.enableHotReload}>
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
  return { registry: {}, isLoading: false };
}

/**
 * Component for testing individual components
 */
export function ComponentPlayground({
  componentName,
}: {
  componentName: string;
}) {
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
