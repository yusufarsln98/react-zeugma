import { describe, it, expect } from 'vitest'
import {
  getPointerCoordinates,
  resolvePointer,
  getTabDropPosition,
  distanceOutsideRect,
} from './pointer'

describe('DnD pointer utilities', () => {
  it('extracts coordinates from PointerEvent/MouseEvent', () => {
    const mouseEvt = new MouseEvent('mousemove', { clientX: 120, clientY: 240 })
    expect(getPointerCoordinates(mouseEvt)).toEqual({ x: 120, y: 240 })
  })

  it('resolves pointer position considering delta or latest pointer ref', () => {
    expect(resolvePointer(undefined, undefined, { x: 50, y: 60 })).toEqual({ x: 50, y: 60 })

    const mouseEvt = new MouseEvent('mousemove', { clientX: 10, clientY: 20 })
    expect(resolvePointer(mouseEvt, { x: 5, y: -5 }, null)).toEqual({ x: 15, y: 15 })
  })

  it('determines before or after position relative to rect center', () => {
    const rect = { left: 100, width: 200 } // center = 200
    expect(getTabDropPosition(rect, 150)).toBe('before')
    expect(getTabDropPosition(rect, 250)).toBe('after')
    expect(getTabDropPosition(rect, null)).toBe('before')
  })

  it('calculates distance outside boundary rectangle', () => {
    const rect = { left: 10, right: 100, top: 20, bottom: 200 }

    // Inside rect: distance 0
    expect(distanceOutsideRect({ x: 50, y: 100 }, rect)).toBe(0)

    // Left of rect by 10px
    expect(distanceOutsideRect({ x: 0, y: 100 }, rect)).toBe(10)

    // Diagonal offset: dx=3, dy=4 -> distance=5
    expect(distanceOutsideRect({ x: 7, y: 16 }, rect)).toBe(5)
  })
})
