import { TreeNode, SplitNode, PaneNode } from '../types'

function areObjectsEqual(
  objA: Record<string, unknown> | undefined,
  objB: Record<string, unknown> | undefined,
  depth = 0,
  visited = new WeakSet<object>(),
): boolean {
  if (objA === objB) return true
  if (!objA || !objB) return false
  if (depth > 20) return false

  if (visited.has(objA) || visited.has(objB)) {
    return visited.has(objA) && visited.has(objB)
  }
  visited.add(objA)
  visited.add(objB)

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key)) return false
    const valA = objA[key]
    const valB = objB[key]
    if (typeof valA === 'object' && valA !== null && typeof valB === 'object' && valB !== null) {
      if (
        !areObjectsEqual(
          valA as Record<string, unknown>,
          valB as Record<string, unknown>,
          depth + 1,
          visited,
        )
      ) {
        return false
      }
    } else if (valA !== valB) {
      return false
    }
  }
  return true
}

function areMetadataEqual(
  a: Record<string, Record<string, unknown>> | undefined,
  b: Record<string, Record<string, unknown>> | undefined,
): boolean {
  if (a === b) return true
  if (!a || !b) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false
    if (!areObjectsEqual(a[key], b[key])) return false
  }
  return true
}

/**
 * Perform a fast deep equality comparison of two layout tree nodes,
 * short-circuiting as soon as a difference is found and avoiding costly
 * JSON stringification on every render.
 */
export function areLayoutsEqual(a: TreeNode | null, b: TreeNode | null): boolean {
  if (a === b) return true
  if (!a || !b) return false
  if (a.type !== b.type) return false

  if (a.type === 'split') {
    const sb = b as SplitNode
    return (
      a.direction === sb.direction &&
      a.splitPercentage === sb.splitPercentage &&
      areLayoutsEqual(a.first, sb.first) &&
      areLayoutsEqual(a.second, sb.second)
    )
  } else {
    const pb = b as PaneNode
    if (a.id !== pb.id) return false
    if (a.activeTabId !== pb.activeTabId) return false
    if (a.locked !== pb.locked) return false
    if (a.tabIds.length !== pb.tabIds.length) return false
    for (let i = 0; i < a.tabIds.length; i++) {
      if (a.tabIds[i] !== pb.tabIds[i]) return false
    }
    return areMetadataEqual(a.tabsMetadata, pb.tabsMetadata)
  }
}
