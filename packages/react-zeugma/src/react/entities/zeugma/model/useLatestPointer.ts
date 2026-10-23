import { useEffect, useRef } from 'react'

/**
 * Tracks the latest pointer coordinate relative to the viewport during dragging.
 */
export function useLatestPointer(activeId: string | null) {
  const latestPointerRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!activeId) {
      latestPointerRef.current = null
      return
    }

    const handlePointerMove = (e: PointerEvent) => {
      latestPointerRef.current = { x: e.clientX, y: e.clientY }
    }

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0] || e.changedTouches[0]
      if (touch) {
        latestPointerRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [activeId])

  return latestPointerRef
}
