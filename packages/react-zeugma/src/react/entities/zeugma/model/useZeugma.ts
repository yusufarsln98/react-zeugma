import { useState, useRef, useEffect, useCallback, useMemo, SetStateAction } from 'react'
import {
  TreeNode,
  SplitDirection,
  UseZeugmaOptions,
  ZeugmaController,
  ZeugmaControllerInternal,
  ZeugmaActions,
  ZeugmaQueries,
  MetadataUpdater,
  TabMetadataMap,
} from '../../../shared'
import { createMetadataStore, MetadataStore } from './metadataStore'
import {
  createPane,
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
  areLayoutsEqual,
} from '../../../../core/tree'

export function useZeugma(options: UseZeugmaOptions): ZeugmaController {
  const {
    initialLayout,
    layout: controlledLayout,
    initialMetadata,
    metadata: controlledMetadata,
    onChange,
    onMetadataChange,
    onMetadataMapChange,
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
  const [prevControlledMetadata, setPrevControlledMetadata] = useState<TabMetadataMap | undefined>(
    controlledMetadata,
  )

  const metadataStoreRef = useRef<MetadataStore | null>(null)
  if (!metadataStoreRef.current) {
    const initialTree = controlledLayout !== undefined ? controlledLayout : (initialLayout ?? null)
    const initialMeta = controlledMetadata !== undefined ? controlledMetadata : initialMetadata
    metadataStoreRef.current = createMetadataStore(initialTree, initialMeta)
  }
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

  const onMetadataChangeRef = useRef(onMetadataChange)
  onMetadataChangeRef.current = onMetadataChange

  const onMetadataMapChangeRef = useRef(onMetadataMapChange)
  onMetadataMapChangeRef.current = onMetadataMapChange

  const notifyPrunedMetadata = useCallback((prunedIds: string[]) => {
    if (prunedIds.length === 0) return
    for (const prunedId of prunedIds) {
      onMetadataChangeRef.current?.(prunedId, undefined)
    }
    onMetadataMapChangeRef.current?.(metadataStoreRef.current!.getAll())
  }, [])

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
      const prunedIds = metadataStoreRef.current.syncFromTree(controlledLayout)
      notifyPrunedMetadata(prunedIds)
      setPoppedOutTabIds((prevPopped) => {
        if (prevPopped.length === 0) return prevPopped
        const filtered = prevPopped.filter((id) => findTabById(controlledLayout, id) !== null)
        return filtered.length === prevPopped.length ? prevPopped : filtered
      })
    }
  }

  // Sync metadata if controlled metadata map changes from outside during render
  if (controlledMetadata !== undefined && controlledMetadata !== prevControlledMetadata) {
    setPrevControlledMetadata(controlledMetadata)
    const activeTree = controlledLayout !== undefined ? controlledLayout : layoutRef.current
    metadataStoreRef.current.syncFromMap(controlledMetadata, activeTree)
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
          const prunedIds = metadataStoreRef.current!.pruneMissingTabs(next)
          notifyPrunedMetadata(prunedIds)

          setPoppedOutTabIds((prevPopped) => {
            if (prevPopped.length === 0) return prevPopped
            const filtered = prevPopped.filter((id) => findTabById(next, id) !== null)
            return filtered.length === prevPopped.length ? prevPopped : filtered
          })

          onChangeRef.current?.(next)
        }
      }
    },
    [notifyPrunedMetadata],
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

  // Internal commit used by DnD — commits layout without resetting live tab metadata
  const _commitDndLayout = useCallback(
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

  const notifyMetadataMapDiff = useCallback((prevMap: TabMetadataMap, nextMap: TabMetadataMap) => {
    const allKeys = new Set([...Object.keys(prevMap), ...Object.keys(nextMap)])
    let anyChanged = false
    for (const tabId of allKeys) {
      if (prevMap[tabId] !== nextMap[tabId]) {
        anyChanged = true
        onMetadataChangeRef.current?.(tabId, nextMap[tabId])
      }
    }
    if (anyChanged) {
      onMetadataMapChangeRef.current?.(nextMap)
    }
  }, [])

  const setMetadata = useCallback(
    (nextMetadataOrUpdater: SetStateAction<TabMetadataMap>) => {
      const store = metadataStoreRef.current!
      const prevMap = store.getAll()
      const nextMap =
        typeof nextMetadataOrUpdater === 'function'
          ? (nextMetadataOrUpdater as (prev: TabMetadataMap) => TabMetadataMap)(prevMap)
          : nextMetadataOrUpdater
      store.syncFromMap(nextMap, layoutRef.current)
      notifyMetadataMapDiff(prevMap, store.getAll())
    },
    [notifyMetadataMapDiff],
  )

  // Public setter — resets transient states and prunes metadata for removed tabs
  const setLayout = useCallback(
    (nextLayoutOrUpdater: SetStateAction<TreeNode | null>) => {
      _commitDndLayout(nextLayoutOrUpdater)
    },
    [_commitDndLayout],
  )

  // Silent atomic hydration — replaces layout and metadata without firing onChange/onMetadata*Change
  const hydrate = useCallback((nextLayout: TreeNode | null, nextMetadata?: TabMetadataMap) => {
    setLocalFullscreenPaneId(null)
    setActiveId(null)
    setActiveType(null)
    setDismissIntentId(null)
    layoutRef.current = nextLayout
    setLocalLayout(nextLayout)
    setRenderingLayout(nextLayout)
    metadataStoreRef.current!.resetFromTree(nextLayout, nextMetadata)
    setPoppedOutTabIds((prevPopped) => {
      if (prevPopped.length === 0) return prevPopped
      const filtered = prevPopped.filter((id) => findTabById(nextLayout, id) !== null)
      return filtered.length === prevPopped.length ? prevPopped : filtered
    })
  }, [])

  // Layout Modification Actions
  const mutateAddTab = useMemo(
    () =>
      mutateLayout(
        (prev, tabId: string, targetPaneId?: string) => {
          const cleanedPrev = removeTab(prev, tabId) ?? prev
          return addTab(cleanedPrev, targetPaneId, tabId)
        },
        { blockedInFullscreen: true },
      ),
    [mutateLayout],
  )

  const actions: ZeugmaActions = useMemo(
    () => ({
      removePane: mutateLayout(removePane, { blockedInFullscreen: true }),
      addTab: (tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => {
        if (fullscreenPaneIdRef.current !== null) return
        if (metadata !== undefined) {
          const store = metadataStoreRef.current!
          store.set(tabId, metadata)
          onMetadataChangeRef.current?.(tabId, metadata)
          onMetadataMapChangeRef.current?.(store.getAll())
        }
        mutateAddTab(tabId, targetPaneId)
      },
      updateTabMetadata: (tabId: string, updater: MetadataUpdater) => {
        if (layoutRef.current && !findTabById(layoutRef.current, tabId)) return
        const store = metadataStoreRef.current!
        store.update(tabId, updater)
        onMetadataChangeRef.current?.(tabId, store.get(tabId))
        onMetadataMapChangeRef.current?.(store.getAll())
      },
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
      splitTab: mutateLayout(
        (
          prev,
          tabId: string,
          targetPaneId: string,
          direction: SplitDirection,
          splitType: 'left' | 'right' | 'top' | 'bottom',
        ) => {
          const targetPane =
            findPaneById(prev, targetPaneId) ?? findPaneContainingTab(prev, targetPaneId)
          const sourcePane = findPaneContainingTab(prev, tabId)
          if (!targetPane || !sourcePane) return prev
          if (sourcePane.id === targetPane.id && sourcePane.tabIds.length <= 1) return prev

          const treeWithoutTab = removeTab(prev, tabId)
          return splitPane(treeWithoutTab, targetPane.id, direction, splitType, createPane(tabId))
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
    [mutateLayout, mutateAddTab],
  )

  const subscribeTabMetadata = useCallback(
    (tabId: string, listener: () => void) => metadataStoreRef.current!.subscribe(tabId, listener),
    [],
  )

  // Tree queries
  const queries: ZeugmaQueries = useMemo(
    () => ({
      findPaneById: (paneId: string) => findPaneById(layoutRef.current, paneId),
      findPaneContainingTab: (tabId: string) => findPaneContainingTab(layoutRef.current, tabId),
      findTabById: (tabId: string) => {
        const tab = findTabById(layoutRef.current, tabId)
        if (!tab) return null
        return {
          ...tab,
          metadata: metadataStoreRef.current!.get(tabId),
        }
      },
      getTabMetadata: (tabId: string) => metadataStoreRef.current!.get(tabId),
      getActiveTabMetadata: (paneId: string) => {
        const pane = findPaneById(layoutRef.current, paneId)
        if (!pane) return undefined
        return metadataStoreRef.current!.get(pane.activeTabId)
      },
      getMetadataMap: () => metadataStoreRef.current!.getAll(),
    }),
    [],
  )

  const controller: ZeugmaControllerInternal = useMemo(
    () => ({
      layout,
      setLayout,
      setMetadata,
      hydrate,
      _internalSetLayout,
      _commitDndLayout,
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
      subscribeTabMetadata,
      ...actions,
      ...queries,
    }),
    [
      layout,
      setLayout,
      setMetadata,
      hydrate,
      _internalSetLayout,
      _commitDndLayout,
      renderingLayout,
      fullscreenPaneId,
      setFullscreenPaneId,
      locked,
      poppedOutTabIds,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      subscribeTabMetadata,
      actions,
      queries,
    ],
  )

  return controller
}
