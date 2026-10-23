import React, { useMemo, useCallback, useEffect } from 'react'
import { DndContext } from '@dnd-kit/core'

import {
  ZeugmaStateContext,
  ZeugmaActionsContext,
  PortalRegistryContext,
  ZeugmaDragContext,
  ZeugmaDragStateValue,
  ZeugmaProps,
  BaseZeugmaProps,
  ZeugmaControllerInternal,
  useShallowStable,
  TabDetails,
  ZeugmaClassNames,
} from '../../../shared'
import {
  usePortalRegistry,
  useZeugmaDnd,
  useAllTabIds,
  useZeugmaDragMeasurement,
  useZeugmaPersistence,
  useZeugmaPopouts,
} from '../model'
import { CursorOverlay } from './CursorOverlay'
import { PortalHostItem } from './PortalHostItem'
import { DragOverlayPreview } from './DragOverlayPreview'
import { PaneTree } from '../../../widgets/pane-tree'

const EMPTY_CLASSNAMES: ZeugmaClassNames = Object.freeze({})
const EMPTY_POPPED_OUT_TAB_IDS: string[] = Object.freeze([]) as unknown as string[]

const DISMISSING_TRANSFORM_STYLE: React.CSSProperties = {
  transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
  transform: 'scale(0.8)',
  transformOrigin: 'top left',
}

const NORMAL_TRANSFORM_STYLE: React.CSSProperties = {
  transition: 'transform 150ms cubic-bezier(0.2, 0, 0, 1)',
  transform: 'scale(1)',
  transformOrigin: 'top left',
}

const PORTAL_HOST_STYLE: React.CSSProperties = { display: 'none' }

const ZeugmaProviderInternal: React.FC<
  BaseZeugmaProps & { children?: React.ReactNode; renderPane?: (paneId: string) => React.ReactNode }
