#!/usr/bin/env node

import { RegistryGenerator } from './generator';

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  try {
    const generator = new RegistryGenerator();

    if (verbose) {
      console.log('🚀 Starting AIP registry generation...\n');
    }

    const summary = await generator.generateWithSummary();
    console.log(summary);

    process.exit(0);
  } catch (error) {
    console.error(
      '❌ Registry generation failed:',
      error instanceof Error ? error.message : error,
    );
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { main };
