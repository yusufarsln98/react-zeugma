'use client'

import type { RenderCounterFooterProps } from './types'
import { useRenderCounter } from './use-render-counter'

/**
 * A container footer component for displaying mount and render counters at the bottom of widgets or panels.
 */
export function RenderCounterFooter({
  id,
  label,
  children,
  className,
  footerClassName,
  style,
  logToConsole = false,
  disabled = false,
}: RenderCounterFooterProps) {
  const displayId = label || id || 'widget'
  const { mounts, renders } = useRenderCounter(id, { logToConsole, disabled })

  if (disabled) {
    return <>{children}</>
  }

  return (
    <div className={className} style={style}>
      {children && (
        <div
          style={{
            flex: 1,
            height: '100%',
            width: '100%',
            minHeight: 0,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {children}
        </div>
      )}
      <div className={footerClassName}>
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {displayId}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            Mounts: <strong className="counter-mounts">{mounts}</strong>
          </span>
          <span>|</span>
          <span>
            Renders: <strong className="counter-renders">{renders}</strong>
          </span>
        </div>
      </div>
    </div>
  )
}
