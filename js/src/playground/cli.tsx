/**
 * CLI Component Tester
 * Zero-ceremony command line component testing
 */

import { useAIP } from '../registry/magic';

export interface CLITestOptions {
  component: string;
  props?: Record<string, any>;
  validate?: boolean;
  showStats?: boolean;
}

/**
 * Test component programmatically (for CLI/scripts)
 */
export async function testComponent(options: CLITestOptions): Promise<{
  success: boolean;
  error?: string;
  stats?: any;
  validation?: any;
}> {
  const { component, props = {}, validate = true, showStats = false } = options;
  
  try {
    const aip = useAIP({ useLazyLoading: true, enableRuntimeValidation: validate });
    
    // Load component
    const componentInstance = await aip.getComponentAsync(component);
    
    if (!componentInstance) {
      return {
        success: false,
        error: `Component "${component}" not found`
      };
    }
    
    // Validate props if requested
    let validation;
    if (validate) {
      validation = aip.validateProps(component, props);
      if (!validation.success) {
        return {
          success: false,
          error: validation.error,
          validation
        };
      }
    }
    
    // Get stats if requested
    const stats = showStats ? aip.getBundleStats() : undefined;
    
    return {
      success: true,
      stats,
      validation
    };
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * List all available components
 */
export function listComponents(): string[] {
  const aip = useAIP({ useLazyLoading: true });
  return aip.availableComponents;
}

/**
 * Get component description/metadata
 */
export async function describeComponent(name: string): Promise<{
  name: string;
  description: string;
  metadata?: any;
  available: boolean;
}> {
  const aip = useAIP({ useLazyLoading: true });
  
  if (!aip.availableComponents.includes(name)) {
    return {
      name,
      description: 'Component not found',
      available: false
    };
  }
  
  const lazyRegistry = aip.components as any;
  const info = lazyRegistry[name];
  
  return {
    name,
    description: info?.description || 'No description available',
    metadata: info?.metadata,
    available: true
  };
}

/**
 * Batch test multiple components
 */
export async function batchTest(tests: CLITestOptions[]): Promise<Array<{
  component: string;
  result: Awaited<ReturnType<typeof testComponent>>;
}>> {
  const results = [];
  
  for (const test of tests) {
    const result = await testComponent(test);
    results.push({
      component: test.component,
      result
    });
  }
  
  return results;
}

/**
 * Performance benchmark
 */
export async function benchmarkComponents(componentNames: string[]): Promise<{
  results: Array<{
    component: string;
    loadTime: number;
    success: boolean;
    error?: string;
  }>;
  summary: {
    total: number;
    successful: number;
    failed: number;
    averageLoadTime: number;
  };
}> {
  const results = [];
  const aip = useAIP({ useLazyLoading: true });
  
  for (const name of componentNames) {
    const startTime = performance.now();
    
    try {
      const component = await aip.getComponentAsync(name);
      const loadTime = performance.now() - startTime;
      
      results.push({
        component: name,
        loadTime,
        success: !!component
      });
    } catch (error) {
      const loadTime = performance.now() - startTime;
      results.push({
        component: name,
        loadTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.length - successful;
  const averageLoadTime = results.length > 0 
    ? results.reduce((acc, r) => acc + r.loadTime, 0) / results.length
    : 0;
  
  return {
    results,
    summary: {
      total: results.length,
      successful,
      failed,
      averageLoadTime
    }
  };
}