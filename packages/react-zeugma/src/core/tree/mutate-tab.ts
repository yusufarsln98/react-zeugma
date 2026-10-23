import type { TreeNode } from '../types'
import { compactMetadata, createPane } from './factory'
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

    const newTabsMetadata = pane.tabsMetadata ? { ...pane.tabsMetadata } : undefined
    if (newTabsMetadata) {
      delete newTabsMetadata[tabId]
    }

    return {
      ...pane,
      tabIds: newTabs,
      activeTabId: newActive,
      tabsMetadata: compactMetadata(newTabsMetadata),
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
  metadata?: Record<string, unknown>,
): TreeNode | null {
  if (tree === null) {
    return createPane(tabId, metadata)
  }

  const targetPane = targetPaneId ? findPaneById(tree, targetPaneId) : null
  if (targetPane && targetPane.type === 'pane') {
    return mapPanes(tree, (pane) => {
      if (pane.id !== targetPaneId) return pane
      const newTabs = [...pane.tabIds]
      if (!newTabs.includes(tabId)) {
        newTabs.push(tabId)
      }
      let newTabsMetadata = pane.tabsMetadata
      if (metadata) {
        newTabsMetadata = {
          ...pane.tabsMetadata,
          [tabId]: metadata,
        }
      }
      return {
        ...pane,
        tabIds: newTabs,
        activeTabId: tabId,
        tabsMetadata: newTabsMetadata,
      }
    })
  }

  return insertLeaf(tree, createPane(tabId, metadata))
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

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const sourceMetadata = sourcePane?.tabsMetadata?.[draggedTabId]

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return createPane(draggedTabId, sourceMetadata)
  }

  return mapPanes(cleanTree, (pane) => {
    if (pane.id !== targetPaneId) return pane
    const newTabs = [...pane.tabIds]
    if (!newTabs.includes(draggedTabId)) {
      newTabs.push(draggedTabId)
    }
    const newTabsMetadata = { ...pane.tabsMetadata }
    if (sourceMetadata) {
      newTabsMetadata[draggedTabId] = sourceMetadata
    }
    return {
      ...pane,
      tabIds: newTabs,
      activeTabId: draggedTabId,
      tabsMetadata: compactMetadata(newTabsMetadata),
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
  const sourceMetadata = sourcePane.tabsMetadata?.[draggedTabId]
  const targetMetadata = targetPane.tabsMetadata?.[targetTabId]

  return mapPanes(tree, (pane) => {
    if (pane.id !== sourcePaneId && pane.id !== targetPaneId) {
      return pane
    }

    let newTabIds = [...pane.tabIds]
    let newActiveTabId = pane.activeTabId
    const newTabsMetadata = pane.tabsMetadata ? { ...pane.tabsMetadata } : {}

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
        delete newTabsMetadata[draggedTabId]
        if (targetMetadata) {
          newTabsMetadata[targetTabId] = targetMetadata
        }
      }
      if (pane.id === targetPaneId) {
        newTabIds = newTabIds.map((id) => (id === targetTabId ? draggedTabId : id))
        if (newActiveTabId === targetTabId) {
          newActiveTabId = draggedTabId
        }
        delete newTabsMetadata[targetTabId]
        if (sourceMetadata) {
          newTabsMetadata[draggedTabId] = sourceMetadata
        }
      }
    }

    return {
      ...pane,
      tabIds: newTabIds,
      activeTabId: newActiveTabId,
      tabsMetadata: compactMetadata(newTabsMetadata),
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

  const sourcePane = findPaneContainingTab(tree, draggedTabId)
  const sourceMetadata = sourcePane?.tabsMetadata?.[draggedTabId]

  const cleanTree = removeTab(tree, draggedTabId)
  if (cleanTree === null) {
    return createPane(draggedTabId, sourceMetadata)
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

    const newTabsMetadata = { ...pane.tabsMetadata }
    if (sourceMetadata) {
      newTabsMetadata[draggedTabId] = sourceMetadata
    }

    return {
      ...pane,
      tabIds: filteredTabs,
      activeTabId: draggedTabId,
      tabsMetadata: compactMetadata(newTabsMetadata),
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
  const draggedTabsMetadata = sourcePane.tabsMetadata || {}

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

    const newTabsMetadata = { ...pane.tabsMetadata }
    for (const tid of draggedTabIds) {
      if (draggedTabsMetadata[tid]) {
        newTabsMetadata[tid] = draggedTabsMetadata[tid]
      }
    }

    return {
      ...pane,
      tabIds: filteredTabs,
      activeTabId: draggedActiveTabId,
      tabsMetadata: compactMetadata(newTabsMetadata),
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
