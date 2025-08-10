import React, { createContext, useContext, useEffect } from 'react';
import {
  useTheme,
  type ThemeConfig,
  type UseThemeResult,
} from '../../hooks/useTheme';

const ThemeContext = createContext<UseThemeResult | null>(null);

export interface ThemeProviderProps {
  children: React.ReactNode;
  config?: ThemeConfig;
  loadThemeCSS?: boolean;
}

export function Theme({
  children,
  config,
  loadThemeCSS = true,
}: ThemeProviderProps) {
  const themeResult = useTheme(config);

  // Load theme CSS if requested
  useEffect(() => {
    if (!loadThemeCSS || typeof globalThis.window === 'undefined') return;

    const existingLink = document.querySelector('link[data-aip-theme]');
    if (existingLink) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/aip-theme.css'; // Assumes theme.css is served at this path
    link.setAttribute('data-aip-theme', 'true');
    document.head.appendChild(link);

    return () => {
      const linkToRemove = document.querySelector('link[data-aip-theme]');
      if (linkToRemove) {
        linkToRemove.remove();
      }
    };
  }, [loadThemeCSS]);

  return (
    <ThemeContext.Provider value={themeResult}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAIPTheme(): UseThemeResult {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAIPTheme must be used within a ThemeProvider');
  }
  return context;
}

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ThemeToggle({
  className = '',
  showLabel = true,
  size = 'md',
}: ThemeToggleProps) {
  const { theme, setTheme, isDark } = useAIPTheme();

  const sizeClasses = {
    sm: 'aip-text-sm aip-p-sm',
    md: 'aip-text-base aip-p-md',
    lg: 'aip-text-lg aip-p-lg',
  };

  const buttonClass = `aip-button aip-button-secondary ${sizeClasses[size]} ${className}`;

  return (
    <button
      className={buttonClass}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <span className="aip-transition">{isDark ? '☀️' : '🌙'}</span>
      {showLabel && <span className="ml-2">{isDark ? 'Light' : 'Dark'}</span>}
    </button>
  );
}

export interface ThemeSelectProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeSelect({
  className = '',
  showLabel = true,
}: ThemeSelectProps) {
  const { theme, setTheme } = useAIPTheme();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <label className="aip-text-sm aip-text-secondary">Theme:</label>
      )}
      <select
        className="aip-input aip-text-sm"
        value={theme}
        onChange={(e) => setTheme(e.target.value as any)}
      >
        <option value="light">Light</option>
        <option value="dark">Dark</option>
        <option value="system">System</option>
      </select>
    </div>
  );
}

export interface CustomPropertyEditorProps {
  className?: string;
  properties?: string[];
}

export function CustomPropertyEditor({
  className = '',
  properties = [
    '--aip-primary',
    '--aip-secondary',
    '--aip-accent',
    '--aip-bg-primary',
    '--aip-bg-secondary',
    '--aip-text-primary',
    '--aip-text-secondary',
  ],
}: CustomPropertyEditorProps) {
  const {
    customProperties,
    setCustomProperty,
    removeCustomProperty,
    resetCustomProperties,
  } = useAIPTheme();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="aip-text-lg aip-font-semibold">Custom Properties</h3>
        <button
          className="aip-button aip-button-secondary aip-text-sm"
          onClick={resetCustomProperties}
        >
          Reset
        </button>
      </div>

      <div className="space-y-2">
        {properties.map((property) => (
          <div key={property} className="flex items-center gap-2">
            <label className="aip-text-sm aip-text-secondary min-w-[120px]">
              {property}:
            </label>
            <input
              type="text"
              className="aip-input aip-text-sm flex-1"
              value={customProperties[property] || ''}
              onChange={(e) => setCustomProperty(property, e.target.value)}
              placeholder="Enter value..."
            />
            {customProperties[property] && (
              <button
                className="aip-button aip-button-secondary aip-text-xs"
                onClick={() => removeCustomProperty(property)}
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
