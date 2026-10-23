import { ReactNode, Dispatch, SetStateAction, RefObject } from 'react'
import type {
  TreeNode,
  SplitNode,
  SplitDirection,
  TabDetails,
  ZeugmaState,
  ZeugmaActions,
  ZeugmaQueries,
  ZeugmaClassNames,
  PopoutPlaceholderProps,
  DragOverlayActiveItem,
  ZeugmaPersistOptions,
} from '../../../core/types'

export * from '../../../core/types'

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

export interface ZeugmaStateSetters {
  /** Updates the layout tree. Also resets transient states like fullscreenPaneId. */
  setLayout: Dispatch<SetStateAction<TreeNode | null>>
  /** Programmatically sets the fullscreen pane ID. */
  setFullscreenPaneId: (paneId: string | null) => void
  /** Programmatically updates the global locked status. */
  setLocked: Dispatch<SetStateAction<boolean>>
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
    children: ReactNode
  }) => ReactNode
  /** [Experimental] Optional custom renderer for the placeholder shown in a pane when its active tab is popped out into a new window. */
  renderPopoutPlaceholder?: (props: PopoutPlaceholderProps) => ReactNode
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
    children: ReactNode
  }) => ReactNode
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
