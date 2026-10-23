import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useResizer } from './useResizer'
import { ZeugmaStateContext, ZeugmaStateValue, SplitNode, TreeNode } from '../../../shared'

describe('useResizer Hook', () => {
  const dummyNode: SplitNode = {
    type: 'split',
    direction: 'row',
    splitPercentage: 50,
    first: { type: 'pane', id: 'p1', tabIds: ['t1'], activeTabId: 't1' },
    second: { type: 'pane', id: 'p2', tabIds: ['t2'], activeTabId: 't2' },
  }

  const createMockContext = (overrides?: Partial<ZeugmaStateValue>): ZeugmaStateValue =>
    ({
      layout: dummyNode,
      renderingLayout: dummyNode,
      setLayout: vi.fn(),
      activeId: null,
      activeType: null,
      dismissIntentId: null,
      setContainerRef: vi.fn(),
      fullscreenPaneId: null,
      classNames: {},
      minSplitPercentage: 5,
      maxSplitPercentage: 95,
      locked: false,
      setLocked: vi.fn(),
      findPaneById: vi.fn(),
      findPaneContainingTab: vi.fn(),
      findTabById: vi.fn(),
      getTabMetadata: vi.fn(),
      getActiveTabMetadata: vi.fn(),
      poppedOutTabIds: [],
      isTabPoppedOut: vi.fn(() => false),
      ...overrides,
    }) as unknown as ZeugmaStateValue

  it('does not initiate drag when layout is locked', () => {
    const onLayoutChange = vi.fn()
    const containerEl = document.createElement('div')
    const containerRef = { current: containerEl }

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ZeugmaStateContext.Provider value={createMockContext({ locked: true })}>
        {children}
      </ZeugmaStateContext.Provider>
    )

    const { result } = renderHook(
      () =>
        useResizer({
          containerRef,
          isRow: true,
          direction: 'row',
          splitPercentage: 50,
          resizerSize: 4,
          snapThreshold: 8,
          layout: dummyNode,
          currentNode: dummyNode,
          onLayoutChange,
          parentLeft: 0,
          parentTop: 0,
          parentWidth: 100,
          parentHeight: 100,
        }),
      { wrapper },
    )

    const preventDefault = vi.fn()
    const fakeEvent = {
      preventDefault,
      clientX: 100,
      clientY: 100,
      currentTarget: document.createElement('div'),
    } as unknown as React.PointerEvent<HTMLDivElement>

    result.current(fakeEvent)
    expect(preventDefault).not.toHaveBeenCalled()
  })

  it('scopes resizer query to container element instead of entire document', () => {
    const outsideSeparator = document.createElement('div')
    outsideSeparator.setAttribute('role', 'separator')
    outsideSeparator.setAttribute('data-direction', 'row')
    document.body.appendChild(outsideSeparator)

    const containerEl = document.createElement('div')
    const querySelectorAllSpy = vi.spyOn(containerEl, 'querySelectorAll')
    document.body.appendChild(containerEl)

    const resizerEl = document.createElement('div')
    containerEl.appendChild(resizerEl)

    const containerRef = { current: containerEl }
    const onLayoutChange = vi.fn()

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <ZeugmaStateContext.Provider value={createMockContext({ locked: false })}>
        {children}
      </ZeugmaStateContext.Provider>
    )

    const { result } = renderHook(
      () =>
        useResizer({
          containerRef,
          isRow: true,
          direction: 'row',
          splitPercentage: 50,
          resizerSize: 4,
          snapThreshold: 8,
          layout: dummyNode as TreeNode,
          currentNode: dummyNode,
          onLayoutChange,
          parentLeft: 0,
          parentTop: 0,
          parentWidth: 100,
          parentHeight: 100,
        }),
      { wrapper },
    )

    const fakeEvent = {
      preventDefault: vi.fn(),
      clientX: 50,
      clientY: 50,
      currentTarget: resizerEl,
    } as unknown as React.PointerEvent<HTMLDivElement>

    result.current(fakeEvent)

    expect(querySelectorAllSpy).toHaveBeenCalledWith('div[role="separator"][data-direction]')

    // Cleanup
    outsideSeparator.remove()
    containerEl.remove()
  })
})
