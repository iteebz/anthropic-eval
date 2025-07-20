import React, { useState, useEffect, useMemo } from 'react';
import { RecursiveComponentParser } from '../parser/recursive';
import { RecursiveRenderer } from '../components/RecursiveRenderer';
import { SlottedCard, SlottedLayout, SlottedModal, Fill } from '../components/compound/SlotComposition';
import { CompoundCard, CompoundForm, CompoundList, CompoundNav, CompoundModal } from '../components/compound/CompoundComponents';
import { createThemeIntegrationTester } from '../testing/theme-integration';
import { createDarkModeValidator } from '../testing/dark-mode-validator';

interface PlaygroundState {
  componentInput: string;
  selectedComponent: string;
  theme: 'light' | 'dark' | 'auto';
  showSource: boolean;
  showTests: boolean;
  testResults: any[];
  darkModeResults: any[];
  error: string | null;
}

const EXAMPLE_COMPONENTS = {
  'basic-card': '{{card:{"title":"Hello World","variant":"default"}|content=Welcome to the playground!}}',
  'nested-buttons': '{{card:{"title":"Actions"}|content=Click {{button:{"text":"Primary","variant":"primary"}}} or {{button:{"text":"Secondary","variant":"secondary"}}}}}',
  'complex-layout': '{{card:{"title":"Dashboard"}|content=Status: {{badge:{"text":"Active","variant":"success"}}} | Last updated: {{text:{"content":"2 minutes ago","size":"sm"}}}}}',
  'modal-example': '{{modal:{"title":"Confirm Action","size":"md"}|content=Are you sure you want to continue? {{button:{"text":"Yes","variant":"primary"}}} {{button:{"text":"No","variant":"secondary"}}}}}',
  'form-example': '{{form:{"title":"User Registration"}|content=Name: {{input:{"placeholder":"Enter your name","required":true}}} Email: {{input:{"type":"email","placeholder":"Enter your email","required":true}}} {{button:{"text":"Submit","type":"submit","variant":"primary"}}}}}',
  'list-example': '{{list:{"title":"Tasks","type":"todo"}|content={{item:{"text":"Complete project","done":false}}} {{item:{"text":"Review code","done":true}}} {{item:{"text":"Deploy to production","done":false}}}}',
  'navigation-example': '{{nav:{"orientation":"horizontal"}|content={{navitem:{"text":"Home","active":true}}} {{navitem:{"text":"About","active":false}}} {{navitem:{"text":"Contact","active":false}}}}',
  'slot-card': 'SlottedCard with fills',
  'slot-layout': 'SlottedLayout with fills',
  'slot-modal': 'SlottedModal with fills',
  'compound-card': 'CompoundCard with sub-components',
  'compound-form': 'CompoundForm with fields',
  'compound-list': 'CompoundList with items',
  'compound-nav': 'CompoundNav with items',
  'compound-modal': 'CompoundModal with header/body/footer'
};

