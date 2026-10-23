'use client'

import { useMemo } from 'react'
import { LayoutGrid } from 'lucide-react'
import { useZeugmaContext, TreeNode } from 'react-zeugma/react'
import { AVAILABLE_WIDGETS, WIDGET_META } from './constants'

// Helper to get all tab IDs currently in the layout
function getActiveWidgets(node: TreeNode | null): string[] {
  if (!node) return []
  if (node.type === 'pane') {
    return node.tabIds
  }
  return [...getActiveWidgets(node.first), ...getActiveWidgets(node.second)]
}

// Custom tree transformer to replace a tab ID in place within the pane
function replaceTabInTree(
  tree: TreeNode | null,
  targetTabId: string,
  newTabId: string,
  newTabColor?: string,
): TreeNode | null {
  if (!tree) return null
  if (tree.type === 'pane') {
    if (tree.tabIds.includes(targetTabId)) {
      const tabIds = tree.tabIds.map((id) => (id === targetTabId ? newTabId : id))
      const activeTabId = tree.activeTabId === targetTabId ? newTabId : tree.activeTabId
      const tabsMetadata = { ...tree.tabsMetadata }
      delete tabsMetadata[targetTabId]
      if (newTabColor) {
        tabsMetadata[newTabId] = { color: newTabColor }
      }
      return {
        ...tree,
        tabIds,
        activeTabId,
        tabsMetadata: Object.keys(tabsMetadata).length > 0 ? tabsMetadata : undefined,
      }
    }
    return tree
  }
  return {
    ...tree,
    first: (replaceTabInTree(tree.first, targetTabId, newTabId, newTabColor) ??
      tree.first) as TreeNode,
    second: (replaceTabInTree(tree.second, targetTabId, newTabId, newTabColor) ??
      tree.second) as TreeNode,
  }
}

// Custom tree transformer to remove a tab from the layout tree
function removeTabFromTree(tree: TreeNode | null, tabId: string): TreeNode | null {
  if (!tree) return null
  if (tree.type === 'pane') {
    if (tree.tabIds.includes(tabId)) {
      const newTabs = tree.tabIds.filter((t) => t !== tabId)
      if (newTabs.length === 0) return null
      const newActive = tree.activeTabId === tabId ? newTabs[0] : tree.activeTabId
      const newMetadata = { ...tree.tabsMetadata }
      delete newMetadata[tabId]
      return {
        ...tree,
        tabIds: newTabs,
        activeTabId: newActive,
        tabsMetadata: Object.keys(newMetadata).length > 0 ? newMetadata : undefined,
      }
    }
    return tree
  }
  const first = removeTabFromTree(tree.first, tabId)
  const second = removeTabFromTree(tree.second, tabId)
  if (first === null) return second
  if (second === null) return first
  return { ...tree, first: first as TreeNode, second: second as TreeNode }
}

export function EmptyWidgetPanel({ tabId }: { tabId: string }) {
  const controller = useZeugmaContext()

  const activeWidgetIds = useMemo(() => getActiveWidgets(controller.layout), [controller.layout])

  const inactiveWidgets = useMemo(() => {
    return AVAILABLE_WIDGETS.filter((w) => !activeWidgetIds.includes(w.id))
  }, [activeWidgetIds])

  const handleSelectWidget = (widgetId: string) => {
    const widget = AVAILABLE_WIDGETS.find((w) => w.id === widgetId)
    controller.setLayout((currentLayout) => {
      // 1. Clean the tree from the new widget if it's already there (though it should be inactive)
      const cleanLayout = removeTabFromTree(currentLayout, widgetId)
      // 2. Atomically swap the empty-widget tab ID with the new widget ID in the exact same pane
      return replaceTabInTree(cleanLayout, tabId, widgetId, widget?.color)
    })
  }

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[var(--demo-chrome)] p-6 text-center overflow-y-auto">
      <div className="max-w-md w-full space-y-4 flex flex-col items-center">
        <div className="p-3 bg-[var(--demo-line-soft)] rounded-full border border-[var(--demo-line)] text-[var(--demo-muted)] mb-2 animate-pulse">
          <LayoutGrid className="w-6 h-6" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--demo-text)] mb-1">Empty Panel</h3>
          <p className="text-[11px] text-[var(--demo-muted)]">
            Select a widget below to place in this panel
          </p>
        </div>

        {inactiveWidgets.length === 0 ? (
          <div className="p-4 bg-[var(--demo-line-soft)]/50 rounded border border-[var(--demo-line)] text-[11px] text-[var(--demo-muted)] max-w-xs">
            All widgets are currently active.
            <br />
            Close a panel or tab elsewhere to make its widget available here.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm max-h-[200px] overflow-y-auto pr-1">
            {inactiveWidgets.map((w) => {
              const meta = WIDGET_META[w.id]
              return (
                <button
                  key={w.id}
                  onClick={() => handleSelectWidget(w.id)}
                  className="flex items-center gap-2 p-2 bg-[var(--demo-line-soft)] hover:bg-[var(--demo-line)] border border-[var(--demo-line)] rounded text-left transition-all duration-200 group text-[var(--demo-text)]"
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: w.color }}
                  />
                  {meta?.icon && (
                    <span className="opacity-70 group-hover:opacity-100 transition-opacity">
                      {meta.icon}
                    </span>
                  )}
                  <span className="text-[11px] font-medium truncate">{meta?.title || w.label}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
