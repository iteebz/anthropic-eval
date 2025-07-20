import React from "react";
import { InlineComponentConfig } from "../../core/inline-components";

interface InlineComponentFallbackProps {
  config: InlineComponentConfig;
  error?: Error;
  mode?: 'error' | 'loading' | 'notFound';
}

export function InlineFallback({ 
  config, 
  error, 
  mode = 'notFound' 
}: InlineComponentFallbackProps) {
  const { type, slug, label, mode: configMode } = config;

  switch (mode) {
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded border border-red-200">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm">{label || slug}</span>
          {error && (
            <span className="text-xs text-red-500" title={error.message}>
              (Error)
            </span>
          )}
        </span>
      );

    case 'loading':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200">
          <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></span>
          <span className="text-sm">{label || slug}</span>
        </span>
      );

    case 'notFound':
    default:
      // Render based on configured mode
      switch (configMode) {
        case 'link':
          return (
            <a 
              href={`/components/${type}/${slug}`}
              className="text-blue-600 hover:text-blue-800 underline"
              title={`View ${type} component: ${slug}`}
            >
              {label || slug}
            </a>
          );

        case 'preview':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-sm">{label || slug}</span>
              <span className="text-xs text-blue-500">({type})</span>
            </span>
          );

        case 'collapse':
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 rounded border border-gray-200">
              <span className="text-sm">{label || slug}</span>
              <span className="text-xs text-gray-500">({type})</span>
            </span>
          );

        case 'expand':
        default:
          return (
            <div className="inline-block border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50">
              <span className="font-medium">{label || slug}</span>
              <span className="text-gray-500 ml-1">({type})</span>
              <span className="text-xs text-gray-400 ml-1">[Not Found]</span>
            </div>
          );
      }
  }
}

// Hook for managing fallback states
export function useInlineComponentFallback() {
  const [fallbackStates, setFallbackStates] = React.useState<Map<string, {
    mode: 'error' | 'loading' | 'notFound';
    error?: Error;
  }>>(new Map());

  const setFallback = React.useCallback((
    componentId: string, 
    mode: 'error' | 'loading' | 'notFound',
    error?: Error
  ) => {
    setFallbackStates(prev => {
      const next = new Map(prev);
      next.set(componentId, { mode, error });
      return next;
    });
  }, []);

  const clearFallback = React.useCallback((componentId: string) => {
    setFallbackStates(prev => {
      const next = new Map(prev);
      next.delete(componentId);
      return next;
    });
  }, []);

  const getFallback = React.useCallback((componentId: string) => {
    return fallbackStates.get(componentId);
  }, [fallbackStates]);

  return { setFallback, clearFallback, getFallback };
}