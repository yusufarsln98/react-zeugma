import { useEffect, useRef } from 'react'
import { TabDetails } from '../../../shared'
import {
  setupPopoutInterception,
  teardownPopoutInterception,
  getActivePopoutDocuments,
  addActivePopoutDocument,
  removeActivePopoutDocument,
  setActivePopoutDocument,
  setLastActiveEvent,
  startHeadObserver,
  stopHeadObserver,
  startHtmlObserver,
  stopHtmlObserver,
  copyDocumentStyles,
  copyDocumentClasses,
  detectSeamlessBackground,
  applyThemeAndBackground,
  openPopoutWindow,
  setupPopoutContainer,
  bindPopoutTracking,
  closePopoutWindow,
} from '../../../../core/popout'

export interface UseZeugmaPopoutsProps {
  poppedOutTabIds: string[]
  registerPopoutTarget?: (tabId: string, el: HTMLDivElement | null) => void
  findTabById: (tabId: string) => TabDetails | null
  dockTab: (tabId: string) => void
}

export function useZeugmaPopouts(props: UseZeugmaPopoutsProps): void {
  const { poppedOutTabIds, registerPopoutTarget, findTabById, dockTab } = props
  const popoutWindowsRef = useRef<Record<string, Window>>({})

  // Synchronize popout windows with poppedOutTabIds state
  useEffect(() => {
    if (poppedOutTabIds.length > 0) {
      setupPopoutInterception()
    }

    const activeWindows = popoutWindowsRef.current
    const activeDocs = getActivePopoutDocuments()

    poppedOutTabIds.forEach((tabId) => {
      if (activeWindows[tabId]) {
        try {
          activeWindows[tabId].focus()
        } catch {
          // Window might have been closed/blocked
        }
        return
      }

      setupPopoutInterception()

      const tabDetails = findTabById(tabId)
      const title = (tabDetails?.metadata?.title as string) || `Tab ${tabId}`

      const popup = openPopoutWindow(tabId, title)
      if (!popup) {
        console.warn('Failed to open popout window. Check popup blocker.')
        dockTab(tabId)
        return
      }

      activeWindows[tabId] = popup
      addActivePopoutDocument(popup.document)

      startHeadObserver(activeDocs)
      startHtmlObserver(activeDocs)

      // Copy document styles & classes
      copyDocumentStyles(popup)
      copyDocumentClasses(popup)

      // Detect background and apply theme
      const finalBgColor = detectSeamlessBackground(tabId)
      applyThemeAndBackground(popup, finalBgColor)

      // Create container
      const container = setupPopoutContainer(popup, tabId)

      // Register target
      registerPopoutTarget?.(tabId, container)

      // Bind tracking & unload events
      bindPopoutTracking(
        popup,
        (e: Event) => {
          setLastActiveEvent(e)
          setActivePopoutDocument(popup.document)

          setTimeout(() => {
            setLastActiveEvent(null)
            setActivePopoutDocument(null)
          }, 0)
        },
        () => {
          setLastActiveEvent(null)
          setActivePopoutDocument(null)
          removeActivePopoutDocument(popup.document)
          if (activeDocs.size === 0) {
            stopHeadObserver()
            stopHtmlObserver()
            teardownPopoutInterception()
          }
          dockTab(tabId)
        },
      )
    })

    // Close windows for tabs that are no longer popped out
    Object.keys(activeWindows).forEach((tabId) => {
      if (!poppedOutTabIds.includes(tabId)) {
        const popup = activeWindows[tabId]
        delete activeWindows[tabId]
        registerPopoutTarget?.(tabId, null)
        if (popup) {
          removeActivePopoutDocument(popup.document)
          if (activeDocs.size === 0) {
            stopHeadObserver()
            stopHtmlObserver()
            teardownPopoutInterception()
          }
          closePopoutWindow(popup)
        }
      }
    })
  }, [poppedOutTabIds, registerPopoutTarget, findTabById, dockTab])

  // Clean up all popout windows on unmount
  useEffect(() => {
    const activeWindows = popoutWindowsRef.current
    return () => {
      const activeDocs = getActivePopoutDocuments()
      Object.keys(activeWindows).forEach((tabId) => {
        const popup = activeWindows[tabId]
        if (popup) {
          removeActivePopoutDocument(popup.document)
          closePopoutWindow(popup)
        }
      })
      if (activeDocs.size === 0) {
        stopHeadObserver()
        stopHtmlObserver()
        teardownPopoutInterception()
      }
    }
  }, [])
}
