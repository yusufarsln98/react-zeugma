import path from 'node:path'
import { readFileSync, existsSync } from 'node:fs'

/**
 * Fetch the CHANGELOG.md content from the local monorepo root.
 * Called at build time (or ISR revalidation) from a server component.
 */
export async function fetchChangelog(): Promise<string> {
  try {
    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/react-zeugma/CHANGELOG.md'),
      path.resolve(process.cwd(), '../packages/react-zeugma/CHANGELOG.md'),
      path.resolve(process.cwd(), '../../packages/react-zeugma/CHANGELOG.md'),
    ]
    for (const localPath of candidatePaths) {
      if (existsSync(localPath)) {
        return readFileSync(localPath, 'utf-8')
      }
    }
    throw new Error('Local CHANGELOG.md not found in candidate paths')
  } catch (err) {
    console.error('Error reading changelog:', err)
    return '# Changelog\n\nUnable to load changelog. Please try again later.'
  }
}
