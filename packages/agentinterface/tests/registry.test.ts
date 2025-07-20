import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RegistryBuilder } from '../src/registry/builder';
import { MetadataValidator } from '../src/registry/validator';
import { RegistryGenerator } from '../src/registry/generator';
import { RegistrySync } from '../src/registry/sync';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs for testing
vi.mock('fs');
const mockFs = vi.mocked(fs);

describe('Registry System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RegistryBuilder', () => {
    it('should scan components directory', async () => {
      const builder = new RegistryBuilder('test/components');
      
      // Mock directory structure
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['timeline.tsx', 'markdown.tsx', 'index.ts'] as any);
      mockFs.readFileSync.mockReturnValue(`
        export const metadata = {
          type: "timeline",
          description: "Display chronological events",
          schema: { type: "object" },
          category: "interface",
          tags: ["chronological", "events"]
        } as const;
      `);

      await builder.scanComponents();
      const entries = builder.getEntries();

      expect(entries).toHaveLength(2); // timeline.tsx and markdown.tsx (index.ts filtered out)
      expect(entries[0].type).toBe('timeline');
    });

    it('should handle missing components directory', async () => {
      const builder = new RegistryBuilder('nonexistent');
      mockFs.existsSync.mockReturnValue(false);

      await expect(builder.scanComponents()).rejects.toThrow('Components directory not found');
    });
  });

  describe('MetadataValidator', () => {
    it('should validate correct metadata', () => {
      const validator = new MetadataValidator();
      const entry = {
        type: 'timeline',
        metadata: {
          type: 'timeline',
          description: 'Display chronological events in timeline format',
          schema: { type: 'object', properties: {} },
          category: 'interface',
          tags: ['chronological', 'events']
        },
        filePath: 'timeline.tsx'
      };

      const errors = validator.validateMetadata(entry);
      expect(errors).toHaveLength(0);
    });

    it('should catch validation errors', () => {
      const validator = new MetadataValidator();
      const entry = {
        type: 'bad-component',
        metadata: {
          type: 'bad-component',
          description: 'Bad', // Too short
          schema: { type: 'object' },
          category: 'invalid-category' as any,
          tags: []
        },
        filePath: 'bad.tsx'
      };

      const errors = validator.validateMetadata(entry);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('RegistryGenerator', () => {
    it('should generate registry with correct structure', async () => {
      const generator = new RegistryGenerator('test/components', 'test/registry.json');
      
      // Mock successful component scanning
      const mockBuilder = {
        scanComponents: vi.fn(),
        getEntries: vi.fn().mockReturnValue([
          {
            type: 'timeline',
            metadata: {
              type: 'timeline',
              description: 'Display chronological events',
              schema: { type: 'object' },
              category: 'interface',
              tags: ['chronological']
            },
            filePath: 'timeline.tsx'
          }
        ])
      };

      // Mock validator
      const mockValidator = {
        validateAll: vi.fn().mockReturnValue([])
      };

      // Mock sync
      const mockSync = {
        autoSync: vi.fn()
      };

      // Replace private properties (for testing)
      (generator as any).builder = mockBuilder;
      (generator as any).validator = mockValidator;
      (generator as any).sync = mockSync;

      mockFs.existsSync.mockReturnValue(true);
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.writeFileSync.mockImplementation(() => {});

      const registry = await generator.generate();

      expect(registry.components).toHaveProperty('timeline');
      expect(registry.stats.totalComponents).toBe(1);
      expect(registry.categories).toHaveProperty('interface');
      expect(mockSync.autoSync).toHaveBeenCalled();
    });
  });

  describe('RegistrySync', () => {
    it('should sync registry files', async () => {
      const sync = new RegistrySync({
        jsRegistryPath: 'dist/registry.json',
        pythonRegistryPath: 'python/registry.json'
      });

      const registryContent = JSON.stringify({ version: '1.0.0', components: {} });
      
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(registryContent);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: registryContent.length } as any);

      await expect(sync.syncRegistry()).resolves.not.toThrow();
    });

    it('should detect when files are in sync', async () => {
      const sync = new RegistrySync();
      const content = '{"test": true}';

      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(content);

      const inSync = await sync.isInSync();
      expect(inSync).toBe(true);
    });

    it('should handle missing JS registry', async () => {
      const sync = new RegistrySync();
      mockFs.existsSync.mockReturnValue(false);

      await expect(sync.syncRegistry()).rejects.toThrow('JS registry not found');
    });
  });

  describe('Integration', () => {
    it('should complete full registry generation and sync workflow', async () => {
      // This would be a more comprehensive integration test
      // Testing the full workflow from component scanning to Python sync
      
      const generator = new RegistryGenerator();
      
      // Mock the entire workflow
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readdirSync.mockReturnValue(['timeline.tsx'] as any);
      mockFs.readFileSync.mockReturnValue(`
        export const metadata = {
          type: "timeline",
          description: "Display chronological events in timeline format",
          schema: { type: "object", properties: {} },
          category: "interface",
          tags: ["chronological", "events"]
        } as const;
      `);
      mockFs.writeFileSync.mockImplementation(() => {});
      mockFs.mkdirSync.mockImplementation(() => {});
      mockFs.statSync.mockReturnValue({ size: 100, mtime: new Date() } as any);

      const summary = await generator.generateWithSummary();
      
      expect(summary).toContain('Registry Generation Complete');
      expect(summary).toContain('Total Components: 1');
    });
  });
});