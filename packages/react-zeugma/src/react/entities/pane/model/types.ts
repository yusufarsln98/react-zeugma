export interface BaseLeafRenderProps {
  /** True if the leaf is actively being dragged. */
  isDragging: boolean
  /** True if the leaf currently occupies the fullscreen view. */
  isFullscreen: boolean
  /** Toggles the leaf to and from fullscreen/zoomed mode. */
  toggleFullscreen: () => void
  /** Closes and removes the leaf from the layout tree. */
  remove: () => void
  /** The metadata values associated with this leaf, or undefined. */
  metadata: Record<string, unknown> | undefined
  /** True if this specific leaf or the dashboard globally is locked. */
  locked: boolean
}

export interface PaneRenderProps extends BaseLeafRenderProps {
  // Tabulation extensions:
  /** The array of tab IDs in this pane. */
  tabIds: string[]
  /** The currently active tab ID. */
  activeTabId: string
  /** Selects a specific tab to make it active. */
  selectTab: (tabId: string) => void
  /** Removes/closes a specific tab. */
  removeTab: (tabId: string) => void
  /** The metadata values associated with all tabs in this pane. */
  tabsMetadata: Record<string, Record<string, unknown>> | undefined
  /** Whether the active tab is popped out into a new window. */
  isActiveTabPoppedOut: boolean
  /** Popout the active tab (or a specific tab) into a new window. */
  popoutTab: (tabId?: string) => void
  /** Dock the active tab (or a specific tab) back to the main layout. */
  dockTab: (tabId?: string) => void
}
