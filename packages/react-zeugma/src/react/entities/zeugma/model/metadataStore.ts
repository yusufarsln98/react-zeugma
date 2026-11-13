import { TreeNode } from '../../../shared'

export type MetadataUpdater =
  | Record<string, unknown>
  | ((prev: Record<string, unknown> | undefined) => Record<string, unknown> | undefined)

export interface MetadataStore {
  get: (tabId: string) => Record<string, unknown> | undefined
  set: (tabId: string, metadata: Record<string, unknown> | undefined) => void
  update: (tabId: string, updater: MetadataUpdater) => void
  delete: (tabId: string) => void
  resetFromTree: (tree: TreeNode | null) => void
  syncFromTree: (tree: TreeNode | null) => void
  pruneMissingTabs: (tree: TreeNode | null) => void
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
export function createMetadataStore(initialTree: TreeNode | null = null): MetadataStore {
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

  function resetFromTree(tree: TreeNode | null) {
    const { metadataMap } = collectTreeMetadata(tree)
    const affectedTabIds = new Set<string>([...values.keys(), ...metadataMap.keys()])

    values.clear()
    for (const [tabId, meta] of metadataMap) {
      values.set(tabId, meta)
    }

    for (const tabId of affectedTabIds) {
      notify(tabId)
    }
  }

  function syncFromTree(tree: TreeNode | null) {
    const { tabIds, metadataMap } = collectTreeMetadata(tree)

    for (const existingId of Array.from(values.keys())) {
      if (!tabIds.has(existingId)) {
        del(existingId)
      }
    }

    for (const [tabId, meta] of metadataMap) {
      if (!values.has(tabId)) {
        set(tabId, meta)
      }
    }
  }

  function pruneMissingTabs(tree: TreeNode | null) {
    const { tabIds } = collectTreeMetadata(tree)
    for (const existingId of Array.from(values.keys())) {
      if (!tabIds.has(existingId)) {
        del(existingId)
      }
    }
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

  if (initialTree) {
    const { metadataMap } = collectTreeMetadata(initialTree)
    for (const [tabId, meta] of metadataMap) {
      values.set(tabId, meta)
    }
  }

  return {
    get: (tabId: string) => values.get(tabId),
    set,
    update,
    delete: del,
    resetFromTree,
    syncFromTree,
    pruneMissingTabs,
    subscribe,
  }
}
