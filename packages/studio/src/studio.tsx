/**
 * AIP Component Playground
 * Zero-ceremony component testing and development
 */

import React, { useState, useEffect } from 'react';
import { Cards, Accordion, render } from 'agentinterface/browser';

interface StudioProps {
  initialComponent?: string;
  enableBundleStats?: boolean;
}

export function Studio({ 
  initialComponent = 'card', 
  enableBundleStats = false 
}: StudioProps) {
  const [selectedComponent, setSelectedComponent] = useState(initialComponent);
  const [testProps, setTestProps] = useState<any>({});
  const [propsJson, setPropsJson] = useState('{}');
  const [availableComponents] = useState(['card', 'tabs', 'accordion']);

  useEffect(() => {
    // Set default props for common components
    const defaultProps = {
      'card': { 
        body: [{ type: 'text', content: 'Hello World from card body' }],
        variant: 'default'
      },
      'tabs': {
        items: [
          { id: 'tab1', label: 'Tab 1', content: [{ type: 'text', content: 'Tab 1 content' }] },
          { id: 'tab2', label: 'Tab 2', content: [{ type: 'text', content: 'Tab 2 content' }] }
        ]
      },
      'accordion': {
        sections: [
          { title: 'Section 1', content: 'First section content' },
          { title: 'Section 2', content: 'Second section content' }
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

  const renderComponent = () => {
    return render({ type: selectedComponent, ...testProps });
  };

  return (
    <div className="studio-container max-w-6xl mx-auto p-6">
      <div className="studio-header mb-8">
        <h1 className="text-3xl font-bold mb-2">AIP Component Studio</h1>
        <p className="text-gray-600">Test and develop AIP components with zero ceremony</p>
      </div>

      <div className="studio-content grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="studio-controls">
          <div className="control-group mb-4">
            <label className="block text-sm font-medium mb-2">Component</label>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full p-2 border rounded-md bg-white"
            >
              {availableComponents.map((name: string) => (
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
              <h3 className="font-medium mb-2">Registry Stats</h3>
              <div className="text-sm space-y-1">
                <div>Registered Components: {availableComponents.length}</div>
                <div>Selected: {selectedComponent}</div>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="studio-preview">
          <div className="preview-header flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Preview</h2>
            <div className="text-sm text-gray-500">
              {selectedComponent}
            </div>
          </div>

          <div className="preview-container border rounded-md p-4 bg-white min-h-[400px]">
            <div className="component-wrapper">
              {renderComponent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Standalone studio app
 */
export function StudioApp() {
  return (
    <div className="studio-app min-h-screen bg-gray-50">
      <Studio />
    </div>
  );
}