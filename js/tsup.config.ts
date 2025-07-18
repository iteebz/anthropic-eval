import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  external: ['react', 'react-dom', 'tailwindcss'],
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