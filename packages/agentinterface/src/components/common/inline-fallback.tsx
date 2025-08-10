import React from 'react';
import { InlineComponentConfig } from '../../core/inline-components';

interface InlineComponentFallbackProps {
  config: InlineComponentConfig;
  error?: Error;
  mode?: 'error' | 'loading' | 'notFound';
}

export function InlineFallback({
  config,
  error,
  mode = 'notFound',
}: InlineComponentFallbackProps) {
  const { type, slug, label, mode: configMode } = config;

  switch (mode) {
    case 'error': {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2 py-1 text-red-700">
          <span className="text-red-500">⚠️</span>
          <span className="text-sm">{label || slug}</span>
          {error && (
            <span className="text-xs text-red-500" title={error.message}>
              (Error)
            </span>
          )}
        </span>
      );
    }

    case 'loading': {
      return (
        <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
          <span className="size-2 animate-pulse rounded-full bg-gray-400"></span>
          <span className="text-sm">{label || slug}</span>
        </span>
      );
    }

    case 'notFound':
    default: {
      // Render based on configured mode
      switch (configMode) {
        case 'link': {
          return (
            <a
              href={`/components/${type}/${slug}`}
              className="text-blue-600 underline hover:text-blue-800"
              title={`View ${type} component: ${slug}`}
            >
              {label || slug}
            </a>
          );
        }

        case 'preview': {
          return (
            <span className="inline-flex items-center gap-1 rounded border border-blue-200 bg-blue-50 px-2 py-1 text-blue-700">
              <span className="size-2 rounded-full bg-blue-500"></span>
              <span className="text-sm">{label || slug}</span>
              <span className="text-xs text-blue-500">({type})</span>
            </span>
          );
        }

        case 'collapse': {
          return (
            <span className="inline-flex items-center gap-1 rounded border border-gray-200 bg-gray-50 px-2 py-1 text-gray-600">
              <span className="text-sm">{label || slug}</span>
              <span className="text-xs text-gray-500">({type})</span>
            </span>
          );
        }

        case 'expand':
        default: {
          return (
            <div className="inline-block rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm">
              <span className="font-medium">{label || slug}</span>
              <span className="ml-1 text-gray-500">({type})</span>
              <span className="ml-1 text-xs text-gray-400">[Not Found]</span>
            </div>
          );
        }
      }
    }
  }
}

// Hook for managing fallback states
export function useInlineComponentFallback() {
  const [fallbackStates, setFallbackStates] = React.useState<
    Map<
      string,
      {
        mode: 'error' | 'loading' | 'notFound';
        error?: Error;
      }
    >
  >(new Map());

  const setFallback = React.useCallback(
    (
      componentId: string,
      mode: 'error' | 'loading' | 'notFound',
      error?: Error,
    ) => {
      setFallbackStates((prev) => {
        const next = new Map(prev);
        next.set(componentId, { mode, error });
        return next;
      });
    },
    [],
  );

  const clearFallback = React.useCallback((componentId: string) => {
    setFallbackStates((prev) => {
      const next = new Map(prev);
      next.delete(componentId);
      return next;
    });
  }, []);

  const getFallback = React.useCallback(
    (componentId: string) => {
      return fallbackStates.get(componentId);
    },
    [fallbackStates],
  );

  return { setFallback, clearFallback, getFallback };
}
