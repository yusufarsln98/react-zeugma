import { TreeNode, SplitNode, PaneNode } from '../types'

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
    return true
  }
}
