import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { renderHook } from '@testing-library/react'
import { useZeugma, useZeugmaContext, Zeugma, Pane, PaneTree, ZeugmaProps } from '../../../index'
import {
  useZeugmaState,
  useZeugmaActions,
  ZeugmaStateContext,
  ZeugmaDragContext,
  ZeugmaActionsContext,
} from '../../../shared'
import type { TreeNode, ZeugmaController } from '../../../shared'
import { Tabs } from '../../pane/ui/Tabs'
import * as dndKitCore from '@dnd-kit/core'

describe('Zeugma Context Provider & Consumers', () => {
  const initialLayout: TreeNode = {
    type: 'pane',
    id: 'pane-1',
    tabIds: ['tab-1'],
    activeTabId: 'tab-1',
  }

  it('should throw error when useZeugmaState is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaState())
    }).toThrow('useZeugmaState must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should throw error when useZeugmaActions is used outside provider', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      renderHook(() => useZeugmaActions())
    }).toThrow('useZeugmaActions must be used within a Zeugma provider')
    consoleErrorSpy.mockRestore()
  })

  it('should successfully render children and provide context values', () => {
    let contextValue: ZeugmaController | null = null
    const ConsumerComponent = () => {
      contextValue = useZeugmaContext()
      return <div data-testid="child">Child Component</div>
    }

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <ConsumerComponent />
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('child')).toBeDefined()
    expect(contextValue).not.toBeNull()
    expect(contextValue!.layout).toEqual(initialLayout)

    // Actions should be present
    expect(typeof contextValue!.addTab).toBe('function')
    expect(typeof contextValue!.removePane).toBe('function')
    expect(typeof contextValue!.setFullscreenPaneId).toBe('function')
    expect(typeof contextValue!.setLocked).toBe('function')
    expect(typeof contextValue!.splitPane).toBe('function')
    expect(typeof contextValue!.updateSplitPercentage).toBe('function')
    expect(typeof contextValue!.moveTab).toBe('function')
  })

  it('should pass tab metadata to Pane.Content render callback', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
      tabsMetadata: {
        'tab-1': { title: 'My Tab Title', customProp: 42 },
      },
    }

    let receivedMetadata: Record<string, unknown> | undefined = undefined

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div data-testid="pane-root">
            <Pane.Content>
              {(tab) => {
                receivedMetadata = tab.metadata
                return <div data-testid="tab-content">{tab.id} Content</div>
              }}
            </Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('tab-content')).toBeDefined()
    expect(receivedMetadata).toEqual({ title: 'My Tab Title', customProp: 42 })
  })

  it('should successfully provide context using Zeugma with children and explicit PaneTree', () => {
    let contextValue: ZeugmaController | null = null
    const ConsumerComponent = () => {
      contextValue = useZeugmaContext()
      return <div data-testid="child">Child Component</div>
    }

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <ConsumerComponent />
        </Pane>
      )
      return (
        <Zeugma controller={controller}>
          <div data-testid="toolbar">Toolbar</div>
          <PaneTree renderPane={renderPane} />
        </Zeugma>
      )
    }

    render(<TestWrapper />)

    expect(screen.getByTestId('toolbar')).toBeDefined()
    expect(screen.getByTestId('child')).toBeDefined()
    expect(contextValue).not.toBeNull()
    expect(contextValue!.layout).toEqual(initialLayout)
  })

  it('should throw error when Zeugma is used without controller', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => {
      render(<Zeugma {...({} as unknown as ZeugmaProps)} />)
    }).toThrow('Zeugma component requires a controller.')
    consoleErrorSpy.mockRestore()
  })
})

