import { ReactNode, Dispatch, SetStateAction, RefObject } from 'react'

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

export interface RenderTabProps extends TabDetails {
  /** Whether this tab is currently being dragged. */
  isDragging: boolean
  /** Whether another dragged item is hovering over this tab. */
  isOver: boolean
  /** Callback to select/activate this tab. */
  onSelect: () => void
  /** Callback to close/remove this tab. */
  onRemove: () => void
  /** [Experimental] Whether this tab is popped out in a separate window. */
  isPoppedOut: boolean
  /** [Experimental] Popout this tab. */
  popout: () => void
  /** [Experimental] Dock this tab back. */
  dock: () => void
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

export interface ZeugmaStateSetters {
  /** Updates the layout tree. Also resets transient states like fullscreenPaneId. */
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  /** Programmatically sets the fullscreen pane ID. */
  setFullscreenPaneId: (paneId: string | null) => void
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>
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

export interface ZeugmaController
  extends ZeugmaState, ZeugmaStateSetters, ZeugmaActions, ZeugmaQueries {}

export interface ZeugmaControllerInternal extends ZeugmaController {
  // Transient drag-and-drop/resize state
  _internalSetLayout: Dispatch<SetStateAction<TreeNode | null>>
  renderingLayout: TreeNode | null
  activeId: string | null
  setActiveId: Dispatch<SetStateAction<string | null>>
  activeType: 'pane' | 'tab' | null
  setActiveType: Dispatch<SetStateAction<'pane' | 'tab' | null>>
  dismissIntentId: string | null
  setDismissIntentId: Dispatch<SetStateAction<string | null>>
  containerRef: RefObject<HTMLElement | null>
  setContainerRef: (element: HTMLElement | null) => void
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

export interface BaseZeugmaProps {
  /** The Zeugma Controller returned by useZeugma() */
  controller: ZeugmaController
  /** Custom overlay renderer function used to customize the cursor-following drag preview for an active pane or tab. */
  renderDragOverlay?: (active: DragOverlayActiveItem) => ReactNode
  /** Optional CSS class name mapping overrides for custom styles of components like panes, drop previews, overlays, etc. */
  classNames?: ZeugmaClassNames
  /** Size/thickness of the split handle resizer bars in pixels. */
  resizerSize?: number

  /** Minimum pixel distance that a user must drag a pane handle before dragging triggers. Defaults to 8. */
  dragActivationDistance?: number
  /** Threshold value in pixels for snapping layout resizing handles to adjacent edges. Defaults to 8. */
  snapThreshold?: number
  /** Minimum split percentage allowed when resizing split panes. Defaults to 5. */
  minSplitPercentage?: number
  /** Maximum split percentage allowed when resizing split panes. Defaults to 95. */
  maxSplitPercentage?: number
  /** Whether dragging a pane far enough outside the container triggers a drag-out/dismiss action. Defaults to false. */
  enableDragToDismiss?: boolean
  /** The threshold in pixels beyond the container boundaries required to activate the drag-out/dismiss action. Defaults to 60. */
  dismissThreshold?: number

  /** Callback triggered when a pane is removed from the dashboard layout tree. */
  onRemove?: (paneId: string) => void
  /** Callback triggered when dragging starts for a pane. */
  onDragStart?: (activeId: string) => void
  /** Callback triggered when dragging ends, providing details on target pane and drop action (split or move). */
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  /** Callback triggered when the user starts dragging a resizing handle between split panes. */
  onResizeStart?: (currentNode: SplitNode) => void
  /** Callback triggered continuously while the user is dragging a resizing handle. Passes the new split percentage. */
  onResize?: (currentNode: SplitNode, percentage: number) => void
  /** Callback triggered when the user stops dragging a resizing handle. Passes the final split percentage. */
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  /** Callback triggered when the drag-out/dismiss intent changes. */
  onDismissIntentChange?: (paneId: string | null) => void

