import { PaneNode } from '../types'

export function generateUniqueId(): string {
  return 'pane-' + Math.random().toString(36).substring(2, 11)
}

export function createPane(tabId: string, id: string = generateUniqueId()): PaneNode {
  return {
    type: 'pane',
    id,
    tabIds: [tabId],
    activeTabId: tabId,
  }
}
