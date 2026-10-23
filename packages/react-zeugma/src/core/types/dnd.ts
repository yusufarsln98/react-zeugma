import { SplitDirection } from './tree'

export type DragType = 'tab' | 'pane'

export type SplitPosition = 'top' | 'bottom' | 'left' | 'right'

export type TabPosition = 'before' | 'after' | 'center'

export type RootSplitFraction = '1/4' | '1/3'

export type RootSplitEdge = 'top' | 'bottom' | 'left' | 'right'

export type DropAction = {
  type: 'split' | 'move'
  direction?: SplitDirection
  position?: SplitPosition | 'center'
}
