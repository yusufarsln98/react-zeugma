import { describe, it, expect } from 'vitest'
import { resolveDrop } from './resolve-drop'
import type { PaneNode, SplitNode } from '../types'

describe('resolveDrop pure resolver', () => {
  const layout: SplitNode = {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'p1',
      tabIds: ['t1'],
      activeTabId: 't1',
    },
    second: {
      type: 'pane',
      id: 'p2',
      tabIds: ['t2', 't3'],
      activeTabId: 't2',
    },
  }

  it('returns null when target is locked or unknown', () => {
    expect(
      resolveDrop({
        layout,
        activeType: 'tab',
        draggingId: 't1',
        target: { type: 'locked', paneId: 'p2' },
      }),
    ).toBeNull()

    expect(
      resolveDrop({
        layout,
        activeType: 'tab',
        draggingId: 't1',
        target: { type: 'unknown', rawId: 'unknown' },
      }),
    ).toBeNull()
  })

  it('handles tab reorder drop', () => {
    const result = resolveDrop({
      layout,
      activeType: 'tab',
      draggingId: 't1',
      target: { type: 'tab', targetTabId: 't2' },
      overTabPosition: 'after',
    })

    expect(result).not.toBeNull()
    expect(result?.overId).toBe('t2')
    expect(result?.dropAction).toEqual({ type: 'move', position: 'center' })
    const p2 = result?.newLayout as PaneNode
    expect(p2.tabIds).toEqual(['t2', 't1', 't3'])
  })

  it('handles root drop splitting entire layout', () => {
    const result = resolveDrop({
      layout,
      activeType: 'tab',
      draggingId: 't1',
      target: { type: 'root', fraction: '1/4', edge: 'left' },
    })

    expect(result).not.toBeNull()
    expect(result?.overId).toBe('root')
    expect(result?.dropAction).toEqual({ type: 'split', direction: 'row', position: 'left' })
    const root = result?.newLayout as SplitNode
    expect(root.type).toBe('split')
    expect(root.direction).toBe('row')
    expect(root.splitPercentage).toBe(25)
  })

  it('handles edge drop splitting target pane', () => {
    const result = resolveDrop({
      layout,
      activeType: 'pane',
      draggingId: 'p1',
      target: { type: 'pane-edge', position: 'bottom', targetId: 'p2' },
    })

    expect(result).not.toBeNull()
    expect(result?.overId).toBe('p2')
    expect(result?.dropAction).toEqual({ type: 'split', direction: 'column', position: 'bottom' })
  })

  it('handles center drop swapping tabs', () => {
    const result = resolveDrop({
      layout,
      activeType: 'tab',
      draggingId: 't1',
      target: { type: 'pane-center', targetId: 'p2' },
    })

    expect(result).not.toBeNull()
    expect(result?.overId).toBe('p2')
    expect(result?.dropAction).toEqual({ type: 'move', position: 'center' })
  })

  it('returns null when dropping tab/pane onto itself', () => {
    expect(
      resolveDrop({
        layout,
        activeType: 'tab',
        draggingId: 't2',
        target: { type: 'tab', targetTabId: 't2' },
      }),
    ).toBeNull()

    expect(
      resolveDrop({
        layout,
        activeType: 'pane',
        draggingId: 'p1',
        target: { type: 'pane-edge', position: 'left', targetId: 'p1' },
      }),
    ).toBeNull()
  })
})
