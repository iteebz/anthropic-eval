import * as fs from 'fs';
import * as path from 'path';
import { RegistryBuilder, RegistryEntry } from './builder';
import { MetadataValidator } from './validator';
import { RegistrySync } from './sync';

export interface RegistryOutput {
  version: string;
  generatedAt: string;
  components: Record<string, ComponentRegistryEntry>;
  categories: Record<string, string[]>;
  tags: Record<string, string[]>;
  stats: {
    totalComponents: number;
    categoryCounts: Record<string, number>;
  };
}

export interface ComponentRegistryEntry {
  type: string;
  description: string;
  schema: any;
  category: string;
  tags: string[];
  filePath: string;
}

export class RegistryGenerator {
  private builder: RegistryBuilder;
  private validator: MetadataValidator;
  private sync: RegistrySync;
  private outputPath: string;

  constructor(componentsDir?: string, outputPath = 'dist/registry.json') {
    this.builder = new RegistryBuilder(componentsDir);
    this.validator = new MetadataValidator();
    this.sync = new RegistrySync({ jsRegistryPath: outputPath, verbose: true });
    this.outputPath = outputPath;
  }

  /**
   * Generate the complete registry JSON file
   */
  async generate(): Promise<RegistryOutput> {
    console.log('🔍 Scanning AIP components...');

    // Scan components
    await this.builder.scanComponents();
    const entries = this.builder.getEntries();

    if (entries.length === 0) {
      throw new Error('No AIP components found to generate registry');
    }

    console.log(`📦 Found ${entries.length} components`);

    // Validate all components
    console.log('✅ Validating component metadata...');
    const validationErrors = this.validator.validateAll(entries);

    if (validationErrors.length > 0) {
      const errorMessage = this.validator.formatErrors(validationErrors);
      throw new Error(
        `Registry generation failed due to validation errors:\n${errorMessage}`,
      );
    }

    // Generate registry structure
    const registry = this.buildRegistry(entries);

    // Ensure output directory exists
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write registry file
    fs.writeFileSync(this.outputPath, JSON.stringify(registry, null, 2));

    console.log(`🎉 Registry generated successfully: ${this.outputPath}`);
    console.log(`   Components: ${registry.stats.totalComponents}`);
    console.log(
      `   Categories: ${Object.keys(registry.categories).join(', ')}`,
    );

    // Auto-sync to Python
    console.log('🔄 Syncing to Python package...');
    await this.sync.autoSync();

    return registry;
  }

  /**
   * Build the registry structure from component entries
   */
  private buildRegistry(entries: RegistryEntry[]): RegistryOutput {
    const components: Record<string, ComponentRegistryEntry> = {};
    const categories: Record<string, string[]> = {};
    const tags: Record<string, string[]> = {};
    const categoryCounts: Record<string, number> = {};

    // Process each component
    for (const entry of entries) {
      const { type, metadata, filePath } = entry;

      // Add to components registry
      components[type] = {
        type: metadata.type,
        description: metadata.description,
        schema: metadata.schema,
        category: metadata.category,
        tags: metadata.tags,
        filePath,
      };

      // Organize by category
      if (!categories[metadata.category]) {
        categories[metadata.category] = [];
        categoryCounts[metadata.category] = 0;
      }
      categories[metadata.category].push(type);
      categoryCounts[metadata.category]++;

      // Organize by tags
      for (const tag of metadata.tags) {
        if (!tags[tag]) {
          tags[tag] = [];
        }
        tags[tag].push(type);
      }
    }

    // Sort arrays for consistent output
    for (const category in categories) {
      categories[category].sort();
    }
    for (const tag in tags) {
      tags[tag].sort();
    }

    return {
      version: this.getVersion(),
      generatedAt: new Date().toISOString(),
      components,
      categories,
      tags,
      stats: {
        totalComponents: entries.length,
        categoryCounts,
      },
    };
  }

  /**
   * Get version from package.json or default
   */
  private getVersion(): string {
    try {
      const packagePath = path.resolve('package.json');
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
        return packageJson.version || '1.0.0';
      }
    } catch (error) {
      console.warn('Could not read package.json version, using default');
    }
    return '1.0.0';
  }

  /**
   * Generate registry and return formatted summary
   */
  async generateWithSummary(): Promise<string> {
    try {
      const registry = await this.generate();

      let summary = `Registry Generation Complete!\n\n`;
      summary += `📊 Summary:\n`;
      summary += `   • Total Components: ${registry.stats.totalComponents}\n`;
      summary += `   • Categories: ${Object.keys(registry.categories).length}\n`;
      summary += `   • Unique Tags: ${Object.keys(registry.tags).length}\n`;
      summary += `   • Generated: ${registry.generatedAt}\n`;
      summary += `   • Output: ${this.outputPath}\n\n`;

      summary += `🏷️  Components by Category:\n`;
      for (const [category, components] of Object.entries(
        registry.categories,
      )) {
        summary += `   • ${category}: ${components.join(', ')}\n`;
      }

      return summary;
    } catch (error) {
      return `❌ Registry generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }
}
