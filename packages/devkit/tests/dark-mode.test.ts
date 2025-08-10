#!/usr/bin/env node

import { DarkModeValidator } from './dark-mode-validator';

async function runDarkModeValidation() {
  console.log('🌙 Starting Dark Mode Validation...\n');

  // Initialize validator with comprehensive config
  const validator = new DarkModeValidator({
    components: [
      'Button',
      'Card',
      'Modal',
      'Input',
      'Select',
      'Checkbox',
      'Radio',
      'Switch',
      'Textarea',
      'Badge',
      'Alert',
      'Tooltip',
      'Dropdown',
      'Pagination',
      'Tabs',
      'Accordion',
      'Table',
      'List',
      'Navigation',
      'Breadcrumb',
    ],
    strictMode: true,
    performanceThreshold: 100,
    contrastThreshold: 4.5,
    includePerformanceMetrics: true,
    validateTransitions: true,
    testColorBlindness: true,
    customValidators: {
      'no-hardcoded-colors': (element) => {
        const styles = getComputedStyle(element);
        const props = ['backgroundColor', 'color', 'borderColor'];

        for (const prop of props) {
          const value = styles.getPropertyValue(prop);
          if (
            value &&
            (value.includes('#') ||
              value.includes('rgb(') ||
              value.includes('hsl('))
          ) {
            if (!value.includes('var(')) {
              return false;
            }
          }
        }
        return true;
      },
      'theme-class-present': (element) => {
        return (
          element.hasAttribute('data-theme') ||
          element.closest('[data-theme]') !== null
        );
      },
      'css-variables-defined': (element) => {
        const requiredVars = [
          '--aip-primary',
          '--aip-background',
          '--aip-text',
        ];
        const styles = getComputedStyle(element);

        for (const varName of requiredVars) {
          const value = styles.getPropertyValue(varName);
          if (!value || value.trim() === '') {
            return false;
          }
        }
        return true;
      },
    },
  });

  try {
    // Run validation
    const results = await validator.validateAllComponents();

    // Generate report
    const report = validator.generateReport();
    const summary = validator.getSummary();

    // Display results
    console.log('📊 Validation Summary:');
    console.log(`Total Components: ${summary.totalComponents}`);
    console.log(`Passed: ${summary.passed} ✅`);
    console.log(`Failed: ${summary.failed} ❌`);
    console.log(
      `Average Dark Mode Score: ${summary.avgDarkScore.toFixed(1)}/100`,
    );
    console.log(
      `Average Light Mode Score: ${summary.avgLightScore.toFixed(1)}/100`,
    );
    console.log(`Critical Issues: ${summary.criticalIssues}`);
    console.log(`Recommendations: ${summary.recommendations}\n`);

    // Show detailed results
    console.log('📋 Detailed Results:');
    results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.component}`);
      console.log(
        `  Dark: ${result.darkModeScore}/100, Light: ${result.lightModeScore}/100`,
      );

      if (result.issues.length > 0) {
        console.log(`  Issues: ${result.issues.join(', ')}`);
      }

      if (result.recommendations.length > 0) {
        console.log(
          `  Recommendations: ${result.recommendations.slice(0, 2).join(', ')}`,
        );
      }
    });

    // Write detailed report to file
    const fs = await import('fs/promises');
    await fs.writeFile('dark-mode-validation-report.md', report);
    console.log(
      '\n📄 Detailed report saved to: dark-mode-validation-report.md',
    );

    // Success/failure summary
    if (summary.passed === summary.totalComponents) {
      console.log('\n🎉 All components passed dark mode validation!');
    } else {
      console.log(`\n⚠️  ${summary.failed} components need attention`);
    }
  } catch (error) {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runDarkModeValidation().catch(console.error);
}

export { runDarkModeValidation };
