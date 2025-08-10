/**
 * AgentInterface Developer Tools
 * Provides debugging and development utilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useHotReload } from './hot-reload';
// Use local ComponentInfo interface
interface ComponentInfo {
  name: string;
  description: string;
  component: React.ComponentType<any>;
}

export interface DevToolsProps {
  /** Show dev tools by default */
  defaultOpen?: boolean;
  /** Position of dev tools */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  /** Custom className */
  className?: string;
}

export function AgentInterfaceDevTools({
  defaultOpen = false,
  position = 'bottom-right',
  className = '',
}: DevToolsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState<
    'components' | 'registry' | 'errors' | 'performance'
  >('components');
  const hotReload = useHotReload();

  // Don't show in production
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg mb-2 transition-colors"
        title="Toggle AgentInterface DevTools"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265L11.5 8h3.25a1 1 0 01.949 1.316l-4.5 13a1 1 0 01-1.949-.632L10.5 12H7.25a1 1 0 01-.949-1.316l4.5-13a1 1 0 011.515-.633z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dev Tools Panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-96 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-50 dark:bg-gray-700 px-4 py-2 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                AgentInterface DevTools
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-600">
            {(['components', 'registry', 'errors', 'performance'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-3 py-2 text-sm font-medium capitalize ${
                    activeTab === tab
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                  {tab === 'errors' && hotReload.errors.length > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded-full">
                      {hotReload.errors.length}
                    </span>
                  )}
                </button>
              ),
            )}
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-64">
            {activeTab === 'components' && <ComponentsTab />}
            {activeTab === 'registry' && <RegistryTab />}
            {activeTab === 'errors' && <ErrorsTab />}
            {activeTab === 'performance' && <PerformanceTab />}
          </div>
        </div>
      )}
    </div>
  );
}

function ComponentsTab() {
  const hotReload = useHotReload();
  const componentCount = Object.keys(hotReload.registry).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Components ({componentCount})
        </span>
        <button
          onClick={hotReload.reloadAll}
          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
        >
          Reload All
        </button>
      </div>

      <div className="space-y-2">
        {Object.entries(hotReload.registry).map(([name, info]) => (
          <ComponentCard key={name} name={name} info={info} />
        ))}
      </div>

      {componentCount === 0 && (
        <div className="text-center text-gray-500 py-4">
          No components found
        </div>
      )}
    </div>
  );
}

function ComponentCard({ name, info }: { name: string; info: ComponentInfo }) {
  const hotReload = useHotReload();
  const hasError = hotReload.errors.some((error) => error.includes(name));

  return (
    <div
      className={`border rounded p-2 ${hasError ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-sm">{name}</div>
          <div className="text-xs text-gray-500">{info.description}</div>
        </div>
        <button
          onClick={() => hotReload.reloadComponent(name)}
          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
        >
          Reload
        </button>
      </div>
    </div>
  );
}

function RegistryTab() {
  const hotReload = useHotReload();
  const registryInfo = {
    componentCount: Object.keys(hotReload.registry).length,
    lastReload: hotReload.lastReload,
    isEnabled: hotReload.isEnabled,
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-gray-500">Components</div>
          <div className="font-medium">{registryInfo.componentCount}</div>
        </div>
        <div>
          <div className="text-gray-500">Hot Reload</div>
          <div
            className={`font-medium ${registryInfo.isEnabled ? 'text-green-600' : 'text-red-600'}`}
          >
            {registryInfo.isEnabled ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {registryInfo.lastReload && (
        <div className="text-xs text-gray-500">
          Last reload: {registryInfo.lastReload.toLocaleString()}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={hotReload.reloadAll}
          className="w-full bg-blue-500 text-white py-2 px-3 rounded text-sm hover:bg-blue-600"
        >
          Reload Registry
        </button>
        <button
          onClick={() => hotReload.setEnabled(!hotReload.isEnabled)}
          className={`w-full py-2 px-3 rounded text-sm ${
            hotReload.isEnabled
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {hotReload.isEnabled ? 'Disable' : 'Enable'} Hot Reload
        </button>
      </div>
    </div>
  );
}

function ErrorsTab() {
  const hotReload = useHotReload();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Errors ({hotReload.errors.length})
        </span>
        {hotReload.errors.length > 0 && (
          <button
            onClick={() => hotReload.reloadAll()}
            className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
          >
            Retry All
          </button>
        )}
      </div>

      {hotReload.errors.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No errors</div>
      ) : (
        <div className="space-y-2">
          {hotReload.errors.map((error, index) => (
            <div
              key={index}
              className="bg-red-50 border border-red-200 rounded p-2"
            >
              <div className="text-sm text-red-700 font-mono">{error}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PerformanceTab() {
  const [renderTimes, setRenderTimes] = useState<Record<string, number>>({});

  useEffect(() => {
    // Mock performance data - in real implementation, this would come from performance observers
    const mockTimes = {
      'card-grid': 12.5,
      timeline: 8.3,
      markdown: 3.1,
      'code-snippet': 15.2,
    };
    setRenderTimes(mockTimes);
  }, []);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium">Render Performance</div>

      <div className="space-y-2">
        {Object.entries(renderTimes).map(([component, time]) => (
          <div key={component} className="flex items-center justify-between">
            <span className="text-sm">{component}</span>
            <span
              className={`text-xs px-2 py-1 rounded ${
                time < 10
                  ? 'bg-green-100 text-green-700'
                  : time < 20
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {time.toFixed(1)}ms
            </span>
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-3">
        Performance metrics are collected during development only
      </div>
    </div>
  );
}

/**
 * Console commands for development
 */
export function setupDevConsole() {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return;
  }

  (window as any).agentInterface = {
    reloadComponent: (name: string) => {
      window.dispatchEvent(
        new CustomEvent('agentinterface:hot-reload', {
          detail: { type: 'component-changed', componentName: name },
        }),
      );
    },
    reloadAll: () => {
      window.dispatchEvent(
        new CustomEvent('agentinterface:hot-reload', {
          detail: { type: 'registry-changed' },
        }),
      );
    },
    getRegistry: () => {
      // This would need to be connected to the actual registry
      console.log('Registry access not implemented yet');
    },
  };

  console.log('AgentInterface DevTools loaded. Available commands:', [
    'agentInterface.reloadComponent(name)',
    'agentInterface.reloadAll()',
    'agentInterface.getRegistry()',
  ]);
}
