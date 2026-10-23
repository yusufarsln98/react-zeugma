import type { TreeNode, SplitDirection, PaneNode, DragType, DropAction } from '../types'
import {
  removeTab as removeTabHelper,
  removePane as removePaneHelper,
  splitPane,
  findPaneById,
  findPaneContainingTab,
  moveTab,
  movePaneTabs,
  generateUniqueId,
} from '../tree'
import type { ParsedDropTarget } from './dnd-ids'

export interface ResolveDropInput {
  layout: TreeNode | null
  activeType: DragType
  draggingId: string
  target: ParsedDropTarget
  overTabPosition?: 'before' | 'after' | null
}

export interface ResolveDropSuccess {
  newLayout: TreeNode | null
  overId: string | null
  dropAction: DropAction
}

export type ResolveDropResult = ResolveDropSuccess | null

export function resolveDrop(input: ResolveDropInput): ResolveDropResult {
  const { layout, activeType, draggingId, target, overTabPosition } = input
  if (!layout) return null

  const isTabDrag = activeType === 'tab'

  if (target.type === 'locked' || target.type === 'unknown') {
    return null
  }

  // 1. Tab drop target
  if (target.type === 'tab') {
    const { targetTabId } = target
    const position = overTabPosition ?? 'before'

    if (isTabDrag) {
      if (draggingId === targetTabId) return null
      const newLayout = moveTab(layout, draggingId, targetTabId, position)
      return {
        newLayout,
        overId: targetTabId,
        dropAction: { type: 'move', position: 'center' },
      }
    } else {
      const newLayout = movePaneTabs(layout, draggingId, targetTabId, position)
      return {
        newLayout,
        overId: targetTabId,
        dropAction: { type: 'move', position: 'center' },
      }
    }
  }

  // 2. Root split target
  if (target.type === 'root') {
    const { fraction, edge } = target
    const cleanLayout = isTabDrag
      ? removeTabHelper(layout, draggingId)
      : removePaneHelper(layout, draggingId)

    let draggedPaneNode: PaneNode
    if (isTabDrag) {
      const originalPane = findPaneContainingTab(layout, draggingId)
      const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
      draggedPaneNode = {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
        tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
      }
    } else {
      draggedPaneNode = findPaneById(layout, draggingId) ?? {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
      }
    }

    if (cleanLayout === null) {
      return {
        newLayout: draggedPaneNode,
        overId: 'root',
        dropAction: {
          type: 'split',
          direction: edge === 'left' || edge === 'right' ? 'row' : 'column',
          position: edge,
        },
      }
    }

    const isRow = edge === 'left' || edge === 'right'
    const isFirst = edge === 'left' || edge === 'top'
    let splitPercentage = 50
    if (fraction === '1/4') {
      splitPercentage = isFirst ? 25 : 75
    } else if (fraction === '1/3') {
      splitPercentage = isFirst ? 100 / 3 : 200 / 3
    }

    const newLayout: TreeNode = {
      type: 'split',
      direction: isRow ? 'row' : 'column',
      first: isFirst ? draggedPaneNode : cleanLayout,
      second: isFirst ? cleanLayout : draggedPaneNode,
      splitPercentage,
    }

    return {
      newLayout,
      overId: 'root',
      dropAction: {
        type: 'split',
        direction: isRow ? 'row' : 'column',
        position: edge,
      },
    }
  }

  // 3. Pane center swap target
  if (target.type === 'pane-center') {
    if (!isTabDrag) return null
    const targetPane = findPaneById(layout, target.targetId)
    if (!targetPane || !targetPane.activeTabId) return null

    const targetTabId = targetPane.activeTabId
    const newLayout = moveTab(layout, draggingId, targetTabId, 'center')
    return {
      newLayout,
      overId: target.targetId,
      dropAction: { type: 'move', position: 'center' },
    }
  }

  // 4. Pane edge split target
  if (target.type === 'pane-edge') {
    const { position, targetId } = target

    const parentPane = isTabDrag
      ? findPaneContainingTab(layout, draggingId)
      : findPaneById(layout, draggingId)

    const isParentTarget = parentPane && parentPane.id === targetId
    const isOnlyTab = parentPane && parentPane.tabIds.length === 1

    if (draggingId === targetId || (isParentTarget && isOnlyTab)) {
      return null
    }

    const direction: SplitDirection = position === 'left' || position === 'right' ? 'row' : 'column'

    let draggedPaneNode: PaneNode
    if (isTabDrag) {
      const originalPane = findPaneContainingTab(layout, draggingId)
      const sourceMetadata = originalPane?.tabsMetadata?.[draggingId]
      draggedPaneNode = {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
        tabsMetadata: sourceMetadata ? { [draggingId]: sourceMetadata } : undefined,
      }
    } else {
      draggedPaneNode = findPaneById(layout, draggingId) ?? {
        type: 'pane',
        id: generateUniqueId(),
        tabIds: [draggingId],
        activeTabId: draggingId,
      }
    }

    const cleanLayout = isTabDrag
      ? removeTabHelper(layout, draggingId)
      : removePaneHelper(layout, draggingId)

    const newLayout = splitPane(cleanLayout, targetId, direction, position, draggedPaneNode)

    return {
      newLayout,
      overId: targetId,
      dropAction: {
        type: 'split',
        direction,
        position,
      },
    }
  }

  return null
}
