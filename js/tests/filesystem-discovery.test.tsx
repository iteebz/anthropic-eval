/**
 * Tests for ComponentDiscovery core logic
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentDiscovery, autoDiscoverComponents } from '../src/dev/filesystem-discovery';
import { promises as fs } from 'fs';

// Mock fs module
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    promises: {
      readdir: vi.fn(),
      stat: vi.fn(),
      readFile: vi.fn()
    }
  };
});

const mockFs = vi.mocked(fs);

describe('ComponentDiscovery', () => {
  let discovery: ComponentDiscovery;
  const mockBaseDir = '/test/src';
  const mockScanDirs = ['components/interface', 'components/render'];

  beforeEach(() => {
    vi.clearAllMocks();
    discovery = new ComponentDiscovery({
      baseDir: mockBaseDir,
      scanDirs: mockScanDirs,
      watch: false // Disable watching in tests
    });
  });

  describe('component discovery', () => {
    it('handles missing directories gracefully', async () => {
      mockFs.readdir.mockRejectedValue(new Error('ENOENT: no such file or directory'));

      const components = await discovery.discover();
      
      expect(components.size).toBe(0);
      // Should not throw an error
    });
  });
});

describe('autoDiscoverComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles empty explicit components', async () => {
    mockFs.readdir.mockResolvedValueOnce([]);

    const registry = await autoDiscoverComponents({});

    expect(Object.keys(registry)).toHaveLength(0);
  });
});