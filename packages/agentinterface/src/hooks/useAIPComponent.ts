/**
 * Simple stub for useAIPComponent
 */

import { useState } from 'react';

export interface UseAIPComponentOptions {
  enableRuntimeValidation?: boolean;
  strictMode?: boolean;
  fallbackComponent?: React.ComponentType<any>;
  preloadComponents?: string[];
}

export interface UseAIPComponentResult {
  component: React.ComponentType<any> | null;
  loading: boolean;
  error: string | null;
  preload: (componentNames: string[]) => Promise<void>;
  getBundleStats: () => any;
}

export const useAIPComponent = (componentName: string, options: UseAIPComponentOptions = {}): UseAIPComponentResult => {
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  
  return {
    component: null,
    loading,
    error,
    preload: async () => {},
    getBundleStats: () => ({})
  };
};

export const useAIPComponents = (componentNames: string[], options: UseAIPComponentOptions = {}) => {
  return {
    components: {},
    loading: false,
    errors: {},
    preload: async () => {},
    getBundleStats: () => ({})
  };
};

export const useAIPBundleStats = () => ({});