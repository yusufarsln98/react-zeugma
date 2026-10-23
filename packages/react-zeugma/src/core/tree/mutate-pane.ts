import type { TreeNode, SplitNode, SplitDirection, PaneNode } from '../types'
import { generateUniqueId } from './factory'
import { mapPanes } from './traverse'

/**
 * Remove a pane container and consolidate the tree structure.
 */
export function removePane(tree: TreeNode | null, paneId: string): TreeNode | null {
  return mapPanes(tree, (pane) => (pane.id === paneId ? null : pane))
}

/**
 * Insert a pane by splitting an existing target node.
 */
export function splitPane(
  tree: TreeNode | null,
  targetId: string,
  direction: SplitDirection,
  splitType: 'left' | 'right' | 'top' | 'bottom',
  paneToAdd: string | PaneNode,
): TreeNode | null {
  if (tree === null) {
    if (typeof paneToAdd === 'string') {
      return { type: 'pane', id: generateUniqueId(), tabIds: [paneToAdd], activeTabId: paneToAdd }
    }
    return paneToAdd
  }

  const addedNode: PaneNode =
    typeof paneToAdd === 'string'
      ? { type: 'pane', id: generateUniqueId(), tabIds: [paneToAdd], activeTabId: paneToAdd }
      : paneToAdd

  const isFirst = splitType === 'left' || splitType === 'top'

  return mapPanes(tree, (pane) => {
    if (pane.id !== targetId) return pane
    return {
      type: 'split',
      direction,
      first: isFirst ? addedNode : pane,
      second: isFirst ? pane : addedNode,
      splitPercentage: 50,
    }
  })
}

/**
 * Insert a leaf node into the layout tree.
 */
export function insertLeaf(tree: TreeNode | null, leafNode: PaneNode): TreeNode {
  if (tree === null) {
    return leafNode
  }

  function insert(node: TreeNode, parentDirection: SplitDirection | null): TreeNode {
    if (node.type === 'pane') {
      const direction: SplitDirection = parentDirection === 'row' ? 'column' : 'row'
      return {
        type: 'split',
        direction,
        splitPercentage: 50,
        first: node,
        second: leafNode,
      }
    }

    return {
      ...node,
      second: insert(node.second, node.direction),
    }
  }

  return insert(tree, null)
}

/**
 * Update split percentage of a target SplitNode recursively with structural sharing.
 */
export function updateSplitPercentage(
  tree: TreeNode | null,
  target: SplitNode,
  newPercentage: number,
): TreeNode | null {
  if (tree === null) return null
  if (tree === target) {
    if (tree.splitPercentage === newPercentage) return tree
    return { ...tree, splitPercentage: newPercentage }
  }
  if (tree.type === 'split') {
    const newFirst = updateSplitPercentage(tree.first, target, newPercentage) ?? tree.first
    const newSecond = updateSplitPercentage(tree.second, target, newPercentage) ?? tree.second
    if (newFirst === tree.first && newSecond === tree.second) {
      return tree
    }
    return {
      ...tree,
      first: newFirst,
      second: newSecond,
    }
  }
  return tree
}

/**
 * Update the locked status on a specific pane in the layout tree.
 */
export function updatePaneLock(
  tree: TreeNode | null,
  paneId: string,
  locked: boolean,
): TreeNode | null {
  return mapPanes(tree, (pane) => {
    if (pane.id !== paneId) return pane
    if (locked === false) {
      if (pane.locked === undefined) return pane
      const { locked: _unused, ...rest } = pane
      return rest as PaneNode
    }
    if (pane.locked === true) return pane
    return { ...pane, locked }
  })
}
