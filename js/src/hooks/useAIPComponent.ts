/**
 * React hooks for AIP components with lazy loading
 */

import { useState, useEffect, useRef, ComponentType } from 'react';
import { useAIP } from '../registry/magic';

export interface UseAIPComponentOptions {
  enableRuntimeValidation?: boolean;
  strictMode?: boolean;
  fallbackComponent?: ComponentType<any>;
  preloadComponents?: string[];
}

export interface UseAIPComponentResult {
  component: ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  preload: (componentNames: string[]) => Promise<void>;
  getBundleStats: () => any;
}

/**
 * Hook for loading AIP components with lazy loading
 */
export function useAIPComponent(
  componentName: string,
  options: UseAIPComponentOptions = {}
): UseAIPComponentResult {
  const [component, setComponent] = useState<ComponentType<any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  const aip = useAIP({
    useLazyLoading: true,
    enableRuntimeValidation: options.enableRuntimeValidation,
    strictMode: options.strictMode,
    fallbackComponent: options.fallbackComponent,
    preloadComponents: options.preloadComponents
  });

  useEffect(() => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    aip.getComponentAsync(componentName)
      .then((loadedComponent) => {
        setComponent(loadedComponent);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load component');
        setComponent(options.fallbackComponent || null);
      })
      .finally(() => {
        setLoading(false);
        loadingRef.current = false;
      });
  }, [componentName, options.fallbackComponent]);

  return {
    component,
    loading,
    error,
    preload: aip.preload,
    getBundleStats: aip.getBundleStats
  };
}

/**
 * Hook for managing multiple AIP components
 */
export function useAIPComponents(
  componentNames: string[],
  options: UseAIPComponentOptions = {}
): {
  components: Record<string, ComponentType<any> | null>;
  loading: boolean;
  errors: Record<string, string | null>;
  preload: (componentNames: string[]) => Promise<void>;
  getBundleStats: () => any;
} {
  const [components, setComponents] = useState<Record<string, ComponentType<any> | null>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const loadingRef = useRef(false);

  const aip = useAIP({
    useLazyLoading: true,
    enableRuntimeValidation: options.enableRuntimeValidation,
    strictMode: options.strictMode,
    fallbackComponent: options.fallbackComponent,
    preloadComponents: options.preloadComponents
  });

  useEffect(() => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setLoading(true);
    setErrors({});

    Promise.all(
      componentNames.map(async (name) => {
        try {
          const component = await aip.getComponentAsync(name);
          return { name, component, error: null };
        } catch (err) {
          return { 
            name, 
            component: options.fallbackComponent || null, 
            error: err instanceof Error ? err.message : 'Failed to load component' 
          };
        }
      })
    )
    .then((results) => {
      const newComponents: Record<string, ComponentType<any> | null> = {};
      const newErrors: Record<string, string | null> = {};
      
      results.forEach(({ name, component, error }) => {
        newComponents[name] = component;
        newErrors[name] = error;
      });
      
      setComponents(newComponents);
      setErrors(newErrors);
    })
    .finally(() => {
      setLoading(false);
      loadingRef.current = false;
    });
  }, [componentNames.join(','), options.fallbackComponent]);

  return {
    components,
    loading,
    errors,
    preload: aip.preload,
    getBundleStats: aip.getBundleStats
  };
}

/**
 * Hook for AIP bundle optimization stats
 */
export function useAIPBundleStats() {
  const aip = useAIP({ useLazyLoading: true });
  const [stats, setStats] = useState(aip.getBundleStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(aip.getBundleStats());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}