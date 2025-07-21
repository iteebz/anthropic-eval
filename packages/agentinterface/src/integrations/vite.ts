/**
 * Vite Plugin for AgentInterface
 * Integrates AIP registry generation into Vite build process
 */

import type { Plugin } from 'vite';
import { RegistryGenerator } from '../registry/generator';

export interface AgentInterfaceViteOptions {
  /** Components directory (default: src/components/aip) */
  componentsDir?: string;
  /** Registry output path (default: dist/registry.json) */
  outputPath?: string;
  /** Enable verbose logging */
  verbose?: boolean;
}

export function agentInterface(options: AgentInterfaceViteOptions = {}): Plugin {
  const generator = new RegistryGenerator(
    options.componentsDir,
    options.outputPath
  );

  return {
    name: 'agentinterface',
    
    async buildStart() {
      if (options.verbose) {
        console.log('🚀 AgentInterface: Generating registry...');
      }
      
      try {
        await generator.generate();
        if (options.verbose) {
          console.log('✅ AgentInterface: Registry generated');
        }
      } catch (error) {
        console.error('❌ AgentInterface registry generation failed:', error);
        throw error;
      }
    }
  };
}