import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/registry/cli.ts'],
  format: ['esm', 'cjs'],
  dts: false,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss', 'fs', 'path'],
  treeshake: true,
  splitting: false,
  minify: false,
  target: 'es2020',
  platform: 'neutral',
  outDir: 'dist',
  esbuildOptions: (options) => {
    options.jsx = 'automatic'
    options.jsxImportSource = 'react'
  },
})