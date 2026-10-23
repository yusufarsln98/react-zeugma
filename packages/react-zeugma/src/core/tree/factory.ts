import { PaneNode } from '../types'

export function generateUniqueId(): string {
  return 'pane-' + Math.random().toString(36).substring(2, 11)
}

export function compactMetadata(
  metadata: Record<string, Record<string, unknown>> | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (!metadata) return undefined
  return Object.keys(metadata).length > 0 ? metadata : undefined
}

export function createPane(
  tabId: string,
  metadata?: Record<string, unknown>,
  id: string = generateUniqueId(),
): PaneNode {
  return {
    type: 'pane',
    id,
    tabIds: [tabId],
    activeTabId: tabId,
    tabsMetadata: metadata ? { [tabId]: metadata } : undefined,
  }
}
