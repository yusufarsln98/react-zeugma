import { useRef, useState, useCallback, useMemo } from 'react'
import type { TabDetails } from '../../../shared'

export function usePortalRegistry() {
  const [portalTargets, setPortalTargets] = useState<Record<string, HTMLDivElement | null>>({})
  const [popoutTargets, setPopoutTargets] = useState<Record<string, HTMLDivElement | null>>({})
  const renderCallbacksRef = useRef<Record<string, (tab: TabDetails) => React.ReactNode>>({})
  const renderPaneRef = useRef<((paneId: string) => React.ReactNode) | null>(null)
  const tabHeadersRef = useRef<
    Record<string, (props: { isDragging: boolean; isOver: boolean }) => React.ReactNode>
  >({})
  const activeIdRef = useRef<string | null>(null)

  const registerPortalTarget = useCallback(
    (tabId: string, el: HTMLDivElement | null, expectedEl?: HTMLDivElement | null) => {
      setPortalTargets((prev) => {
        if (!el) {
          if (expectedEl && prev[tabId] !== expectedEl) {
            return prev
          }
          if (!prev[tabId]) return prev
          const next = { ...prev }
          delete next[tabId]
          return next
        }
        if (prev[tabId] === el) return prev
        return { ...prev, [tabId]: el }
      })
    },
    [],
  )

  const registerPopoutTarget = useCallback((tabId: string, el: HTMLDivElement | null) => {
    setPopoutTargets((prev) => {
      if (!el) {
        if (!prev[tabId]) return prev
        const next = { ...prev }
        delete next[tabId]
        return next
      }
      if (prev[tabId] === el) return prev
      return { ...prev, [tabId]: el }
    })
  }, [])

  const registerRenderCallback = useCallback(
    (tabId: string, render: (tab: TabDetails) => React.ReactNode) => {
      renderCallbacksRef.current[tabId] = render
    },
    [],
  )

  const registerRenderPane = useCallback((render: (paneId: string) => React.ReactNode) => {
    renderPaneRef.current = render
  }, [])

  const registerTabHeader = useCallback(
    (
      tabId: string,
      render: (props: { isDragging: boolean; isOver: boolean }) => React.ReactNode,
    ) => {
      tabHeadersRef.current[tabId] = render
    },
    [],
  )

  const mergedTargets = useMemo(() => {
    return { ...portalTargets, ...popoutTargets }
  }, [portalTargets, popoutTargets])

  return {
    portalTargets: mergedTargets,
    registerPortalTarget,
    registerPopoutTarget,
    registerRenderCallback,
    renderCallbacksRef,
    registerRenderPane,
    renderPaneRef,
    registerTabHeader,
    tabHeadersRef,
    activeIdRef,
  }
}
