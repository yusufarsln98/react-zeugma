import { useMemo } from 'react'
import type { TreeNode } from '../../../shared'

export function collectAllTabIds(layout: TreeNode | null): string[] {
  const ids = new Set<string>()
  function traverse(node: TreeNode | null) {
    if (!node) return
    if (node.type === 'pane') {
      node.tabIds.forEach((tabId) => {
        ids.add(tabId)
      })
    } else if (node.type === 'split') {
      traverse(node.first)
      traverse(node.second)
    }
  }
  traverse(layout)
  return Array.from(ids).sort()
}

export function useAllTabIds(layout: TreeNode | null): string[] {
  return useMemo(() => collectAllTabIds(layout), [layout])
}
