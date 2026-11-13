import type { TreeNode, PaneNode, TabDetails } from '../types'

/**
 * Find a PaneNode by its unique ID.
 */
export function findPaneById(tree: TreeNode | null, paneId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.id === paneId ? tree : null
  }
  return findPaneById(tree.first, paneId) ?? findPaneById(tree.second, paneId)
}

/**
 * Find the PaneNode containing the given tab ID.
 */
export function findPaneContainingTab(tree: TreeNode | null, tabId: string): PaneNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return tree.tabIds.includes(tabId) ? tree : null
  }
  return findPaneContainingTab(tree.first, tabId) ?? findPaneContainingTab(tree.second, tabId)
}

/**
 * Find a PaneNode by its own ID, or by a tab ID it contains.
 */
export function findPaneOrContainingTab(tree: TreeNode | null, id: string): PaneNode | null {
  return findPaneById(tree, id) ?? findPaneContainingTab(tree, id)
}

/**
 * Find the details of a tab by its ID.
 */
export function findTabById(tree: TreeNode | null, tabId: string): TabDetails | null {
  const pane = findPaneContainingTab(tree, tabId)
  if (!pane) return null
  const index = pane.tabIds.indexOf(tabId)
  return {
    id: tabId,
    paneId: pane.id,
    isActive: pane.activeTabId === tabId,
    index,
  }
}
