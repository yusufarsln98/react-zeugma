import type { SetStateAction } from 'react'

/**
 * Resolves a React SetStateAction value or updater function against previous state.
 */
export function resolveAction<T>(action: SetStateAction<T>, prev: T): T {
  return typeof action === 'function' ? (action as (prevState: T) => T)(prev) : action
}
