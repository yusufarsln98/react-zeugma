import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useZeugma } from './useZeugma'
import type { TreeNode, PaneNode, SplitNode, ZeugmaControllerInternal } from '../../../shared'

describe('useZeugma Hook', () => {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'pane-1',
    tabIds: ['tab-1'],
    activeTabId: 'tab-1',
  }

  it('should initialize with uncontrolled initialLayout', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))
    expect(result.current.layout).toEqual(initialLayout)
    expect(result.current.locked).toBe(false)
    expect(result.current.fullscreenPaneId).toBeNull()
  })

  it('should handle controlled layout updates from options', () => {
    const { result, rerender } = renderHook((props) => useZeugma(props), {
      initialProps: { layout: initialLayout },
    })
    expect(result.current.layout).toEqual(initialLayout)

    const updatedLayout: TreeNode = {
      type: 'pane',
      id: 'pane-updated',
      tabIds: ['tab-updated'],
      activeTabId: 'tab-updated',
    }

    rerender({ layout: updatedLayout })
    expect(result.current.layout).toEqual(updatedLayout)
  })

  it('should handle locked toggle via options or setter', () => {
    const { result, rerender } = renderHook((props) => useZeugma(props), {
      initialProps: { initialLayout, locked: false },
    })
    expect(result.current.locked).toBe(false)

    rerender({ initialLayout, locked: true })
    expect(result.current.locked).toBe(true)

    act(() => {
      result.current.setLocked(false)
    })
    expect(result.current.locked).toBe(false)
  })

  it('should toggle fullscreenPaneId', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))
    expect(result.current.fullscreenPaneId).toBeNull()

    act(() => {
      result.current.setFullscreenPaneId('pane-1')
    })
    expect(result.current.fullscreenPaneId).toBe('pane-1')

    act(() => {
      result.current.setFullscreenPaneId(null)
    })
    expect(result.current.fullscreenPaneId).toBeNull()
  })

  it('should perform removePane and removeTab', () => {
    const layoutWithTwoTabs: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithTwoTabs }))

    // Remove tab-2
    act(() => {
      result.current.removeTab('tab-2')
    })
    const pane = result.current.layout as PaneNode
    expect(pane.tabIds).toEqual(['tab-1'])

    // Remove the entire pane
    act(() => {
      result.current.removePane('pane-1')
    })
    expect(result.current.layout).toBeNull()
  })

  it('should perform splitPane programmatically', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.splitPane('pane-1', 'row', 'right', 'tab-new')
    })

    const root = result.current.layout as SplitNode
    expect(root.type).toBe('split')
    expect(root.direction).toBe('row')

    const secondChild = root.second as PaneNode
    expect(secondChild.type).toBe('pane')
    expect(secondChild.tabIds).toEqual(['tab-new'])
  })

  it('should perform updateSplitPercentage', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', id: 'pane-1', tabIds: ['tab-1'], activeTabId: 'tab-1' },
      second: { type: 'pane', id: 'pane-2', tabIds: ['tab-2'], activeTabId: 'tab-2' },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    const initialRoot = result.current.layout as SplitNode

    act(() => {
      result.current.updateSplitPercentage(initialRoot, 75)
    })

    const updatedRoot = result.current.layout as SplitNode
    expect(updatedRoot.splitPercentage).toBe(75)
  })

  it('should perform mergeTab and moveTab', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: { type: 'pane', id: 'pane-1', tabIds: ['tab-1'], activeTabId: 'tab-1' },
      second: { type: 'pane', id: 'pane-2', tabIds: ['tab-2'], activeTabId: 'tab-2' },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    // Merge tab-2 from pane-2 into pane-1
    act(() => {
      result.current.mergeTab('tab-2', 'pane-1')
    })

    let layout = result.current.layout as PaneNode
    expect(layout.type).toBe('pane') // second pane collapsed
    expect(layout.tabIds).toEqual(['tab-1', 'tab-2'])

    // Move tab-2 before tab-1
    act(() => {
      result.current.moveTab('tab-2', 'tab-1', 'before')
    })

    layout = result.current.layout as PaneNode
    expect(layout.tabIds).toEqual(['tab-2', 'tab-1'])
  })

  it('should support tree queries (findPaneById, findPaneContainingTab, findTabById)', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    const pane = result.current.findPaneById('pane-1')
    expect(pane).not.toBeNull()
    expect(pane?.id).toBe('pane-1')

    const paneByTab = result.current.findPaneContainingTab('tab-1')
    expect(paneByTab?.id).toBe('pane-1')

    const tabDetails = result.current.findTabById('tab-1')
    expect(tabDetails).not.toBeNull()
    expect(tabDetails?.paneId).toBe('pane-1')
    expect(tabDetails?.isActive).toBe(true)
  })

  it('should support synchronous batching without state overwrite (layoutRef check)', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.addTab('tab-2', 'pane-1')
      result.current.addTab('tab-3', 'pane-1')
    })

    const pane = result.current.layout as PaneNode
    expect(pane.tabIds).toEqual(['tab-1', 'tab-2', 'tab-3'])
    expect(pane.activeTabId).toBe('tab-3')
  })

  it('should maintain action identity stability across layout changes', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    const initialAddTab = result.current.addTab
    const initialRemovePane = result.current.removePane

    act(() => {
      result.current.addTab('tab-2', 'pane-1')
    })

    expect(result.current.addTab).toBe(initialAddTab)
    expect(result.current.removePane).toBe(initialRemovePane)
  })

  it('should initialize and preserve immutable tab metadata', () => {
    const layoutWithMeta: PaneNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
      tabsMetadata: {
        'tab-1': { title: 'Initial Title' },
      },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithMeta }))

    expect(result.current.getTabMetadata('tab-1')).toEqual({ title: 'Initial Title' })
    expect(result.current.getActiveTabMetadata('pane-1')).toEqual({ title: 'Initial Title' })
    expect(result.current.findTabById('tab-1')?.metadata).toEqual({ title: 'Initial Title' })

    act(() => {
      result.current.addTab('tab-2', 'pane-1', { title: 'Tab 2 Title' })
    })

    const pane = result.current.layout as PaneNode
    expect(pane.tabsMetadata?.['tab-1']).toEqual({ title: 'Initial Title' })
    expect(pane.tabsMetadata?.['tab-2']).toEqual({ title: 'Tab 2 Title' })
    expect(result.current.getTabMetadata('tab-2')).toEqual({ title: 'Tab 2 Title' })
  })

  it('should lock and unlock a specific pane programmatically', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      result.current.updatePaneLock('pane-1', true)
    })

    let pane = result.current.layout as PaneNode
    expect(pane.locked).toBe(true)

    act(() => {
      result.current.updatePaneLock('pane-1', false)
    })

    pane = result.current.layout as PaneNode
    expect(pane.locked).toBeUndefined()
  })

  it('should select tab (change activeTabId) in a pane', () => {
    const layoutWithTwoTabs: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithTwoTabs }))

    act(() => {
      result.current.selectTab('pane-1', 'tab-2')
    })

    const pane = result.current.layout as PaneNode
    expect(pane.activeTabId).toBe('tab-2')
  })

  it('should call onFullscreenChange callback when setFullscreenPaneId is invoked', () => {
    const onFullscreenChangeMock = vi.fn()
    const { result } = renderHook(() =>
      useZeugma({ initialLayout, onFullscreenChange: onFullscreenChangeMock }),
    )

    act(() => {
      result.current.setFullscreenPaneId('pane-1')
    })

    expect(onFullscreenChangeMock).toHaveBeenCalledWith('pane-1')
  })

  it('should maintain renderingLayout separately from logical layout when using _internalSetLayout', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    expect(result.current.layout).toEqual(initialLayout)
    expect((result.current as unknown as ZeugmaControllerInternal).renderingLayout).toEqual(
      initialLayout,
    )

    act(() => {
      ;(result.current as unknown as ZeugmaControllerInternal)._internalSetLayout(null)
    })

    // logical layout should stay unchanged
    expect(result.current.layout).toEqual(initialLayout)
    // renderingLayout should be updated to null
    expect((result.current as unknown as ZeugmaControllerInternal).renderingLayout).toBeNull()

    // programmatically setting layout via setLayout should sync both layout and renderingLayout
    const updatedLayout: TreeNode = {
      type: 'pane',
      id: 'pane-2',
      tabIds: ['tab-2'],
      activeTabId: 'tab-2',
    }

    act(() => {
      result.current.setLayout(updatedLayout)
    })

    expect(result.current.layout).toEqual(updatedLayout)
    expect((result.current as unknown as ZeugmaControllerInternal).renderingLayout).toEqual(
      updatedLayout,
    )
  })

  it('should force sync renderingLayout on setLayout even when the layout change is structurally identical (no-op for logical layout)', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    act(() => {
      ;(result.current as unknown as ZeugmaControllerInternal)._internalSetLayout(null)
    })

    // Call setLayout with the original layout (structurally identical, so a no-op for logical layout)
    act(() => {
      result.current.setLayout(initialLayout)
    })

    // Both should now be synced back to initialLayout
    expect(result.current.layout).toEqual(initialLayout)
    expect((result.current as unknown as ZeugmaControllerInternal).renderingLayout).toEqual(
      initialLayout,
    )
  })

  it('should swap tabs in the same pane when moveTab is called with position: center', () => {
    const layoutWithThreeTabs: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2', 'tab-3'],
      activeTabId: 'tab-1',
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithThreeTabs }))

    act(() => {
      result.current.moveTab('tab-1', 'tab-3', 'center')
    })

    const pane = result.current.layout as PaneNode
    expect(pane.tabIds).toEqual(['tab-3', 'tab-2', 'tab-1'])
    expect(pane.activeTabId).toBe('tab-1')
  })

  it('should swap tabs across different panes when moveTab is called with position: center', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1', 'tab-2'],
        activeTabId: 'tab-1',
        tabsMetadata: {
          'tab-1': { label: 'Tab 1' },
        },
      },
      second: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-3', 'tab-4'],
        activeTabId: 'tab-3',
        tabsMetadata: {
          'tab-3': { label: 'Tab 3' },
        },
      },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    act(() => {
      result.current.moveTab('tab-1', 'tab-3', 'center')
    })

    const root = result.current.layout as SplitNode
    const firstPane = root.first as PaneNode
    const secondPane = root.second as PaneNode

    expect(firstPane.tabIds).toEqual(['tab-3', 'tab-2'])
    expect(firstPane.activeTabId).toBe('tab-3')
    expect(firstPane.tabsMetadata?.['tab-3']).toEqual({ label: 'Tab 3' })
    expect(firstPane.tabsMetadata?.['tab-1']).toBeUndefined()

    expect(secondPane.tabIds).toEqual(['tab-1', 'tab-4'])
    expect(secondPane.activeTabId).toBe('tab-1')
    expect(secondPane.tabsMetadata?.['tab-1']).toEqual({ label: 'Tab 1' })
    expect(secondPane.tabsMetadata?.['tab-3']).toBeUndefined()
  })

  it('should support popout and dock actions', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    expect(result.current.poppedOutTabIds).toEqual([])

    // Popout tab-1
    act(() => {
      result.current.popoutTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual(['tab-1'])

    // Dock tab-1 back
    act(() => {
      result.current.dockTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual([])
  })

  it('should remove a popped-out tab from poppedOutTabIds when that tab is removed from the layout tree', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    // Popout tab-1
    act(() => {
      result.current.popoutTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual(['tab-1'])

    // Remove tab-1 from the tree
    act(() => {
      result.current.removeTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual([])
  })

  it('should remove a popped-out tab from poppedOutTabIds when the layout is replaced programmatically and no longer contains that tab', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))

    // Popout tab-1
    act(() => {
      result.current.popoutTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual(['tab-1'])

    // Programmatically set layout to a new tree without tab-1
    act(() => {
      result.current.setLayout({
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
      })
    })
    expect(result.current.poppedOutTabIds).toEqual([])
  })

  it('should remove a popped-out tab from poppedOutTabIds when the controlled layout prop changes and no longer contains that tab', () => {
    let currentLayout = initialLayout
    const { result, rerender } = renderHook(({ layout }) => useZeugma({ layout }), {
      initialProps: { layout: currentLayout },
    })

    // Popout tab-1
    act(() => {
      result.current.popoutTab('tab-1')
    })
    expect(result.current.poppedOutTabIds).toEqual(['tab-1'])

    // Update controlled layout to a new tree without tab-1
    currentLayout = {
      type: 'pane',
      id: 'pane-2',
      tabIds: ['tab-2'],
      activeTabId: 'tab-2',
    }
    rerender({ layout: currentLayout })
    expect(result.current.poppedOutTabIds).toEqual([])
  })

  it('should block layout-modifying actions when fullscreenPaneId is not null', () => {
    const layoutWithSplit: TreeNode = {
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      },
      second: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-2', 'tab-3'],
        activeTabId: 'tab-2',
      },
    }
    const { result } = renderHook(() => useZeugma({ initialLayout: layoutWithSplit }))

    // Set fullscreen mode
    act(() => {
      result.current.setFullscreenPaneId('pane-2')
    })
    expect(result.current.fullscreenPaneId).toBe('pane-2')

    // 1. Try removePane
    act(() => {
      result.current.removePane('pane-1')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 2. Try removeTab
    act(() => {
      result.current.removeTab('tab-3')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 3. Try addTab
    act(() => {
      result.current.addTab('tab-new', 'pane-2')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 4. Try splitPane
    act(() => {
      result.current.splitPane('pane-2', 'row', 'right', 'tab-new')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 5. Try updateSplitPercentage
    act(() => {
      const root = result.current.layout as SplitNode
      result.current.updateSplitPercentage(root, 75)
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 6. Try mergeTab
    act(() => {
      result.current.mergeTab('tab-1', 'pane-2')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 7. Try moveTab
    act(() => {
      result.current.moveTab('tab-3', 'tab-2', 'before')
    })
    expect(result.current.layout).toEqual(layoutWithSplit) // Unchanged

    // 8. Try popoutTab
    act(() => {
      result.current.popoutTab('tab-2')
    })
    expect(result.current.poppedOutTabIds).toEqual([]) // Unchanged

    // 9. Try selectTab (SHOULD WORK)
    act(() => {
      result.current.selectTab('pane-2', 'tab-3')
    })
    const updatedPane2 = (result.current.layout as SplitNode).second as PaneNode
    expect(updatedPane2.activeTabId).toBe('tab-3') // Changed!

    // 10. Try setLayout (SHOULD WORK & RESET FULLSCREEN)
    const newLayout: TreeNode = {
      type: 'pane',
      id: 'pane-new',
      tabIds: ['tab-new'],
      activeTabId: 'tab-new',
    }
    act(() => {
      result.current.setLayout(newLayout)
    })
    expect(result.current.layout).toEqual(newLayout)
    expect(result.current.fullscreenPaneId).toBeNull()
  })

  it('should invoke functional setLayout updater exactly once and keep renderingLayout in sync', () => {
    const { result } = renderHook(() => useZeugma({ initialLayout }))
    const updaterSpy = vi.fn((_prev: TreeNode | null): TreeNode => {
      return {
        type: 'pane',
        id: 'pane-from-fn',
        tabIds: ['tab-from-fn'],
        activeTabId: 'tab-from-fn',
      }
    })

    act(() => {
      result.current.setLayout(updaterSpy)
    })

    expect(updaterSpy).toHaveBeenCalledTimes(1)
    const internal = result.current as unknown as ZeugmaControllerInternal
    expect(internal.renderingLayout).toEqual(result.current.layout)
  })
})
