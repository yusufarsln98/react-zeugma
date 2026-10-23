/**
 * react-zeugma — core (framework-agnostic)
 *
 * Recursive layout tree data structures, immutable tree mutators and queries,
 * bounding-box layout calculation, drop-target resolution, pointer drag
 * sessions, and cross-window popout utilities.
 *
 * This module has zero dependency on React or any UI framework.
 * React users: see `react-zeugma/react` for `<Zeugma>`, `<PaneTree>`, `<Pane>`,
 * `useZeugma`, `useZeugmaContext`, `usePaneContext`, and `useResizer`.
 */

export {
  generateUniqueId,
  removePane,
  removeTab,
  splitPane,
  insertLeaf,
  addTab,
  updateSplitPercentage,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  swapTabs,
  movePaneTabs,
  computeLayout,
  calculateTabDropIndex,
  isValidTreeNode,
} from './tree'

export type { ComputedPane, ComputedSplitter } from './tree'

export type {
  SplitDirection,
  SplitNode,
  PaneNode,
  TreeNode,
  TabDetails,
  UseZeugmaOptions,
  ZeugmaState,
  ZeugmaActions,
  ZeugmaQueries,
  ZeugmaClassNames,
  PopoutPlaceholderProps,
  DragOverlayActiveItem,
  ZeugmaPersistOptions,
  DragType,
  SplitPosition,
  TabPosition,
  RootSplitFraction,
  RootSplitEdge,
  DropAction,
} from './types'
