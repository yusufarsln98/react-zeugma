import type { TreeNode } from '../types'
import { createPane } from './factory'
import { mapPanes } from './traverse'
import { findPaneById, findPaneContainingTab } from './query'
import { insertLeaf, removePane } from './mutate-pane'

/**
 * Remove a tab from a pane and consolidate the tree structure if no tabs remain.
 */
export function removeTab(tree: TreeNode | null, tabId: string): TreeNode | null {
  return mapPanes(tree, (pane) => {
    if (!pane.tabIds.includes(tabId)) return pane
    const newTabs = pane.tabIds.filter((t) => t !== tabId)
    if (newTabs.length === 0) return null

    let newActive = pane.activeTabId
    if (pane.activeTabId === tabId) {
      newActive = newTabs[0]
    }

    return {
      ...pane,
      tabIds: newTabs,
      activeTabId: newActive,
    }
  })
}

/**
 * Add a tab into a target pane node, or splits/creates a new pane if no target pane ID is provided.
 */
export function addTab(
  tree: TreeNode | null,
  targetPaneId: string | undefined | null,
  tabId: string,
): TreeNode | null {
  if (tree === null) {
    return createPane(tabId)
  }

  const targetPane = targetPaneId ? findPaneById(tree, targetPaneId) : null
  if (targetPane && targetPane.type === 'pane') {
    return mapPanes(tree, (pane) => {
      if (pane.id !== targetPaneId) return pane
      const newTabs = [...pane.tabIds]
      if (!newTabs.includes(tabId)) {
        newTabs.push(tabId)
      }
      return {
        ...pane,
        tabIds: newTabs,
        activeTabId: tabId,
      }
    })
  }

  return insertLeaf(tree, createPane(tabId))
}

/**
 * Activate a tab within a pane with structural sharing.
 */
export function selectTab(tree: TreeNode | null, paneId: string, tabId: string): TreeNode | null {
  return mapPanes(tree, (pane) => {
    if (pane.id !== paneId) return pane
    if (pane.activeTabId === tabId) return pane
    return { ...pane, activeTabId: tabId }
  })
}

/**
 * Merge a tab into a target pane node.
 */
export function mergeTab(
  tree: TreeNode | null,
  draggedTabId: string,
  targetPaneId: string,
): TreeNode | null {
  if (tree === null) return null

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return createPane(draggedTabId)
  }

  return mapPanes(cleanTree, (pane) => {
    if (pane.id !== targetPaneId) return pane
    const newTabs = [...pane.tabIds]
    if (!newTabs.includes(draggedTabId)) {
      newTabs.push(draggedTabId)
    }
    return {
      ...pane,
      tabIds: newTabs,
      activeTabId: draggedTabId,
    }
  })
}

/**
 * Swap two tabs in the tree.
 */
export function swapTabs(
  tree: TreeNode | null,
  draggedTabId: string,
  targetTabId: string,
): TreeNode | null {
  if (tree === null || draggedTabId === targetTabId) return tree

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const targetPane = findPaneContainingTab(tree, targetTabId)
  if (!sourcePane || !targetPane) return tree

  const sourcePaneId = sourcePane.id
  const targetPaneId = targetPane.id

  return mapPanes(tree, (pane) => {
    if (pane.id !== sourcePaneId && pane.id !== targetPaneId) {
      return pane
    }

    let newTabIds = [...pane.tabIds]
    let newActiveTabId = pane.activeTabId

    if (sourcePaneId === targetPaneId) {
      const dragIdx = newTabIds.indexOf(draggedTabId)
      const targetIdx = newTabIds.indexOf(targetTabId)
      if (dragIdx !== -1 && targetIdx !== -1) {
        newTabIds[dragIdx] = targetTabId
        newTabIds[targetIdx] = draggedTabId
      }
      newActiveTabId = draggedTabId
    } else {
      if (pane.id === sourcePaneId) {
        newTabIds = newTabIds.map((id) => (id === draggedTabId ? targetTabId : id))
        if (newActiveTabId === draggedTabId) {
          newActiveTabId = targetTabId
        }
      }
      if (pane.id === targetPaneId) {
        newTabIds = newTabIds.map((id) => (id === targetTabId ? draggedTabId : id))
        if (newActiveTabId === targetTabId) {
          newActiveTabId = draggedTabId
        }
      }
    }

    return {
      ...pane,
      tabIds: newTabIds,
      activeTabId: newActiveTabId,
    }
  })
}

/**
 * Move/reorder a tab inside or to a target pane next to a target tab.
 */
export function moveTab(
  tree: TreeNode | null,
  draggedTabId: string,
  targetTabId: string,
  position: 'before' | 'after' | 'center' = 'before',
): TreeNode | null {
  if (tree === null || draggedTabId === targetTabId) return tree

  if (position === 'center') {
    return swapTabs(tree, draggedTabId, targetTabId)
  }

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return createPane(draggedTabId)
  }

  return mapPanes(cleanTree, (pane) => {
    if (!pane.tabIds.includes(targetTabId)) return pane

    const newTabs = [...pane.tabIds]
    const filteredTabs = newTabs.filter((t) => t !== draggedTabId)
    let insertIndex = filteredTabs.indexOf(targetTabId)
    if (insertIndex < 0) {
      insertIndex = 0
    }
    if (position === 'after') {
      insertIndex += 1
    }
    filteredTabs.splice(insertIndex, 0, draggedTabId)

    return {
      ...pane,
      tabIds: filteredTabs,
      activeTabId: draggedTabId,
    }
  })
}

/**
 * Move/insert all tabs of a dragged pane next to a target tab in another pane.
 */
export function movePaneTabs(
  tree: TreeNode | null,
  draggedPaneId: string,
  targetTabId: string,
  position: 'before' | 'after' = 'before',
): TreeNode | null {
  if (tree === null) return null

  const sourcePane = findPaneById(tree, draggedPaneId)
  if (!sourcePane) return tree

  const draggedTabIds = sourcePane.tabIds
  const draggedActiveTabId = sourcePane.activeTabId

  const cleanTree = removePane(tree, draggedPaneId)
  if (cleanTree === null) {
    return sourcePane
  }

  return mapPanes(cleanTree, (pane) => {
    if (!pane.tabIds.includes(targetTabId)) return pane

    const newTabs = [...pane.tabIds]
    const filteredTabs = newTabs.filter((t) => !draggedTabIds.includes(t))
    let insertIndex = filteredTabs.indexOf(targetTabId)
    if (insertIndex < 0) {
      insertIndex = 0
    }
    if (position === 'after') {
      insertIndex += 1
    }
    filteredTabs.splice(insertIndex, 0, ...draggedTabIds)

    return {
      ...pane,
      tabIds: filteredTabs,
      activeTabId: draggedActiveTabId,
    }
  })
}

/**
 * Calculates the target drop insertion index in a list of tabs during a drag.
 * Returns -1 if the drop target is not in the list.
 */
export function calculateTabDropIndex(
  tabIds: string[],
  activeType: string | null,
  overTabId: string | null,
  overTabPosition: 'before' | 'after' | null,
): number {
  const isDraggingTabOrPane = activeType === 'tab' || activeType === 'pane'
  const isHoveredTabInThisPane = isDraggingTabOrPane && overTabId && tabIds.includes(overTabId)
  if (!isHoveredTabInThisPane || !overTabPosition) {
    return -1
  }
  const index = tabIds.indexOf(overTabId)
  return overTabPosition === 'before' ? index : index + 1
}
