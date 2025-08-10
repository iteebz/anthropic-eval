import React, { useState, useEffect } from 'react';
import {
  createThemeIntegrationTester,
  ThemeTestResult,
} from './theme-integration';
import { ThemeMode } from '../hooks/useTheme';
import { useAIP } from '../registry/magic';

interface ThemeTestingPanelProps {
  components?: string[];
  themes?: ThemeMode[];
  onTestComplete?: (results: ThemeTestResult[]) => void;
}

export const ThemeTestingPanel: React.FC<ThemeTestingPanelProps> = ({
  components = [],
  themes = ['light', 'dark'],
  onTestComplete,
}) => {
  const [results, setResults] = useState<ThemeTestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('light');
  const aip = useAIP();

  useEffect(() => {
    if (results.length > 0 && onTestComplete) {
      onTestComplete(results);
    }
  }, [results, onTestComplete]);

  const runTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      const tester = createThemeIntegrationTester({
        components: components.length > 0 ? components : undefined,
        themes,
        contrastRatio: 4.5,
        testColorBlindness: true,
        testHighContrast: true,
      });

      const testResults = await tester.testAllComponents();
      setResults(testResults);

      tester.cleanup();
    } catch (error) {
      console.error('Theme testing failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const runSingleTest = async (component: string, theme: ThemeMode) => {
    setTesting(true);

    try {
      const tester = createThemeIntegrationTester({
        components: [component],
        themes: [theme],
      });

      const testResults = await tester.testAllComponents();

      // Update results by replacing existing result for this component/theme
      setResults((prev) => {
        const filtered = prev.filter(
          (r) => !(r.component === component && r.themes[0] === theme),
        );
        return [...filtered, ...testResults];
      });

      tester.cleanup();
    } catch (error) {
      console.error(`Failed to test ${component} with ${theme} theme:`, error);
    } finally {
      setTesting(false);
    }
  };

  const getResultForComponent = (
    component: string,
    theme: ThemeMode,
  ): ThemeTestResult | undefined => {
    return results.find(
      (r) => r.component === component && r.themes[0] === theme,
    );
  };

  const getOverallStats = () => {
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;
    return {
      passed,
      total,
      percentage: total > 0 ? (passed / total) * 100 : 0,
    };
  };

  const stats = getOverallStats();

  return (
    <div className="aip-theme-testing-panel p-6 bg-surface rounded-lg border border-border">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">
          Theme Integration Testing
        </h2>
        <button
          onClick={runTests}
          disabled={testing}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {testing ? 'Testing...' : 'Run All Tests'}
        </button>
      </div>

      {results.length > 0 && (
        <div className="mb-6 p-4 bg-accent/10 rounded-lg">
          <div className="flex items-center gap-4 mb-2">
            <div className="text-lg font-semibold">
              Overall: {stats.passed}/{stats.total} tests passed
            </div>
            <div className="text-sm text-text-secondary">
              ({stats.percentage.toFixed(1)}%)
            </div>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-success h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.percentage}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {/* Component List */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text">Components</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {aip.getComponentOptions().map((option) => (
              <div
                key={option.name}
                className="p-3 border border-border rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text">{option.name}</span>
                  <span className="text-sm text-text-secondary">
                    {option.description}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => {
                    const result = getResultForComponent(option.name, theme);
                    const status = result
                      ? result.passed
                        ? '✅'
                        : '❌'
                      : '⏳';

                    return (
                      <button
                        key={theme}
                        onClick={() => runSingleTest(option.name, theme)}
                        disabled={testing}
                        className="px-2 py-1 text-xs border border-border rounded hover:bg-accent/10 disabled:opacity-50"
                      >
                        {status} {theme}
                      </button>
                    );
                  })}
                </div>

                {/* Test Results */}
                {themes.map((theme) => {
                  const result = getResultForComponent(option.name, theme);
                  if (!result) return null;

                  return (
                    <div
                      key={theme}
                      className="mt-2 p-2 bg-surface/50 rounded text-xs"
                    >
                      <div className="font-medium">{theme} Theme</div>
                      <div className="text-text-secondary">
                        Contrast: {result.accessibility.contrast.toFixed(2)}
                      </div>
                      <div className="text-text-secondary">
                        Variables: {result.cssVariables.length}
                      </div>
                      {result.errors.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {result.errors.map((error, i) => (
                            <div key={i} className="text-error text-xs">
                              • {error}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Test Configuration */}
        <div className="p-4 border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-text mb-3">
            Test Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Test Themes
              </label>
              <div className="space-y-1">
                {['light', 'dark', 'auto'].map((theme) => (
                  <label key={theme} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={themes.includes(theme as ThemeMode)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Add theme
                        } else {
                          // Remove theme
                        }
                      }}
                      className="rounded border-border"
                    />
                    <span className="text-sm text-text">{theme}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Accessibility Tests
              </label>
              <div className="space-y-1">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-border"
                  />
                  <span className="text-sm text-text">Color Blindness</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-border"
                  />
                  <span className="text-sm text-text">High Contrast</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-border"
                  />
                  <span className="text-sm text-text">WCAG AA (4.5:1)</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestingPanel;
