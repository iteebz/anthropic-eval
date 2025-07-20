import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/browser.ts', 'src/registry/cli.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss', 'fs', 'path'],
  treeshake: true,
  splitting: false,
  minify: false,
  target: 'es2020',
  platform: 'neutral',
  outDir: 'dist',
  publicDir: 'src/styles',
  esbuildOptions: (options) => {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
})