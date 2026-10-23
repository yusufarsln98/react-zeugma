/**
 * react-zeugma/react — subpath entry for React components and hooks.
 *
 * Kept as a separate entry point so React peer dependencies are only ever
 * pulled in by consumers who explicitly import `react-zeugma/react`.
 * The core (`react-zeugma` / `react-zeugma/core`) stays framework-agnostic.
 */

export * from './react/index'
