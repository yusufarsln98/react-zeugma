import { useRef } from 'react'

function shallowEqual(
  objA: Record<string, unknown> | undefined | null,
  objB: Record<string, unknown> | undefined | null,
): boolean {
  if (Object.is(objA, objB)) return true
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) return false

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i]
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false
    }
  }

  return true
}

/**
 * Returns a stable object reference across renders if the shallow keys and values have not changed.
 */
export function useShallowStable<T extends object | undefined | null>(value: T): T {
  const ref = useRef<T>(value)

  if (!shallowEqual(ref.current as Record<string, unknown>, value as Record<string, unknown>)) {
    ref.current = value
  }

  return ref.current
}
