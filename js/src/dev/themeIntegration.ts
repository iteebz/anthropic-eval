import { z } from 'zod';
import { ThemeConfig, ThemeMode } from '../hooks/useTheme';

// Schema for theme validation
const ThemeTestSchema = z.object({
  component: z.string(),
  themes: z.array(z.enum(['light', 'dark', 'auto'])),
  cssVariables: z.array(z.string()),
  computedStyles: z.record(z.string()),
  accessibility: z.object({
    contrast: z.number().min(4.5),
    colorBlindness: z.boolean(),
    highContrast: z.boolean()
  }),
  passed: z.boolean(),
  errors: z.array(z.string())
});

export type ThemeTestResult = z.infer<typeof ThemeTestSchema>;

export interface ThemeTestConfig {
  themes: ThemeMode[];
  components: string[];
  cssVariables: string[];
  contrastRatio: number;
  testColorBlindness: boolean;
  testHighContrast: boolean;
}

export class ThemeIntegrationTester {
  private readonly config: ThemeTestConfig;
  private readonly results: ThemeTestResult[] = [];

  constructor(config: Partial<ThemeTestConfig> = {}) {
    this.config = {
      themes: ['light', 'dark', 'auto'],
      components: [],
      cssVariables: [
        '--aip-primary',
        '--aip-secondary', 
        '--aip-background',
        '--aip-surface',
        '--aip-text',
        '--aip-text-secondary',
        '--aip-border',
        '--aip-accent',
        '--aip-error',
        '--aip-warning',
        '--aip-success',
        '--aip-shadow'
      ],
      contrastRatio: 4.5,
      testColorBlindness: true,
      testHighContrast: true,
      ...config
    };
  }

  /**
   * Test all components across all themes
   */
  async testAllComponents(): Promise<ThemeTestResult[]> {
    const components = await this.discoverComponents();
    
    for (const component of components) {
      for (const theme of this.config.themes) {
        const result = await this.testComponent(component, theme);
        this.results.push(result);
      }
    }

    return this.results;
  }

  /**
   * Test a specific component with a specific theme
   */
  async testComponent(componentName: string, theme: ThemeMode): Promise<ThemeTestResult> {
    const errors: string[] = [];
    
    try {
      // Create test environment
      const testContainer = await this.createTestContainer(componentName, theme);
      
      // Test CSS variables
      const cssVariables = await this.testCSSVariables(testContainer);
      
      // Test computed styles
      const computedStyles = await this.testComputedStyles(testContainer);
      
      // Test accessibility
      const accessibility = await this.testAccessibility(testContainer);
      
      // Validate theme consistency
      await this.validateThemeConsistency(testContainer, theme);
      
      const result: ThemeTestResult = {
        component: componentName,
        themes: [theme],
        cssVariables,
        computedStyles,
        accessibility,
        passed: errors.length === 0,
        errors
      };

      return ThemeTestSchema.parse(result);
      
    } catch (error) {
      errors.push(`Test failed: ${error.message}`);
      
      return {
        component: componentName,
        themes: [theme],
        cssVariables: [],
        computedStyles: {},
        accessibility: {
          contrast: 0,
          colorBlindness: false,
          highContrast: false
        },
        passed: false,
        errors
      };
    }
  }

  /**
   * Discover all components automatically
   */
  private async discoverComponents(): Promise<string[]> {
    if (this.config.components.length > 0) {
      return this.config.components;
    }

    // Auto-discover components from filesystem
    const modules = import.meta.glob('../components/interface/*.tsx', { eager: true });
    
    return Object.keys(modules).map(path => {
      const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
      return fileName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
    });
  }

  /**
   * Create test container for component
   */
  private async createTestContainer(componentName: string, theme: ThemeMode): Promise<HTMLElement> {
    // Create isolated test environment
    const container = document.createElement('div');
    container.className = `aip-theme-test-${theme}`;
    container.setAttribute('data-theme', theme);
    
    // Apply theme CSS variables
    await this.applyThemeVariables(container, theme);
    
    // Mount component
    await this.mountComponent(container, componentName);
    
    // Add to DOM for testing
    document.body.appendChild(container);
    
    return container;
  }

