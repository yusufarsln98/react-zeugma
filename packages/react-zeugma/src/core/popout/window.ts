export const delayClose = (closeFn: () => void) => {
  if (typeof requestAnimationFrame !== 'undefined') {
    requestAnimationFrame(closeFn)
  } else {
    setTimeout(closeFn, 0)
  }
}

export function openPopoutWindow(tabId: string, title: string): Window | null {
  if (typeof window === 'undefined') return null
  const popup = window.open('', `zeugma-popout-${tabId}`, 'width=800,height=600')
  if (!popup) return null

  popup.document.title = title
  popup.document.head.innerHTML = ''
  return popup
}

export function setupPopoutContainer(popup: Window, tabId: string): HTMLDivElement {
  const container = popup.document.createElement('div')
  container.id = `zeugma-popout-container-${tabId}`
  container.className = 'zeugma-popout-container'
  container.style.width = '100%'
  container.style.height = '100%'
  container.style.overflow = 'hidden'
  container.style.border = 'none'
  popup.document.body.appendChild(container)
  return container
}

const EVENTS_TO_TRACK = [
  'pointerdown',
  'mousedown',
  'click',
  'keydown',
  'focus',
  'touchstart',
] as const

export interface PopoutWindowBindings {
  trackEvent: (e: Event) => void
  handleUnload: () => void
  cleanup: () => void
}

export function bindPopoutTracking(
  popup: Window,
  onEvent: (e: Event) => void,
  onUnload: () => void,
): () => void {
  const trackEvent = (e: Event) => {
    onEvent(e)
  }

  EVENTS_TO_TRACK.forEach((evtName) => {
    popup.addEventListener(evtName, trackEvent, true)
  })

  popup.addEventListener('beforeunload', onUnload)

  const cleanup = () => {
    EVENTS_TO_TRACK.forEach((evtName) => {
      popup.removeEventListener(evtName, trackEvent, true)
    })
    popup.removeEventListener('beforeunload', onUnload)
  }

  ;(popup as unknown as { __zeugmaCleanup?: () => void }).__zeugmaCleanup = cleanup
  return cleanup
}

export function closePopoutWindow(popup: Window): void {
  try {
    const popupObj = popup as unknown as { __zeugmaCleanup?: () => void; close: () => void }
    if (popupObj.__zeugmaCleanup) {
      popupObj.__zeugmaCleanup()
    }
    delayClose(() => {
      try {
        popupObj.close()
      } catch {}
    })
  } catch {}
}
