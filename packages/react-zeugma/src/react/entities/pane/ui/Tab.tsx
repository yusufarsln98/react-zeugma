import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import {
  useZeugmaState,
  ZeugmaActionsContext,
  useZeugmaDrag,
  PortalRegistryContext,
} from '../../../shared'
import { TabsContext } from './Tabs'

export interface TabContextValue {
  tabId: string
  isActive: boolean
  isDragging: boolean
  isOver: boolean
  metadata?: Record<string, unknown>
  locked: boolean
  selectTab: () => void
  removeTab: () => void
  isPoppedOut: boolean
  popoutTab: () => void
  dockTab: () => void
}

export const TabContext = createContext<TabContextValue | undefined>(undefined)

export const useTabContext = () => {
  const context = useContext(TabContext)
  if (!context) {
    throw new Error('useTabContext must be used within a Tab component')
  }
  return context
}

export interface TabRenderProps {
  isDragging: boolean
  isOver: boolean
}

export interface TabProps {
  /** The unique ID of the tab, which corresponds to the pane/widget ID. */
  id: string
  /** Whether dragging is locked on this tab. */
  locked?: boolean
  /** Render prop child function. */
  children: (props: TabRenderProps) => React.ReactNode
  /** Custom CSS class applied to the tab wrapper. */
  className?: string
  /** Custom inline CSS style applied to the tab wrapper. */
  style?: React.CSSProperties
}

export const Tab: React.FC<TabProps> = ({ id, locked = false, children, className, style }) => {
  const {
    locked: globalLocked,
    classNames = {},
    fullscreenPaneId,
    poppedOutTabIds = [],
  } = useZeugmaState()
  const actions = useContext(ZeugmaActionsContext)
  const { overTabId } = useZeugmaDrag()
  const portalRegistry = useContext(PortalRegistryContext)

  useEffect(() => {
    if (portalRegistry?.registerTabHeader) {
      portalRegistry.registerTabHeader(id, children)
    }
    return () => {
      if (portalRegistry?.registerTabHeader) {
        if (portalRegistry.activeIdRef?.current !== id) {
          portalRegistry.registerTabHeader(id, () => null)
        }
      }
    }
  }, [id, children, portalRegistry])

  const isPoppedOut = poppedOutTabIds.includes(id)

  const tabsContext = useContext(TabsContext)
  const isLocked =
    locked || globalLocked || (tabsContext?.locked ?? false) || fullscreenPaneId !== null

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
    isDragging,
  } = useDraggable({
    id: `tab-header-${id}`,
    disabled: isLocked,
  })

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: `tab-drop-${id}`,
    disabled: isLocked,
  })

  const handleRef = (el: HTMLDivElement | null) => {
    setDragRef(el)
    setDropRef(el)
  }

  const isTargetOver = isOver && overTabId === id

  const tabIds = tabsContext?.tabIds || []
  const index = tabIds.indexOf(id)
  const activeTabId = tabsContext?.activeTabId

  const showSeparator = index > 0 && id !== activeTabId && tabIds[index - 1] !== activeTabId

  const separator = showSeparator ? <div className={classNames.tabSeparator} /> : null

  const isActive = tabsContext ? tabsContext.activeTabId === id : false
  const metadata = tabsContext?.tabsMetadata?.[id]

  const selectThisTab = useCallback(() => {
    tabsContext?.selectTab(id)
  }, [tabsContext, id])

  const removeThisTab = useCallback(() => {
    tabsContext?.removeTab(id)
  }, [tabsContext, id])

  const tabContextValue = useMemo<TabContextValue>(
    () => ({
      tabId: id,
      isActive,
      isDragging,
      isOver: isTargetOver,
      metadata,
      locked: isLocked,
      selectTab: selectThisTab,
      removeTab: removeThisTab,
      isPoppedOut,
      popoutTab: () => actions?.popoutTab(id),
      dockTab: () => actions?.dockTab(id),
    }),
    [
      id,
      isActive,
      isDragging,
      isTargetOver,
      metadata,
      isLocked,
      selectThisTab,
      removeThisTab,
      isPoppedOut,
      actions,
    ],
  )

  return (
    <TabContext.Provider value={tabContextValue}>
      <div
        ref={handleRef}
        id={`tab-header-${id}`}
        className={className}
        style={{
          display: 'inline-flex',
          position: 'relative',
          cursor: isLocked ? 'default' : 'grab',
          ...style,
        }}
        {...(isLocked ? {} : listeners)}
        {...(isLocked ? {} : attributes)}
      >
        {separator}
        {children({
          isDragging,
          isOver: isTargetOver,
        })}
      </div>
    </TabContext.Provider>
  )
}
