import * as fs from 'fs';
import * as path from 'path';

export interface SyncOptions {
  jsRegistryPath?: string;
  pythonRegistryPath?: string;
  verbose?: boolean;
}

export class RegistrySync {
  private jsRegistryPath: string;
  private pythonRegistryPath: string;
  private verbose: boolean;

  constructor(options: SyncOptions = {}) {
    this.jsRegistryPath = options.jsRegistryPath || 'dist/registry.json';
    this.pythonRegistryPath =
      options.pythonRegistryPath || 'python/src/agentinterface/registry.json';
    this.verbose = options.verbose || false;
  }

  /**
   * Copy registry from JS dist to Python package
   */
  async syncRegistry(): Promise<void> {
    try {
      // Check if JS registry exists
      if (!fs.existsSync(this.jsRegistryPath)) {
        throw new Error(`JS registry not found at: ${this.jsRegistryPath}`);
      }

      // Read JS registry
      const registryContent = fs.readFileSync(this.jsRegistryPath, 'utf-8');

      // Validate it's valid JSON
      try {
        JSON.parse(registryContent);
      } catch (error) {
        throw new Error(
          `Invalid JSON in registry file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }

      // Ensure Python directory exists
      const pythonDir = path.dirname(this.pythonRegistryPath);
      if (!fs.existsSync(pythonDir)) {
        fs.mkdirSync(pythonDir, { recursive: true });
        if (this.verbose) {
          console.log(`📁 Created directory: ${pythonDir}`);
        }
      }

      // Copy registry to Python package
      fs.writeFileSync(this.pythonRegistryPath, registryContent);

      if (this.verbose) {
        console.log(`✅ Registry synchronized successfully`);
        console.log(`   From: ${this.jsRegistryPath}`);
        console.log(`   To: ${this.pythonRegistryPath}`);
      }

      // Verify the copy
      await this.verifySync();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Registry synchronization failed: ${message}`);
    }
  }

  /**
   * Verify that the sync was successful
   */
  private async verifySync(): Promise<void> {
    if (!fs.existsSync(this.pythonRegistryPath)) {
      throw new Error('Python registry file was not created');
    }

    // Compare file sizes as a basic check
    const jsStats = fs.statSync(this.jsRegistryPath);
    const pythonStats = fs.statSync(this.pythonRegistryPath);

    if (jsStats.size !== pythonStats.size) {
      throw new Error('Registry file sizes do not match after sync');
    }

    // Compare content checksums
    const jsContent = fs.readFileSync(this.jsRegistryPath, 'utf-8');
    const pythonContent = fs.readFileSync(this.pythonRegistryPath, 'utf-8');

    if (jsContent !== pythonContent) {
      throw new Error('Registry file contents do not match after sync');
    }

    if (this.verbose) {
      console.log(`🔍 Verification passed - files match`);
    }
  }

  /**
   * Check if registries are in sync
   */
  async isInSync(): Promise<boolean> {
    try {
      if (
        !fs.existsSync(this.jsRegistryPath) ||
        !fs.existsSync(this.pythonRegistryPath)
      ) {
        return false;
      }

      const jsContent = fs.readFileSync(this.jsRegistryPath, 'utf-8');
      const pythonContent = fs.readFileSync(this.pythonRegistryPath, 'utf-8');

      return jsContent === pythonContent;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get sync status information
   */
  async getSyncStatus(): Promise<{
    jsExists: boolean;
    pythonExists: boolean;
    inSync: boolean;
    jsModified?: Date;
    pythonModified?: Date;
  }> {
    const jsExists = fs.existsSync(this.jsRegistryPath);
    const pythonExists = fs.existsSync(this.pythonRegistryPath);
    const inSync = await this.isInSync();

    let jsModified: Date | undefined;
    let pythonModified: Date | undefined;

    if (jsExists) {
      jsModified = fs.statSync(this.jsRegistryPath).mtime;
    }

    if (pythonExists) {
      pythonModified = fs.statSync(this.pythonRegistryPath).mtime;
    }

    return {
      jsExists,
      pythonExists,
      inSync,
      jsModified,
      pythonModified,
    };
  }

  /**
   * Force sync even if files appear to be in sync
   */
  async forceSync(): Promise<void> {
    if (this.verbose) {
      console.log('🔄 Force syncing registry...');
    }
    await this.syncRegistry();
  }

  /**
   * Auto-sync only if needed (JS registry is newer)
   */
  async autoSync(): Promise<boolean> {
    const status = await this.getSyncStatus();

    if (!status.jsExists) {
      if (this.verbose) {
        console.log('⚠️  JS registry does not exist, skipping sync');
      }
      return false;
    }

    if (!status.pythonExists) {
      if (this.verbose) {
        console.log('📋 Python registry missing, syncing...');
      }
      await this.syncRegistry();
      return true;
    }

    if (!status.inSync) {
      if (this.verbose) {
        console.log('🔄 Registries out of sync, syncing...');
      }
      await this.syncRegistry();
      return true;
    }

    if (this.verbose) {
      console.log('✅ Registries already in sync');
    }
    return false;
  }
}