describe('Tab Drop Preview rendering', () => {
  beforeEach(() => {
    vi.spyOn(dndKitCore, 'useDroppable').mockReturnValue({
      setNodeRef: () => {},
      isOver: true,
      node: { current: null },
      rect: { current: null },
      active: null,
      over: null,
    })
    vi.spyOn(dndKitCore, 'useDraggable').mockReturnValue({
      setNodeRef: () => {},
      listeners: undefined,
      attributes: {},
      isDragging: false,
      transform: null,
      node: { current: null },
    } as unknown as ReturnType<typeof dndKitCore.useDraggable>)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const defaultState = {
    layout: null,
    renderingLayout: null,
    setLayout: () => {},
    activeId: 'tab-1',
    activeType: 'tab' as const,
    dismissIntentId: null,
    setContainerRef: () => {},
    fullscreenPaneId: null,
    classNames: {
      tabDropPreview: 'custom-drop-preview',
    },
    locked: false,
    setLocked: () => {},
    findPaneById: () => null,
    findPaneContainingTab: () => null,
    findTabById: () => null,
    getTabMetadata: () => undefined,
    getActiveTabMetadata: () => undefined,
    renderPane: () => null,
    poppedOutTabIds: [] as string[],
    isTabPoppedOut: () => false,
  }

  it('should render the drop preview indicator before the target tab when position is before', () => {
    const dragValue = {
      overTabId: 'tab-2',
      overTabPosition: 'before' as const,
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabIds={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('position: absolute')
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-50%)')

    // It should be inside a parent that has relative position and width 0
    const parent = indicator?.parentElement
    expect(parent?.getAttribute('style')).toContain('position: relative')
    expect(parent?.getAttribute('style')).toContain('width: 0')
  })

  it('should render the drop preview indicator after the target tab when position is after', () => {
    const dragValue = {
      overTabId: 'tab-1',
      overTabPosition: 'after' as const, // index 1 (between tab-1 and tab-2)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabIds={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-50%)')
  })

  it('should render the drop preview indicator with none transform when position is before the first tab', () => {
    const dragValue = {
      overTabId: 'tab-1',
      overTabPosition: 'before' as const, // index 0 (very beginning)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabIds={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: none')
  })

  it('should render the drop preview indicator with translateX(-100%) transform when position is after the last tab', () => {
    const dragValue = {
      overTabId: 'tab-2',
      overTabPosition: 'after' as const, // index 2 (very end)
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabIds={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).not.toBeNull()
    expect(indicator?.getAttribute('style')).toContain('transform: translateX(-100%)')
  })

  it('should not render the drop preview indicator when overTabId is not in the tabIds list', () => {
    const dragValue = {
      overTabId: 'tab-3',
      overTabPosition: 'before' as const,
    }

    const { container } = render(
      <ZeugmaStateContext.Provider value={defaultState}>
        <ZeugmaDragContext.Provider value={dragValue}>
          <Tabs
            tabIds={['tab-1', 'tab-2']}
            activeTabId="tab-1"
            selectTab={() => {}}
            removeTab={() => {}}
            renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId} Content</span>}
          />
        </ZeugmaDragContext.Provider>
      </ZeugmaStateContext.Provider>,
    )

    const indicator = container.querySelector('.custom-drop-preview')
    expect(indicator).toBeNull()
  })

  it('should resolve active tabIds from renderingLayout during dragging', () => {
    const layoutWithDragRemoved: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-2'],
      activeTabId: 'tab-2',
    }

    const stateWithDrag = {
      ...defaultState,
      renderingLayout: layoutWithDragRemoved,
      activeId: 'tab-1',
      activeType: 'tab' as const,
    }

    const mockActions = {
      removePane: vi.fn(),
      addTab: vi.fn(),
      updatePaneLock: vi.fn(),
      selectTab: vi.fn(),
      mergeTab: vi.fn(),
      removeTab: vi.fn(),
      setFullscreenPaneId: vi.fn(),
      setLocked: vi.fn(),
      splitPane: vi.fn(),
      updateSplitPercentage: vi.fn(),
      moveTab: vi.fn(),
      popoutTab: vi.fn(),
      dockTab: vi.fn(),
    }

    const dragValue = {
      overTabId: null,
      overTabPosition: null,
    }

    const { queryByTestId } = render(
      <ZeugmaDragContext.Provider value={dragValue}>
        <ZeugmaActionsContext.Provider value={mockActions}>
          <ZeugmaStateContext.Provider value={stateWithDrag}>
            <Pane id="pane-1">
              <Pane.Tabs renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId}</span>} />
            </Pane>
          </ZeugmaStateContext.Provider>
        </ZeugmaActionsContext.Provider>
      </ZeugmaDragContext.Provider>,
    )

    // The dragged tab "tab-1" should NOT be rendered in the tab list since it was removed in renderingLayout
    expect(queryByTestId('tab-1')).toBeNull()
    // The remaining tab "tab-2" should be rendered
    expect(queryByTestId('tab-2')).not.toBeNull()
  })

  it('should resolve active tabIds from logical layout if the pane itself is being dragged', () => {
    const layoutWithDragRemoved = null // pane is completely removed from renderingLayout

    const originalLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    const stateWithDrag = {
      ...defaultState,
      layout: originalLayout,
      renderingLayout: layoutWithDragRemoved,
      activeId: 'pane-1',
      activeType: 'pane' as const,
    }

    const mockActions = {
      removePane: vi.fn(),
      addTab: vi.fn(),
      updatePaneLock: vi.fn(),
      selectTab: vi.fn(),
      mergeTab: vi.fn(),
      removeTab: vi.fn(),
      setFullscreenPaneId: vi.fn(),
      setLocked: vi.fn(),
      splitPane: vi.fn(),
      updateSplitPercentage: vi.fn(),
      moveTab: vi.fn(),
      popoutTab: vi.fn(),
      dockTab: vi.fn(),
    }

    const dragValue = {
      overTabId: null,
      overTabPosition: null,
    }

    const { queryByTestId } = render(
      <ZeugmaDragContext.Provider value={dragValue}>
        <ZeugmaActionsContext.Provider value={mockActions}>
          <ZeugmaStateContext.Provider value={stateWithDrag}>
            <Pane id="pane-1">
              <Pane.Tabs renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId}</span>} />
            </Pane>
          </ZeugmaStateContext.Provider>
        </ZeugmaActionsContext.Provider>
      </ZeugmaDragContext.Provider>,
    )

    // Since pane-1 is being dragged (id === activeId), it resolves from layout
    // rendering tab-1 and tab-2
    expect(queryByTestId('tab-1')).not.toBeNull()
    expect(queryByTestId('tab-2')).not.toBeNull()
  })

  describe('Persistence Behavior', () => {
    beforeEach(() => {
      localStorage.clear()
      vi.restoreAllMocks()
    })

    afterEach(() => {
      localStorage.clear()
    })

    it('should save layout to localStorage when layout changes and persist is true', () => {
      const initialLayout: TreeNode = {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      }

      let controllerInstance: ZeugmaController | null = null

      const TestWrapper = () => {
        const controller = useZeugma({ initialLayout })
        controllerInstance = controller
        return (
          <Zeugma
            controller={controller}
            persist={true}
            renderPane={(id) => <Pane id={id}>{id}</Pane>}
          />
        )
      }

      render(<TestWrapper />)

      // Initial save should happen after mount/load phase
      expect(localStorage.getItem('zeugma-layout')).not.toBeNull()
      const savedLayout = JSON.parse(localStorage.getItem('zeugma-layout')!)
      expect(savedLayout).toEqual(initialLayout)

      // Modify layout (e.g. add a tab)
      act(() => {
        controllerInstance!.addTab('tab-2', 'pane-1')
      })

      const updatedSavedLayout = JSON.parse(localStorage.getItem('zeugma-layout')!)
      expect(updatedSavedLayout.tabIds).toContain('tab-2')
    })

    it('should load layout from localStorage on mount if persist is true', () => {
      const savedLayout: TreeNode = {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1', 'tab-2'],
        activeTabId: 'tab-2',
      }
      localStorage.setItem('zeugma-layout', JSON.stringify(savedLayout))

      const initialLayout: TreeNode = {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      }

      let controllerInstance: ZeugmaController | null = null

      const TestWrapper = () => {
        const controller = useZeugma({ initialLayout })
        controllerInstance = controller
        return (
          <Zeugma
            controller={controller}
            persist={true}
            renderPane={(id) => <Pane id={id}>{id}</Pane>}
          />
        )
      }

      render(<TestWrapper />)

      // It should load the layout from localStorage rather than using initialLayout
      expect(controllerInstance!.layout).toEqual(savedLayout)
    })

    it('should use custom key if provided in persist object', () => {
      const customKey = 'my-custom-layout-key'
      const initialLayout: TreeNode = {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      }

      const TestWrapper = () => {
        const controller = useZeugma({ initialLayout })
        return (
          <Zeugma
            controller={controller}
            persist={{ key: customKey }}
            renderPane={(id) => <Pane id={id}>{id}</Pane>}
          />
        )
      }

      render(<TestWrapper />)

      expect(localStorage.getItem(customKey)).not.toBeNull()
      expect(localStorage.getItem('zeugma-layout')).toBeNull()
    })

    it('should not persist if enabled is false in persist object', () => {
      const initialLayout: TreeNode = {
        type: 'pane',
        id: 'pane-1',
        tabIds: ['tab-1'],
        activeTabId: 'tab-1',
      }

      const TestWrapper = () => {
        const controller = useZeugma({ initialLayout })
        return (
          <Zeugma
            controller={controller}
            persist={{ enabled: false }}
            renderPane={(id) => <Pane id={id}>{id}</Pane>}
          />
        )
      }

      render(<TestWrapper />)

      expect(localStorage.getItem('zeugma-layout')).toBeNull()
    })
  })

  it('should disable dragging on both panes and tabs in fullscreen mode', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }

    const useDraggableSpy = vi.mocked(dndKitCore.useDraggable)
    useDraggableSpy.mockClear()

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout, fullscreenPaneId: 'pane-1' })
      return (
        <Zeugma
          controller={controller}
          renderPane={(id) => (
            <Pane id={id}>
              <Pane.Tabs renderTab={({ id: tabId }) => <span data-testid={tabId}>{tabId}</span>} />
            </Pane>
          )}
        />
      )
    }

    render(<TestWrapper />)

    const calls = useDraggableSpy.mock.calls
    expect(calls.length).toBeGreaterThan(0)

    const paneDragCall = calls.find((c) => c[0].id === 'pane-1')
    const tabDragCall = calls.find((c) => c[0].id === 'tab-header-tab-1')

    expect(paneDragCall).toBeDefined()
    expect(paneDragCall![0].disabled).toBe(true)

    expect(tabDragCall).toBeDefined()
    expect(tabDragCall![0].disabled).toBe(true)
  })

  it('should not render hardcoded text or buttons when a tab is popped out without placeholder', () => {
    const mockWindow = {
      document: document.implementation.createHTMLDocument('Popout'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      focus: vi.fn(),
    }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window)

    const testLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }
    let controllerRef: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout: testLayout })
      controllerRef = controller
      return (
        <Zeugma
          controller={controller}
          renderPane={(id) => (
            <Pane id={id}>
              <Pane.Content>{(tab) => <div data-testid="tab-content">{tab.id}</div>}</Pane.Content>
            </Pane>
          )}
        />
      )
    }

    render(<TestWrapper />)

    act(() => {
      controllerRef?.popoutTab('tab-1')
    })

    // Should NOT have hardcoded text or button
    expect(screen.queryByText('This panel is open in a new window')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Dock Back' })).toBeNull()
    expect(screen.queryByText('Dock Back')).toBeNull()
    openSpy.mockRestore()
  })

  it('should render custom popout placeholder when provided to Pane.Content', () => {
    const mockWindow = {
      document: document.implementation.createHTMLDocument('Popout'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      focus: vi.fn(),
    }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window)

    const testLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }
    let controllerRef: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout: testLayout })
      controllerRef = controller
      return (
        <Zeugma
          controller={controller}
          renderPane={(id) => (
            <Pane id={id}>
              <Pane.Content
                renderPopoutPlaceholder={({ tabId, dock }) => (
                  <div data-testid="custom-placeholder">
                    <span>Popped out: {tabId}</span>
                    <button onClick={dock} data-testid="dock-btn">
                      Re-dock
                    </button>
                  </div>
                )}
              >
                {(tab) => <div data-testid="tab-content">{tab.id}</div>}
              </Pane.Content>
            </Pane>
          )}
        />
      )
    }

    render(<TestWrapper />)

    act(() => {
      controllerRef?.popoutTab('tab-1')
    })

    expect(screen.getByTestId('custom-placeholder')).toBeDefined()
    expect(screen.getByText('Popped out: tab-1')).toBeDefined()

    act(() => {
      screen.getByTestId('dock-btn').click()
    })

    expect(screen.queryByTestId('custom-placeholder')).toBeNull()
    openSpy.mockRestore()
  })

  it('should render custom popout placeholder when provided globally to Zeugma', () => {
    const mockWindow = {
      document: document.implementation.createHTMLDocument('Popout'),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      close: vi.fn(),
      focus: vi.fn(),
    }
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWindow as unknown as Window)

    const testLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }
    let controllerRef: ZeugmaController | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout: testLayout })
      controllerRef = controller
      return (
        <Zeugma
          controller={controller}
          renderPopoutPlaceholder={({ tabId }) => (
            <div data-testid="global-placeholder">Global popout for {tabId}</div>
          )}
          renderPane={(id) => (
            <Pane id={id}>
              <Pane.Content>{(tab) => <div data-testid="tab-content">{tab.id}</div>}</Pane.Content>
            </Pane>
          )}
        />
      )
    }

    render(<TestWrapper />)

    act(() => {
      controllerRef?.popoutTab('tab-1')
    })

    expect(screen.getByTestId('global-placeholder')).toBeDefined()
    expect(screen.getByText('Global popout for tab-1')).toBeDefined()
    openSpy.mockRestore()
  })
})
