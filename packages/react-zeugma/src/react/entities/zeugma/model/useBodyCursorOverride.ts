import { useEffect } from 'react'

/**
 * Overrides body cursor style when drag/hover operations require a specific global cursor.
 */
export function useBodyCursorOverride(isOverLocked: boolean) {
  useEffect(() => {
    if (isOverLocked) {
      document.body.style.setProperty('cursor', 'not-allowed', 'important')
    } else {
      document.body.style.removeProperty('cursor')
    }
    return () => {
      document.body.style.removeProperty('cursor')
    }
  }, [isOverLocked])
}
