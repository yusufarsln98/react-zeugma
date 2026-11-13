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
  popoutUrl?: string | ((tabId: string) => string)
}

export function useZeugmaPopouts(props: UseZeugmaPopoutsProps): void {
  const { poppedOutTabIds, registerPopoutTarget, findTabById, dockTab, popoutUrl } = props
  const popoutWindowsRef = useRef<Record<string, Window>>({})
  const loadCleanupsRef = useRef<Record<string, () => void>>({})
  const popoutUrlRef = useRef(popoutUrl)
  popoutUrlRef.current = popoutUrl

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
      const configuredUrl = popoutUrlRef.current
      const resolvedUrl =
        typeof configuredUrl === 'function'
          ? configuredUrl(tabId)
          : (configuredUrl ?? '/popout.html')

      const popup = openPopoutWindow(tabId, title, resolvedUrl)
      if (!popup) {
        console.warn('Failed to open popout window. Check popup blocker.')
        dockTab(tabId)
        return
      }

      activeWindows[tabId] = popup

      const initializePopoutDocument = () => {
        if (activeWindows[tabId] !== popup || popup.closed) return

        if (resolvedUrl) {
          popup.document.title = title
          popup.document.head.innerHTML = ''
        }

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
      }

      const hasLocation = typeof popup.location?.href === 'string'
      const isAsyncUrl =
        Boolean(resolvedUrl) &&
        hasLocation &&
        (popup.location.href === 'about:blank' || popup.document?.readyState !== 'complete')

      if (isAsyncUrl) {
        const onLoad = () => {
          popup.removeEventListener('load', onLoad)
          delete loadCleanupsRef.current[tabId]
          initializePopoutDocument()
        }
        loadCleanupsRef.current[tabId] = () => {
          popup.removeEventListener('load', onLoad)
        }
        popup.addEventListener('load', onLoad)
      } else {
        initializePopoutDocument()
      }
    })

    // Close windows for tabs that are no longer popped out
    Object.keys(activeWindows).forEach((tabId) => {
      if (!poppedOutTabIds.includes(tabId)) {
        loadCleanupsRef.current[tabId]?.()
        delete loadCleanupsRef.current[tabId]
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
    const loadCleanups = loadCleanupsRef.current
    return () => {
      const activeDocs = getActivePopoutDocuments()
      Object.keys(loadCleanups).forEach((tabId) => {
        loadCleanups[tabId]?.()
        delete loadCleanups[tabId]
      })
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
