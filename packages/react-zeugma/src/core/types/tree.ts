declare global {
  interface Window {
    __zeugmaActivePopoutDocument?: Document | null
    __zeugmaCleanup?: () => void
  }
}

export type SplitDirection = 'row' | 'column'

export interface SplitNode {
  type: 'split'
  direction: SplitDirection
  first: TreeNode
  second: TreeNode
  splitPercentage: number
}

export interface PaneNode {
  type: 'pane'
  id: string
  tabIds: string[]
  activeTabId: string
  locked?: boolean
  tabsMetadata?: Record<string, Record<string, unknown>>
}

export type TreeNode = SplitNode | PaneNode

export interface TabDetails {
  id: string
  paneId: string
  isActive: boolean
  index: number
  metadata: Record<string, unknown> | undefined
}

export interface UseZeugmaOptions {
  /** Initial layout tree model defining pane organization for uncontrolled mode. Only used on initial mount. */
  initialLayout?: TreeNode | null
  /** Controlled layout tree model. If provided, the hook will run in controlled mode and sync with this value. */
  layout?: TreeNode | null
  /** Callback triggered when the layout changes via drag-and-drop actions, splits, moves, or resizes. */
  onChange?: (newLayout: TreeNode | null) => void
  /** The ID of the pane that is currently taking up the full dashboard area. Null if no pane is fullscreen. */
  fullscreenPaneId?: string | null
  /** Callback triggered when a pane is toggled to/from fullscreen mode. Passes the active fullscreen paneId or null. */
  onFullscreenChange?: (paneId: string | null) => void
  /** Whether the layout is locked. When locked, resizing, dragging, and dropping are disabled. */
  locked?: boolean
}

export interface ZeugmaState {
  /** The current active layout tree structure, or null if empty. */
  layout: TreeNode | null
  /** The ID of the pane currently zoomed to fullscreen, or null. */
  fullscreenPaneId: string | null
  /** Whether the layout is globally locked. */
  locked: boolean
  /** [Experimental] The list of tab/widget IDs that are currently open in a new window. */
  poppedOutTabIds: string[]
}

export interface ZeugmaActions {
  /** Removes the specified pane or widget from the layout tree and collapses its parent split. */
  removePane: (paneId: string) => void
  /** Appends a tab into a target pane node, or splits/creates a new pane if no target pane ID is provided. */
  addTab: (tabId: string, targetPaneId?: string, metadata?: Record<string, unknown>) => void
  /** Stable callback to update the locked status of a specific pane in the layout tree. */
  updatePaneLock: (paneId: string, locked: boolean) => void
  /** Stable callback to activate a tab within a pane. */
  selectTab: (paneId: string, tabId: string) => void
  /** Stable callback to merge a dragged tab/pane into another pane's tab list. */
  mergeTab: (draggedTabId: string, targetPaneId: string) => void
  /** Stable callback to remove/close a specific tab from the layout. */
  removeTab: (tabId: string) => void
  /** Splits an existing pane and adds a new one. */
  splitPane: (
    targetId: string,
    direction: SplitDirection,
    splitType: 'left' | 'right' | 'top' | 'bottom',
    paneToAdd: string,
  ) => void
  /** Updates the split percentage of a split node. */
  updateSplitPercentage: (currentNode: SplitNode, percentage: number) => void
  /** Moves/reorders a tab relative to another target tab. */
  moveTab: (
    draggedTabId: string,
    targetTabId: string,
    position?: 'before' | 'after' | 'center',
  ) => void
  /** [Experimental] Popout the specified tab into a new window. */
  popoutTab: (tabId: string) => void
  /** [Experimental] Dock the specified tab back to the main layout. */
  dockTab: (tabId: string) => void
}

export interface ZeugmaQueries {
  /** Find a PaneNode or WidgetNode by its ID in the layout tree. */
  findPaneById: (paneId: string) => PaneNode | null
  /** Find the PaneNode containing the given tab ID in the layout tree. */
  findPaneContainingTab: (tabId: string) => PaneNode | null
  /** Find the details of a tab by its ID in the layout tree. */
  findTabById: (tabId: string) => TabDetails | null
  /** Get the metadata for a specific tab by its ID. */
  getTabMetadata: (tabId: string) => Record<string, unknown> | undefined
  /** Get the metadata of the active tab in a specific pane by the pane ID. */
  getActiveTabMetadata: (paneId: string) => Record<string, unknown> | undefined
}

export interface ZeugmaClassNames {
  /** CSS class applied to the root dashboard container. */
  dashboard?: string
  /** CSS class applied to the root dashboard container when a drag-out dismiss is active. */
  dashboardDismissActive?: string
  /** CSS class applied to the outer container div of each `<Pane>`. */
  pane?: string
  /** CSS class applied to the pane container when locked. */
  paneLocked?: string
  /** CSS class applied to drop zone indicators when hovering over layout edges to split a pane. */
  dropPreview?: string
  /** CSS class applied to root split drop zone preview. */
  rootDropPreview?: string
  /** CSS class applied to the custom cursor-following drag preview portal wrapper. */
  dragOverlay?: string
  /** CSS class applied to the pane drag preview wrapper. */
  paneDragPreview?: string
  /** CSS class applied to the tab drag preview wrapper. */
  tabDragPreview?: string
  /** CSS class applied to the drag-to-resize split bar handles. */
  resizer?: string
  /** CSS class applied to the background dismiss zone indicator during a drag-out dismiss gesture. */
  dismissPreview?: string
  /** CSS class applied to root container when dashboard is globally locked. */
  dashboardLocked?: string
  /** CSS class applied to drop zone indicator when hovering over a locked pane. */
  lockedPreview?: string
  /** CSS class applied to drop zone indicator when hovering over a locked pane. */
  tabDropPreview?: string
  /** CSS class applied to the drop zone indicator when hovering over a pane's center swap zone. */
  swapPreview?: string
  /** CSS class applied to the separator line between tabs. */
  tabSeparator?: string
  /** CSS class applied to the wrapper element for a tab's contents. */
  tabContentWrapper?: string
  /** CSS class applied to the tabs container div. */
  tabsContainer?: string
  /** CSS class applied to individual tabs (as static string or dynamic callback). */
  tab?: string | ((tabId: string) => string)
  /** CSS class applied to the pane inner container (containing header and content). */
  paneContainer?: string
  /** CSS class applied to the pane header bar. */
  paneHeader?: string
  /** CSS class applied to the pane controls wrapper. */
  paneControls?: string
  /** CSS class applied to the pane buttons (maximize/close). */
  paneButton?: string
  /** CSS class applied to the default tab close button. */
  tabCloseButton?: string
  /** CSS class applied to the drag handle. */
  dragHandle?: string
  /** CSS class applied to the popout placeholder wrapper when a tab is popped out. */
  popoutPlaceholder?: string
}

export interface PopoutPlaceholderProps {
  /** The unique ID of the tab that is popped out into a new window. */
  tabId: string
  /** Callback to dock the tab back into the main layout. */
  dock: () => void
}

export interface DragOverlayActiveItem {
  type: 'tab' | 'pane'
  id: string
  isDismissing: boolean
}

export interface ZeugmaPersistOptions {
  /** Whether to enable persistence. Defaults to true if the object is provided. */
  enabled?: boolean
  /** The key used for localStorage persistence. Defaults to 'zeugma-layout'. */
  key?: string
}
