/**
 * Test setup for AgentInterface development tests
 */

import '@testing-library/jest-dom/vitest';
import { vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock global objects that might not be available in test environment
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock import.meta.hot for Vite HMR
global.import = {
  meta: {
    hot: {
      on: vi.fn(),
      accept: vi.fn(),
      dispose: vi.fn(),
    }
  }
} as any;

// Mock process.env for Node.js environment detection
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  // Reset console mocks before each test
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterEach(() => {
  // Restore original console methods after each test
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock chokidar for file watching tests
vi.mock('chokidar', () => ({
  watch: vi.fn().mockReturnValue({
    on: vi.fn(),
    close: vi.fn(),
  }),
}));

// Mock fs promises
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>();
  return {
    ...actual,
    promises: {
      readdir: vi.fn(),
      stat: vi.fn(),
      readFile: vi.fn(),
      writeFile: vi.fn(),
    },
  };
});

// Mock path module
vi.mock('path', async (importOriginal) => {
  const actual = await importOriginal<typeof import('path')>();
  return {
    ...actual,
    join: vi.fn((...args) => args.join('/')),
    basename: vi.fn((path, ext) => {
      const name = path.split('/').pop() || '';
      return ext ? name.replace(ext, '') : name;
    }),
    extname: vi.fn((path) => {
      const parts = path.split('.');
      return parts.length > 1 ? `.${parts.pop()}` : '';
    }),
  };
});

// Helper function to mock filesystem structure
export async function mockFilesystem(structure: Record<string, any>) {
  const { promises: fs } = vi.mocked(await import('fs'));
  const path = vi.mocked(await import('path'));

  fs.readdir.mockImplementation((dir: string) => {
    const normalizedDir = dir.replace(/\\/g, '/');
    const dirContents = structure[normalizedDir];
    
    if (!dirContents) {
      return Promise.reject(new Error(`ENOENT: no such file or directory, scandir '${dir}'`));
    }

    return Promise.resolve(dirContents);
  });

  fs.stat.mockImplementation((filePath: string) => {
    return Promise.resolve({
      mtime: new Date('2023-01-01'),
      isFile: () => true,
      isDirectory: () => false,
    });
  });

  fs.readFile.mockImplementation((filePath: string) => {
    const fileContent = structure[filePath.replace(/\\/g, '/')];
    if (fileContent !== undefined) {
      return Promise.resolve(fileContent);
    }
    return Promise.resolve('export default function Component() {}');
  });
}

// Helper function to create mock components
export function createMockComponent(name: string) {
  const Component = () => React.createElement('div', { 'data-testid': name }, name);
  Component.displayName = name;
  return Component;
}

// Helper function to create mock agent response
export function createMockAgentResponse(type: string, content: any = {}) {
  return {
    type,
    content,
    timestamp: new Date().toISOString(),
    ...content,
  };
}