import type { ReactNode, CSSProperties } from 'react'

export interface RenderCounterOptions {
  /**
   * Optional custom ID to track or share counters across component mounts/renders.
   * If omitted, a unique instance ID is generated.
   */
  id?: string
  /**
   * Whether to log mount and render counter events to the browser console.
   * @default false
   */
  logToConsole?: boolean
  /**
   * If set to true, counter tracking logic is disabled and returns 0 mounts / 0 renders.
   * Useful for conditionally disabling tracking in production builds.
   * @default false
   */
  disabled?: boolean
}

export interface RenderCounterState {
  /**
   * The total number of times the component has mounted to the DOM.
   */
  mounts: number
  /**
   * The total number of render executions (including initial render and re-renders).
   */
  renders: number
  /**
   * Resets the mount and render counts back to 0.
   */
  reset: () => void
}

export interface RenderCounterBadgeProps {
  /**
   * Optional identifier. Defaults to auto-generated ID if omitted.
   */
  id?: string
  /**
   * Visual badge placement relative to container.
   * @default 'top-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  /**
   * Optional custom CSS class name.
   */
  className?: string
  /**
   * Custom inline styles.
   */
  style?: CSSProperties
  /**
   * Log counter changes to browser console.
   */
  logToConsole?: boolean
  /**
   * If true, hides the badge component.
   * @default false
   */
  disabled?: boolean
}

export interface RenderCounterFooterProps {
  /**
   * Optional identifier or tab label.
   */
  id?: string
  /**
   * Optional label shown on the left side of the footer.
   */
  label?: string
  /**
   * Child element(s) wrapped inside the container.
   */
  children?: ReactNode
  /**
   * Custom container CSS class name.
   */
  className?: string
  /**
   * Custom footer bar CSS class name.
   */
  footerClassName?: string
  /**
   * Custom inline styles for container.
   */
  style?: CSSProperties
  /**
   * Log counter changes to browser console.
   */
  logToConsole?: boolean
  /**
   * If true, hides the footer status bar and renders children directly.
   * @default false
   */
  disabled?: boolean
}
