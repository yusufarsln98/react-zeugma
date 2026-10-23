import { defineConfig, type Options } from 'tsup'

/**
 * Core entry ("." and "./core").
 * Fully framework-agnostic — no React import, so no "use client" banner.
 */
const core: Options = {
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
}

/**
 * React & DevTools entries ("./react", "./devtools").
 * Bundles the React components and hooks together with the core functions they
 * drive; React peer dependencies stay external and the "use client" banner
 * ships only here. `clean: false` keeps the core output from the build above.
 */
const react: Options = {
  entry: ['src/react.ts', 'src/devtools.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: false,
  minify: true,
  external: ['react', 'react-dom', '@dnd-kit/core'],
  banner: {
    js: '"use client";',
  },
}

export default defineConfig([core, react])
