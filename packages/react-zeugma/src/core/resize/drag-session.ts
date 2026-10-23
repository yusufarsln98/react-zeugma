/**
 * Shared drag-session lifecycle utility.
 *
 * Handles the common boilerplate for pointer-based resize operations:
 * - Adds `zeugma-resizing` class to `document.body`
 * - Injects a global `cursor` style so the resize cursor stays active
 *   even when the pointer leaves the handle element
 * - Sets `data-resizing` on the resizer element
 * - Attaches `pointermove` / `pointerup` listeners to `document`
 * - Cleans everything up on pointer-up
 *
 * Consumers provide domain-specific `onMove` and `onEnd` callbacks.
 */

export interface DragSessionConfig {
  /** CSS cursor to enforce globally during the drag */
  cursor: 'col-resize' | 'row-resize'
  /** The resizer DOM element (receives `data-resizing` attribute) */
  resizerEl: HTMLElement
  /** Called on every `pointermove` during the drag */
  onMove: (e: PointerEvent) => void
  /** Called once on `pointerup` — after cleanup has already run */
  onEnd: () => void
}

export function createDragSession({
  cursor,
  resizerEl,
  onMove,
  onEnd,
}: DragSessionConfig): () => void {
  // 1. Body class
  document.body.classList.add('zeugma-resizing')

  // 2. Global cursor override
  const styleEl = document.createElement('style')
  styleEl.id = 'zeugma-global-cursor-style'
  styleEl.textContent = `
    * {
      cursor: ${cursor} !important;
      user-select: none !important;
    }
    .zeugma-resizing *:not([role="separator"]) {
      pointer-events: none !important;
    }
  `
  document.head.appendChild(styleEl)

  // 3. Mark the resizer element
  resizerEl.setAttribute('data-resizing', 'true')

  // 4. Cleanup function
  let isCleanedUp = false
  const cleanup = () => {
    if (isCleanedUp) return
    isCleanedUp = true

    document.body.classList.remove('zeugma-resizing')
    resizerEl.removeAttribute('data-resizing')

    const globalStyle = document.getElementById('zeugma-global-cursor-style')
    if (globalStyle) {
      globalStyle.remove()
    }

    document.removeEventListener('pointermove', handlePointerMove)
    document.removeEventListener('pointerup', handlePointerUp)
    document.removeEventListener('pointercancel', handlePointerCancel)
    window.removeEventListener('blur', handleWindowBlur)
  }

  // 5. Document-level listeners
  const handlePointerMove = (e: PointerEvent) => {
    onMove(e)
  }

  const handlePointerUp = () => {
    cleanup()
    onEnd()
  }

  const handlePointerCancel = () => {
    cleanup()
    onEnd()
  }

  const handleWindowBlur = () => {
    cleanup()
    onEnd()
  }

  document.addEventListener('pointermove', handlePointerMove)
  document.addEventListener('pointerup', handlePointerUp)
  document.addEventListener('pointercancel', handlePointerCancel)
  window.addEventListener('blur', handleWindowBlur)

  return cleanup
}
