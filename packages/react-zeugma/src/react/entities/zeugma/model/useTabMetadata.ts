'use client'

import { useContext, useCallback, useSyncExternalStore } from 'react'
import { ZeugmaMetadataContext } from '../../../shared'

/**
 * Subscribe to live metadata updates for a specific tab ID.
 * Only re-renders the calling component when that specific tab's metadata changes.
 */
export function useTabMetadata(tabId: string): Record<string, unknown> | undefined {
  const metadataContext = useContext(ZeugmaMetadataContext)

  const subscribe = useCallback(
    (listener: () => void) => {
      if (!metadataContext) return () => {}
      return metadataContext.subscribeTabMetadata(tabId, listener)
    },
    [metadataContext, tabId],
  )

  const getSnapshot = useCallback(
    () => metadataContext?.getTabMetadata(tabId),
    [metadataContext, tabId],
  )

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