  /** Configuration for layout persistence in localStorage. */
  persist?: boolean | ZeugmaPersistOptions
  /** [Experimental] Optional custom wrapper element/component to wrap the contents of a popout tab.
   * Useful for styled-components (StyleSheetManager), Antd (ConfigProvider), etc.
   */
  renderPopoutWrapper?: (props: {
    tabId: string
    document: Document
    window: Window
    children: React.ReactNode
  }) => React.ReactNode
  /** [Experimental] Optional custom renderer for the placeholder shown in a pane when its active tab is popped out into a new window. */
  renderPopoutPlaceholder?: (props: PopoutPlaceholderProps) => ReactNode
}

export interface ZeugmaPersistOptions {
  /** Whether to enable persistence. Defaults to true if the object is provided. */
  enabled?: boolean
  /** The key used for localStorage persistence. Defaults to 'zeugma-layout'. */
  key?: string
}

export type ZeugmaProps =
  | (BaseZeugmaProps & {
      children?: never
      /** Render function mapping unique pane nodes to React elements. Usually renders a <Pane> wrapper. */
      renderPane: (paneId: string) => ReactNode
    })
  | (BaseZeugmaProps & {
      children: ReactNode
      /** In Provider Mode, renderPane is not accepted on <Zeugma> and MUST be passed directly to <PaneTree>. */
      renderPane?: never
    })

/**
 * State context — holds reactive values that change during runtime.
 * All consumers of this context will re-render when any of these values change.
 */
/**
 * State context — holds reactive values that change during runtime.
 * All consumers of this context will re-render when any of these values change.
 */
export interface ZeugmaStateValue extends ZeugmaState, ZeugmaQueries {
  /** Callback to update the layout tree. */
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  /** The transient layout tree used for rendering on screen. During drag-and-drop, this has the dragged item removed. */
  renderingLayout: TreeNode | null
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>
  /** Normalized or overridden CSS classes for custom layout styling. */
  classNames: ZeugmaClassNames
  /** Render function mapping unique pane nodes to React elements. */
  renderPane?: (paneId: string) => ReactNode
  /** Size/thickness of the split handle resizer bars in pixels. */
  resizerSize?: number

  // Drag-and-drop orchestration state exposed publicly
  /** The ID of the active dragged item (pane or tab). */
  activeId: string | null
  /** The type of the active dragged item ('pane' | 'tab'). */
  activeType: 'pane' | 'tab' | null
  /** The ID of the item with active dismiss intent, or null. */
  dismissIntentId: string | null

  // Drag-and-drop orchestration state and refs
  setContainerRef: (element: HTMLElement | null) => void
  onRemove?: (paneId: string) => void
  onFullscreenChange?: (paneId: string | null) => void
  snapThreshold?: number
  onResizeStart?: (currentNode: SplitNode) => void
  onResize?: (currentNode: SplitNode, percentage: number) => void
  onResizeEnd?: (currentNode: SplitNode, percentage: number) => void
  minSplitPercentage?: number
  maxSplitPercentage?: number
  /** [Experimental] Query function to check if a tab is popped out. */
  isTabPoppedOut: (tabId: string) => boolean
  /** [Experimental] Optional custom wrapper to wrap the contents of a popout tab. */
  renderPopoutWrapper?: (props: {
    tabId: string
    document: Document
    window: Window
    children: React.ReactNode
  }) => React.ReactNode
  /** [Experimental] Optional custom renderer for the placeholder shown in a pane when its active tab is popped out into a new window. */
  renderPopoutPlaceholder?: (props: PopoutPlaceholderProps) => ReactNode
}

export interface ZeugmaDragStateValue {
  /** The ID of the tab currently hovered over during a tab drag, or null. */
  overTabId: string | null
  /** The position of the tab drop preview relative to the hovered tab ('before' | 'after'). */
  overTabPosition: 'before' | 'after' | null
}

/**
 * Actions context — holds stable dispatch functions with permanent identity.
 * Consumers of only this context will never re-render from layout/drag state changes.
 */
export interface ZeugmaActionsValue extends ZeugmaActions {
  /** Programmatically sets the fullscreen pane ID. */
  setFullscreenPaneId: (paneId: string | null) => void
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>
}

export interface PortalRegistryValue {
  registerPortalTarget: (
    tabId: string,
    el: HTMLDivElement | null,
    expectedEl?: HTMLDivElement | null,
  ) => void
  registerRenderCallback: (tabId: string, render: (tab: TabDetails) => ReactNode) => void
  renderCallbacksRef: RefObject<Record<string, (tab: TabDetails) => ReactNode>>
  registerRenderPane?: (render: (paneId: string) => ReactNode) => void
  renderPaneRef?: RefObject<((paneId: string) => ReactNode) | null>
  registerTabHeader?: (
    tabId: string,
    render: (props: { isDragging: boolean; isOver: boolean }) => ReactNode,
  ) => void
  tabHeadersRef?: RefObject<
    Record<string, (props: { isDragging: boolean; isOver: boolean }) => ReactNode>
  >
  activeIdRef?: RefObject<string | null>
  registerPopoutTarget?: (tabId: string, el: HTMLDivElement | null) => void
}
