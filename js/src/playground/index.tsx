/**
 * AIP Component Playground
 * Zero-ceremony component testing and development
 */

import React, { useState, useEffect } from 'react';
import { useAIP } from '../registry/magic';
import { useAIPComponent, useAIPBundleStats } from '../hooks/useAIPComponent';

interface PlaygroundProps {
  initialComponent?: string;
  enableBundleStats?: boolean;
}

export function AIPPlayground({ 
  initialComponent = 'markdown', 
  enableBundleStats = true 
}: PlaygroundProps) {
  const aip = useAIP({ useLazyLoading: true });
  const [selectedComponent, setSelectedComponent] = useState(initialComponent);
  const [testProps, setTestProps] = useState<any>({});
  const [propsJson, setPropsJson] = useState('{}');
  
  const { component, loading, error } = useAIPComponent(selectedComponent);
  const bundleStats = useAIPBundleStats();

  useEffect(() => {
    // Set default props for common components
    const defaultProps = {
      'markdown': { content: '# Hello World\n\nThis is a **test** markdown.' },
      'card-grid': { 
        items: [
          { title: 'Card 1', description: 'First card' },
          { title: 'Card 2', description: 'Second card' }
        ]
      },
      'code-snippet': { 
        code: 'const hello = "world";', 
        language: 'javascript' 
      },
      'timeline': {
        events: [
          { date: '2024-01-01', title: 'Event 1', description: 'First event' },
          { date: '2024-01-02', title: 'Event 2', description: 'Second event' }
        ]
      }
    };
    
    const defaults = defaultProps[selectedComponent as keyof typeof defaultProps] || {};
    setTestProps(defaults);
    setPropsJson(JSON.stringify(defaults, null, 2));
  }, [selectedComponent]);

  const handlePropsChange = (value: string) => {
    setPropsJson(value);
    try {
      const parsed = JSON.parse(value);
      setTestProps(parsed);
    } catch (e) {
      // Invalid JSON, keep current props
    }
  };

  const ComponentToRender = component;

  return (
    <div className="playground-container max-w-6xl mx-auto p-6">
      <div className="playground-header mb-8">
        <h1 className="text-3xl font-bold mb-2">AIP Component Playground</h1>
        <p className="text-gray-600">Test and develop AIP components with zero ceremony</p>
      </div>

      <div className="playground-content grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="playground-controls">
          <div className="control-group mb-4">
            <label className="block text-sm font-medium mb-2">Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {aip.availableComponents.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>

          <div className="control-group mb-4">
            <label className="block text-sm font-medium mb-2">Props (JSON)</label>
            <textarea
              value={propsJson}
              onChange={(e) => handlePropsChange(e.target.value)}
              className="w-full h-48 p-3 border rounded-md font-mono text-sm bg-gray-50"
              placeholder="Enter component props as JSON"
            />
          </div>

          {enableBundleStats && (
            <div className="bundle-stats p-4 bg-blue-50 rounded-md">
              <h3 className="font-medium mb-2">Bundle Stats</h3>
              <div className="text-sm space-y-1">
                <div>Total Components: {bundleStats.totalComponents}</div>
                <div>Loaded: {bundleStats.loadedComponents}</div>
                <div>Loaded %: {bundleStats.loadedPercentage.toFixed(1)}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="playground-preview">
          <div className="preview-header flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div className="text-sm text-gray-500">
              {selectedComponent} {loading && '(loading...)'}
            </div>
          </div>

          <div className="preview-container border rounded-md p-4 bg-white min-h-[400px]">
            {loading && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
            
            {error && (
              <div className="text-red-600 p-4 bg-red-50 rounded-md">
                Error: {error}
              </div>
            )}
            
            {ComponentToRender && !loading && (
              <div className="component-wrapper">
                <ComponentToRender {...testProps} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone playground app
 */
export function PlaygroundApp() {
  return (
    <div className="playground-app min-h-screen bg-gray-50">
      <AIPPlayground />
    </div>
  );
}