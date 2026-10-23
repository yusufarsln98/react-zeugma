import type { TreeNode } from '../types'

/**
 * Validates whether an unknown value conforms to the TreeNode schema.
 */
export function isValidTreeNode(node: unknown): node is TreeNode {
  if (typeof node !== 'object' || node === null) {
    return false
  }

  const candidate = node as Record<string, unknown>

  if (candidate.type === 'pane') {
    return (
      typeof candidate.id === 'string' &&
      Array.isArray(candidate.tabIds) &&
      candidate.tabIds.every((id) => typeof id === 'string') &&
      typeof candidate.activeTabId === 'string'
    )
  }

  if (candidate.type === 'split') {
    return (
      (candidate.direction === 'row' || candidate.direction === 'column') &&
      typeof candidate.splitPercentage === 'number' &&
      isValidTreeNode(candidate.first) &&
      isValidTreeNode(candidate.second)
    )
  }

  return false
}

/**
 * Stricter validation for loaded persisted layout trees.
 * Ensures tabs are non-empty, activeTabId is within tabIds, and splitPercentage is bounded.
 */
export function isRenderableTree(node: unknown): node is TreeNode {
  if (!isValidTreeNode(node)) return false

  if (node.type === 'pane') {
    return (
      node.tabIds.length > 0 &&
      node.tabIds.includes(node.activeTabId) &&
      (node.tabsMetadata === undefined ||
        (typeof node.tabsMetadata === 'object' && node.tabsMetadata !== null))
    )
  }

  if (node.type === 'split') {
    return (
      node.splitPercentage >= 0 &&
      node.splitPercentage <= 100 &&
      isRenderableTree(node.first) &&
      isRenderableTree(node.second)
    )
  }

  return false
}
