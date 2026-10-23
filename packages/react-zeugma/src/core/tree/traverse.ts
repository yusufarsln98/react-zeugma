import type { TreeNode, PaneNode } from '../types'

/**
 * Structural-sharing visitor: recursively visits each PaneNode in the tree.
 * If fn returns the exact same reference, ancestor SplitNode references are preserved.
 * If fn returns null, the pane is pruned and the parent split collapsed to the sibling.
 */
export function mapPanes(
  tree: TreeNode | null,
  fn: (pane: PaneNode) => TreeNode | null,
): TreeNode | null {
  if (tree === null) return null
  if (tree.type === 'pane') {
    return fn(tree)
  }

  const newFirst = mapPanes(tree.first, fn)
  const newSecond = mapPanes(tree.second, fn)

  if (newFirst === null) return newSecond
  if (newSecond === null) return newFirst

  if (newFirst === tree.first && newSecond === tree.second) {
    return tree
  }

  return { ...tree, first: newFirst, second: newSecond }
}
