import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  mode: ThemeMode;
  customProperties?: Record<string, string>;
}

export interface UseThemeResult {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  customProperties: Record<string, string>;
  setCustomProperty: (property: string, value: string) => void;
  removeCustomProperty: (property: string) => void;
  resetCustomProperties: () => void;
}

const THEME_STORAGE_KEY = 'aip-theme';
const CUSTOM_PROPERTIES_KEY = 'aip-custom-properties';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof globalThis.window === 'undefined') return 'light';
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getStoredTheme(): ThemeMode {
  if (typeof globalThis.window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

function getStoredCustomProperties(): Record<string, string> {
  if (typeof globalThis.window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(CUSTOM_PROPERTIES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function applyTheme(theme: ThemeMode) {
  if (typeof globalThis.window === 'undefined') return;

  const root = document.documentElement;
  const actualTheme = theme === 'system' ? getSystemTheme() : theme;

  root.setAttribute('data-theme', actualTheme);

  // Also set as class for legacy support
  root.classList.remove('light', 'dark');
  root.classList.add(actualTheme);
}

function applyCustomProperties(properties: Record<string, string>) {
  if (typeof globalThis.window === 'undefined') return;

  const root = document.documentElement;

  Object.entries(properties).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
}

export function useTheme(initialConfig?: ThemeConfig): UseThemeResult {
  const [theme, setThemeState] = useState<ThemeMode>(
    () => initialConfig?.mode || getStoredTheme(),
  );

  const [customProperties, setCustomPropertiesState] = useState<
    Record<string, string>
  >(() => ({
    ...getStoredCustomProperties(),
    ...initialConfig?.customProperties,
  }));

  const isDark =
    theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);

    if (typeof globalThis.window !== 'undefined') {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      } catch {
        // Ignore localStorage errors
      }
    }

    applyTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  const setCustomProperty = useCallback((property: string, value: string) => {
    setCustomPropertiesState((prev) => {
      const updated = { ...prev, [property]: value };

      if (typeof globalThis.window !== 'undefined') {
        try {
          localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }
      }

      return updated;
    });
  }, []);

  const removeCustomProperty = useCallback((property: string) => {
    setCustomPropertiesState((prev) => {
      const updated = { ...prev };
      delete updated[property];

      if (typeof globalThis.window !== 'undefined') {
        try {
          localStorage.setItem(CUSTOM_PROPERTIES_KEY, JSON.stringify(updated));
        } catch {
          // Ignore localStorage errors
        }

        // Remove from DOM
        document.documentElement.style.removeProperty(property);
      }

      return updated;
    });
  }, []);

  const resetCustomProperties = useCallback(() => {
    setCustomPropertiesState({});

    if (typeof globalThis.window !== 'undefined') {
      try {
        localStorage.removeItem(CUSTOM_PROPERTIES_KEY);
      } catch {
        // Ignore localStorage errors
      }

      // Remove all custom properties from DOM
      const root = document.documentElement;
      const style = root.style;

      for (let i = style.length - 1; i >= 0; i--) {
        const prop = style[i];
        if (prop.startsWith('--aip-')) {
          root.style.removeProperty(prop);
        }
      }
    }
  }, []);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Apply custom properties when they change
  useEffect(() => {
    applyCustomProperties(customProperties);
  }, [customProperties]);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof globalThis.window === 'undefined' || theme !== 'system') return;

    const mediaQuery = globalThis.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      applyTheme('system');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark,
    customProperties,
    setCustomProperty,
    removeCustomProperty,
    resetCustomProperties,
  };
}
