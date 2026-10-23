'use client'

import { useRef, useEffect, useState, useCallback, useId } from 'react'
import type { RenderCounterOptions, RenderCounterState } from './types'
import {
  getCounterRecord,
  subscribeCounter,
  notifyCounter,
  resetCounterRecord,
} from '../../core/devtools'

/**
 * A React hook that tracks component mount and render counts in a React 18/19 StrictMode safe manner.
 * Supports optional global ID sharing, console logging, and manual reset.
 */
export function useRenderCounter(
  idOrOptions?: string | RenderCounterOptions,
  maybeOptions?: RenderCounterOptions,
): RenderCounterState {
  const defaultAutoId = useId()

  const options: RenderCounterOptions =
    typeof idOrOptions === 'string' ? { id: idOrOptions, ...maybeOptions } : idOrOptions || {}

  const { id = defaultAutoId, logToConsole = false, disabled = false } = options

  const renderCountRef = useRef<number>(0)
  const isMountedRef = useRef<boolean>(false)
  const [, forceUpdate] = useState<number>(0)

  if (!disabled) {
    renderCountRef.current += 1
  }

  useEffect(() => {
    if (disabled) return

    const unsubscribe = subscribeCounter(id, () => {
      forceUpdate((c) => c + 1)
    })

    const record = getCounterRecord(id)
    record.mounts += 1
    isMountedRef.current = true

    if (logToConsole) {
      console.log(
        `[DevTools:${id}] Mounted: ${record.mounts} | Rendered: ${renderCountRef.current}`,
      )
    }

    notifyCounter(id)

    return () => {
      isMountedRef.current = false
      unsubscribe()
    }
  }, [id, disabled, logToConsole])

  if (!disabled) {
    const record = getCounterRecord(id)
    record.renders = Math.max(record.renders, renderCountRef.current)
  }

  const reset = useCallback(() => {
    renderCountRef.current = 0
    resetCounterRecord(id)
  }, [id])

  if (disabled) {
    return { mounts: 0, renders: 0, reset }
  }

  const record = getCounterRecord(id)

  return {
    mounts: record.mounts,
    renders: renderCountRef.current,
    reset,
  }
}
