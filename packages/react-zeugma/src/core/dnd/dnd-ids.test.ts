import { describe, it, expect } from 'vitest'
import {
  tabHeaderId,
  tabDropId,
  rootDropId,
  lockedDropId,
  paneDropId,
  parseActiveId,
  parseDropTarget,
} from './dnd-ids'

describe('dnd-ids utility', () => {
  it('encodes IDs correctly', () => {
    expect(tabHeaderId('t1')).toBe('tab-header-t1')
    expect(tabDropId('t1')).toBe('tab-drop-t1')
    expect(rootDropId('1/4', 'left')).toBe('drop-root-1/4-left')
    expect(lockedDropId('p1')).toBe('drop-locked-p1')
    expect(paneDropId('left', 'p1')).toBe('drop-left-p1')
    expect(paneDropId('center', 'p1')).toBe('drop-center-p1')
  })

  it('parses active item ID for tab and pane', () => {
    expect(parseActiveId('tab-header-my-tab')).toEqual({ type: 'tab', id: 'my-tab' })
    expect(parseActiveId('my-pane')).toEqual({ type: 'pane', id: 'my-pane' })
  })

  it('parses drop targets into discriminated union', () => {
    expect(parseDropTarget('tab-drop-t1')).toEqual({ type: 'tab', targetTabId: 't1' })
    expect(parseDropTarget('drop-locked-p1')).toEqual({ type: 'locked', paneId: 'p1' })
    expect(parseDropTarget('drop-root-1/4-top')).toEqual({
      type: 'root',
      fraction: '1/4',
      edge: 'top',
    })
    expect(parseDropTarget('drop-root-1/3-left')).toEqual({
      type: 'root',
      fraction: '1/3',
      edge: 'left',
    })
    expect(parseDropTarget('drop-root-1/3-right')).toEqual({
      type: 'root',
      fraction: '1/3',
      edge: 'right',
    })
    expect(parseDropTarget('drop-left-p1')).toEqual({
      type: 'pane-edge',
      position: 'left',
      targetId: 'p1',
    })
    expect(parseDropTarget('drop-center-p1')).toEqual({
      type: 'pane-center',
      targetId: 'p1',
    })
    expect(parseDropTarget('unrelated-id')).toEqual({
      type: 'unknown',
      rawId: 'unrelated-id',
    })
    expect(parseDropTarget(null)).toEqual({
      type: 'unknown',
      rawId: '',
    })
  })
})
