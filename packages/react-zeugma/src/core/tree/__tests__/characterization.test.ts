import { describe, it, expect } from 'vitest'
import {
  generateUniqueId,
  removePane,
  removeTab,
  splitPane,
  insertLeaf,
  addTab,
  updateSplitPercentage,
  findPaneById,
  findPaneContainingTab,
  findTabById,
  getTabMetadata,
  getActiveTabMetadata,
  updatePaneLock,
  selectTab,
  mergeTab,
  moveTab,
  swapTabs,
  movePaneTabs,
  computeLayout,
  calculateTabDropIndex,
  isValidTreeNode,
  areLayoutsEqual,
} from '../index'
import type { SplitNode, PaneNode } from '../../types'

describe('Tree Helpers Characterization Tests', () => {
  const singlePane: PaneNode = {
    type: 'pane',
    id: 'p1',
    tabIds: ['t1', 't2'],
    activeTabId: 't1',
    tabsMetadata: {
      t1: { title: 'Tab 1' },
      t2: { title: 'Tab 2' },
    },
  }

  const splitTree: SplitNode = {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: {
      type: 'pane',
      id: 'p1',
      tabIds: ['t1'],
      activeTabId: 't1',
      tabsMetadata: { t1: { title: 'Tab 1' } },
    },
    second: {
      type: 'pane',
      id: 'p2',
      tabIds: ['t2', 't3'],
      activeTabId: 't2',
      tabsMetadata: { t2: { title: 'Tab 2' } },
    },
  }

  describe('generateUniqueId', () => {
    it('produces string starting with pane-', () => {
      const id = generateUniqueId()
      expect(id).toMatch(/^pane-[a-z0-9]+$/)
    })
  })

  describe('isValidTreeNode', () => {
    it('validates a valid pane', () => {
      expect(isValidTreeNode(singlePane)).toBe(true)
    })

    it('validates a valid split node', () => {
      expect(isValidTreeNode(splitTree)).toBe(true)
    })

    it('rejects invalid structures', () => {
      expect(isValidTreeNode(null)).toBe(false)
      expect(isValidTreeNode(undefined)).toBe(false)
      expect(isValidTreeNode('pane')).toBe(false)
      expect(isValidTreeNode({})).toBe(false)
      expect(isValidTreeNode({ type: 'unknown' })).toBe(false)
      expect(isValidTreeNode({ type: 'pane', id: 123 })).toBe(false)
      expect(isValidTreeNode({ type: 'split', direction: 'invalid' })).toBe(false)
    })
  })

  describe('findPaneById and findPaneContainingTab', () => {
    it('finds pane by id', () => {
      expect(findPaneById(splitTree, 'p1')?.id).toBe('p1')
      expect(findPaneById(splitTree, 'p2')?.id).toBe('p2')
      expect(findPaneById(splitTree, 'p999')).toBeNull()
      expect(findPaneById(null, 'p1')).toBeNull()
    })

    it('finds pane containing tab', () => {
      expect(findPaneContainingTab(splitTree, 't1')?.id).toBe('p1')
      expect(findPaneContainingTab(splitTree, 't3')?.id).toBe('p2')
      expect(findPaneContainingTab(splitTree, 't999')).toBeNull()
      expect(findPaneContainingTab(null, 't1')).toBeNull()
    })
  })

  describe('findTabById and metadata queries', () => {
    it('finds tab details by tabId', () => {
      const details = findTabById(splitTree, 't3')
      expect(details).toEqual({
        id: 't3',
        paneId: 'p2',
        isActive: false,
        index: 1,
        metadata: undefined,
      })

      const t1Details = findTabById(splitTree, 't1')
      expect(t1Details).toEqual({
        id: 't1',
        paneId: 'p1',
        isActive: true,
        index: 0,
        metadata: { title: 'Tab 1' },
      })

      expect(findTabById(splitTree, 'missing')).toBeNull()
      expect(findTabById(null, 't1')).toBeNull()
    })

    it('retrieves tab metadata', () => {
      expect(getTabMetadata(splitTree, 't1')).toEqual({ title: 'Tab 1' })
      expect(getTabMetadata(splitTree, 't3')).toBeUndefined()
      expect(getTabMetadata(null, 't1')).toBeUndefined()
    })

    it('retrieves active tab metadata for a pane', () => {
      expect(getActiveTabMetadata(splitTree, 'p1')).toEqual({ title: 'Tab 1' })
      expect(getActiveTabMetadata(splitTree, 'p2')).toEqual({ title: 'Tab 2' })
      expect(getActiveTabMetadata(splitTree, 'missing')).toBeUndefined()
      expect(getActiveTabMetadata(null, 'p1')).toBeUndefined()
    })
  })

  describe('removePane', () => {
    it('returns null when removing sole pane', () => {
      expect(removePane(singlePane, 'p1')).toBeNull()
    })

    it('collapses split when one branch is removed', () => {
      const result = removePane(splitTree, 'p1') as PaneNode
      expect(result).not.toBeNull()
      expect(result.id).toBe('p2')
    })

    it('returns unchanged tree if pane does not exist', () => {
      expect(removePane(singlePane, 'missing')).toEqual(singlePane)
      expect(removePane(null, 'p1')).toBeNull()
    })
  })

  describe('removeTab', () => {
    it('removes non-active tab from pane preserving active tab', () => {
      const result = removeTab(singlePane, 't2') as PaneNode
      expect(result.tabIds).toEqual(['t1'])
      expect(result.activeTabId).toBe('t1')
      expect(result.tabsMetadata).toEqual({ t1: { title: 'Tab 1' } })
    })

    it('activates first remaining tab when active tab is removed', () => {
      const result = removeTab(singlePane, 't1') as PaneNode
      expect(result.tabIds).toEqual(['t2'])
      expect(result.activeTabId).toBe('t2')
    })

    it('collapses pane when its last tab is removed', () => {
      const result = removeTab(splitTree, 't1') as PaneNode
      expect(result.id).toBe('p2')
    })

    it('cleans up empty metadata', () => {
      const paneWithOneMeta: PaneNode = {
        type: 'pane',
        id: 'p',
        tabIds: ['t1', 't2'],
        activeTabId: 't1',
        tabsMetadata: { t1: { a: 1 } },
      }
      const result = removeTab(paneWithOneMeta, 't1') as PaneNode
      expect(result.tabsMetadata).toBeUndefined()
    })
  })

  describe('splitPane', () => {
    it('creates root pane when tree is null', () => {
      const result = splitPane(null, 'any', 'row', 'left', 'newTab') as PaneNode
      expect(result.type).toBe('pane')
      expect(result.tabIds).toEqual(['newTab'])
    })

    it('splits target pane horizontally and vertically', () => {
      const leftSplit = splitPane(singlePane, 'p1', 'row', 'left', 't3') as SplitNode
      expect(leftSplit.type).toBe('split')
      expect(leftSplit.direction).toBe('row')
      expect((leftSplit.first as PaneNode).tabIds).toEqual(['t3'])
      expect((leftSplit.second as PaneNode).id).toBe('p1')

      const bottomSplit = splitPane(singlePane, 'p1', 'column', 'bottom', 't4') as SplitNode
      expect(bottomSplit.direction).toBe('column')
      expect((bottomSplit.first as PaneNode).id).toBe('p1')
      expect((bottomSplit.second as PaneNode).tabIds).toEqual(['t4'])
    })
  })

  describe('insertLeaf', () => {
    it('returns leaf when tree is null', () => {
      const leaf: PaneNode = { type: 'pane', id: 'leaf', tabIds: ['l1'], activeTabId: 'l1' }
      expect(insertLeaf(null, leaf)).toEqual(leaf)
    })

    it('splits pane into row when parent was null', () => {
      const leaf: PaneNode = { type: 'pane', id: 'leaf', tabIds: ['l1'], activeTabId: 'l1' }
      const res = insertLeaf(singlePane, leaf) as SplitNode
      expect(res.type).toBe('split')
      expect(res.direction).toBe('row')
      expect(res.first).toEqual(singlePane)
      expect(res.second).toEqual(leaf)
    })
  })

  describe('addTab', () => {
    it('creates a new pane if tree is null', () => {
      const res = addTab(null, null, 'tab-new', { x: 1 }) as PaneNode
      expect(res.type).toBe('pane')
      expect(res.tabIds).toEqual(['tab-new'])
      expect(res.activeTabId).toBe('tab-new')
      expect(res.tabsMetadata).toEqual({ 'tab-new': { x: 1 } })
    })

    it('appends tab to target pane and activates it', () => {
      const res = addTab(singlePane, 'p1', 't3', { title: 'T3' }) as PaneNode
      expect(res.tabIds).toEqual(['t1', 't2', 't3'])
      expect(res.activeTabId).toBe('t3')
      expect(res.tabsMetadata?.['t3']).toEqual({ title: 'T3' })
    })

    it('inserts a leaf pane if target pane is not found', () => {
      const res = addTab(singlePane, 'nonexistent', 't3') as SplitNode
      expect(res.type).toBe('split')
    })
  })

  describe('updateSplitPercentage', () => {
    it('updates percentage of targeted node', () => {
      const res = updateSplitPercentage(splitTree, splitTree, 70) as SplitNode
      expect(res.splitPercentage).toBe(70)
      expect(updateSplitPercentage(null, splitTree, 70)).toBeNull()
    })
  })

  describe('updatePaneLock', () => {
    it('sets locked property', () => {
      const res = updatePaneLock(singlePane, 'p1', true) as PaneNode
      expect(res.locked).toBe(true)
    })

    it('removes locked property when set to false', () => {
      const lockedPane: PaneNode = { ...singlePane, locked: true }
      const res = updatePaneLock(lockedPane, 'p1', false) as PaneNode
      expect(res.locked).toBeUndefined()
    })
  })

  describe('selectTab', () => {
    it('updates activeTabId of target pane', () => {
      const res = selectTab(singlePane, 'p1', 't2') as PaneNode
      expect(res.activeTabId).toBe('t2')
    })

    it('returns same tree if already active', () => {
      const res = selectTab(singlePane, 'p1', 't1')
      expect(res).toBe(singlePane)
    })
  })

  describe('mergeTab and moveTab', () => {
    it('merges tab from one pane into another', () => {
      const res = mergeTab(splitTree, 't1', 'p2') as PaneNode
      expect(res.id).toBe('p2')
      expect(res.tabIds).toContain('t1')
      expect(res.activeTabId).toBe('t1')
      expect(res.tabsMetadata?.['t1']).toEqual({ title: 'Tab 1' })
    })

    it('reorders tab before or after another in same pane', () => {
      const after = moveTab(singlePane, 't1', 't2', 'after') as PaneNode
      expect(after.tabIds).toEqual(['t2', 't1'])

      const before = moveTab(after, 't1', 't2', 'before') as PaneNode
      expect(before.tabIds).toEqual(['t1', 't2'])
    })

    it('swaps tabs when position is center', () => {
      const swapped = moveTab(singlePane, 't1', 't2', 'center') as PaneNode
      expect(swapped.tabIds).toEqual(['t2', 't1'])
    })
  })

  describe('swapTabs and movePaneTabs', () => {
    it('swaps tabs across panes', () => {
      const swapped = swapTabs(splitTree, 't1', 't2') as SplitNode
      const p1 = swapped.first as PaneNode
      const p2 = swapped.second as PaneNode
      expect(p1.tabIds).toContain('t2')
      expect(p2.tabIds).toContain('t1')
    })

    it('moves all tabs of a pane next to a target tab', () => {
      const moved = movePaneTabs(splitTree, 'p1', 't2', 'after') as PaneNode
      expect(moved.id).toBe('p2')
      expect(moved.tabIds).toEqual(['t2', 't1', 't3'])
    })
  })

  describe('computeLayout', () => {
    it('computes bounding box for single pane', () => {
      const layout = computeLayout(singlePane)
      expect(layout.panes).toHaveLength(1)
      expect(layout.panes[0]).toMatchObject({
        paneId: 'p1',
        left: 0,
        top: 0,
        width: 100,
        height: 100,
      })
      expect(layout.splitters).toHaveLength(0)
    })

    it('computes correct rectangles and splitter for split layout', () => {
      const layout = computeLayout(splitTree)
      expect(layout.panes).toHaveLength(2)
      expect(layout.splitters).toHaveLength(1)
      expect(layout.splitters[0].left).toBe(50)
      expect(layout.splitters[0].direction).toBe('row')
    })
  })

  describe('calculateTabDropIndex', () => {
    const tabIds = ['a', 'b', 'c']

    it('returns target index for before and after', () => {
      expect(calculateTabDropIndex(tabIds, 'tab', 'b', 'before')).toBe(1)
      expect(calculateTabDropIndex(tabIds, 'tab', 'b', 'after')).toBe(2)
      expect(calculateTabDropIndex(tabIds, 'pane', 'a', 'before')).toBe(0)
    })

    it('returns -1 when inactive or mismatched target', () => {
      expect(calculateTabDropIndex(tabIds, null, 'b', 'before')).toBe(-1)
      expect(calculateTabDropIndex(tabIds, 'tab', 'nonexistent', 'before')).toBe(-1)
      expect(calculateTabDropIndex(tabIds, 'tab', 'b', null)).toBe(-1)
    })
  })

  describe('areLayoutsEqual', () => {
    it('returns true for identical tree structures', () => {
      expect(areLayoutsEqual(singlePane, { ...singlePane })).toBe(true)
      expect(areLayoutsEqual(splitTree, { ...splitTree })).toBe(true)
      expect(areLayoutsEqual(null, null)).toBe(true)
    })

    it('returns false when tree structure or tabs differ', () => {
      expect(areLayoutsEqual(singlePane, null)).toBe(false)
      expect(areLayoutsEqual(singlePane, { ...singlePane, activeTabId: 't2' })).toBe(false)
      expect(areLayoutsEqual(singlePane, { ...singlePane, tabIds: ['t1'] })).toBe(false)
    })
  })
})
