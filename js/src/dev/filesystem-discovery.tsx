/**
 * Filesystem-based component discovery for development
 * Auto-discovers components from filesystem structure
 */

import { promises as fs } from 'fs';
import path from 'path';
import { ComponentInfo } from '../registry/auto';

export interface ComponentDiscoveryOptions {
  /** Base directory to search for components */
  baseDir?: string;
  /** Pattern to match component files */
  pattern?: RegExp;
  /** Directories to scan */
  scanDirs?: string[];
  /** Enable hot reload watching */
  watch?: boolean;
}

export interface DiscoveredComponent {
  name: string;
  path: string;
  description: string;
  component?: any;
  lastModified: Date;
}

const DEFAULT_PATTERN = /^(?!.*\.(test|spec|d)\.tsx?$).*\.tsx?$/;
const DEFAULT_SCAN_DIRS = ['components/interface', 'components/render'];

export class ComponentDiscovery {
  private components = new Map<string, DiscoveredComponent>();
  private watchers = new Map<string, any>();
  private options: ComponentDiscoveryOptions;

  constructor(options: ComponentDiscoveryOptions = {}) {
    this.options = {
      baseDir: options.baseDir || process.cwd(),
      pattern: options.pattern || DEFAULT_PATTERN,
      scanDirs: options.scanDirs || DEFAULT_SCAN_DIRS,
      watch: options.watch ?? process.env.NODE_ENV === 'development'
    };
  }

  /**
   * Discover components from filesystem
   */
  async discover(): Promise<Map<string, DiscoveredComponent>> {
    const { baseDir, scanDirs, pattern } = this.options;

    for (const scanDir of scanDirs!) {
      const fullPath = path.join(baseDir!, scanDir);
      
      try {
        await this.scanDirectory(fullPath, pattern!);
      } catch (error) {
        console.warn(`Failed to scan directory ${fullPath}:`, error);
      }
    }

    if (this.options.watch) {
      await this.setupWatching();
    }

    return this.components;
  }

  private async scanDirectory(dir: string, pattern: RegExp): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath, pattern);
        } else if (entry.isFile() && pattern.test(entry.name)) {
          await this.processComponentFile(fullPath);
        }
      }
    } catch (error) {
      // Directory doesn't exist or is inaccessible
      return;
    }
  }

  private async processComponentFile(filePath: string): Promise<void> {
    try {
      const stats = await fs.stat(filePath);
      const basename = path.basename(filePath, path.extname(filePath));
      const componentName = basename.toLowerCase().replace(/([A-Z])/g, '-$1');

      // Read file content to extract description
      const content = await fs.readFile(filePath, 'utf-8');
      const description = this.extractDescription(content);

      const component: DiscoveredComponent = {
        name: componentName,
        path: filePath,
        description,
        lastModified: stats.mtime
      };

      // Try to load component in development
      if (process.env.NODE_ENV === 'development') {
        try {
          const imported = await import(filePath);
          component.component = imported.default || imported[basename];
        } catch (error) {
          console.warn(`Failed to import component ${componentName}:`, error);
        }
      }

      this.components.set(componentName, component);
    } catch (error) {
      console.warn(`Failed to process component file ${filePath}:`, error);
    }
  }

  private extractDescription(content: string): string {
    // Extract description from JSDoc comment
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (jsdocMatch) {
      return jsdocMatch[1];
    }

    // Extract from component displayName
    const displayNameMatch = content.match(/\.displayName\s*=\s*['"`](.+?)['"`]/);
    if (displayNameMatch) {
      return displayNameMatch[1];
    }

    // Extract from interface props comment
    const interfaceMatch = content.match(/interface\s+\w+Props[^{]*{\s*\/\*\*\s*(.+?)\s*\*\//);
    if (interfaceMatch) {
      return interfaceMatch[1];
    }

    return 'Auto-discovered component';
  }

  private async setupWatching(): Promise<void> {
    if (typeof window !== 'undefined') {
      // Browser environment - use dev server's hot reload
      return;
    }

    const chokidar = await import('chokidar').catch(() => null);
    if (!chokidar) {
      console.warn('chokidar not available, skipping file watching');
      return;
    }

    const { baseDir, scanDirs, pattern } = this.options;
    const watchPaths = scanDirs!.map(dir => path.join(baseDir!, dir));

    const watcher = chokidar.watch(watchPaths, {
      persistent: true,
      ignoreInitial: true,
      ignored: (filePath: string) => !pattern!.test(path.basename(filePath))
    });

    watcher.on('add', (filePath: string) => {
      this.processComponentFile(filePath);
    });

    watcher.on('change', (filePath: string) => {
      this.processComponentFile(filePath);
    });

    watcher.on('unlink', (filePath: string) => {
      const basename = path.basename(filePath, path.extname(filePath));
      const componentName = basename.toLowerCase().replace(/([A-Z])/g, '-$1');
      this.components.delete(componentName);
    });

    this.watchers.set('main', watcher);
  }

  /**
   * Get component registry compatible with existing system
   */
  getRegistry(): Record<string, ComponentInfo> {
    const registry: Record<string, ComponentInfo> = {};

    for (const [name, component] of this.components) {
      registry[name] = {
        name,
        description: component.description,
        component: component.component
      };
    }

    return registry;
  }

  /**
   * Get component manifest for dev tools
   */
  getManifest() {
    return {
      components: Array.from(this.components.values()),
      lastUpdated: new Date().toISOString(),
      options: this.options
    };
  }

  /**
   * Clean up watchers
   */
  async dispose(): Promise<void> {
    for (const [key, watcher] of this.watchers) {
      if (watcher && typeof watcher.close === 'function') {
        await watcher.close();
      }
    }
    this.watchers.clear();
  }
}

/**
 * Create development-friendly component discovery
 */
export function createDevDiscovery(options: ComponentDiscoveryOptions = {}): ComponentDiscovery {
  return new ComponentDiscovery({
    watch: true,
    ...options
  });
}

/**
 * Auto-discover components and integrate with existing registry
 */
export async function autoDiscoverComponents(
  explicitComponents: Record<string, any> = {},
  options: ComponentDiscoveryOptions = {}
): Promise<Record<string, ComponentInfo>> {
  const discovery = new ComponentDiscovery(options);
  await discovery.discover();
  
  const discoveredRegistry = discovery.getRegistry();
  const explicitRegistry = Object.fromEntries(
    Object.entries(explicitComponents).map(([key, component]) => [
      key.toLowerCase().replace(/([A-Z])/g, '-$1'),
      {
        name: key.toLowerCase().replace(/([A-Z])/g, '-$1'),
        description: 'Explicit component',
        component
      }
    ])
  );

  // Explicit components take precedence
  return {
    ...discoveredRegistry,
    ...explicitRegistry
  };
}