/**
 * Webpack Plugin for AgentInterface
 * Standalone webpack integration for AIP registry generation
 */

import { RegistryGenerator } from '../registry/generator';

export interface AgentInterfaceWebpackOptions {
  /** Components directory (default: src/components/aip) */
  componentsDir?: string;
  /** Registry output path (default: dist/registry.json) */
  outputPath?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

export class AgentInterfaceWebpackPlugin {
  private generator: RegistryGenerator;
  private options: AgentInterfaceWebpackOptions;

  constructor(options: AgentInterfaceWebpackOptions = {}) {
    this.options = options;
    this.generator = new RegistryGenerator(
      options.componentsDir,
      options.outputPath
    );
  }

  apply(compiler: any) {
    compiler.hooks.beforeCompile.tapAsync(
      'AgentInterfaceWebpackPlugin', 
      async (compilation: any, callback: any) => {
        try {
          if (this.options.verbose) {
            console.log('🚀 AgentInterface: Generating registry...');
          }
          
          await this.generator.generate();
          
          if (this.options.verbose) {
            console.log('✅ AgentInterface: Registry generated');
          }
          
          callback();
        } catch (error) {
          console.error('❌ AgentInterface registry generation failed:', error);
          callback(error);
        }
      }
    );
  }
}