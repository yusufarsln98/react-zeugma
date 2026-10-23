import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useZeugmaDnd } from './useZeugmaDnd'
import type { ZeugmaControllerInternal, TreeNode } from '../../../shared'
import * as dndKitCore from '@dnd-kit/core'

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const original = await importOriginal<typeof dndKitCore>()
  return {
    ...original,
    pointerWithin: vi.fn(),
  }
})

interface MockController extends ZeugmaControllerInternal {
  dragActivationDistance: number
  enableDragToDismiss: boolean
  dismissThreshold: number
}

describe('useZeugmaDnd Hook', () => {
  const mockController = (): MockController => {
    const setLayoutMock = vi.fn()
    const internalSetLayoutMock = vi.fn()
    return {
      layout: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1', 'tab-2'],
        activeTabId: 'tab-1',
      },
      renderingLayout: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1', 'tab-2'],
        activeTabId: 'tab-1',
      },
      setLayout: setLayoutMock,
      _internalSetLayout: internalSetLayoutMock,
      activeId: null,
      setActiveId: vi.fn(),
      activeType: null,
      setActiveType: vi.fn(),
      dismissIntentId: null,
      setDismissIntentId: vi.fn(),
      fullscreenPaneId: null,
      setFullscreenPaneId: vi.fn(),
      locked: false,
      setLocked: vi.fn(),
      containerRef: { current: null },
      setContainerRef: vi.fn(),
      dragActivationDistance: 8,
      enableDragToDismiss: false,
      dismissThreshold: 60,
      removePane: vi.fn(),
      addTab: vi.fn(),
      updatePaneLock: vi.fn(),
      selectTab: vi.fn(),
      mergeTab: vi.fn(),
      removeTab: vi.fn(),
      splitPane: vi.fn(),
      updateSplitPercentage: vi.fn(),
      moveTab: vi.fn(),
      findPaneById: vi.fn(),
      findPaneContainingTab: vi.fn(),
      findTabById: vi.fn(),
      getTabMetadata: vi.fn(),
      getActiveTabMetadata: vi.fn(),
      poppedOutTabIds: [],
      popoutTab: vi.fn(),
      dockTab: vi.fn(),
    }
  }

  it('should not filter out tab drop zones in collision detection when dragging a pane', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const { result } = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    const collisionDetection = result.current.collisionDetection

    // Simulate pointerWithin returning a set of collisions
    const mockCollisions = [{ id: 'tab-drop-tab-1' }, { id: 'drop-left-pane-2' }]
    vi.mocked(dndKitCore.pointerWithin).mockReturnValue(mockCollisions as dndKitCore.Collision[])

    // Scenario A: Active drag is a tab (tab-header-tab-1)
    const tabArgs = {
      active: { id: 'tab-header-tab-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]
    const tabResult = collisionDetection(tabArgs)
    expect(tabResult).toEqual(mockCollisions) // For tab drag, we don't filter out tab-drop zones

    // Scenario B: Active drag is a pane (pane-1)
    const paneArgs = {
      active: { id: 'pane-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]
    const paneResult = collisionDetection(paneArgs)
    expect(paneResult).toEqual(mockCollisions) // For pane drag, tab-drop-tab-1 is also not filtered out
  })

  it('should merge tabs of a dragged pane next to the target tab when dropping a pane on a tab-drop zone', () => {
    const controller = mockController()
    controller.layout = {
      type: 'split',
      direction: 'row',
      first: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      },
      second: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
      },
      splitPercentage: 50,
    }
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const onDragEndMock = vi.fn()
    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    const handleDragStart = hookInstance.result.current.onDragStart
    const handleDragEnd = hookInstance.result.current.onDragEnd

    // 1. Simulate starting drag of pane-1
    handleDragStart({
      active: { id: 'pane-1' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent)

    // 2. Simulate dropping pane-1 over tab-drop-tab-2
    const paneDragEndEvent = {
      active: { id: 'pane-1' },
      over: {
        id: 'tab-drop-tab-2',
        rect: {
          width: 100,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: 100,
        },
        data: {},
        disabled: false,
        node: { current: null },
      },
      activatorEvent: new MouseEvent('mouseup'),
      delta: { x: 60, y: 0 },
    } as unknown as dndKitCore.DragEndEvent

    handleDragEnd(paneDragEndEvent)

    // Verify setLayout IS called to merge pane-1's tabs into pane-2
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-2',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
      tabsMetadata: undefined,
    })
    // Verify onDragEnd callback is called with the target tab and drop metadata
    expect(onDragEndMock).toHaveBeenCalledWith('pane-1', 'tab-2', {
      type: 'move',
      position: 'center',
    })
  })

  it('should trigger moveTab when dropping a tab on a tab-drop zone', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const onDragEndMock = vi.fn()
    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    const handleDragEnd = hookInstance.result.current.onDragEnd

    // Simulate dragging a tab (isTabDrag = true) and dropping it over a tab drop zone
    const tabDragEndEvent = {
      active: { id: 'tab-header-tab-1' },
      over: {
        id: 'tab-drop-tab-2',
        rect: {
          width: 100,
          height: 0,
          top: 0,
          bottom: 0,
          left: 0,
          right: 100,
        },
        data: {},
        disabled: false,
        node: { current: null },
      },
      activatorEvent: new MouseEvent('mouseup'),
      delta: { x: 10, y: 0 },
    } as unknown as dndKitCore.DragEndEvent

    handleDragEnd(tabDragEndEvent)

    // Verify setLayout IS called with the expected layout
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
      tabsMetadata: undefined,
    })
    expect(onDragEndMock).toHaveBeenCalledWith('tab-1', 'tab-2', {
      type: 'move',
      position: 'center',
    })
  })

  it('should remove the element from layout on drag start, and restore/clear state on cancel or invalid drop', async () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // 1. Start drag for tab-1
    const dragStartEvent = {
      active: { id: 'tab-header-tab-1' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent

    hookInstance.result.current.onDragStart(dragStartEvent)

    // Verify _internalSetLayout was called to remove the dragged element
    expect(controller._internalSetLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-2'],
      activeTabId: 'tab-2',
      tabsMetadata: undefined,
    })
    // Verify setLayout was NOT called
    expect(controller.setLayout).not.toHaveBeenCalled()

    // Mock controller state during drag (layout is unchanged)
    const controllerWithDragState = {
      ...controller,
    }

    const hookWithDragState = renderHook(() =>
      useZeugmaDnd({
        ...controllerWithDragState,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // 2. Drag cancel should restore layout
    hookWithDragState.result.current.onDragCancel()
    expect(controllerWithDragState._internalSetLayout).toHaveBeenCalledWith(
      controllerWithDragState.layout,
    )

    // Reset mocks for the next scenario
    vi.mocked(controllerWithDragState._internalSetLayout).mockClear()

    // 3. Invalid drop (no over target) should restore layout
    const dragEndEventNoOver = {
      active: { id: 'tab-header-tab-1' },
      over: null,
    } as unknown as dndKitCore.DragEndEvent

    hookWithDragState.result.current.onDragEnd(dragEndEventNoOver)
    expect(controllerWithDragState._internalSetLayout).toHaveBeenCalledWith(
      controllerWithDragState.layout,
    )
  })

  it('should set an inactive tab as active on drag start', async () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    // Start drag for tab-2 (which is inactive, layout has activeTabId: 'tab-1')
    const dragStartEvent = {
      active: { id: 'tab-header-tab-2' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent

    hookInstance.result.current.onDragStart(dragStartEvent)

    // Verify setLayout was NOT called at drag start
    expect(controller.setLayout).not.toHaveBeenCalled()

    // Verify _internalSetLayout was called to set layout after removing tab-2
    expect(controller._internalSetLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
      tabsMetadata: undefined,
    })

    // Reset mocks
    vi.mocked(controller._internalSetLayout).mockClear()
    vi.mocked(controller.setLayout).mockClear()

    // Cancel the drag
    hookInstance.result.current.onDragCancel()

    // Verify setLayout was called with the selected layout (where tab-2 is active)
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-2',
    })

    // Verify _internalSetLayout was called to restore the selected layout
    expect(controller._internalSetLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-2',
    })
  })

  it('should prioritize root drop zones over pane drop zones, but prioritize tab drops over root drop zones when dragging a tab', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()

    const { result } = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
      }),
    )

    const collisionDetection = result.current.collisionDetection

    // Hitting a root drop zone and a pane drop zone
    const mockCollisions = [{ id: 'drop-left-pane-2' }, { id: 'drop-root-1/3-left' }]
    vi.mocked(dndKitCore.pointerWithin).mockReturnValue(mockCollisions as dndKitCore.Collision[])

    const paneArgs = {
      active: { id: 'pane-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]

    const sortedPaneCollisions = collisionDetection(paneArgs)
    // Root drop zone should be sorted first
    expect(sortedPaneCollisions[0].id).toBe('drop-root-1/3-left')

    // Scenario: Dragging a tab, hitting tab-drop-tab-2 and drop-root-1/3-top
    const mockTabCollisions = [{ id: 'drop-root-1/3-top' }, { id: 'tab-drop-tab-2' }]
    vi.mocked(dndKitCore.pointerWithin).mockReturnValue(mockTabCollisions as dndKitCore.Collision[])

    const tabArgs = {
      active: { id: 'tab-header-tab-1' },
      droppableContainers: [],
    } as unknown as Parameters<dndKitCore.CollisionDetection>[0]

    const sortedTabCollisions = collisionDetection(tabArgs)
    // Tab drop should be sorted first
    expect(sortedTabCollisions[0].id).toBe('tab-drop-tab-2')
  })

  it('should handle dropping on root drop zones and split layout at root level', () => {
    const controller = mockController()
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()
    const onDragEndMock = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    // Simulate drag start for pane-1 to set active drag state
    const dragStartEvent = {
      active: { id: 'pane-1' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent
    hookInstance.result.current.onDragStart(dragStartEvent)

    // Simulate dropping on drop-root-1/3-left
    const dragEndEvent = {
      active: { id: 'pane-1' },
      over: { id: 'drop-root-1/3-left' },
    } as unknown as dndKitCore.DragEndEvent

    hookInstance.result.current.onDragEnd(dragEndEvent)

    // Layout had pane-1 with tabs tab-1, tab-2.
    // Since pane-1 is the only pane in the layout (original layout is pane-1),
    // removing pane-1 makes cleanLayout null.
    // So the new layout is just pane-1 (draggedPaneNode).
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    })
    expect(onDragEndMock).toHaveBeenCalledWith('pane-1', 'root', {
      type: 'split',
      direction: 'row',
      position: 'left',
    })

    // Now test split where original layout has multiple nodes (so cleanLayout is not null)
    const complexController = mockController()
    complexController.layout = {
      type: 'split',
      direction: 'row',
      first: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      },
      second: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
      },
      splitPercentage: 50,
    }

    const complexHook = renderHook(() =>
      useZeugmaDnd({
        ...complexController,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    // Drag start for pane-2
    complexHook.result.current.onDragStart({
      active: { id: 'pane-2' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent)

    // Drop on drop-root-1/3-top
    complexHook.result.current.onDragEnd({
      active: { id: 'pane-2' },
      over: { id: 'drop-root-1/3-top' },
    } as unknown as dndKitCore.DragEndEvent)

    // Clean layout (complex layout with pane-2 removed) is just pane-1.
    // Dragged pane node is pane-2.
    // Drop is top 1/3, which is column direction, top is first.
    // So new layout is:
    // type: 'split'
    // direction: 'column'
    // first: pane-2
    // second: pane-1
    // splitPercentage: 33.333333333333336
    expect(complexController.setLayout).toHaveBeenCalledWith({
      type: 'split',
      direction: 'column',
      first: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
      },
      second: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      },
      splitPercentage: 100 / 3,
    })
  })

  it('should trigger swap on drop when dragging a tab to the center drop zone of a target pane', () => {
    const customLayout: TreeNode = {
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
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
      },
    }

    const controller = {
      ...mockController(),
      layout: customLayout,
      renderingLayout: customLayout,
    }
    const setOverTabId = vi.fn()
    const setOverTabPosition = vi.fn()
    const onDragEndMock = vi.fn()

    const hookInstance = renderHook(() =>
      useZeugmaDnd({
        ...controller,
        setOverTabId,
        setOverTabPosition,
        onDragEnd: onDragEndMock,
      }),
    )

    // Simulate drag start for tab-1
    hookInstance.result.current.onDragStart({
      active: { id: 'tab-header-tab-1' },
      activatorEvent: new MouseEvent('mousedown'),
    } as unknown as dndKitCore.DragStartEvent)

    // Simulate drag move over target pane-2 center drop zone ('drop-center-pane-2')
    hookInstance.result.current.onDragMove({
      active: { id: 'tab-header-tab-1' },
      over: {
        id: 'drop-center-pane-2',
        rect: {
          width: 200,
          height: 200,
          top: 0,
          bottom: 200,
          left: 0,
          right: 200,
        },
        data: {},
        disabled: false,
        node: { current: null },
      },
      activatorEvent: new MouseEvent('mousemove'),
      delta: { x: 0, y: 0 },
    } as unknown as dndKitCore.DragMoveEvent)

    // Simulate dropping the tab on 'drop-center-pane-2'
    hookInstance.result.current.onDragEnd({
      active: { id: 'tab-header-tab-1' },
      over: {
        id: 'drop-center-pane-2',
        rect: {
          width: 200,
          height: 200,
          top: 0,
          bottom: 200,
          left: 0,
          right: 200,
        },
        data: {},
        disabled: false,
        node: { current: null },
      },
      activatorEvent: new MouseEvent('mouseup'),
      delta: { x: 0, y: 0 },
    } as unknown as dndKitCore.DragEndEvent)

    // setLayout should be called with swapped layout: pane-1 has tab-2, pane-2 has tab-1
    expect(controller.setLayout).toHaveBeenCalledWith({
      type: 'split',
      direction: 'row',
      splitPercentage: 50,
      first: {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-2'],
        activeTabId: 'tab-2',
        tabsMetadata: undefined,
      },
      second: {
        type: 'pane',
        id: 'pane-2',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
        tabsMetadata: undefined,
      },
    })
  })
})
