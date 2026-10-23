import { describe, it, expect } from 'vitest'
import { render, act } from '@testing-library/react'
import { useEffect } from 'react'
import { useZeugma, Zeugma, Pane } from '../../../index'
import type { TreeNode, ZeugmaControllerInternal } from '../../../shared'

describe('Zeugma Drag and Drop Widget Remounting', () => {
  it('should not remount widgets during tab move (reorder)', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaControllerInternal | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as ZeugmaControllerInternal
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div id={`pane-target-${paneId}`}>
            <Pane.Content>{(tab) => <TestWidget tabId={tab.id} />}</Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    // In the new API, only active tabs render immediately (lazy mounting).
    // Let's make tab-2 active once so both get mounted and registered.
    act(() => {
      controllerInstance?.selectTab('pane-1', 'tab-2')
    })
    act(() => {
      controllerInstance?.selectTab('pane-1', 'tab-1')
    })

    expect(mountCount).toBe(2)
    expect(unmountCount).toBe(0)

    // Reset counters before drag
    mountCount = 0
    unmountCount = 0

    // Simulate drag start on tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId('tab-1')
        controllerInstance.setActiveType('tab')

        const newLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabIds: ['tab-2'],
          activeTabId: 'tab-2',
        }
        controllerInstance._internalSetLayout!(newLayout)
      }
    })

    // During drag, no remounts of widgets should happen
    expect(mountCount).toBe(0)
    expect(unmountCount).toBe(0)

    // Simulate drag end on tab-1 (dropping on the same pane, moving it)
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId(null)
        controllerInstance.setActiveType(null)

        const finalLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabIds: ['tab-2', 'tab-1'],
          activeTabId: 'tab-1',
        }
        controllerInstance._internalSetLayout!(finalLayout)
      }
    })

    // After drop, tab-1 should NOT have remounted!
    expect(mountCount).toBe(0)
    expect(unmountCount).toBe(0)
  })

  it('should not remount widgets during split drop', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaControllerInternal | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as ZeugmaControllerInternal
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div id={`pane-target-${paneId}`}>
            <Pane.Content>{(tab) => <TestWidget tabId={tab.id} />}</Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    // In the new API, only active tabs render immediately (lazy mounting).
    // Let's make tab-2 active once so both get mounted and registered.
    act(() => {
      controllerInstance?.selectTab('pane-1', 'tab-2')
    })
    act(() => {
      controllerInstance?.selectTab('pane-1', 'tab-1')
    })

    // Reset counters before drag
    mountCount = 0
    unmountCount = 0

    // Simulate drag start on tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId('tab-1')
        controllerInstance.setActiveType('tab')

        const newLayout: TreeNode = {
          type: 'pane',
          id: 'pane-1',
          tabIds: ['tab-2'],
          activeTabId: 'tab-2',
        }
        controllerInstance._internalSetLayout!(newLayout)
      }
    })

    expect(mountCount).toBe(0)
    expect(unmountCount).toBe(0)

    // Simulate split drop (creating pane-2 and moving tab-1 there)
    act(() => {
      if (controllerInstance) {
        controllerInstance.setActiveId(null)
        controllerInstance.setActiveType(null)

        const finalLayout: TreeNode = {
          type: 'split',
          direction: 'row',
          splitPercentage: 50,
          first: {
            type: 'pane',
            id: 'pane-1',
            tabIds: ['tab-2'],
            activeTabId: 'tab-2',
          },
          second: {
            type: 'pane',
            id: 'pane-2',
            tabIds: ['tab-1'],
            activeTabId: 'tab-1',
          },
        }
        controllerInstance._internalSetLayout!(finalLayout)
      }
    })

    // Expect no remount (no unmounts or additional mounts of target tab)
    expect(mountCount).toBe(0)
    expect(unmountCount).toBe(0)
  })

  it('should not remount widgets during tab switching (activation)', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1', 'tab-2'],
      activeTabId: 'tab-1',
    }

    const unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaControllerInternal | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as ZeugmaControllerInternal
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div id={`pane-target-${paneId}`}>
            <Pane.Content>{(tab) => <TestWidget tabId={tab.id} />}</Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    // Switch active tab in pane-1 from tab-1 to tab-2
    act(() => {
      if (controllerInstance) {
        controllerInstance.selectTab('pane-1', 'tab-2')
      }
    })

    // No unmount should occur when switching tabs
    expect(unmountCount).toBe(0)

    // Switch active tab in pane-1 back from tab-2 to tab-1
    act(() => {
      if (controllerInstance) {
        controllerInstance.selectTab('pane-1', 'tab-1')
      }
    })

    expect(unmountCount).toBe(0)
  })

  it('should remount widgets during window popout and docking transitions', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaControllerInternal | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as ZeugmaControllerInternal
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div id={`pane-target-${paneId}`}>
            <Pane.Content>{(tab) => <TestWidget tabId={tab.id} />}</Pane.Content>
          </div>
        </Pane>
      )
      return <Zeugma controller={controller} renderPane={renderPane} />
    }

    render(<TestWrapper />)

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    // Reset counters before popout simulation
    mountCount = 0
    unmountCount = 0

    // Mock window.open to simulate opening a popout window
    const originalOpen = window.open
    const mockPopoutDoc = document.implementation.createHTMLDocument('mock-popout')
    const mockWindow = {
      document: mockPopoutDoc,
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {},
      close: () => {},
      location: { origin: 'http://localhost' },
    }
    window.open = () => mockWindow as unknown as Window

    try {
      // Popout the tab
      act(() => {
        if (controllerInstance) {
          controllerInstance.popoutTab('tab-1')
        }
      })

      // Widget should remount (unmount old + mount new) because key changes
      expect(unmountCount).toBe(1)
      expect(mountCount).toBe(1)

      // Reset counters
      mountCount = 0
      unmountCount = 0

      // Dock the tab back
      act(() => {
        if (controllerInstance) {
          controllerInstance.dockTab('tab-1')
        }
      })

      // Widget should remount again when docking back
      expect(unmountCount).toBe(1)
      expect(mountCount).toBe(1)
    } finally {
      window.open = originalOpen
    }
  })

  it('should apply renderPopoutWrapper only when popped out and remount widgets on transition', () => {
    const initialLayout: TreeNode = {
      type: 'pane',
      id: 'pane-1',
      tabIds: ['tab-1'],
      activeTabId: 'tab-1',
    }

    let mountCount = 0
    let unmountCount = 0

    const TestWidget = ({ tabId }: { tabId: string }) => {
      useEffect(() => {
        mountCount++
        return () => {
          unmountCount++
        }
      }, [])
      return <div data-testid={`widget-${tabId}`}>{tabId} Content</div>
    }

    let controllerInstance: ZeugmaControllerInternal | null = null

    const TestWrapper = () => {
      const controller = useZeugma({ initialLayout })
      controllerInstance = controller as ZeugmaControllerInternal
      const renderPane = (paneId: string) => (
        <Pane id={paneId}>
          <div id={`pane-target-${paneId}`}>
            <Pane.Content>{(tab) => <TestWidget tabId={tab.id} />}</Pane.Content>
          </div>
        </Pane>
      )
      const renderPopoutWrapper = ({
        children,
      }: {
        document: Document
        children: React.ReactNode
      }) => {
        return <div data-testid="wrapper-popout">{children}</div>
      }
      return (
        <Zeugma
          controller={controller}
          renderPane={renderPane}
          renderPopoutWrapper={renderPopoutWrapper}
        />
      )
    }

    render(<TestWrapper />)

    expect(mountCount).toBe(1)
    expect(unmountCount).toBe(0)

    // Reset counters before popout simulation
    mountCount = 0
    unmountCount = 0

    // Mock window.open to simulate opening a popout window
    const originalOpen = window.open
    const mockPopoutDoc = document.implementation.createHTMLDocument('mock-popout')
    const mockWindow = {
      document: mockPopoutDoc,
      addEventListener: () => {},
      removeEventListener: () => {},
      focus: () => {},
      close: () => {},
      location: { origin: 'http://localhost' },
    }
    window.open = () => mockWindow as unknown as Window

    try {
      // Popout the tab
      act(() => {
        if (controllerInstance) {
          controllerInstance.popoutTab('tab-1')
        }
      })

      // Widget should remount because key changes on popout transition
      expect(unmountCount).toBe(1)
      expect(mountCount).toBe(1)

      // Verify the popout wrapper is applied in the popout document
      const popoutWrapper = mockPopoutDoc.querySelector('[data-testid="wrapper-popout"]')
      expect(popoutWrapper).toBeTruthy()

      // Reset counters
      mountCount = 0
      unmountCount = 0

      // Dock the tab back
      act(() => {
        if (controllerInstance) {
          controllerInstance.dockTab('tab-1')
        }
      })

      // Widget should remount again when docking back
      expect(unmountCount).toBe(1)
      expect(mountCount).toBe(1)
    } finally {
      window.open = originalOpen
    }
  })
})
