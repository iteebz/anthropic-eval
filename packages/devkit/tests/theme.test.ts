#!/usr/bin/env node

import {
  createThemeIntegrationTester,
  ThemeTestResult,
} from './theme-integration';

/**
 * Run theme integration tests for all components
 */
async function runThemeTests(): Promise<void> {
  console.log('🎨 Running theme integration tests...\n');

  const tester = createThemeIntegrationTester({
    themes: ['light', 'dark'],
    contrastRatio: 4.5,
    testColorBlindness: true,
    testHighContrast: true,
  });

  try {
    const results = await tester.testAllComponents();

    // Generate and display report
    const report = tester.generateReport();
    console.log(report);

    // Check for failures
    const failed = results.filter((r) => !r.passed);
    if (failed.length > 0) {
      console.error(`\n❌ ${failed.length} theme tests failed:`);
      failed.forEach((result) => {
        console.error(`  - ${result.component} (${result.themes[0]})`);
        result.errors.forEach((error) => {
          console.error(`    • ${error}`);
        });
      });
      process.exit(1);
    }

    console.log('\n✅ All theme integration tests passed!');
  } catch (error) {
    console.error('❌ Theme test runner failed:', error);
    process.exit(1);
  } finally {
    tester.cleanup();
  }
}

/**
 * Run specific component tests
 */
async function runComponentTest(componentName: string): Promise<void> {
  console.log(`🎨 Testing component: ${componentName}\n`);

  const tester = createThemeIntegrationTester({
    components: [componentName],
    themes: ['light', 'dark'],
  });

  try {
    const results = await tester.testAllComponents();

    results.forEach((result) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${result.component} - ${result.themes[0]} theme`);

      if (result.errors.length > 0) {
        result.errors.forEach((error) => {
          console.error(`  ❌ ${error}`);
        });
      }

      console.log(
        `  📊 Contrast ratio: ${result.accessibility.contrast.toFixed(2)}`,
      );
      console.log(`  🎨 CSS variables: ${result.cssVariables.length}`);
      console.log(
        `  ♿ Color blind friendly: ${result.accessibility.colorBlindness ? '✅' : '❌'}`,
      );
      console.log(
        `  🔍 High contrast: ${result.accessibility.highContrast ? '✅' : '❌'}`,
      );
      console.log('');
    });
  } catch (error) {
    console.error(`❌ Failed to test ${componentName}:`, error);
    process.exit(1);
  } finally {
    tester.cleanup();
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    runThemeTests();
  } else {
    const componentName = args[0];
    runComponentTest(componentName);
  }
}

export { runThemeTests, runComponentTest };
