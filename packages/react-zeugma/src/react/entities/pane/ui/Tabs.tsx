import React, { createContext, useContext, useMemo } from 'react'
import { Tab } from './Tab'
import {
  useZeugmaState,
  ZeugmaActionsContext,
  useZeugmaDrag,
  ZeugmaClassNames,
} from '../../../shared'
import type { RenderTabProps } from '../../../shared'
import { calculateTabDropIndex } from '../../../../core/tree'
import { PaneContext } from './Pane'

export interface TabsContextValue {
  tabIds: string[]
  activeTabId: string
  locked: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
  selectTab: (id: string) => void
  removeTab: (id: string) => void
}

export const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export const useTabsContext = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabsContext must be used within a Tabs component')
  }
  return context
}

export interface TabsProps {
  /** The list of tab IDs in this pane. */
  tabIds?: string[]
  /** The currently active tab ID. */
  activeTabId?: string
  /** Whether dragging is locked on these tabs. */
  locked?: boolean
  /** Metadata for the tabs. */
  tabsMetadata?: Record<string, Record<string, unknown>>
  /** Callback when a tab is selected. */
  selectTab?: (id: string) => void
  /** Callback when a tab is closed/removed. */
  removeTab?: (id: string) => void
  /** Render function for each individual tab content. */
  renderTab: (props: RenderTabProps) => React.ReactNode
  /** Custom CSS classes for Tabs container and tab wrappers. */
  classNames?: {
    container?: string
    tab?: string | ((tabId: string) => string)
  }
  /** Custom inline CSS styles for Tabs container and tab wrappers. */
  styles?: {
    container?: React.CSSProperties
    tab?: React.CSSProperties | ((tabId: string) => React.CSSProperties)
  }
}

const resolveDynamicProp = <T,>(
  value: T | ((id: string) => T) | undefined,
  id: string,
): T | undefined => {
  return typeof value === 'function' ? (value as (id: string) => T)(id) : value
}

const EMPTY_TAB_IDS: string[] = Object.freeze([]) as unknown as string[]
const EMPTY_GLOBAL_CLASSNAMES: ZeugmaClassNames = Object.freeze({})
const EMPTY_POPPED_OUT_TAB_IDS: string[] = Object.freeze([]) as unknown as string[]
const NOOP = () => {}
const CONTAINER_BASE_STYLE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '100%',
}

export const Tabs: React.FC<TabsProps> & {
  Tab: typeof Tab
} = ({
  tabIds: propTabs,
  activeTabId: propActiveTabId,
  locked: propLocked,
  tabsMetadata: propTabsMetadata,
  selectTab: propSelectTab,
  removeTab: propRemoveTab,
  renderTab,
  classNames,
  styles,
}) => {
  const paneContext = useContext(PaneContext)

  const tabIds = useMemo(
    () => propTabs ?? paneContext?.tabIds ?? EMPTY_TAB_IDS,
    [propTabs, paneContext?.tabIds],
  )
  const activeTabId = propActiveTabId ?? paneContext?.activeTabId ?? ''
  const locked = propLocked ?? paneContext?.locked ?? false
  const tabsMetadata = propTabsMetadata ?? paneContext?.tabsMetadata
  const selectTab = useMemo(
    () => propSelectTab ?? paneContext?.selectTab ?? NOOP,
    [propSelectTab, paneContext?.selectTab],
  )
  const removeTab = useMemo(
    () => propRemoveTab ?? paneContext?.removeTab ?? NOOP,
    [propRemoveTab, paneContext?.removeTab],
  )

  const {
    classNames: globalClassNames = EMPTY_GLOBAL_CLASSNAMES,
    activeType,
    poppedOutTabIds = EMPTY_POPPED_OUT_TAB_IDS,
  } = useZeugmaState()
  const actions = useContext(ZeugmaActionsContext)
  const { overTabId, overTabPosition } = useZeugmaDrag()

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      tabIds,
      activeTabId,
      locked,
      tabsMetadata,
      selectTab,
      removeTab,
    }),
    [tabIds, activeTabId, locked, tabsMetadata, selectTab, removeTab],
  )

  const targetIndex = calculateTabDropIndex(tabIds, activeType, overTabId, overTabPosition)

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={classNames?.container}
        style={{
          ...CONTAINER_BASE_STYLE,
          ...styles?.container,
        }}
      >
        {tabIds.map((tabId, index) => {
          const metadata = tabsMetadata?.[tabId]
          const resolvedClassName = resolveDynamicProp(classNames?.tab, tabId)
          const resolvedStyle = resolveDynamicProp(styles?.tab, tabId)

          const showPreviewHere = index === targetIndex

          return (
            <React.Fragment key={tabId}>
              {showPreviewHere && globalClassNames.tabDropPreview && (
                <div style={{ position: 'relative', height: '100%', width: 0, zIndex: 10 }}>
                  <div
                    className={globalClassNames.tabDropPreview}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      transform: index === 0 ? 'none' : 'translateX(-50%)',
                    }}
                  />
                </div>
              )}
              <Tab id={tabId} locked={locked} className={resolvedClassName} style={resolvedStyle}>
                {({ isDragging, isOver }) =>
                  renderTab({
                    id: tabId,
                    paneId: paneContext?.id ?? '',
                    isActive: tabId === activeTabId,
                    index,
                    isDragging,
                    isOver,
                    metadata,
                    onSelect: () => selectTab(tabId),
                    onRemove: () => removeTab(tabId),
                    isPoppedOut: poppedOutTabIds.includes(tabId),
                    popout: () => actions?.popoutTab(tabId),
                    dock: () => actions?.dockTab(tabId),
                  })
                }
              </Tab>
            </React.Fragment>
          )
        })}

        {targetIndex === tabIds.length && globalClassNames.tabDropPreview && (
          <div style={{ position: 'relative', height: '100%', width: 0, zIndex: 10 }}>
            <div
              className={globalClassNames.tabDropPreview}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                transform: 'translateX(-100%)',
              }}
            />
          </div>
        )}
      </div>
    </TabsContext.Provider>
  )
}

Tabs.Tab = Tab