> = (props) => {
  const {
    controller,
    children,
    renderDragOverlay,
    classNames = EMPTY_CLASSNAMES,
    renderPane,
    resizerSize,

    // Configuration settings
    dragActivationDistance = 8,
    snapThreshold = 8,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
    enableDragToDismiss = false,
    dismissThreshold = 60,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onResizeStart,
    onResize,
    onResizeEnd,
    onDismissIntentChange,

    // Persistence
    persist = false,
    renderPopoutWrapper,
    renderPopoutPlaceholder,
  } = props

  const internalController = controller as ZeugmaControllerInternal
  const {
    layout,
    setLayout,
    _internalSetLayout,
    renderingLayout,
    fullscreenPaneId,
    setFullscreenPaneId,
    locked,
    setLocked,
    findPaneById,
    findPaneContainingTab,
    findTabById,
    getTabMetadata,
    getActiveTabMetadata,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    containerRef,
    setContainerRef,
    removePane,
    addTab,
    updatePaneLock,
    selectTab,
    mergeTab,
    removeTab,
    splitPane,
    updateSplitPercentage,
    moveTab,
    poppedOutTabIds = EMPTY_POPPED_OUT_TAB_IDS,
    popoutTab,
    dockTab,
  } = internalController

  // Synchronize layout persistence
  useZeugmaPersistence({ persist, layout, setLayout })

  const {
    portalTargets,
    registerPortalTarget,
    registerPopoutTarget,
    registerRenderCallback,
    renderCallbacksRef,
    registerRenderPane,
    renderPaneRef,
    registerTabHeader,
    tabHeadersRef,
    activeIdRef,
  } = usePortalRegistry()

  useZeugmaPopouts({
    poppedOutTabIds,
    registerPopoutTarget,
    findTabById,
    dockTab,
  })

  const isTabPoppedOut = useCallback(
    (tabId: string) => poppedOutTabIds.includes(tabId),
    [poppedOutTabIds],
  )

  const {
    overTabId,
    setOverTabId,
    overTabPosition,
    setOverTabPosition,
    handleDragStartInternal,
    handleDragEndInternal,
  } = useZeugmaDragMeasurement({
    onDragStart,
    onDragEnd,
  })

  const dnd = useZeugmaDnd({
    layout,
    _internalSetLayout,
    setLayout,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    setOverTabId,
    setOverTabPosition,
    containerRef,

    // Config
    dragActivationDistance,
    enableDragToDismiss,
    dismissThreshold,

    // Callbacks
    onRemove,
    onDragStart: handleDragStartInternal,
    onDragEnd: handleDragEndInternal,
    onDismissIntentChange,

    // Actions
    removeTab,
    removePane,
  })

  // Shallow-memoize classNames to avoid identity busting from inline objects and track all properties
  const stableClassNames = useShallowStable(classNames)

  // State context — reactive values that change during runtime
  const stateValue = useMemo(
    () => ({
      layout,
      renderingLayout,
      setLayout,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      classNames: stableClassNames,
      onRemove,
      onFullscreenChange: setFullscreenPaneId,
      snapThreshold,
      onResizeStart,
      onResize,
      onResizeEnd,
      minSplitPercentage,
      maxSplitPercentage,
      locked,
      setLocked,
      findPaneById,
      findPaneContainingTab,
      findTabById,
      getTabMetadata,
      getActiveTabMetadata,
      renderPane,
      resizerSize,
      poppedOutTabIds,
      isTabPoppedOut,
      renderPopoutWrapper,
      renderPopoutPlaceholder,
    }),
    [
      layout,
      renderingLayout,
      activeId,
      activeType,
      dismissIntentId,
      setContainerRef,
      fullscreenPaneId,
      stableClassNames,
      onRemove,
      setFullscreenPaneId,
      snapThreshold,
      onResizeStart,
      onResize,
      onResizeEnd,
      minSplitPercentage,
      maxSplitPercentage,
      setLayout,
      locked,
      setLocked,
      findPaneById,
      findPaneContainingTab,
      findTabById,
      getTabMetadata,
      getActiveTabMetadata,
      renderPane,
      resizerSize,
      poppedOutTabIds,
      isTabPoppedOut,
      renderPopoutWrapper,
      renderPopoutPlaceholder,
    ],
  )

  const dragValue = useMemo<ZeugmaDragStateValue>(
    () => ({
      overTabId,
      overTabPosition,
    }),
    [overTabId, overTabPosition],
  )

  // Actions context — stable dispatch functions that never change identity
  const actionsValue = useMemo(
    () => ({
      removePane,
      addTab,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
      setFullscreenPaneId,
      setLocked,
      splitPane,
      updateSplitPercentage,
      moveTab,
      popoutTab,
      dockTab,
    }),
    [
      removePane,
      addTab,
      updatePaneLock,
      selectTab,
      mergeTab,
      removeTab,
      setFullscreenPaneId,
      setLocked,
      splitPane,
      updateSplitPercentage,
      moveTab,
      popoutTab,
      dockTab,
    ],
  )

  // Collect all tab IDs and widget IDs in the current layout tree
  const allTabIds = useAllTabIds(layout)

  const tabDetailsMap = useMemo(() => {
    const map = new Map<string, TabDetails>()
    for (const id of allTabIds) {
      const tab = findTabById(id)
      if (tab) {
        map.set(id, tab)
      }
    }
    return map
  }, [allTabIds, findTabById])

  const portalRegistryValue = useMemo(
    () => ({
      registerPortalTarget,
      registerRenderCallback,
      renderCallbacksRef,
      registerRenderPane,
      renderPaneRef,
      registerTabHeader,
      tabHeadersRef,
      activeIdRef,
      registerPopoutTarget,
    }),
    [
      registerPortalTarget,
      registerRenderCallback,
      renderCallbacksRef,
      registerRenderPane,
      renderPaneRef,
      registerTabHeader,
      tabHeadersRef,
      activeIdRef,
      registerPopoutTarget,
    ],
  )

  useEffect(() => {
    if (activeIdRef) {
      activeIdRef.current = activeId
    }
  }, [activeId, activeIdRef])

  const renderCursorOverlay = useCallback(
    (id: string) => {
      const isDismissing = id === dismissIntentId
      return (
        <div style={isDismissing ? DISMISSING_TRANSFORM_STYLE : NORMAL_TRANSFORM_STYLE}>
          <DragOverlayPreview
            activeId={id}
            activeType={activeType!}
            dismissIntentId={dismissIntentId}
            renderDragOverlay={renderDragOverlay}
            renderPaneRef={renderPaneRef}
            renderPane={renderPane}
            tabHeadersRef={tabHeadersRef}
            classNames={stableClassNames}
          />
        </div>
      )
    },
    [
      dismissIntentId,
      activeType,
      renderDragOverlay,
      renderPaneRef,
      renderPane,
      tabHeadersRef,
      stableClassNames,
    ],
  )

  return (
    <ZeugmaActionsContext.Provider value={actionsValue}>
      <ZeugmaStateContext.Provider value={stateValue}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <PortalRegistryContext.Provider value={portalRegistryValue}>
            <DndContext id="zeugma-dnd-context" {...dnd}>
              {children}
            </DndContext>
            {activeId && activeType && (
              <CursorOverlay
                activeId={activeId}
                render={renderCursorOverlay}
                className={`${stableClassNames.dragOverlay || ''} ${
                  activeId === dismissIntentId ? stableClassNames.dismissPreview || '' : ''
                }`.trim()}
              />
            )}
            {/* Transparent Portal Host to preserve widget state across pane drags */}
            <div id="zeugma-portal-host" style={PORTAL_HOST_STYLE}>
              {allTabIds.map((tabId) => {
                const target = portalTargets[tabId]
                const tabDetails = tabDetailsMap.get(tabId)
                if (!tabDetails) return null
                return (
                  <PortalHostItem
                    key={tabId}
                    tabDetails={tabDetails}
                    target={target || null}
                    renderWidget={renderCallbacksRef.current[tabId]}
                  />
                )
              })}
            </div>
          </PortalRegistryContext.Provider>
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>
    </ZeugmaActionsContext.Provider>
  )
}

const ZeugmaRenderer: React.FC<{
  renderPane?: (paneId: string) => React.ReactNode
  resizerSize?: number
  snapThreshold?: number
}> = ({ renderPane, resizerSize, snapThreshold }) => {
  if (!renderPane) {
    throw new Error(
      'Zeugma component requires a renderPane prop when used as a standalone renderer.',
    )
  }
  return (
    <PaneTree renderPane={renderPane} resizerSize={resizerSize} snapThreshold={snapThreshold} />
  )
}

export const Zeugma: React.FC<ZeugmaProps> = (props) => {
  const { children, ...restProps } = props as unknown as {
    children?: React.ReactNode
    renderPane?: (paneId: string) => React.ReactNode
  }

  const { controller } = props as unknown as { controller?: ZeugmaControllerInternal }
  if (!controller) {
    throw new Error('Zeugma component requires a controller.')
  }

  return (
    <ZeugmaProviderInternal
      {...(props as unknown as BaseZeugmaProps & {
        children?: React.ReactNode
        renderPane?: (paneId: string) => React.ReactNode
      })}
    >
      {children !== undefined ? children : <ZeugmaRenderer {...restProps} />}
    </ZeugmaProviderInternal>
  )
}
