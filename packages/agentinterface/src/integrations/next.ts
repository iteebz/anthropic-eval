/**
 * Next.js Integration for AgentInterface  
 * Webpack plugin for AIP registry generation
 */

import { RegistryGenerator } from '../registry/generator';

export interface AgentInterfaceNextOptions {
  /** Components directory (default: src/components/aip) */
  componentsDir?: string;
  /** Registry output path (default: dist/registry.json) */
  outputPath?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

export function withAgentInterface(
  nextConfig: any = {},
  options: AgentInterfaceNextOptions = {}
) {
  return {
    ...nextConfig,
    webpack: (config: any, context: any) => {
      // Apply existing webpack config
      if (nextConfig.webpack) {
        config = nextConfig.webpack(config, context);
      }

      // Add AgentInterface registry generation
      config.plugins.push(new AgentInterfaceWebpackPlugin(options));

      return config;
    }
  };
}

class AgentInterfaceWebpackPlugin {
  private generator: RegistryGenerator;
  private options: AgentInterfaceNextOptions;

  constructor(options: AgentInterfaceNextOptions = {}) {
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