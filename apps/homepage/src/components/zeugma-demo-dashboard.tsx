'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { isValidTreeNode } from 'react-zeugma'
import { Zeugma, Pane, useZeugma, TabDetails, usePaneContext, PaneTree } from 'react-zeugma/react'
import { DashboardToolbar, DashboardContainer } from './zeugma-demo-dashboard/DashboardLayout'
import { WidgetWrapper } from './zeugma-demo-dashboard/WidgetWrapper'
import { LiveDataProvider } from './zeugma-demo-dashboard/LiveDataProvider'
import { ExternalLink, Maximize2, Minimize2, Pin, X } from 'lucide-react'

import {
  WIDGET_META,
  defaultDashboardLayout,
  defaultDashboardMetadata,
} from './zeugma-demo-dashboard/constants'

import { DashboardDrawer } from './zeugma-demo-dashboard/DashboardDrawer'
import {
  TabContextMenu,
  TabContextMenuState,
  TabStatus,
} from './zeugma-demo-dashboard/TabContextMenu'

const STATUS_DOT_CLASS: Record<TabStatus, string> = {
  live: 'bg-emerald-400',
  alert: 'bg-rose-400',
  paused: 'bg-amber-400',
}

// ── Custom Pane Header (Drag Handle, Fullscreen, Close) ──────────────────────

