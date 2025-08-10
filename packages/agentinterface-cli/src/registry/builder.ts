import * as fs from 'fs';
import * as path from 'path';

export interface ComponentMetadata {
  type: string;
  description: string;
  schema: any;
  category: string;
  tags: string[];
}

export interface RegistryEntry {
  type: string;
  metadata: ComponentMetadata;
  filePath: string;
}

export class RegistryBuilder {
  private componentsDir: string;
  private entries: RegistryEntry[] = [];

  constructor(componentsDir = 'src/components/aip') {
    this.componentsDir = componentsDir;
  }

  /**
   * Scan the AIP components directory for component files
   */
  async scanComponents(): Promise<void> {
    const fullPath = path.resolve(this.componentsDir);

    if (!fs.existsSync(fullPath)) {
      throw new Error(`Components directory not found: ${fullPath}`);
    }

    const files = fs.readdirSync(fullPath);
    const componentFiles = files.filter(
      (file) =>
        file.endsWith('.tsx') && file !== 'index.ts' && file !== 'README.md',
    );

    for (const file of componentFiles) {
      const filePath = path.join(fullPath, file);
      await this.extractMetadata(filePath, file);
    }
  }

  /**
   * Extract metadata from a component file using regex parsing
   */
  private async extractMetadata(
    filePath: string,
    fileName: string,
  ): Promise<void> {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Extract metadata export using regex - match the entire metadata object
    const metadataMatch = content.match(
      /export const metadata = \{([\s\S]*?)\} as const;/s,
    );

    if (!metadataMatch) {
      console.warn(`No metadata found in ${fileName}`);
      return;
    }

    try {
      // Parse the metadata object
      const metadataStr = metadataMatch[0];
      const metadata = this.parseMetadataString(metadataStr);

      this.entries.push({
        type: metadata.type,
        metadata,
        filePath: path.relative(process.cwd(), filePath),
      });

      console.log(`✓ Found component: ${metadata.type}`);
    } catch (error) {
      console.error(`Error parsing metadata in ${fileName}:`, error);
    }
  }

  /**
   * Parse metadata string into object (simplified parser)
   */
  private parseMetadataString(metadataStr: string): ComponentMetadata {
    // Extract type
    const typeMatch = metadataStr.match(/type:\s*["']([^"']+)["']/);
    const type = typeMatch?.[1] || '';

    // Extract description
    const descMatch = metadataStr.match(/description:\s*["']([^"']+)["']/);
    const description = descMatch?.[1] || '';

    // Extract category
    const categoryMatch = metadataStr.match(/category:\s*["']([^"']+)["']/);
    const category = categoryMatch?.[1] || 'interface';

    // Extract tags array
    const tagsMatch = metadataStr.match(/tags:\s*\[([^\]]+)\]/);
    const tags = tagsMatch?.[1]
      ? tagsMatch[1].split(',').map((tag) => tag.trim().replace(/["']/g, ''))
      : [];

    // For now, we'll set schema as a placeholder - proper schema extraction would be more complex
    const schema = { type: 'object' };

    return {
      type,
      description,
      schema,
      category,
      tags,
    };
  }

  /**
   * Get all discovered registry entries
   */
  getEntries(): RegistryEntry[] {
    return this.entries;
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.entries = [];
  }
}
