import { z } from 'zod';
import { ThemeIntegrationTester, ThemeTestResult } from './theme-integration';

const DarkModeValidationSchema = z.object({
  component: z.string(),
  darkModeScore: z.number().min(0).max(100),
  lightModeScore: z.number().min(0).max(100),
  contrastCompliance: z.object({
    darkMode: z.boolean(),
    lightMode: z.boolean(),
    ratio: z.number()
  }),
  colorVariables: z.object({
    resolved: z.array(z.string()),
    missing: z.array(z.string()),
    invalid: z.array(z.string())
  }),
  accessibility: z.object({
    wcagAA: z.boolean(),
    wcagAAA: z.boolean(),
    colorBlindness: z.boolean(),
    highContrast: z.boolean()
  }),
  performance: z.object({
    transitionTime: z.number(),
    renderTime: z.number(),
    memoryUsage: z.number()
  }),
  issues: z.array(z.string()),
  recommendations: z.array(z.string()),
  passed: z.boolean()
});

export type DarkModeValidation = z.infer<typeof DarkModeValidationSchema>;

export interface DarkModeValidatorConfig {
  components: string[];
  strictMode: boolean;
  performanceThreshold: number;
  contrastThreshold: number;
  includePerformanceMetrics: boolean;
  validateTransitions: boolean;
  testColorBlindness: boolean;
  customValidators: Record<string, (element: HTMLElement) => boolean>;
}

export class DarkModeValidator {
  private readonly config: DarkModeValidatorConfig;
  private readonly tester: ThemeIntegrationTester;
  private readonly results: DarkModeValidation[] = [];

  constructor(config: Partial<DarkModeValidatorConfig> = {}) {
    this.config = {
      components: [],
      strictMode: true,
      performanceThreshold: 100,
      contrastThreshold: 4.5,
      includePerformanceMetrics: true,
      validateTransitions: true,
      testColorBlindness: true,
      customValidators: {},
      ...config
    };

    this.tester = new ThemeIntegrationTester({
      themes: ['light', 'dark'],
      components: this.config.components,
      contrastRatio: this.config.contrastThreshold,
      testColorBlindness: this.config.testColorBlindness
    });
  }

  /**
   * Validate dark mode across entire component library
   */
  async validateAllComponents(): Promise<DarkModeValidation[]> {
    const components = await this.discoverComponents();
    
    for (const component of components) {
      const validation = await this.validateComponent(component);
      this.results.push(validation);
    }

    return this.results;
  }

  /**
   * Validate specific component's dark mode implementation
   */
  async validateComponent(componentName: string): Promise<DarkModeValidation> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Test both light and dark modes
      const lightResult = await this.tester.testComponent(componentName, 'light');
      const darkResult = await this.tester.testComponent(componentName, 'dark');

      // Calculate scores
      const lightScore = this.calculateModeScore(lightResult);
      const darkScore = this.calculateModeScore(darkResult);

      // Test contrast compliance
      const contrastCompliance = await this.validateContrastCompliance(componentName);

      // Test color variables
      const colorVariables = await this.validateColorVariables(componentName);

      // Test accessibility
      const accessibility = await this.validateAccessibility(componentName);

      // Test performance if enabled
      const performance = this.config.includePerformanceMetrics 
        ? await this.validatePerformance(componentName)
        : { transitionTime: 0, renderTime: 0, memoryUsage: 0 };

      // Run custom validators
      await this.runCustomValidators(componentName, issues, recommendations);

      // Analyze results
      this.analyzeResults(lightResult, darkResult, issues, recommendations);

      const validation: DarkModeValidation = {
        component: componentName,
        darkModeScore: darkScore,
        lightModeScore: lightScore,
        contrastCompliance,
        colorVariables,
        accessibility,
        performance,
        issues,
        recommendations,
        passed: issues.length === 0 && darkScore >= 90 && lightScore >= 90
      };

