/**
 * react-zeugma/react
 *
 * React bindings on top of the framework-agnostic react-zeugma core.
 * Exposes `<Zeugma>`, `<PaneTree>`, `<Pane>`, `useZeugma`, `useZeugmaContext`,
 * `usePaneContext`, `useResizer`, and render counter devtools components.
 */

export { Zeugma } from './entities/zeugma'
export type {
  ZeugmaProps,
  ZeugmaClassNames,
  UseZeugmaOptions,
  ZeugmaController,
  TreeNode,
  SplitNode,
  PaneNode,
  TabDetails,
  RenderTabProps,
  SplitDirection,
  DragOverlayActiveItem,
} from './shared'
export { useZeugma, useZeugmaContext } from './entities/zeugma'
export { useResizer } from './features/resize-pane'
export { PaneTree } from './widgets/pane-tree'
export { Pane, usePaneContext } from './entities/pane'
export type {
  PaneProps,
  PaneContentProps,
  PopoutPlaceholderProps,
  DragHandleProps,
  PaneRenderProps,
  TabsProps,
  PaneControlsProps,
} from './entities/pane'
export { useRenderCounter, RenderCounterBadge, RenderCounterFooter } from './devtools'
export type {
  RenderCounterOptions,
  RenderCounterState,
  RenderCounterBadgeProps,
  RenderCounterFooterProps,
} from './devtools'