export function ComponentPlayground() {
  const [state, setState] = useState<PlaygroundState>({
    componentInput: EXAMPLE_COMPONENTS['basic-card'],
    selectedComponent: 'basic-card',
    theme: 'light',
    showSource: false,
    showTests: false,
    testResults: [],
    darkModeResults: [],
    error: null
  });

  const parser = useMemo(() => new RecursiveComponentParser({
    maxDepth: 8,
    strictMode: false,
    allowedComponents: ['card', 'button', 'text', 'badge', 'modal', 'form', 'input', 'list', 'item', 'nav', 'navitem'],
    customTokens: {
      'card': (data) => ({ ...data, className: 'aip-card' }),
      'button': (data) => ({ ...data, className: 'aip-button' }),
      'modal': (data) => ({ ...data, className: 'aip-modal' }),
      'form': (data) => ({ ...data, className: 'aip-form' }),
      'input': (data) => ({ ...data, className: 'aip-input' }),
      'list': (data) => ({ ...data, className: 'aip-list' }),
      'nav': (data) => ({ ...data, className: 'aip-nav' })
    }
  }), []);

  const parseResult = useMemo(() => {
    if (!state.componentInput.trim()) return null;
    
    try {
      const components = parser.parse(state.componentInput);
      setState(prev => ({ ...prev, error: null }));
      return components;
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message }));
      return null;
    }
  }, [state.componentInput, parser]);

  const handleExampleChange = (example: string) => {
    setState(prev => ({
      ...prev,
      selectedComponent: example,
      componentInput: EXAMPLE_COMPONENTS[example] || example,
      error: null
    }));
  };

  const runThemeTests = async () => {
    setState(prev => ({ ...prev, showTests: true }));
    
    try {
      const tester = createThemeIntegrationTester({
        themes: ['light', 'dark'],
        components: ['Button', 'Card', 'Modal', 'Input'],
        contrastRatio: 4.5,
        testColorBlindness: true,
        testHighContrast: true
      });

      const results = await tester.testAllComponents();
      setState(prev => ({ ...prev, testResults: results }));
    } catch (error) {
      console.error('Theme testing failed:', error);
    }
  };

  const runDarkModeValidation = async () => {
    setState(prev => ({ ...prev, showTests: true }));
    
    try {
      const validator = createDarkModeValidator({
        components: ['Button', 'Card', 'Modal', 'Input'],
        strictMode: false,
        performanceThreshold: 100,
        contrastThreshold: 4.5,
        includePerformanceMetrics: true
      });

      const results = await validator.validateAllComponents();
      setState(prev => ({ ...prev, darkModeResults: results }));
    } catch (error) {
      console.error('Dark mode validation failed:', error);
    }
  };

  const renderSlottedExample = () => {
    if (state.selectedComponent === 'slot-card') {
      return (
        <SlottedCard variant="outlined" className="w-full">
          <Fill slot="header">
            <h3 className="text-lg font-semibold">Slotted Card Header</h3>
          </Fill>
          <Fill slot="body">
            <p>This is the main content of the slotted card. It uses the Fill/Slot pattern for flexible composition.</p>
          </Fill>
          <Fill slot="actions">
            <button className="aip-button aip-button-primary">Action 1</button>
            <button className="aip-button aip-button-secondary">Action 2</button>
          </Fill>
          <Fill slot="footer">
            <small className="text-gray-500">Footer content</small>
          </Fill>
        </SlottedCard>
      );
    }

    if (state.selectedComponent === 'slot-layout') {
      return (
        <SlottedLayout className="min-h-96">
          <Fill slot="header">
            <header className="bg-primary text-white p-4">
              <h1>Application Header</h1>
            </header>
          </Fill>
          <Fill slot="sidebar">
            <nav className="p-4">
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-600">Home</a></li>
                <li><a href="#" className="text-blue-600">About</a></li>
                <li><a href="#" className="text-blue-600">Contact</a></li>
              </ul>
            </nav>
          </Fill>
          <Fill slot="main">
            <main className="p-4">
              <h2>Main Content Area</h2>
              <p>This is the main content of the slotted layout.</p>
            </main>
          </Fill>
          <Fill slot="footer">
            <footer className="bg-gray-100 p-4">
              <p>&copy; 2025 Agent Interface Protocol</p>
            </footer>
          </Fill>
        </SlottedLayout>
      );
    }

    if (state.selectedComponent === 'slot-modal') {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button 
            className="aip-button aip-button-primary"
            onClick={() => setIsOpen(true)}
          >
            Open Slotted Modal
          </button>
          <SlottedModal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
            <Fill slot="header">
              <h3>Slotted Modal Title</h3>
            </Fill>
            <Fill slot="body">
              <p>This is the modal body content using the slot composition pattern.</p>
              <p>You can fill different slots with different content.</p>
            </Fill>
            <Fill slot="footer">
              <button 
                className="aip-button aip-button-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="aip-button aip-button-primary"
                onClick={() => setIsOpen(false)}
              >
                Confirm
              </button>
            </Fill>
          </SlottedModal>
        </div>
      );
    }

    return null;
  };

  const renderCompoundExample = () => {
    if (state.selectedComponent === 'compound-card') {
      return (
        <CompoundCard variant="elevated" className="w-full">
          <CompoundCard.Header>
            <h3 className="text-lg font-semibold">Compound Card</h3>
          </CompoundCard.Header>
          <CompoundCard.Body>
            <p>This is a compound card using the traditional compound pattern.</p>
          </CompoundCard.Body>
          <CompoundCard.Footer>
            <small className="text-gray-500">Card footer</small>
          </CompoundCard.Footer>
        </CompoundCard>
      );
    }

    if (state.selectedComponent === 'compound-form') {
      return (
        <CompoundForm onSubmit={(data) => console.log('Form submitted:', data)}>
          <CompoundForm.Field label="Name" required>
            <CompoundForm.Input name="name" placeholder="Enter your name" required />
          </CompoundForm.Field>
          <CompoundForm.Field label="Email" required>
            <CompoundForm.Input name="email" type="email" placeholder="Enter your email" required />
          </CompoundForm.Field>
          <CompoundForm.Field label="Message">
            <textarea name="message" placeholder="Enter your message" className="aip-input" />
          </CompoundForm.Field>
          <CompoundForm.Button type="submit" variant="primary">
            Submit
          </CompoundForm.Button>
        </CompoundForm>
      );
    }

    if (state.selectedComponent === 'compound-list') {
      return (
        <CompoundList spacing="normal" className="w-full">
          <CompoundList.Item>First item</CompoundList.Item>
          <CompoundList.Item active>Second item (active)</CompoundList.Item>
          <CompoundList.Item>Third item</CompoundList.Item>
          <CompoundList.Item disabled>Fourth item (disabled)</CompoundList.Item>
        </CompoundList>
      );
    }

    if (state.selectedComponent === 'compound-nav') {
      return (
        <CompoundNav orientation="horizontal" className="w-full">
          <CompoundNav.Item active>Home</CompoundNav.Item>
          <CompoundNav.Item href="#about">About</CompoundNav.Item>
          <CompoundNav.Item href="#contact">Contact</CompoundNav.Item>
          <CompoundNav.Item onClick={() => alert('Clicked!')}>Action</CompoundNav.Item>
        </CompoundNav>
      );
    }

    if (state.selectedComponent === 'compound-modal') {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <div>
          <button 
            className="aip-button aip-button-primary"
            onClick={() => setIsOpen(true)}
          >
            Open Compound Modal
          </button>
          <CompoundModal isOpen={isOpen} onClose={() => setIsOpen(false)} size="md">
            <CompoundModal.Header onClose={() => setIsOpen(false)}>
              Compound Modal Title
            </CompoundModal.Header>
            <CompoundModal.Body>
              <p>This is the modal body content using the compound pattern.</p>
            </CompoundModal.Body>
            <CompoundModal.Footer>
              <button 
                className="aip-button aip-button-secondary"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="aip-button aip-button-primary"
                onClick={() => setIsOpen(false)}
              >
                Confirm
              </button>
            </CompoundModal.Footer>
          </CompoundModal>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={`component-playground min-h-screen ${state.theme}`} data-theme={state.theme}>
      <div className="max-w-7xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">🎮 Agent Interface Protocol Playground</h1>
          <p className="text-center text-gray-600">
            Interactive showcase for recursive parsing, slot composition, and compound components
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Theme Controls</h3>
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${state.theme === 'light' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setState(prev => ({ ...prev, theme: 'light' }))}
                >
                  Light
                </button>
                <button
                  className={`px-3 py-1 rounded ${state.theme === 'dark' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setState(prev => ({ ...prev, theme: 'dark' }))}
                >
                  Dark
                </button>
                <button
                  className={`px-3 py-1 rounded ${state.theme === 'auto' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  onClick={() => setState(prev => ({ ...prev, theme: 'auto' }))}
                >
                  Auto
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Examples</h3>
              <div className="space-y-2">
                {Object.keys(EXAMPLE_COMPONENTS).map(example => (
                  <button
                    key={example}
                    className={`w-full text-left px-3 py-2 rounded text-sm ${
                      state.selectedComponent === example 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => handleExampleChange(example)}
                  >
                    {example.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Testing</h3>
              <div className="space-y-2">
                <button
                  className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={runThemeTests}
                >
                  Run Theme Tests
                </button>
                <button
                  className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  onClick={runDarkModeValidation}
                >
                  Run Dark Mode Validation
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">View Options</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.showSource}
                    onChange={(e) => setState(prev => ({ ...prev, showSource: e.target.checked }))}
                    className="mr-2"
                  />
                  Show Source Code
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={state.showTests}
                    onChange={(e) => setState(prev => ({ ...prev, showTests: e.target.checked }))}
                    className="mr-2"
                  />
                  Show Test Results
                </label>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Editor */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Component Input</h3>
              <textarea
                value={state.componentInput}
                onChange={(e) => setState(prev => ({ ...prev, componentInput: e.target.value }))}
                placeholder="Enter component syntax here..."
                className="w-full h-32 p-3 border rounded-lg font-mono text-sm"
              />
              {state.error && (
                <div className="mt-2 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
                  {state.error}
                </div>
              )}
            </div>

            {/* Rendered Output */}
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-3">Rendered Output</h3>
              <div className="border-2 border-dashed border-gray-300 p-4 rounded-lg min-h-32">
                {state.selectedComponent.startsWith('slot-') ? (
                  renderSlottedExample()
                ) : state.selectedComponent.startsWith('compound-') ? (
                  renderCompoundExample()
                ) : parseResult ? (
                  <RecursiveRenderer components={parseResult} />
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    No valid component to render
                  </div>
                )}
              </div>
            </div>

            {/* Source Code */}
            {state.showSource && parseResult && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-3">Parsed Structure</h3>
                <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto text-sm">
                  {JSON.stringify(parseResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Test Results */}
            {state.showTests && (
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                <h3 className="font-semibold mb-3">Test Results</h3>
                
                {state.testResults.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Theme Integration Tests</h4>
                    <div className="space-y-2">
                      {state.testResults.map((result, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{result.component}</span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {result.passed ? 'PASS' : 'FAIL'}
                            </span>
                          </div>
                          {result.errors.length > 0 && (
                            <div className="mt-1 text-sm text-red-600">
                              {result.errors.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {state.darkModeResults.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Dark Mode Validation</h4>
                    <div className="space-y-2">
                      {state.darkModeResults.map((result, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{result.component}</span>
                            <div className="flex gap-2">
                              <span className="text-xs">
                                Dark: {result.darkModeScore}/100
                              </span>
                              <span className="text-xs">
                                Light: {result.lightModeScore}/100
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                result.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {result.passed ? 'PASS' : 'FAIL'}
                              </span>
                            </div>
                          </div>
                          {result.issues.length > 0 && (
                            <div className="mt-1 text-sm text-red-600">
                              Issues: {result.issues.join(', ')}
                            </div>
                          )}
                          {result.recommendations.length > 0 && (
                            <div className="mt-1 text-sm text-blue-600">
                              Recommendations: {result.recommendations.slice(0, 2).join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ComponentPlayground;