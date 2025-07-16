/**
 * Vite plugin for AgentInterface development
 * Provides hot-reload integration and build-time component discovery
 */

import { Plugin } from 'vite';
import { promises as fs } from 'fs';
import path from 'path';

export interface AgentInterfaceVitePluginOptions {
  /** Base directory for component discovery */
  baseDir?: string;
  /** Directories to scan for components */
  scanDirs?: string[];
  /** Pattern to match component files */
  pattern?: RegExp;
  /** Generate manifest file */
  generateManifest?: boolean;
  /** Manifest output path */
  manifestPath?: string;
}

const DEFAULT_OPTIONS: Required<AgentInterfaceVitePluginOptions> = {
  baseDir: 'src',
  scanDirs: ['components/interface', 'components/render'],
  pattern: /^(?!.*\.(test|spec|d)\.tsx?$).*\.tsx?$/,
  generateManifest: true,
  manifestPath: 'public/agentinterface-manifest.json'
};

export function agentInterfaceVitePlugin(
  options: AgentInterfaceVitePluginOptions = {}
): Plugin {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const componentMap = new Map<string, string>();

  return {
    name: 'agentinterface-dev',
    configureServer(server) {
      // Handle hot reload for component changes
      server.middlewares.use('/api/agentinterface', (req, res, next) => {
        if (req.method === 'GET' && req.url === '/api/agentinterface/components') {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            components: Array.from(componentMap.entries()).map(([name, filePath]) => ({
              name,
              path: filePath,
              lastModified: new Date().toISOString()
            }))
          }));
          return;
        }
        next();
      });
    },

    async buildStart() {
      // Discover components at build time
      await this.scanComponents();

      if (opts.generateManifest) {
        await this.generateManifest();
      }
    },

    async handleHotUpdate(ctx) {
      const { file, server } = ctx;
      
      // Check if it's a component file
      if (this.isComponentFile(file)) {
        const componentName = this.extractComponentName(file);
        
        if (componentName) {
          // Update component map
          componentMap.set(componentName, file);
          
          // Notify client of component change
          server.ws.send({
            type: 'custom',
            event: 'agentinterface:component-changed',
            data: { 
              name: componentName,
              path: file,
              timestamp: Date.now()
            }
          });

          // Re-generate manifest
          if (opts.generateManifest) {
            await this.generateManifest();
          }
        }
      }
    },

    async scanComponents() {
      componentMap.clear();
      
      for (const scanDir of opts.scanDirs) {
        const fullPath = path.join(opts.baseDir, scanDir);
        await this.scanDirectory(fullPath);
      }
    },

    async scanDirectory(dir: string) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await this.scanDirectory(fullPath);
          } else if (entry.isFile() && this.isComponentFile(fullPath)) {
            const componentName = this.extractComponentName(fullPath);
            if (componentName) {
              componentMap.set(componentName, fullPath);
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or is inaccessible
      }
    },

    isComponentFile(filePath: string): boolean {
      const basename = path.basename(filePath);
      return opts.pattern.test(basename) && 
             opts.scanDirs.some(dir => filePath.includes(dir.replace(/\//g, path.sep)));
    },

    extractComponentName(filePath: string): string | null {
      const basename = path.basename(filePath, path.extname(filePath));
      return basename.toLowerCase().replace(/([A-Z])/g, '-$1');
    },

    async generateManifest() {
      const manifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        components: Array.from(componentMap.entries()).map(([name, filePath]) => ({
          name,
          path: filePath,
          description: 'Auto-discovered component'
        }))
      };

      try {
        await fs.writeFile(opts.manifestPath, JSON.stringify(manifest, null, 2));
      } catch (error) {
        console.warn('Failed to generate AgentInterface manifest:', error);
      }
    }
  };
}

/**
 * Vite plugin for AgentInterface TypeScript generation
 */
export function agentInterfaceTypesPlugin(): Plugin {
  return {
    name: 'agentinterface-types',
    generateBundle() {
      // Generate TypeScript definitions for discovered components
      this.emitFile({
        type: 'asset',
        fileName: 'agentinterface.d.ts',
        source: `
declare module 'agentinterface/auto' {
  export interface ComponentRegistry {
    [key: string]: React.ComponentType<any>;
  }
  
  export function getComponentRegistry(): ComponentRegistry;
  export function registerComponent(name: string, component: React.ComponentType<any>): void;
}
        `.trim()
      });
    }
  };
}

/**
 * Complete Vite configuration for AgentInterface development
 */
export function createAgentInterfaceViteConfig(
  options: AgentInterfaceVitePluginOptions = {}
) {
  return {
    plugins: [
      agentInterfaceVitePlugin(options),
      agentInterfaceTypesPlugin()
    ],
    define: {
      'process.env.AGENTINTERFACE_DEV': JSON.stringify(process.env.NODE_ENV === 'development')
    },
    optimizeDeps: {
      include: ['agentinterface']
    }
  };
}