function DashboardPaneHeader() {
  const { toggleFullscreen, isFullscreen, remove, tabIds = [], activeTabId } = usePaneContext()

  const [contextMenu, setContextMenu] = useState<TabContextMenuState | null>(null)

  const getWidgetTitle = (id: string) => {
    if (id.startsWith('empty-widget')) return 'Empty Panel'
    return WIDGET_META[id]?.title || id
  }

  return (
    <div className="grafana-panel-header flex items-stretch justify-between min-h-[32px] h-8 bg-[var(--demo-canvas)] relative">
      <div className="flex items-stretch flex-1 h-full min-w-0">
        <Pane.Tabs
          classNames={{
            container: 'grafana-tabs-container h-full flex items-stretch',
            tab: 'h-full flex items-stretch',
          }}
          styles={{
            container: { alignItems: 'stretch' },
            tab: { height: '100%', display: 'flex', alignItems: 'stretch' },
          }}
          renderTab={({ id, index, isActive, onSelect, isPoppedOut, metadata }) => {
            const meta = WIDGET_META[id]
            const prevIsActive = index > 0 && tabIds[index - 1] === activeTabId
            const showSplitter = index > 0 && !isActive && !prevIsActive
            const customTitle = metadata?.title as string | undefined
            const isPinned = Boolean(metadata?.pinned)
            const status = metadata?.status as TabStatus | undefined

            return (
              <button
                onClick={onSelect}
                onContextMenu={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setContextMenu({
                    tabId: id,
                    x: e.clientX,
                    y: e.clientY,
                    isPoppedOut,
                  })
                }}
                title="Right-click for tab options & metadata"
                className={`grafana-tab ${isActive ? 'active' : ''} ${isPoppedOut ? 'opacity-50' : ''}`}
              >
                {showSplitter && <span className="grafana-tab-splitter" />}
                {isPinned && <Pin className="w-2.5 h-2.5 text-amber-400 shrink-0" />}
                {meta?.icon}
                <span className="text-[11px] font-medium tracking-tight">
                  {customTitle || getWidgetTitle(id)}
                </span>
                {status && STATUS_DOT_CLASS[status] && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_CLASS[status]}`}
                  />
                )}
                {isPoppedOut && <ExternalLink className="w-2.5 h-2.5 ml-1 opacity-70" />}
              </button>
            )
          }}
        />
        <div className="flex-1 h-full flex items-center border-b border-[var(--demo-line-soft)]">
          <Pane.DragHandle className="flex-1 h-full min-w-[30px] cursor-grab" />
        </div>
      </div>

      <div className="flex items-center gap-0.5 shrink-0 pl-2 pr-2 border-b border-[var(--demo-line-soft)]">
        <button
          onClick={toggleFullscreen}
          className="grafana-pane-btn"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
        </button>
        <button
          onClick={remove}
          className="grafana-pane-btn hover:text-[#F2495C]"
          title="Close Panel"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      <TabContextMenu
        menu={contextMenu}
        defaultTitle={contextMenu ? getWidgetTitle(contextMenu.tabId) : ''}
        onClose={() => setContextMenu(null)}
      />
    </div>
  )
}

function useDashboardPersist(key = 'zeugma-demo-persist-enabled') {
  const [persist, setPersist] = useState(false)

  // Hydrate checkbox state from localStorage on mount (prevents SSR mismatch)
  useEffect(() => {
    const saved = localStorage.getItem(key)
    if (saved === 'true') {
      setPersist(true)
    }
  }, [key])

  // Persist checkbox state in localStorage when it changes
  useEffect(() => {
    localStorage.setItem(key, String(persist))
  }, [persist, key])

  return [persist, setPersist] as const
}

// ── Inner Dashboard Component ────────────────────────────────────────────────

function ZeugmaDemoDashboardInner() {
  const [timeRange, setTimeRange] = useState('15m')
  const [persist, setPersist] = useDashboardPersist()

  // ── Drawer & API Customization States ──────────────────────────────────────
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [hoveredPaneId, setHoveredPaneId] = useState<string | null>(null)

  const [resizerSize, setResizerSize] = useState(4)
  const [enableDragToDismiss, setEnableDragToDismiss] = useState(true)
  const [dismissThreshold, setDismissThreshold] = useState(60)
  const [snapThreshold, setSnapThreshold] = useState(8)
  const [dragActivationDistance, setDragActivationDistance] = useState(8)
  const [minSplitPercentage, setMinSplitPercentage] = useState(5)
  const [maxSplitPercentage, setMaxSplitPercentage] = useState(95)

  const controller = useZeugma({
    initialLayout: defaultDashboardLayout,
    initialMetadata: defaultDashboardMetadata,
  })
  const hasHydratedLayoutRef = useRef(false)

  // Client-side localStorage persistence using the useZeugma controller
  useEffect(() => {
    if (!persist) {
      hasHydratedLayoutRef.current = true
      return
    }
    if (!hasHydratedLayoutRef.current) {
      hasHydratedLayoutRef.current = true
      try {
        const saved = localStorage.getItem('zeugma-layout')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (isValidTreeNode(parsed)) {
            controller.setLayout(parsed)
          }
        }
      } catch {
        // Ignore invalid persisted layout
      }
    }
  }, [persist, controller.setLayout])

  useEffect(() => {
    if (!persist || !hasHydratedLayoutRef.current) return
    try {
      if (controller.layout) {
        localStorage.setItem('zeugma-layout', JSON.stringify(controller.layout))
      } else {
        localStorage.removeItem('zeugma-layout')
      }
    } catch {
      // Ignore storage write errors
    }
  }, [persist, controller.layout])

  // ── Tab / Widget rendering ───────────────────────────────────────────────

  const renderWidget = useCallback((tab: TabDetails) => {
    return <WidgetWrapper tabId={tab.id} />
  }, [])

  // ── Pane rendering ─────────────────────────────────────────────────────────

  const renderPane = useCallback(
    (paneId: string) => {
      const isHighlighted = paneId === hoveredPaneId
      return (
        <Pane id={paneId}>
          <div
            className={`grafana-panel flex flex-col h-full w-full overflow-hidden transition-all duration-200 ${
              isHighlighted
                ? 'ring-1 ring-[var(--demo-text)] shadow-[0_0_15px_rgba(204,204,220,0.15)] z-10'
                : ''
            }`}
          >
            <DashboardPaneHeader />

            <Pane.Content
              className="grafana-panel-body flex-1 min-h-0 overflow-hidden"
              renderPopoutPlaceholder={({ dock }) => (
                <div className="flex flex-col items-center justify-center h-full w-full gap-3 text-text-muted text-xs p-6 text-center select-none">
                  <span>Panel is open in a separate window</span>
                  <button
                    onClick={dock}
                    className="px-2.5 py-1 text-xs rounded border border-border-primary bg-bg-pane text-text-primary hover:bg-bg-hover transition-colors cursor-pointer"
                  >
                    Dock Back
                  </button>
                </div>
              )}
            >
              {renderWidget}
            </Pane.Content>
          </div>
        </Pane>
      )
    },
    [renderWidget, hoveredPaneId],
  )

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Zeugma
      controller={controller}
      resizerSize={resizerSize}
      enableDragToDismiss={enableDragToDismiss}
      dismissThreshold={dismissThreshold}
      snapThreshold={snapThreshold}
      dragActivationDistance={dragActivationDistance}
      minSplitPercentage={minSplitPercentage}
      maxSplitPercentage={maxSplitPercentage}
      classNames={{
        dropPreview: 'bg-white/5 border border-white/20 transition-all duration-200 shadow-lg',
        rootDropPreview: 'grafana-root-drop-preview',
        resizer: 'grafana-resizer',
        tabDropPreview: 'grafana-tab-drop-preview',
        paneDragPreview: 'opacity-90 shadow-2xl',
        tabDragPreview: 'opacity-90 shadow-2xl',
      }}
      renderPopoutWrapper={({ children }) => (
        <div className="zeugma-popout-wrapper h-full w-full bg-[var(--demo-canvas)] text-white">
          {children}
        </div>
      )}
    >
      <DashboardContainer className="relative">
        <DashboardToolbar
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          drawerOpen={drawerOpen}
          onToggleDrawer={() => setDrawerOpen(!drawerOpen)}
        />

        <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative w-full">
          <DashboardDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            isDocked={true}
            controller={controller}
            resizerSize={resizerSize}
            setResizerSize={setResizerSize}
            enableDragToDismiss={enableDragToDismiss}
            setEnableDragToDismiss={setEnableDragToDismiss}
            dismissThreshold={dismissThreshold}
            setDismissThreshold={setDismissThreshold}
            snapThreshold={snapThreshold}
            setSnapThreshold={setSnapThreshold}
            dragActivationDistance={dragActivationDistance}
            setDragActivationDistance={setDragActivationDistance}
            minSplitPercentage={minSplitPercentage}
            setMinSplitPercentage={setMinSplitPercentage}
            maxSplitPercentage={maxSplitPercentage}
            setMaxSplitPercentage={setMaxSplitPercentage}
            hoveredPaneId={hoveredPaneId}
            setHoveredPaneId={setHoveredPaneId}
            persist={persist}
            onPersistChange={setPersist}
          />

          <div className="grafana-workspace min-w-0">
            <PaneTree renderPane={renderPane} />
          </div>
        </div>
      </DashboardContainer>
    </Zeugma>
  )
}

// ── Wrapper with LiveDataProvider ────────────────────────────────────────────

export function ZeugmaDemoDashboard() {
  return (
    <LiveDataProvider>
      <ZeugmaDemoDashboardInner />
    </LiveDataProvider>
  )
}
