import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useShallowStable } from './useShallowStable'

describe('useShallowStable hook', () => {
  it('returns same reference for shallowly equal objects across renders', () => {
    const { result, rerender } = renderHook(({ val }) => useShallowStable(val), {
      initialProps: { val: { a: 1, b: 'two' } },
    })

    const firstRef = result.current

    // Re-render with new object reference with identical contents
    rerender({ val: { a: 1, b: 'two' } })
    expect(result.current).toBe(firstRef)
  })

  it('updates reference when any key value changes', () => {
    const { result, rerender } = renderHook(({ val }) => useShallowStable(val), {
      initialProps: { val: { swapPreview: 'preview-1', tabContentWrapper: 'wrapper-1' } },
    })

    const firstRef = result.current

    rerender({ val: { swapPreview: 'preview-2', tabContentWrapper: 'wrapper-1' } })
    expect(result.current).not.toBe(firstRef)
    expect(result.current.swapPreview).toBe('preview-2')
  })

  it('updates reference when keys are added or removed', () => {
    const { result, rerender } = renderHook(
      ({ val }: { val: Record<string, unknown> }) => useShallowStable(val),
      { initialProps: { val: { a: 1 } as Record<string, unknown> } },
    )

    const firstRef = result.current

    rerender({ val: { a: 1, b: 2 } })
    expect(result.current).not.toBe(firstRef)

    const secondRef = result.current

    rerender({ val: { a: 1 } })
    expect(result.current).not.toBe(secondRef)
  })

  it('handles undefined or null correctly', () => {
    const { result, rerender } = renderHook(
      ({ val }: { val: Record<string, unknown> | undefined }) => useShallowStable(val),
      { initialProps: { val: undefined as Record<string, unknown> | undefined } },
    )

    expect(result.current).toBeUndefined()

    rerender({ val: { a: 1 } })
    expect(result.current).toEqual({ a: 1 })
  })
})
