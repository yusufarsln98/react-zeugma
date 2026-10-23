'use client'

import type { RenderCounterBadgeProps } from './types'
import { useRenderCounter } from './use-render-counter'

/**
 * A badge displaying mount and render counters for debugging component lifecycles.
 */
export function RenderCounterBadge({
  id,
  className,
  style,
  logToConsole = false,
  disabled = false,
}: RenderCounterBadgeProps) {
  const { mounts, renders } = useRenderCounter(id, { logToConsole, disabled })

  if (disabled) {
    return null
  }

  return (
    <div className={className} style={style}>
      <span>
        M: <strong>{mounts}</strong>
      </span>
      <span>|</span>
      <span>
        R: <strong>{renders}</strong>
      </span>
    </div>
  )
}
