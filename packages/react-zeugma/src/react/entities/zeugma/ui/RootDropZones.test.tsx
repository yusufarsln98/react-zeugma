import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { RootDropZones } from './RootDropZones'

vi.mock('@dnd-kit/core', () => ({
  useDroppable: ({ id }: { id: string }) => ({
    setNodeRef: (el: HTMLElement | null) => {
      if (el) el.dataset.dropId = id
    },
    isOver: false,
  }),
}))

describe('RootDropZones', () => {
  it('positions bottom edge drop zones at the bottom without overriding top', () => {
    const { container } = render(<RootDropZones />)

    const bottomQuarter = container.querySelector(
      '[data-drop-id="drop-root-1/4-bottom"]',
    ) as HTMLElement
    const bottomThird = container.querySelector(
      '[data-drop-id="drop-root-1/3-bottom"]',
    ) as HTMLElement

    expect(bottomQuarter).toBeTruthy()
    expect(bottomQuarter.style.bottom).toBe('0px')
    expect(bottomQuarter.style.top).toBe('')

    expect(bottomThird).toBeTruthy()
    expect(bottomThird.style.bottom).toBe('24px')
    expect(bottomThird.style.top).toBe('')
  })

  it('positions top, left, and right edge drop zones correctly', () => {
    const { container } = render(<RootDropZones />)

    const topQuarter = container.querySelector('[data-drop-id="drop-root-1/4-top"]') as HTMLElement
    const leftQuarter = container.querySelector(
      '[data-drop-id="drop-root-1/4-left"]',
    ) as HTMLElement
    const rightQuarter = container.querySelector(
      '[data-drop-id="drop-root-1/4-right"]',
    ) as HTMLElement

    expect(topQuarter.style.top).toBe('0px')
    expect(topQuarter.style.bottom).toBe('')

    expect(leftQuarter.style.left).toBe('0px')
    expect(leftQuarter.style.top).toBe('48px')

    expect(rightQuarter.style.right).toBe('0px')
    expect(rightQuarter.style.top).toBe('48px')
  })
})