      return DarkModeValidationSchema.parse(validation);

    } catch (error) {
      issues.push(`Validation failed: ${error.message}`);
      
      return {
        component: componentName,
        darkModeScore: 0,
        lightModeScore: 0,
        contrastCompliance: { darkMode: false, lightMode: false, ratio: 0 },
        colorVariables: { resolved: [], missing: [], invalid: [] },
        accessibility: { wcagAA: false, wcagAAA: false, colorBlindness: false, highContrast: false },
        performance: { transitionTime: 0, renderTime: 0, memoryUsage: 0 },
        issues,
        recommendations,
        passed: false
      };
    }
  }

  /**
   * Calculate mode-specific score
   */
  private calculateModeScore(result: ThemeTestResult): number {
    let score = 100;

    // Deduct points for missing CSS variables
    const expectedVariables = 12; // Based on default theme variables
    const missingVariables = expectedVariables - result.cssVariables.length;
    score -= missingVariables * 5;

    // Deduct points for accessibility issues
    if (result.accessibility.contrast < this.config.contrastThreshold) {
      score -= 20;
    }
    if (!result.accessibility.colorBlindness) {
      score -= 15;
    }
    if (!result.accessibility.highContrast) {
      score -= 10;
    }

    // Deduct points for errors
    score -= result.errors.length * 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Validate contrast compliance across modes
   */
  private async validateContrastCompliance(componentName: string): Promise<DarkModeValidation['contrastCompliance']> {
    const lightContainer = await this.createTestContainer(componentName, 'light');
    const darkContainer = await this.createTestContainer(componentName, 'dark');

    const lightContrast = await this.calculateContrastRatio(lightContainer);
    const darkContrast = await this.calculateContrastRatio(darkContainer);

    // Calculate average contrast ratio
    const avgRatio = (lightContrast + darkContrast) / 2;

    // Clean up
    lightContainer.remove();
    darkContainer.remove();

    return {
      darkMode: darkContrast >= this.config.contrastThreshold,
      lightMode: lightContrast >= this.config.contrastThreshold,
      ratio: avgRatio
    };
  }

  /**
   * Validate color variables are properly resolved
   */
  private async validateColorVariables(componentName: string): Promise<DarkModeValidation['colorVariables']> {
    const resolved: string[] = [];
    const missing: string[] = [];
    const invalid: string[] = [];

    const expectedVariables = [
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
    ];

    for (const theme of ['light', 'dark']) {
      const container = await this.createTestContainer(componentName, theme);
      const computedStyle = getComputedStyle(container);

      for (const variable of expectedVariables) {
        const value = computedStyle.getPropertyValue(variable);
        
        if (!value || !value.trim()) {
          missing.push(`${variable} (${theme})`);
        } else if (value.includes('var(') || value === 'initial' || value === 'inherit') {
          invalid.push(`${variable} (${theme}): ${value}`);
        } else {
          resolved.push(`${variable} (${theme})`);
        }
      }

      container.remove();
    }

    return { resolved, missing, invalid };
  }

  /**
   * Validate accessibility across both modes
   */
  private async validateAccessibility(componentName: string): Promise<DarkModeValidation['accessibility']> {
    const lightResult = await this.tester.testComponent(componentName, 'light');
    const darkResult = await this.tester.testComponent(componentName, 'dark');

    const lightAccessibility = lightResult.accessibility;
    const darkAccessibility = darkResult.accessibility;

    return {
      wcagAA: lightAccessibility.contrast >= 4.5 && darkAccessibility.contrast >= 4.5,
      wcagAAA: lightAccessibility.contrast >= 7 && darkAccessibility.contrast >= 7,
      colorBlindness: lightAccessibility.colorBlindness && darkAccessibility.colorBlindness,
      highContrast: lightAccessibility.highContrast && darkAccessibility.highContrast
    };
  }

  /**
   * Validate theme transition performance
   */
  private async validatePerformance(componentName: string): Promise<DarkModeValidation['performance']> {
    const container = await this.createTestContainer(componentName, 'light');
    
    // Measure transition time
    const transitionStart = performance.now();
    container.setAttribute('data-theme', 'dark');
    await new Promise(resolve => setTimeout(resolve, 50)); // Wait for transition
    const transitionTime = performance.now() - transitionStart;

    // Measure render time
    const renderStart = performance.now();
    container.innerHTML = container.innerHTML; // Force re-render
    const renderTime = performance.now() - renderStart;

    // Estimate memory usage (simplified)
    const memoryUsage = this.estimateMemoryUsage(container);

    container.remove();

    return {
      transitionTime,
      renderTime,
      memoryUsage
    };
  }

  /**
   * Run custom validators
   */
  private async runCustomValidators(
    componentName: string,
    issues: string[],
    recommendations: string[]
  ): Promise<void> {
    const container = await this.createTestContainer(componentName, 'dark');

    for (const [name, validator] of Object.entries(this.config.customValidators)) {
      try {
        const result = validator(container);
        if (!result) {
          issues.push(`Custom validator "${name}" failed`);
          recommendations.push(`Review custom validation logic for ${name}`);
        }
      } catch (error) {
        issues.push(`Custom validator "${name}" error: ${error.message}`);
      }
    }

    container.remove();
  }

  /**
   * Analyze test results and provide insights
   */
  private analyzeResults(
    lightResult: ThemeTestResult,
    darkResult: ThemeTestResult,
    issues: string[],
    recommendations: string[]
  ): void {
    // Compare theme consistency
    if (lightResult.cssVariables.length !== darkResult.cssVariables.length) {
      issues.push('Inconsistent CSS variables between light and dark modes');
      recommendations.push('Ensure all theme variables are defined for both modes');
    }

    // Check for common dark mode issues
    if (darkResult.accessibility.contrast < lightResult.accessibility.contrast) {
      issues.push('Dark mode has lower contrast than light mode');
      recommendations.push('Increase contrast in dark mode colors');
    }

    // Performance recommendations
    if (lightResult.errors.length > 0 || darkResult.errors.length > 0) {
      recommendations.push('Fix theme-related errors to improve reliability');
    }

    // Accessibility recommendations
    if (!darkResult.accessibility.colorBlindness) {
      recommendations.push('Improve dark mode color blindness accessibility');
    }
  }

  /**
   * Create test container for component
   */
  private async createTestContainer(componentName: string, theme: 'light' | 'dark'): Promise<HTMLElement> {
    const container = document.createElement('div');
    container.className = `aip-theme-test-${theme}`;
    container.setAttribute('data-theme', theme);
    
    // Apply theme variables
    const themeConfig = await this.getThemeConfig(theme);
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      container.style.setProperty(`--aip-${key}`, value);
    });

    // Mount component
    try {
      const module = await import(`../components/interface/${this.kebabCase(componentName)}.tsx`);
      const Component = module.default || module[componentName];
      
      if (Component) {
        const { createRoot } = await import('react-dom/client');
        const { createElement } = await import('react');
        
        const root = createRoot(container);
        root.render(createElement(Component, {
          content: 'Test content',
          interfaceData: { test: true }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      // Component may not exist, continue with basic container
    }

    document.body.appendChild(container);
    return container;
  }

  /**
   * Calculate contrast ratio for container
   */
  private async calculateContrastRatio(container: HTMLElement): Promise<number> {
    const styles = getComputedStyle(container);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    const bg = this.parseColor(bgColor);
    const text = this.parseColor(textColor);
    
    return this.getContrastRatio(bg, text);
  }

  /**
   * Discover components automatically
   */
  private async discoverComponents(): Promise<string[]> {
    if (this.config.components.length > 0) {
      return this.config.components;
    }

    const modules = import.meta.glob('../components/interface/*.tsx', { eager: true });
    
    return Object.keys(modules).map(path => {
      const fileName = path.split('/').pop()?.replace('.tsx', '') || '';
      return fileName.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('');
    });
  }

  /**
   * Get theme configuration
   */
  private async getThemeConfig(theme: 'light' | 'dark'): Promise<any> {
    const themeModule = await import('../hooks/useTheme');
    const { getThemeConfig } = themeModule;
    
    return getThemeConfig(theme);
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(container: HTMLElement): number {
    const elements = container.querySelectorAll('*');
    const styles = container.querySelectorAll('style');
    
    // Rough estimation: elements + styles + computed styles
    return elements.length * 50 + styles.length * 200 + 1000;
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

  /**
   * Generate validation report
   */
  generateReport(): string {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const avgDarkScore = this.results.reduce((acc, r) => acc + r.darkModeScore, 0) / total;
    const avgLightScore = this.results.reduce((acc, r) => acc + r.lightModeScore, 0) / total;

    let report = `# Dark Mode Validation Report\n\n`;
    report += `**Overall: ${passed}/${total} components passed**\n`;
    report += `**Average Dark Mode Score: ${avgDarkScore.toFixed(1)}/100**\n`;
    report += `**Average Light Mode Score: ${avgLightScore.toFixed(1)}/100**\n\n`;

    // Component breakdown
    this.results.forEach(result => {
      const status = result.passed ? '✅' : '❌';
      report += `## ${status} ${result.component}\n`;
      report += `- Dark Mode: ${result.darkModeScore}/100\n`;
      report += `- Light Mode: ${result.lightModeScore}/100\n`;
      report += `- WCAG AA: ${result.accessibility.wcagAA ? '✅' : '❌'}\n`;
      report += `- Color Blindness: ${result.accessibility.colorBlindness ? '✅' : '❌'}\n`;
      
      if (result.issues.length > 0) {
        report += `\n**Issues:**\n`;
        result.issues.forEach(issue => {
          report += `- ${issue}\n`;
        });
      }
      
      if (result.recommendations.length > 0) {
        report += `\n**Recommendations:**\n`;
        result.recommendations.forEach(rec => {
          report += `- ${rec}\n`;
        });
      }
      
      report += '\n';
    });

    return report;
  }

  /**
   * Get summary statistics
   */
  getSummary(): {
    totalComponents: number;
    passed: number;
    failed: number;
    avgDarkScore: number;
    avgLightScore: number;
    criticalIssues: number;
    recommendations: number;
  } {
    const passed = this.results.filter(r => r.passed).length;
    const criticalIssues = this.results.reduce((acc, r) => acc + r.issues.length, 0);
    const recommendations = this.results.reduce((acc, r) => acc + r.recommendations.length, 0);

    return {
      totalComponents: this.results.length,
      passed,
      failed: this.results.length - passed,
      avgDarkScore: this.results.reduce((acc, r) => acc + r.darkModeScore, 0) / this.results.length,
      avgLightScore: this.results.reduce((acc, r) => acc + r.lightModeScore, 0) / this.results.length,
      criticalIssues,
      recommendations
    };
  }
}

// Factory function
export function createDarkModeValidator(config?: Partial<DarkModeValidatorConfig>): DarkModeValidator {
  return new DarkModeValidator(config);
}

// Utility function for quick validation
export async function validateDarkMode(components: string[] = []): Promise<DarkModeValidation[]> {
  const validator = createDarkModeValidator({ components });
  return await validator.validateAllComponents();
}