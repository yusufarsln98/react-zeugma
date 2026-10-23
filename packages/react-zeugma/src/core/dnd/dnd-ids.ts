import { DragType, RootSplitFraction, RootSplitEdge, SplitPosition } from '../types'

export const TAB_HEADER_PREFIX = 'tab-header-'
export const TAB_DROP_PREFIX = 'tab-drop-'
export const DROP_ROOT_PREFIX = 'drop-root-'
export const DROP_LOCKED_PREFIX = 'drop-locked-'
export const DROP_PREFIX = 'drop-'

export function tabHeaderId(tabId: string): string {
  return `${TAB_HEADER_PREFIX}${tabId}`
}

export function tabDropId(tabId: string): string {
  return `${TAB_DROP_PREFIX}${tabId}`
}

export function rootDropId(fraction: RootSplitFraction, edge: RootSplitEdge): string {
  return `${DROP_ROOT_PREFIX}${fraction}-${edge}`
}

export function lockedDropId(paneId: string): string {
  return `${DROP_LOCKED_PREFIX}${paneId}`
}

export function paneDropId(position: SplitPosition | 'center', paneId: string): string {
  return `${DROP_PREFIX}${position}-${paneId}`
}

export function tabTargetElementId(tabId: string): string {
  return `zeugma-tab-target-${tabId}`
}

export function popoutContainerElementId(tabId: string): string {
  return `zeugma-popout-container-${tabId}`
}

export function parseActiveId(rawId: string): { type: DragType; id: string } {
  if (rawId.startsWith(TAB_HEADER_PREFIX)) {
    return { type: 'tab', id: rawId.substring(TAB_HEADER_PREFIX.length) }
  }
  return { type: 'pane', id: rawId }
}

export type ParsedDropTarget =
  | { type: 'tab'; targetTabId: string }
  | { type: 'root'; fraction: RootSplitFraction; edge: RootSplitEdge }
  | { type: 'locked'; paneId: string }
  | { type: 'pane-edge'; position: SplitPosition; targetId: string }
  | { type: 'pane-center'; targetId: string }
  | { type: 'unknown'; rawId: string }

export function parseDropTarget(rawId: string | undefined | null): ParsedDropTarget {
  if (!rawId) return { type: 'unknown', rawId: '' }

  if (rawId.startsWith(TAB_DROP_PREFIX)) {
    return { type: 'tab', targetTabId: rawId.substring(TAB_DROP_PREFIX.length) }
  }

  if (rawId.startsWith(DROP_LOCKED_PREFIX)) {
    return { type: 'locked', paneId: rawId.substring(DROP_LOCKED_PREFIX.length) }
  }

  const rootMatch = rawId.match(/^drop-root-(1\/4|1\/3)-(top|bottom|left|right)$/)
  if (rootMatch) {
    const fraction = rootMatch[1] as RootSplitFraction
    const edge = rootMatch[2] as RootSplitEdge
    return { type: 'root', fraction, edge }
  }

  const match = rawId.match(/^drop-(left|right|top|bottom|center)-(.+)$/)
  if (match) {
    const position = match[1]
    const targetId = match[2]
    if (position === 'center') {
      return { type: 'pane-center', targetId }
    }
    return { type: 'pane-edge', position: position as SplitPosition, targetId }
  }

  return { type: 'unknown', rawId }
}