  /**
   * Apply theme CSS variables to container
   */
  private async applyThemeVariables(container: HTMLElement, theme: ThemeMode): Promise<void> {
    const themeConfig = await this.getThemeConfig(theme);
    
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      container.style.setProperty(`--aip-${key}`, value);
    });
    
    Object.entries(themeConfig.spacing).forEach(([key, value]) => {
      container.style.setProperty(`--aip-spacing-${key}`, value);
    });
    
    Object.entries(themeConfig.typography).forEach(([key, value]) => {
      container.style.setProperty(`--aip-font-${key}`, value);
    });
  }

  /**
   * Mount component in test container
   */
  private async mountComponent(container: HTMLElement, componentName: string): Promise<void> {
    try {
      const module = await import(`../components/interface/${this.kebabCase(componentName)}.tsx`);
      const Component = module.default || module[componentName];
      
      if (!Component) {
        throw new Error(`Component ${componentName} not found`);
      }

      // Create React element and render
      const { createRoot } = await import('react-dom/client');
      const { createElement } = await import('react');
      
      const root = createRoot(container);
      root.render(createElement(Component, {
        content: 'Test content',
        interfaceData: { test: true },
        onSendMessage: () => {}
      }));
      
      // Wait for render
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      throw new Error(`Failed to mount component ${componentName}: ${error.message}`);
    }
  }

  /**
   * Test CSS variables are properly applied
   */
  private async testCSSVariables(container: HTMLElement): Promise<string[]> {
    const appliedVariables: string[] = [];
    
    for (const variable of this.config.cssVariables) {
      const value = getComputedStyle(container).getPropertyValue(variable);
      if (value && value.trim()) {
        appliedVariables.push(variable);
      }
    }
    
    return appliedVariables;
  }

  /**
   * Test computed styles
   */
  private async testComputedStyles(container: HTMLElement): Promise<Record<string, string>> {
    const computedStyles = getComputedStyle(container);
    
    return {
      backgroundColor: computedStyles.backgroundColor,
      color: computedStyles.color,
      borderColor: computedStyles.borderColor,
      fontSize: computedStyles.fontSize,
      lineHeight: computedStyles.lineHeight,
      fontFamily: computedStyles.fontFamily
    };
  }

  /**
   * Test accessibility requirements
   */
  private async testAccessibility(container: HTMLElement): Promise<ThemeTestResult['accessibility']> {
    const contrast = await this.calculateContrastRatio(container);
    const colorBlindness = this.config.testColorBlindness ? 
      await this.testColorBlindnessCompliance(container) : true;
    const highContrast = this.config.testHighContrast ? 
      await this.testHighContrastMode(container) : true;
    
    return {
      contrast,
      colorBlindness,
      highContrast
    };
  }

  /**
   * Calculate contrast ratio
   */
  private async calculateContrastRatio(container: HTMLElement): Promise<number> {
    const styles = getComputedStyle(container);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    // Convert to RGB values and calculate contrast
    const bg = this.parseColor(bgColor);
    const text = this.parseColor(textColor);
    
    const contrast = this.getContrastRatio(bg, text);
    return contrast;
  }

  /**
   * Test color blindness compliance
   */
  private async testColorBlindnessCompliance(container: HTMLElement): Promise<boolean> {
    // Test common color blindness patterns
    const elements = container.querySelectorAll('*');
    
    for (const element of elements) {
      const styles = getComputedStyle(element);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      // Check if colors are distinguishable for color blind users
      if (!this.isColorBlindFriendly(bgColor, textColor)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Test high contrast mode
   */
  private async testHighContrastMode(container: HTMLElement): Promise<boolean> {
    // Apply high contrast media query simulation
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    
    // Test if component adapts to high contrast
    container.style.filter = 'contrast(200%)';
    
    const elements = container.querySelectorAll('*');
    for (const element of elements) {
      const contrast = await this.calculateContrastRatio(element as HTMLElement);
      if (contrast < 7) { // WCAG AAA standard
        return false;
      }
    }
    
    return true;
  }

  /**
   * Validate theme consistency
   */
  private async validateThemeConsistency(container: HTMLElement, theme: ThemeMode): Promise<void> {
    const elements = container.querySelectorAll('[class*="aip-"]');
    
    for (const element of elements) {
      const styles = getComputedStyle(element);
      
      // Check if theme-specific classes are applied
      const hasThemeClass = element.classList.contains(`aip-${theme}`) ||
                           element.closest(`[data-theme="${theme}"]`);
      
      if (!hasThemeClass) {
        throw new Error(`Element missing theme class for ${theme}`);
      }
      
      // Check if CSS variables are resolved
      const bgColor = styles.backgroundColor;
      if (bgColor.includes('var(') && !bgColor.includes('rgb(')) {
        throw new Error(`CSS variable not resolved: ${bgColor}`);
      }
    }
  }

  /**
   * Get theme configuration
   */
  private async getThemeConfig(theme: ThemeMode): Promise<ThemeConfig> {
    const themeModule = await import('../hooks/useTheme');
    const { getThemeConfig } = themeModule;
    
    return getThemeConfig(theme);
  }

  /**
   * Utility functions
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  private parseColor(color: string): [number, number, number] {
    const rgb = color.match(/rgb\((\d+), (\d+), (\d+)\)/);
    if (rgb) {
      return [parseInt(rgb[1]), parseInt(rgb[2]), parseInt(rgb[3])];
    }
    return [0, 0, 0];
  }

  private getContrastRatio(bg: [number, number, number], text: [number, number, number]): number {
    const luminance1 = this.getLuminance(bg);
    const luminance2 = this.getLuminance(text);
    
    const brightest = Math.max(luminance1, luminance2);
    const darkest = Math.min(luminance1, luminance2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }

  private getLuminance([r, g, b]: [number, number, number]): number {
    const rs = r / 255;
    const gs = g / 255;
    const bs = b / 255;
    
    const rg = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
    const gg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
    const bg = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
    
    return 0.2126 * rg + 0.7152 * gg + 0.0722 * bg;
  }

  private isColorBlindFriendly(bgColor: string, textColor: string): boolean {
    // Simplified color blindness check
    const bg = this.parseColor(bgColor);
    const text = this.parseColor(textColor);
    
    // Check deuteranopia (red-green color blindness)
    const bgGray = 0.299 * bg[0] + 0.587 * bg[1] + 0.114 * bg[2];
    const textGray = 0.299 * text[0] + 0.587 * text[1] + 0.114 * text[2];
    
    return Math.abs(bgGray - textGray) > 50; // Sufficient difference
  }

  /**
   * Generate test report
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    let report = `# Theme Integration Test Report\n\n`;
    report += `**Overall: ${passed}/${total} tests passed**\n\n`;
    
    // Group by component
    const byComponent = this.results.reduce((acc, result) => {
      if (!acc[result.component]) acc[result.component] = [];
      acc[result.component].push(result);
      return acc;
    }, {} as Record<string, ThemeTestResult[]>);
    
    Object.entries(byComponent).forEach(([component, results]) => {
      report += `## ${component}\n`;
      results.forEach(result => {
        const status = result.passed ? '✅' : '❌';
        report += `- ${status} ${result.themes[0]} theme\n`;
        if (result.errors.length > 0) {
          result.errors.forEach(error => {
            report += `  - Error: ${error}\n`;
          });
        }
      });
      report += '\n';
    });
    
    return report;
  }

  /**
   * Cleanup test environment
   */
  cleanup(): void {
    const containers = document.querySelectorAll('[class*="aip-theme-test-"]');
    containers.forEach(container => container.remove());
  }
}

// Factory function
export function createThemeIntegrationTester(config?: Partial<ThemeTestConfig>): ThemeIntegrationTester {
  return new ThemeIntegrationTester(config);
}

// Utility function for quick testing
export async function testComponentThemes(componentName: string, themes: ThemeMode[] = ['light', 'dark']): Promise<ThemeTestResult[]> {
  const tester = createThemeIntegrationTester({ components: [componentName], themes });
  return await tester.testAllComponents();
}