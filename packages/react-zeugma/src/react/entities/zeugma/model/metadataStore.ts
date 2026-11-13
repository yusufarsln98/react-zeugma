import { TreeNode, TabMetadataMap } from '../../../shared'

export type MetadataUpdater =
  | Record<string, unknown>
  | ((prev: Record<string, unknown> | undefined) => Record<string, unknown> | undefined)

export interface MetadataStore {
  get: (tabId: string) => Record<string, unknown> | undefined
  getAll: () => TabMetadataMap
  set: (tabId: string, metadata: Record<string, unknown> | undefined) => void
  update: (tabId: string, updater: MetadataUpdater) => void
  delete: (tabId: string) => void
  resetFromTree: (tree: TreeNode | null, nextMetadata?: TabMetadataMap) => string[]
  syncFromTree: (tree: TreeNode | null) => string[]
  syncFromMap: (nextMap: TabMetadataMap, tree: TreeNode | null) => void
  pruneMissingTabs: (tree: TreeNode | null) => string[]
  subscribe: (tabId: string, listener: () => void) => () => void
}

function collectTreeMetadata(tree: TreeNode | null): {
  tabIds: Set<string>
  metadataMap: Map<string, Record<string, unknown>>
} {
  const tabIds = new Set<string>()
  const metadataMap = new Map<string, Record<string, unknown>>()

  function walk(node: TreeNode | null) {
    if (!node) return
    if (node.type === 'pane') {
      for (const tabId of node.tabIds) {
        tabIds.add(tabId)
        const meta = node.tabsMetadata?.[tabId]
        if (meta !== undefined) {
          metadataMap.set(tabId, meta)
        }
      }
      return
    }
    walk(node.first)
    walk(node.second)
  }

  walk(tree)
  return { tabIds, metadataMap }
}

/**
 * Creates a fine-grained, per-tab metadata store backed by `useSyncExternalStore`.
 * Updating a tab's metadata only notifies listeners subscribed to that specific `tabId`,
 * avoiding layout tree re-renders.
 */
export function createMetadataStore(
  initialTree: TreeNode | null = null,
  initialMetadata?: TabMetadataMap,
): MetadataStore {
  const values = new Map<string, Record<string, unknown>>()
  const listeners = new Map<string, Set<() => void>>()

  function notify(tabId: string) {
    const subs = listeners.get(tabId)
    if (!subs) return
    for (const listener of subs) {
      listener()
    }
  }

  function set(tabId: string, metadata: Record<string, unknown> | undefined) {
    const prev = values.get(tabId)
    if (prev === metadata) return

    if (metadata === undefined) {
      if (!values.has(tabId)) return
      values.delete(tabId)
    } else {
      values.set(tabId, metadata)
    }
    notify(tabId)
  }

  function update(tabId: string, updater: MetadataUpdater) {
    const prev = values.get(tabId)
    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
    set(tabId, next)
  }

  function del(tabId: string) {
    set(tabId, undefined)
  }

  function resetFromTree(tree: TreeNode | null, nextMetadata?: TabMetadataMap): string[] {
    const { tabIds, metadataMap } = collectTreeMetadata(tree)
    const removedTabIds: string[] = []

    for (const existingId of values.keys()) {
      if (!tabIds.has(existingId)) {
        removedTabIds.push(existingId)
      }
    }

    const nextEntries = new Map<string, Record<string, unknown>>()
    for (const [tabId, meta] of metadataMap) {
      nextEntries.set(tabId, meta)
    }
    if (nextMetadata) {
      for (const [tabId, meta] of Object.entries(nextMetadata)) {
        if (!tree || tabIds.has(tabId)) {
          nextEntries.set(tabId, meta)
        }
      }
    }

    const affectedTabIds = new Set<string>([...values.keys(), ...nextEntries.keys()])

    values.clear()
    for (const [tabId, meta] of nextEntries) {
      values.set(tabId, meta)
    }

    for (const tabId of affectedTabIds) {
      notify(tabId)
    }

    return removedTabIds
  }

  function syncFromTree(tree: TreeNode | null): string[] {
    const { tabIds, metadataMap } = collectTreeMetadata(tree)
    const removedTabIds: string[] = []

    for (const existingId of Array.from(values.keys())) {
      if (!tabIds.has(existingId)) {
        del(existingId)
        removedTabIds.push(existingId)
      }
    }

    for (const [tabId, meta] of metadataMap) {
      if (!values.has(tabId)) {
        set(tabId, meta)
      }
    }

    return removedTabIds
  }

  function syncFromMap(nextMap: TabMetadataMap, tree: TreeNode | null): void {
    const { tabIds } = collectTreeMetadata(tree)

    for (const existingId of Array.from(values.keys())) {
      const nextMeta = nextMap[existingId]
      if (nextMeta === undefined || (tree && !tabIds.has(existingId))) {
        del(existingId)
      }
    }

    for (const [tabId, meta] of Object.entries(nextMap)) {
      if (!tree || tabIds.has(tabId)) {
        set(tabId, meta)
      }
    }
  }

  function pruneMissingTabs(tree: TreeNode | null): string[] {
    const { tabIds } = collectTreeMetadata(tree)
    const removedTabIds: string[] = []
    for (const existingId of Array.from(values.keys())) {
      if (!tabIds.has(existingId)) {
        del(existingId)
        removedTabIds.push(existingId)
      }
    }
    return removedTabIds
  }

  function getAll(): TabMetadataMap {
    const snapshot: TabMetadataMap = {}
    for (const [tabId, meta] of values.entries()) {
      snapshot[tabId] = meta
    }
    return snapshot
  }

  function subscribe(tabId: string, listener: () => void) {
    let subs = listeners.get(tabId)
    if (!subs) {
      subs = new Set()
      listeners.set(tabId, subs)
    }
    subs.add(listener)

    return () => {
      const current = listeners.get(tabId)
      if (!current) return
      current.delete(listener)
      if (current.size === 0) {
        listeners.delete(tabId)
      }
    }
  }

  if (initialTree || initialMetadata) {
    const { tabIds, metadataMap } = collectTreeMetadata(initialTree)
    for (const [tabId, meta] of metadataMap) {
      values.set(tabId, meta)
    }
    if (initialMetadata) {
      for (const [tabId, meta] of Object.entries(initialMetadata)) {
        if (!initialTree || tabIds.has(tabId)) {
          values.set(tabId, meta)
        }
      }
    }
  }

  return {
    get: (tabId: string) => values.get(tabId),
    getAll,
    set,
    update,
    delete: del,
    resetFromTree,
    syncFromTree,
    syncFromMap,
    pruneMissingTabs,
    subscribe,
  }
}
