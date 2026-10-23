import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TabDetails, useZeugmaState } from '../../../shared'

export interface PortalHostItemProps {
  tabDetails: TabDetails
  target: HTMLDivElement | null
  renderWidget?: (tab: TabDetails) => React.ReactNode
}

export const PortalHostItem: React.FC<PortalHostItemProps> = React.memo(
  ({ tabDetails, target, renderWidget }) => {
    const { id: tabId } = tabDetails
    const { renderPopoutWrapper } = useZeugmaState()
    const [mounted, setMounted] = useState(false)
    const wrapperRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      setMounted(true)
    }, [])

    // Move the stable wrapper in the DOM when the target pane element changes
    useEffect(() => {
      if (!mounted || !wrapperRef.current) return

      const wrapper = wrapperRef.current
      if (target) {
        target.ownerDocument.adoptNode(wrapper)
        target.appendChild(wrapper)
      } else {
        let hiddenContainer = document.getElementById('zeugma-hidden-portal-container')
        if (!hiddenContainer) {
          hiddenContainer = document.createElement('div')
          hiddenContainer.id = 'zeugma-hidden-portal-container'
          hiddenContainer.style.display = 'none'
          document.body.appendChild(hiddenContainer)
        }
        document.adoptNode(wrapper)
        hiddenContainer.appendChild(wrapper)
      }
    }, [target, mounted])

    // Clean up the DOM element on unmount
    useEffect(() => {
      return () => {
        if (wrapperRef.current) {
          wrapperRef.current.remove()
        }
      }
    }, [])

    if (!mounted) return null

    const targetDoc = target ? target.ownerDocument : document
    if (wrapperRef.current && wrapperRef.current.ownerDocument !== targetDoc) {
      targetDoc.adoptNode(wrapperRef.current)
    }

    if (!wrapperRef.current) {
      wrapperRef.current = targetDoc.createElement('div')
      wrapperRef.current.className = `zeugma-portal-wrapper-${tabId}`
      wrapperRef.current.style.width = '100%'
      wrapperRef.current.style.height = '100%'
    }

    const wrapper = wrapperRef.current

    if (!wrapper || !renderWidget) return null

    const isPopped = !!(target && target.ownerDocument && target.ownerDocument !== document)

    // Always force remount when transitioning between docked and popped states.
    // This ensures all hooks (e.g. antd's useGlobalCache, Leaflet's map init) run fresh
    // with the correct document context and style provider cache.
    const keySuffix = isPopped ? '-popped' : '-docked'
    let widget: React.ReactNode = (
      <React.Fragment key={`${tabId}${keySuffix}`}>{renderWidget(tabDetails)}</React.Fragment>
    )

    // Apply the consumer's popout wrapper only when actually popped out.
    // This wrapper typically provides StyleProvider/StyleSheetManager targeting
    // the popout document's <head> for correct CSS injection.
    if (isPopped && renderPopoutWrapper) {
      widget = renderPopoutWrapper({
        tabId,
        document: targetDoc,
        window: targetDoc.defaultView || window,
        children: widget,
      })
    }

    return createPortal(widget, wrapper)
  },
  (prev, next) => {
    return (
      prev.target === next.target &&
      prev.renderWidget === next.renderWidget &&
      prev.tabDetails.id === next.tabDetails.id &&
      prev.tabDetails.paneId === next.tabDetails.paneId &&
      prev.tabDetails.isActive === next.tabDetails.isActive &&
      prev.tabDetails.index === next.tabDetails.index &&
      prev.tabDetails.metadata === next.tabDetails.metadata
    )
  },
)
