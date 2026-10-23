import { describe, it, expect, beforeEach } from 'vitest'
import { useState } from 'react'
import { render, screen, act } from '@testing-library/react'
import { useRenderCounter } from './use-render-counter'
import { clearAllCounters } from '../../core/devtools'
import { RenderCounterBadge } from './render-counter-badge'
import { RenderCounterFooter } from './render-counter-footer'

function TestComponent({ id }: { id?: string }) {
  const { mounts, renders, reset } = useRenderCounter(id)
  const [, setDummy] = useState(0)

  return (
    <div>
      <span data-testid="mounts">{mounts}</span>
      <span data-testid="renders">{renders}</span>
      <button data-testid="rerender-btn" onClick={() => setDummy((x) => x + 1)}>
        Re-render
      </button>
      <button data-testid="reset-btn" onClick={reset}>
        Reset
      </button>
    </div>
  )
}

describe('useRenderCounter & DevTools', () => {
  beforeEach(() => {
    clearAllCounters()
  })

  it('tracks mounts and renders correctly for a component', () => {
    render(<TestComponent id="test-1" />)

    expect(screen.getByTestId('mounts').textContent).toBe('1')
    expect(screen.getByTestId('renders').textContent).toBe('2')
  })

  it('increments render count on re-render without incrementing mount count', () => {
    render(<TestComponent id="test-2" />)

    act(() => {
      screen.getByTestId('rerender-btn').click()
    })

    expect(screen.getByTestId('mounts').textContent).toBe('1')
    expect(screen.getByTestId('renders').textContent).toBe('3')
  })

  it('resets counters when reset is triggered', () => {
    render(<TestComponent id="test-3" />)

    act(() => {
      screen.getByTestId('rerender-btn').click()
    })
    expect(screen.getByTestId('renders').textContent).toBe('3')

    act(() => {
      screen.getByTestId('reset-btn').click()
    })

    expect(screen.getByTestId('mounts').textContent).toBe('0')
    expect(screen.getByTestId('renders').textContent).toBe('1')
  })

  it('renders RenderCounterBadge correctly', () => {
    render(<RenderCounterBadge id="badge-test" disabled={false} />)
    expect(screen.getByText('M:')).toBeTruthy()
    expect(screen.getByText('R:')).toBeTruthy()
  })

  it('hides RenderCounterBadge when disabled', () => {
    const { container } = render(<RenderCounterBadge id="badge-disabled" disabled={true} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders RenderCounterFooter correctly', () => {
    render(
      <RenderCounterFooter id="footer-test" label="My Widget" disabled={false}>
        <div>Content</div>
      </RenderCounterFooter>,
    )
    expect(screen.getByText('My Widget')).toBeTruthy()
    expect(screen.getByText('Mounts:')).toBeTruthy()
    expect(screen.getByText('Renders:')).toBeTruthy()
  })

  it('renders only children in RenderCounterFooter when disabled', () => {
    render(
      <RenderCounterFooter id="footer-disabled" label="Hidden Footer" disabled={true}>
        <div>Only Content</div>
      </RenderCounterFooter>,
    )
    expect(screen.queryByText('Hidden Footer')).toBeNull()
    expect(screen.queryByText('Mounts:')).toBeNull()
    expect(screen.getByText('Only Content')).toBeTruthy()
  })
})
