import { describe, it, expect } from 'vitest'
import { addTab, removeTab, moveTab, splitPane, selectTab, isValidTreeNode } from '../index'
import type { TreeNode, PaneNode, SplitNode } from '../../types'

function validateTreeInvariants(tree: TreeNode | null): void {
  if (tree === null) return

  expect(isValidTreeNode(tree)).toBe(true)

  const allSeenTabs = new Set<string>()

  function traverse(node: TreeNode): void {
    if (node.type === 'pane') {
      const pane = node as PaneNode
      expect(pane.tabIds.length).toBeGreaterThan(0)
      expect(pane.tabIds).toContain(pane.activeTabId)
      expect(new Set(pane.tabIds).size).toBe(pane.tabIds.length)

      for (const tabId of pane.tabIds) {
        expect(allSeenTabs.has(tabId)).toBe(false)
        allSeenTabs.add(tabId)
      }
    } else if (node.type === 'split') {
      const split = node as SplitNode
      expect(split.first).not.toBeNull()
      expect(split.second).not.toBeNull()
      expect(split.splitPercentage).toBeGreaterThanOrEqual(0)
      expect(split.splitPercentage).toBeLessThanOrEqual(100)
      expect(['row', 'column']).toContain(split.direction)

      traverse(split.first)
      traverse(split.second)
    }
  }

  traverse(tree)
}

describe('Tree Invariant Property Tests', () => {
  it('maintains invariants through randomized sequences of layout operations', () => {
    let tree: TreeNode | null = {
      type: 'pane',
      id: 'root-pane',
      tabIds: ['tab-0'],
      activeTabId: 'tab-0',
    }

    validateTreeInvariants(tree)

    let nextTabId = 1
    const activeTabs = ['tab-0']

    // Execute 50 sequential mixed mutations
    for (let step = 0; step < 50; step++) {
      const op = step % 6

      if (op === 0 || tree === null) {
        // Add tab
        const newTab = `tab-${nextTabId++}`
        activeTabs.push(newTab)
        tree = addTab(tree, null, newTab)
      } else if (op === 1 && activeTabs.length > 1) {
        // Remove tab
        const tabToRemove = activeTabs.pop()!
        tree = removeTab(tree, tabToRemove)
      } else if (op === 2 && activeTabs.length >= 2) {
        // Move tab
        const t1 = activeTabs[0]
        const t2 = activeTabs[1]
        tree = moveTab(tree, t1, t2, step % 2 === 0 ? 'before' : 'after')
      } else if (op === 3) {
        // Split pane
        const newTab = `tab-${nextTabId++}`
        activeTabs.push(newTab)
        if (tree.type === 'pane') {
          tree = splitPane(tree, tree.id, step % 2 === 0 ? 'row' : 'column', 'right', newTab)
        } else {
          tree = addTab(tree, null, newTab)
        }
      } else if (op === 4 && tree.type === 'split') {
        // Select tab
        const firstTab = activeTabs[0]
        tree = selectTab(tree, (tree.first as PaneNode).id || 'root-pane', firstTab) || tree
      } else if (op === 5 && activeTabs.length >= 2) {
        // Merge tab
        const targetTab = activeTabs[0]
        const draggedTab = activeTabs[activeTabs.length - 1]
        if (targetTab !== draggedTab) {
          tree = moveTab(tree, draggedTab, targetTab, 'center') || tree
        }
      }

      validateTreeInvariants(tree)
    }
  })

  it('maintains invariants when collapsing deep splits', () => {
    let tree: TreeNode | null = null

    // Build a 10-pane deep tree
    for (let i = 0; i < 10; i++) {
      tree = addTab(tree, null, `tab-${i}`)
      validateTreeInvariants(tree)
    }

    // Sequentially dismantle the tree
    for (let i = 0; i < 10; i++) {
      tree = removeTab(tree, `tab-${i}`)
      validateTreeInvariants(tree)
    }

    expect(tree).toBeNull()
  })
})
