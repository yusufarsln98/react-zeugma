import { useState, useRef, useEffect, useCallback, useMemo, SetStateAction } from 'react'
import {
  TreeNode,
  SplitDirection,
  UseZeugmaOptions,
  ZeugmaController,
  ZeugmaControllerInternal,
  ZeugmaActions,
  ZeugmaQueries,
} from '../../../shared'
import {
  removePane,
  addTab,
  splitPane,
  updateSplitPercentage,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  removeTab,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  areLayoutsEqual,
} from '../../../../core/tree'

export function useZeugma(options: UseZeugmaOptions): ZeugmaController {
  const {
    initialLayout,
    layout: controlledLayout,
    onChange,
    fullscreenPaneId: controlledFullscreenPaneId,
    onFullscreenChange,
    locked: lockedOption = false,
  } = options

  const [layout, setLocalLayout] = useState<TreeNode | null>(() => {
    return controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
  })
  const [renderingLayout, setRenderingLayout] = useState<TreeNode | null>(() => {
    return controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
  })
  const [prevControlledLayout, setPrevControlledLayout] = useState<TreeNode | null | undefined>(
    controlledLayout,
  )
  const [fullscreenPaneId, setLocalFullscreenPaneId] = useState<string | null>(
    controlledFullscreenPaneId || null,
  )
  const [locked, setLocked] = useState(lockedOption)
  const [poppedOutTabIds, setPoppedOutTabIds] = useState<string[]>([])

  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeType, setActiveType] = useState<'pane' | 'tab' | null>(null)
  const [dismissIntentId, setDismissIntentId] = useState<string | null>(null)

  const containerRef = useRef<HTMLElement | null>(null)

  const setContainerRef = useCallback((element: HTMLElement | null) => {
    containerRef.current = element
  }, [])

  // Keep layout and callback refs in sync to make actions and queries completely stable
  const layoutRef = useRef<TreeNode | null>(layout)
  layoutRef.current = layout

  const fullscreenPaneIdRef = useRef<string | null>(fullscreenPaneId)
  fullscreenPaneIdRef.current = fullscreenPaneId

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const onFullscreenChangeRef = useRef(onFullscreenChange)
  onFullscreenChangeRef.current = onFullscreenChange

  const setFullscreenPaneId = useCallback((paneId: string | null) => {
    setLocalFullscreenPaneId(paneId)
    onFullscreenChangeRef.current?.(paneId)
  }, [])

  // Sync state if options change
  useEffect(() => {
    setLocked(lockedOption)
  }, [lockedOption])

  useEffect(() => {
    if (controlledFullscreenPaneId !== undefined) {
      setLocalFullscreenPaneId(controlledFullscreenPaneId)
    }
  }, [controlledFullscreenPaneId])

  // Sync state if controlled layout changes from outside during render
  if (controlledLayout !== undefined) {
    if (!areLayoutsEqual(controlledLayout, prevControlledLayout ?? null)) {
      setPrevControlledLayout(controlledLayout)
      setLocalLayout(controlledLayout)
      setRenderingLayout(controlledLayout)
      setPoppedOutTabIds((prevPopped) => {
        if (prevPopped.length === 0) return prevPopped
        const filtered = prevPopped.filter((id) => findTabById(controlledLayout, id) !== null)
        return filtered.length === prevPopped.length ? prevPopped : filtered
      })
    }
  }

  // A wrapper that computes the layout mutation, updates state, and triggers onChange
  const mutateLayout = useCallback(
    <Args extends unknown[]>(
      mutationFn: (current: TreeNode | null, ...args: Args) => TreeNode | null,
      opts?: { blockedInFullscreen?: boolean },
    ) => {
      return (...args: Args) => {
        if (opts?.blockedInFullscreen && fullscreenPaneIdRef.current !== null) {
          return
        }
        const prev = layoutRef.current
        const next = mutationFn(prev, ...args)

        if (!areLayoutsEqual(prev, next)) {
          layoutRef.current = next
          setLocalLayout(next)
          setRenderingLayout(next)

          setPoppedOutTabIds((prevPopped) => {
            if (prevPopped.length === 0) return prevPopped
            const filtered = prevPopped.filter((id) => findTabById(next, id) !== null)
            return filtered.length === prevPopped.length ? prevPopped : filtered
          })

          onChangeRef.current?.(next)
        }
      }
    },
    [],
  )

  const handleSetLayout = useMemo(
    () =>
      mutateLayout((prev, nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
        return typeof nextLayoutOrUpdater === 'function'
          ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(prev)
          : nextLayoutOrUpdater
      }),
    [mutateLayout],
  )

  // Internal setter used by DnD — does NOT trigger onChange or reset transient states
  const _internalSetLayout = useCallback((nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
    if (fullscreenPaneIdRef.current !== null) return
    setRenderingLayout((prev) => {
      const next =
        typeof nextLayoutOrUpdater === 'function'
          ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(prev)
          : nextLayoutOrUpdater
      return next
    })
  }, [])

  // Public setter — resets transient states when layout is replaced programmatically
  const setLayout = useCallback(
    (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      setLocalFullscreenPaneId(null)
      onFullscreenChangeRef.current?.(null)
      setActiveId(null)
      setActiveType(null)
      setDismissIntentId(null)
      const resolved =
        typeof nextLayoutOrUpdater === 'function'
          ? (nextLayoutOrUpdater as (prev: TreeNode | null) => TreeNode | null)(layoutRef.current)
          : nextLayoutOrUpdater
      handleSetLayout(resolved)
      // Force sync renderingLayout to clear any transient drag removals
      setRenderingLayout(resolved)
    },
    [handleSetLayout],
  )

  // Layout Modification Actions
  const actions: ZeugmaActions = useMemo(
    () => ({
      removePane: mutateLayout(removePane, { blockedInFullscreen: true }),
      addTab: mutateLayout(
        (prev, tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => {
          const cleanedPrev = removeTab(prev, tabId) ?? prev
          return addTab(cleanedPrev, targetPaneId, tabId, metadata)
        },
        { blockedInFullscreen: true },
      ),
      updatePaneLock: mutateLayout((prev, paneId: string, isLocked: boolean) => {
        const targetPane = findPaneById(prev, paneId) ?? findPaneContainingTab(prev, paneId)
        if (!targetPane) return prev
        return updatePaneLock(prev, targetPane.id, isLocked)
      }),
      selectTab: mutateLayout((prev, paneId: string, tabId: string) => {
        const targetPane = findPaneById(prev, paneId) ?? findPaneContainingTab(prev, paneId)
        if (!targetPane) return prev
        return selectTab(prev, targetPane.id, tabId)
      }),
      mergeTab: mutateLayout(
        (prev, draggedTabId: string, targetPaneId: string) => {
          const targetPane =
            findPaneById(prev, targetPaneId) ?? findPaneContainingTab(prev, targetPaneId)
          if (!targetPane) return prev
          return mergeTab(prev, draggedTabId, targetPane.id)
        },
        { blockedInFullscreen: true },
      ),
      moveTab: mutateLayout(
        (
          prev,
          draggedTabId: string,
          targetTabId: string,
          position?: 'before' | 'after' | 'center',
        ) => moveTab(prev, draggedTabId, targetTabId, position),
        { blockedInFullscreen: true },
      ),
      removeTab: mutateLayout(removeTab, { blockedInFullscreen: true }),
      splitPane: mutateLayout(
        (
          prev,
          targetId: string,
          direction: SplitDirection,
          splitType: 'left' | 'right' | 'top' | 'bottom',
          paneToAdd: string,
        ) => {
          const targetPane = findPaneById(prev, targetId) ?? findPaneContainingTab(prev, targetId)
          if (!targetPane) return prev

          const draggedPaneNode = findPaneById(prev, paneToAdd) ??
            findPaneContainingTab(prev, paneToAdd) ?? {
              type: 'pane',
              id: paneToAdd,
              tabIds: [paneToAdd],
              activeTabId: paneToAdd,
            }
          const treeWithoutDragging = removePane(prev, draggedPaneNode.id)
          return splitPane(
            treeWithoutDragging,
            targetPane.id,
            direction,
            splitType,
            draggedPaneNode,
          )
        },
        { blockedInFullscreen: true },
      ),
      updateSplitPercentage: mutateLayout(updateSplitPercentage, { blockedInFullscreen: true }),
      popoutTab: (tabId: string) => {
        if (fullscreenPaneIdRef.current !== null) return
        setPoppedOutTabIds((prev) => (prev.includes(tabId) ? prev : [...prev, tabId]))
      },
      dockTab: (tabId: string) => {
        if (fullscreenPaneIdRef.current !== null) return
        setPoppedOutTabIds((prev) =>
          !prev.includes(tabId) ? prev : prev.filter((id) => id !== tabId),
        )
      },
    }),
    [mutateLayout],
  )

  // Tree queries
  const queries: ZeugmaQueries = useMemo(
    () => ({
      findPaneById: (paneId: string) => findPaneById(layoutRef.current, paneId),
      findPaneContainingTab: (tabId: string) => findPaneContainingTab(layoutRef.current, tabId),
      findTabById: (tabId: string) => findTabById(layoutRef.current, tabId),
      getTabMetadata: (tabId: string) => getTabMetadata(layoutRef.current, tabId),
      getActiveTabMetadata: (paneId: string) => getActiveTabMetadata(layoutRef.current, paneId),
    }),
    [],
  )

  const controller: ZeugmaControllerInternal = useMemo(
    () => ({
      layout,
      setLayout,
      _internalSetLayout,
      renderingLayout,
      fullscreenPaneId,
      setFullscreenPaneId,
      locked,
      setLocked,
      poppedOutTabIds,
      activeId,
      setActiveId,
      activeType,
      setActiveType,
      dismissIntentId,
      setDismissIntentId,
      containerRef,
      setContainerRef,
      ...actions,
      ...queries,
    }),
    [
      layout,
      setLayout,
      _internalSetLayout,
      renderingLayout,
      fullscreenPaneId,
      setFullscreenPaneId,
      locked,
      poppedOutTabIds,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      actions,
      queries,
    ],
  )

  return controller
}
