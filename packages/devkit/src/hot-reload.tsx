/**
 * Hot reload system for AgentInterface components
 * Enables live reloading of components during development
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
// Component discovery replaced with new registry system
interface ComponentInfo {
  name: string;
  description: string;
  component: React.ComponentType<any>;
}

export interface HotReloadContext {
  /** Current component registry */
  registry: Record<string, ComponentInfo>;
  /** Reload a specific component */
  reloadComponent: (name: string) => Promise<void>;
  /** Reload all components */
  reloadAll: () => Promise<void>;
  /** Enable/disable hot reload */
  setEnabled: (enabled: boolean) => void;
  /** Hot reload status */
  isEnabled: boolean;
  /** Last reload timestamp */
  lastReload: Date | null;
  /** Reload errors */
  errors: string[];
}

const HotReloadContext = createContext<HotReloadContext | null>(null);

export interface HotReloadProviderProps {
  children: React.ReactNode;
  /** Enable hot reload by default */
  enabled?: boolean;
}

export function HotReloadProvider({
  children,
  enabled = process.env.NODE_ENV === 'development',
}: HotReloadProviderProps) {
  const [registry, setRegistry] = useState<Record<string, ComponentInfo>>({});
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [lastReload, setLastReload] = useState<Date | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const reloadComponent = useCallback(
    async (name: string) => {
      if (!isEnabled) return;
      // Simplified: just trigger page reload for now
      window.location.reload();
    },
    [isEnabled],
  );

  const reloadAll = useCallback(async () => {
    if (!isEnabled) return;
    // Simplified: just trigger page reload for now
    window.location.reload();
  }, [isEnabled]);

  const setEnabled = useCallback(
    (enabled: boolean) => {
      setIsEnabled(enabled);
      if (enabled) {
        reloadAll();
      }
    },
    [reloadAll],
  );

  // Set up hot reload listeners
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    // Listen for Vite/Webpack HMR events
    if (import.meta.hot) {
      import.meta.hot.on(
        'agentinterface:component-changed',
        (data: { name: string }) => {
          reloadComponent(data.name);
        },
      );

      import.meta.hot.on('agentinterface:registry-changed', () => {
        reloadAll();
      });
    }

    // Listen for custom hot reload events
    const handleHotReload = (event: CustomEvent) => {
      const { type, componentName } = event.detail;

      if (type === 'component-changed' && componentName) {
        reloadComponent(componentName);
      } else if (type === 'registry-changed') {
        reloadAll();
      }
    };

    window.addEventListener(
      'agentinterface:hot-reload',
      handleHotReload as EventListener,
    );

    return () => {
      window.removeEventListener(
        'agentinterface:hot-reload',
        handleHotReload as EventListener,
      );
    };
  }, [isEnabled, reloadComponent, reloadAll]);

  // Keyboard shortcuts for development
  useEffect(() => {
    if (!isEnabled || typeof window === 'undefined') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + R: Reload all components
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === 'R'
      ) {
        event.preventDefault();
        reloadAll();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEnabled, reloadAll]);

  const contextValue: HotReloadContext = {
    registry,
    reloadComponent,
    reloadAll,
    setEnabled,
    isEnabled,
    lastReload,
    errors,
  };

  return (
    <HotReloadContext.Provider value={contextValue}>
      {children}
    </HotReloadContext.Provider>
  );
}

export function useHotReload(): HotReloadContext {
  const context = useContext(HotReloadContext);
  if (!context) {
    throw new Error('useHotReload must be used within a HotReloadProvider');
  }
  return context;
}

/**
 * Hook for component-level hot reload
 */
export function useComponentHotReload(componentName: string) {
  const hotReload = useHotReload();

  const reload = useCallback(() => {
    hotReload.reloadComponent(componentName);
  }, [hotReload, componentName]);

  const isComponentError = hotReload.errors.some((error) =>
    error.includes(componentName),
  );

  return {
    reload,
    isError: isComponentError,
    lastReload: hotReload.lastReload,
    isEnabled: hotReload.isEnabled,
  };
}

/**
 * Development-only hot reload indicator
 */
export function HotReloadIndicator() {
  const hotReload = useHotReload();

  if (!hotReload.isEnabled || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              hotReload.errors.length > 0 ? 'bg-red-500' : 'bg-green-500'
            }`}
          />
          <span className="font-medium">Hot Reload</span>
          {hotReload.lastReload && (
            <span className="text-gray-500 text-xs">
              {hotReload.lastReload.toLocaleTimeString()}
            </span>
          )}
        </div>

        {hotReload.errors.length > 0 && (
          <div className="mt-2 text-red-600 text-xs">
            {hotReload.errors.length} error(s)
          </div>
        )}

        <div className="mt-2 text-xs text-gray-500">
          Ctrl+Shift+R to reload all
        </div>
      </div>
    </div>
  );
}

/**
 * Vite plugin for AgentInterface hot reload
 */
export function agentInterfaceHotReloadPlugin() {
  return {
    name: 'agentinterface-hot-reload',
    handleHotUpdate(ctx: any) {
      const { file, server } = ctx;

      // Check if it's a component file
      if (file.includes('/components/interface/') && file.endsWith('.tsx')) {
        const componentName = file.split('/').pop()?.replace('.tsx', '');

        if (componentName) {
          server.ws.send({
            type: 'custom',
            event: 'agentinterface:component-changed',
            data: { name: componentName },
          });
        }
      }
    },
  };
}

/**
 * Create hot reload enabled registry
 */
export function createHotReloadRegistry(
  discovery: ComponentDiscovery,
  initialRegistry: Record<string, ComponentInfo> = {},
): Record<string, ComponentInfo> {
  if (process.env.NODE_ENV !== 'development') {
    return initialRegistry;
  }

  // Wrap components with hot reload proxy
  const hotRegistry: Record<string, ComponentInfo> = {};

  for (const [name, info] of Object.entries(initialRegistry)) {
    hotRegistry[name] = {
      ...info,
      component: createHotReloadProxy(info.component, name),
    };
  }

  return hotRegistry;
}

function createHotReloadProxy(Component: any, name: string) {
  if (!Component || process.env.NODE_ENV !== 'development') {
    return Component;
  }

  return function HotReloadProxy(props: any) {
    const { reload, isError } = useComponentHotReload(name);

    if (isError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded p-2 text-red-700">
          <div className="font-medium">Component Error: {name}</div>
          <button
            onClick={reload}
            className="mt-1 px-2 py-1 bg-red-100 rounded text-xs hover:bg-red-200"
          >
            Reload
          </button>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
