'use client'

import { useState, useMemo } from 'react'
import {
  X,
  Lock,
  Unlock,
  Split,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { ZeugmaController, TreeNode, PaneNode, SplitDirection } from 'react-zeugma/react'
import { AVAILABLE_WIDGETS, WIDGET_META, PRESETS } from './constants'

interface DashboardDrawerProps {
  isOpen: boolean
  onClose: () => void
  isDocked: boolean
  controller: ZeugmaController
  resizerSize: number
  setResizerSize: (v: number) => void
  enableDragToDismiss: boolean
  setEnableDragToDismiss: (v: boolean) => void
  dismissThreshold: number
  setDismissThreshold: (v: number) => void
  snapThreshold: number
  setSnapThreshold: (v: number) => void
  dragActivationDistance: number
  setDragActivationDistance: (v: number) => void
  minSplitPercentage: number
  setMinSplitPercentage: (v: number) => void
  maxSplitPercentage: number
  setMaxSplitPercentage: (v: number) => void
  hoveredPaneId: string | null
  setHoveredPaneId: (paneId: string | null) => void
  persist: boolean
  onPersistChange: (v: boolean) => void
}

// Helper to get all PaneNode structures in the layout tree
function getPaneNodes(node: TreeNode | null): PaneNode[] {
  if (!node) return []
  if (node.type === 'pane') {
    return [node]
  }
  return [...getPaneNodes(node.first), ...getPaneNodes(node.second)]
}

// Helper to get all tab IDs currently in the layout
function getActiveWidgets(node: TreeNode | null): string[] {
  if (!node) return []
  if (node.type === 'pane') {
    return node.tabIds
  }
  return [...getActiveWidgets(node.first), ...getActiveWidgets(node.second)]
}

export function DashboardDrawer({
  isOpen,
  onClose,
  isDocked,
  controller,
  resizerSize,
  setResizerSize,
  enableDragToDismiss,
  setEnableDragToDismiss,
  dismissThreshold,
  setDismissThreshold,
  snapThreshold,
  setSnapThreshold,
  dragActivationDistance,
  setDragActivationDistance,
  minSplitPercentage,
  setMinSplitPercentage,
  maxSplitPercentage,
  setMaxSplitPercentage,
  hoveredPaneId,
  setHoveredPaneId,
  persist,
  onPersistChange,
}: DashboardDrawerProps) {
  const [activeSection, setActiveSection] = useState<'settings' | 'panes' | 'tree'>('settings')
  const [splittingPaneId, setSplittingPaneId] = useState<string | null>(null)
  const [splitDirection, setSplitDirection] = useState<SplitDirection>('row')

  const activePanes = useMemo(() => getPaneNodes(controller.layout), [controller.layout])
  const activeWidgetIds = useMemo(() => getActiveWidgets(controller.layout), [controller.layout])

  const inactiveWidgets = useMemo(() => {
    return AVAILABLE_WIDGETS.filter((w) => !activeWidgetIds.includes(w.id))
  }, [activeWidgetIds])

  if (!isOpen) return null

  const handleSplitSubmit = (paneId: string, widgetId: string) => {
    controller.splitPane(
      paneId,
      splitDirection,
      splitDirection === 'row' ? 'right' : 'bottom',
      widgetId,
    )
    setSplittingPaneId(null)
  }

  const handleAddWidgetAtRoot = (widgetId: string) => {
    const widget = AVAILABLE_WIDGETS.find((w) => w.id === widgetId)
    controller.addTab(widgetId, undefined, widget ? { color: widget.color } : undefined)
  }

  return (
    <div className={`grafana-drawer ${isDocked ? 'docked' : 'overlay'}`}>
      {/* Drawer Header */}
      <div className="grafana-drawer-header">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--demo-muted)]" />
          <span className="grafana-drawer-title-text">Dashboard Settings</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="grafana-pane-btn" title="Close Settings">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="grafana-drawer-tabs">
        <button
          onClick={() => setActiveSection('settings')}
          className={`grafana-drawer-tab ${activeSection === 'settings' ? 'active' : ''}`}
        >
          API Config
        </button>
        <button
          onClick={() => setActiveSection('panes')}
          className={`grafana-drawer-tab ${activeSection === 'panes' ? 'active' : ''}`}
        >
          Panes & Widgets
        </button>
        <button
          onClick={() => setActiveSection('tree')}
          className={`grafana-drawer-tab ${activeSection === 'tree' ? 'active' : ''}`}
        >
          Live Tree
        </button>
      </div>

      {/* Content Area */}
      <div className="grafana-drawer-body">
        {/* SECTION 1: API CONFIGURATION */}
        {activeSection === 'settings' && (
          <div className="space-y-5">
            {/* Global Lock */}
            <div className="grafana-setting-card">
              <div className="grafana-setting-row">
                <div>
                  <div className="grafana-setting-label">Global Lock (locked)</div>
                  <div className="grafana-setting-desc">
                    Disables dragging, resizing, and closing.
                  </div>
                </div>
                <label className="grafana-switch">
                  <input
                    type="checkbox"
                    checked={controller.locked}
                    onChange={(e) => controller.setLocked(e.target.checked)}
                  />
                  <span className="grafana-switch-slider" />
                </label>
              </div>
            </div>

            {/* Layout Persistence */}
            <div className="grafana-setting-card">
              <div className="grafana-setting-row">
                <div>
                  <div className="grafana-setting-label">Persist Layout (persist)</div>
                  <div className="grafana-setting-desc">Save layout changes to localStorage.</div>
                </div>
                <label className="grafana-switch">
                  <input
                    type="checkbox"
                    checked={persist}
                    onChange={(e) => onPersistChange(e.target.checked)}
                  />
                  <span className="grafana-switch-slider" />
                </label>
              </div>
            </div>

            {/* Layout Presets */}
            <div className="grafana-setting-card">
              <div className="grafana-setting-label mb-2">Layout Presets</div>
              <div className="grid grid-cols-2 gap-1.5">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => controller.setLayout(preset.layout)}
                    className="grafana-drawer-btn text-left justify-start py-1.5 text-[10px]"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 pt-1">
              {/* Resizer Size */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--demo-muted)]">
                  <span>Resizer Thickness (resizerSize)</span>
                  <span className="text-[var(--demo-text)] font-mono">{resizerSize}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={resizerSize}
                  onChange={(e) => setResizerSize(Number(e.target.value))}
                  className="grafana-slider"
                  disabled={controller.locked}
                />
              </div>

              {/* Drag Activation Distance */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--demo-muted)]">
                  <span>Drag Trigger Distance (dragActivationDistance)</span>
                  <span className="text-[var(--demo-text)] font-mono">
                    {dragActivationDistance}px
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={dragActivationDistance}
                  onChange={(e) => setDragActivationDistance(Number(e.target.value))}
                  className="grafana-slider"
                  disabled={controller.locked}
                />
              </div>

              {/* Snap Threshold */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--demo-muted)]">
                  <span>Snap Threshold (snapThreshold)</span>
                  <span className="text-[var(--demo-text)] font-mono">{snapThreshold}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={snapThreshold}
                  onChange={(e) => setSnapThreshold(Number(e.target.value))}
                  className="grafana-slider"
                  disabled={controller.locked}
                />
              </div>

              {/* Min Split Percentage */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--demo-muted)]">
                  <span>Min Split Size (minSplitPercentage)</span>
                  <span className="text-[var(--demo-text)] font-mono">{minSplitPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={minSplitPercentage}
                  onChange={(e) => setMinSplitPercentage(Number(e.target.value))}
                  className="grafana-slider"
                  disabled={controller.locked}
                />
              </div>

              {/* Max Split Percentage */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--demo-muted)]">
                  <span>Max Split Size (maxSplitPercentage)</span>
                  <span className="text-[var(--demo-text)] font-mono">{maxSplitPercentage}%</span>
                </div>
                <input
                  type="range"
                  min="55"
                  max="95"
                  value={maxSplitPercentage}
                  onChange={(e) => setMaxSplitPercentage(Number(e.target.value))}
                  className="grafana-slider"
                  disabled={controller.locked}
                />
              </div>

              {/* Drag to Dismiss Settings */}
              <div className="border-t border-[var(--demo-line)] pt-4 mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-semibold text-[var(--demo-muted)]">
                    Enable Drag-to-Dismiss (enableDragToDismiss)
                  </div>
                  <label className="grafana-switch">
                    <input
                      type="checkbox"
                      checked={enableDragToDismiss}
                      onChange={(e) => setEnableDragToDismiss(e.target.checked)}
                      disabled={controller.locked}
                    />
                    <span className="grafana-switch-slider" />
                  </label>
                </div>

                {enableDragToDismiss && (
                  <div className="space-y-1 pl-2 border-l border-[var(--demo-line)] transition-all">
                    <div className="flex justify-between text-[9px] font-semibold text-[var(--demo-muted)]">
                      <span>Dismiss Threshold (dismissThreshold)</span>
                      <span className="text-[var(--demo-text)] font-mono">
                        {dismissThreshold}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={dismissThreshold}
                      onChange={(e) => setDismissThreshold(Number(e.target.value))}
                      className="grafana-slider"
                      disabled={controller.locked}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: PANES & WIDGETS */}
        {activeSection === 'panes' && (
          <div className="space-y-6">
            {/* Active Panes */}
            <div>
              <div className="text-[11px] font-bold text-[var(--demo-text)] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Active Panes ({activePanes.length})</span>
                <span className="text-[9px] text-[var(--demo-muted)] lowercase font-normal">
                  hover to highlight
                </span>
              </div>
              <div className="space-y-2">
                {activePanes.map((pane) => {
                  const isLocked = !!pane.locked
                  const isHighlighted = pane.id === hoveredPaneId
                  const isSplitting = splittingPaneId === pane.id

                  return (
                    <div
                      key={pane.id}
                      className={`grafana-drawer-item-card ${isHighlighted ? 'highlighted' : ''}`}
                      onMouseEnter={() => setHoveredPaneId(pane.id)}
                      onMouseLeave={() => setHoveredPaneId(null)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          {isLocked ? (
                            <Lock className="w-3 h-3 text-[#FF9830] shrink-0" />
                          ) : (
                            <Unlock className="w-3 h-3 text-[var(--demo-muted)] shrink-0" />
                          )}
                          <span className="font-mono text-[10px] text-[var(--demo-text)] truncate">
                            {pane.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {/* Split Pane Control */}
                          <button
                            onClick={() => {
                              if (isSplitting) {
                                setSplittingPaneId(null)
                              } else {
                                setSplittingPaneId(pane.id)
                              }
                            }}
                            disabled={controller.locked || isLocked}
                            className={`grafana-drawer-action-btn ${isSplitting ? 'active' : ''}`}
                            title="Split Pane"
                          >
                            <Split className="w-3 h-3" />
                          </button>

                          {/* Lock Toggle */}
                          <button
                            onClick={() => controller.updatePaneLock(pane.id, !isLocked)}
                            disabled={controller.locked}
                            className={`grafana-drawer-action-btn ${isLocked ? 'active' : ''}`}
                            title={isLocked ? 'Unlock Pane' : 'Lock Pane'}
                          >
                            {isLocked ? (
                              <Lock className="w-3 h-3 text-[#FF9830]" />
                            ) : (
                              <Unlock className="w-3 h-3" />
                            )}
                          </button>

                          {/* Close Pane */}
                          <button
                            onClick={() => controller.removePane(pane.id)}
                            disabled={controller.locked || isLocked}
                            className="grafana-drawer-action-btn hover:text-[#F2495C]"
                            title="Close Pane"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Display tabs inside this pane */}
                      <div className="mt-2 pl-2 border-l-2 border-[var(--demo-line)] space-y-1">
                        {pane.tabIds.map((tabId) => {
                          const isActive = tabId === pane.activeTabId
                          const meta = WIDGET_META[tabId]
                          return (
                            <div
                              key={tabId}
                              onClick={() => controller.selectTab(pane.id, tabId)}
                              className={`flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                                isActive
                                  ? 'bg-[var(--demo-line)] text-[#ffffff] font-semibold'
                                  : 'text-[var(--demo-muted)] hover:bg-[var(--demo-line-soft)]/50 hover:text-[var(--demo-text)]'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                {meta?.icon}
                                {meta?.title || tabId}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  controller.removeTab(tabId)
                                }}
                                disabled={controller.locked || isLocked}
                                className="text-[10px] text-[var(--demo-muted)] hover:text-[#F2495C] px-1 disabled:opacity-30"
                              >
                                ×
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      {/* Inline Splitting configuration */}
                      {isSplitting && (
                        <div className="mt-3 pt-2 border-t border-[var(--demo-line)] space-y-2">
                          <div className="flex items-center justify-between text-[9px] text-[var(--demo-muted)] uppercase font-bold">
                            <span>Split Layout</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setSplitDirection('row')}
                                className={`px-1.5 py-0.5 rounded text-[8px] border transition-colors ${
                                  splitDirection === 'row'
                                    ? 'bg-[var(--demo-line)] text-white border-[var(--demo-line-strong)]'
                                    : 'border-[var(--demo-line)] text-[var(--demo-muted)]'
                                }`}
                              >
                                Row (H)
                              </button>
                              <button
                                onClick={() => setSplitDirection('column')}
                                className={`px-1.5 py-0.5 rounded text-[8px] border transition-colors ${
                                  splitDirection === 'column'
                                    ? 'bg-[var(--demo-line)] text-white border-[var(--demo-line-strong)]'
                                    : 'border-[var(--demo-line)] text-[var(--demo-muted)]'
                                }`}
                              >
                                Col (V)
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto pr-1">
                            <button
                              onClick={() =>
                                handleSplitSubmit(
                                  pane.id,
                                  `empty-widget-${Math.random().toString(36).substring(2, 9)}`,
                                )
                              }
                              className="col-span-2 text-[9px] py-1.5 bg-[var(--demo-line)] hover:bg-[var(--demo-line-strong)] border border-[var(--demo-line-strong)] rounded text-left px-1.5 flex items-center gap-1 truncate text-[var(--demo-text)] font-semibold"
                            >
                              <Plus className="w-2.5 h-2.5 text-[#73BF69]" />
                              <span className="truncate">Empty Panel</span>
                            </button>

                            {inactiveWidgets.map((w) => (
                              <button
                                key={w.id}
                                onClick={() => handleSplitSubmit(pane.id, w.id)}
                                className="text-[9px] py-1 bg-[var(--demo-line-soft)] hover:bg-[var(--demo-line)] border border-[var(--demo-line)] rounded text-left px-1.5 flex items-center gap-1 truncate text-[var(--demo-text)]"
                              >
                                <Plus className="w-2.5 h-2.5 text-[#73BF69]" />
                                <span className="truncate">{w.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Inactive Widgets / Add Widget */}
            <div>
              <div className="text-[11px] font-bold text-[var(--demo-text)] uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span>Inactive Widgets ({inactiveWidgets.length})</span>
                <button
                  onClick={() =>
                    handleAddWidgetAtRoot(
                      `empty-widget-${Math.random().toString(36).substring(2, 9)}`,
                    )
                  }
                  className="text-[9px] px-2 py-0.5 bg-[var(--demo-line)] hover:bg-[var(--demo-line-strong)] border border-[var(--demo-line-strong)] rounded text-[var(--demo-text)] flex items-center gap-1 font-semibold"
                >
                  <Plus className="w-2.5 h-2.5 text-[#73BF69]" />
                  Empty Panel
                </button>
              </div>
              {inactiveWidgets.length === 0 ? (
                <div className="text-[10px] text-[var(--demo-muted)] italic p-3 bg-[var(--demo-chrome)] border border-[var(--demo-line)] rounded text-center">
                  All widgets are currently active in the layout!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1.5">
                  {inactiveWidgets.map((w) => (
                    <div
                      key={w.id}
                      className="p-2 bg-[var(--demo-chrome)] border border-[var(--demo-line)] rounded flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: w.color }}
                        />
                        <span className="font-semibold text-[10px] text-[var(--demo-text)] truncate">
                          {w.label}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleAddWidgetAtRoot(w.id)}
                          className="flex-1 text-[9px] py-1 bg-[var(--demo-line)] hover:bg-[var(--demo-line-strong)] border border-[var(--demo-line-strong)] rounded text-center text-[var(--demo-text)]"
                        >
                          Add to Grid
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 3: LIVE TREE VISUALIZER */}
        {activeSection === 'tree' && (
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-[var(--demo-text)] uppercase tracking-wider mb-2">
                Live Layout Tree
              </div>
              <div className="grafana-tree-container p-2.5 bg-[var(--demo-canvas)]/60 border border-[var(--demo-line)] rounded overflow-x-auto">
                <RecursiveTreeVisualizer
                  node={controller.layout}
                  hoveredPaneId={hoveredPaneId}
                  setHoveredPaneId={setHoveredPaneId}
                  controller={controller}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Recursive component to render the binary tree layout
function RecursiveTreeVisualizer({
  node,
  hoveredPaneId,
  setHoveredPaneId,
  controller,
}: {
  node: TreeNode | null
  hoveredPaneId: string | null
  setHoveredPaneId: (paneId: string | null) => void
  controller: ZeugmaController
}) {
  const [collapsed, setCollapsed] = useState(false)

  if (!node) {
    return <div className="text-[10px] text-[var(--demo-muted)] italic pl-2">Empty layout</div>
  }

  if (node.type === 'pane') {
    const isHovered = node.id === hoveredPaneId
    const isLocked = !!node.locked
    return (
      <div
        className={`pl-2 border-l border-[var(--demo-line)] py-1.5 transition-colors ${
          isHovered ? 'bg-white/5 border-l-[var(--demo-text)]' : ''
        }`}
        onMouseEnter={() => setHoveredPaneId(node.id)}
        onMouseLeave={() => setHoveredPaneId(null)}
      >
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="text-[#FF9830] font-bold font-mono">■</span>
          <span className="text-[var(--demo-text)] font-mono font-bold">{node.id}</span>
          {isLocked && <span className="text-[9px] text-[#FF9830]">🔒</span>}
        </div>
        <div className="mt-1 pl-4 space-y-0.5 text-[9px] text-[var(--demo-muted)]">
          <div>
            Active Tab:{' '}
            <span className="text-[var(--demo-text)] font-semibold">
              {WIDGET_META[node.activeTabId]?.title || node.activeTabId}
            </span>
          </div>
          <div>Tabs: [{node.tabIds.map((id) => WIDGET_META[id]?.title || id).join(', ')}]</div>
        </div>
      </div>
    )
  }

  // Split Node
  return (
    <div className="pl-2 border-l border-[var(--demo-line)] py-1">
      <div
        className="flex items-center gap-1.5 text-[10px] cursor-pointer hover:text-[var(--demo-text)]"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3 text-[var(--demo-muted)]" />
        ) : (
          <ChevronDown className="w-3 h-3 text-[var(--demo-muted)]" />
        )}
        <span className="text-[var(--demo-muted)] font-semibold font-mono">Split</span>
        <span className="text-[var(--demo-muted)] text-[9px] font-mono">
          ({node.direction}, {Math.round(node.splitPercentage)}%)
        </span>
      </div>

      {!collapsed && (
        <div className="mt-1 space-y-1 border-l border-dashed border-[var(--demo-line-soft)]/50 ml-1.5">
          <div className="pl-2">
            <div className="text-[8px] text-[var(--demo-muted)] uppercase font-bold tracking-wider mb-0.5">
              first
            </div>
            <RecursiveTreeVisualizer
              node={node.first}
              hoveredPaneId={hoveredPaneId}
              setHoveredPaneId={setHoveredPaneId}
              controller={controller}
            />
          </div>
          <div className="pl-2">
            <div className="text-[8px] text-[var(--demo-muted)] uppercase font-bold tracking-wider mb-0.5">
              second
            </div>
            <RecursiveTreeVisualizer
              node={node.second}
              hoveredPaneId={hoveredPaneId}
              setHoveredPaneId={setHoveredPaneId}
              controller={controller}
            />
          </div>
        </div>
      )}
    </div>
  )
}
