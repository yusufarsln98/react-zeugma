import React, { useRef, useMemo } from 'react'
import { useZeugmaState } from '../../../shared'
import { TreeNode } from '../../../shared'
import { computeLayout } from '../../../../core/tree'
import { RootDropZones } from '../../../entities/zeugma/ui'
import { FlatSplitter, MemoizedPaneContent } from './FlatSplitter'
import { useRegisterRenderPane } from '../../../entities/zeugma/model'

export interface PaneTreeProps {
  /** Render function mapping unique pane nodes to React elements. Usually renders a <Pane> wrapper. */
  renderPane: (paneId: string) => React.ReactNode
  /** The layout subtree node to render. If not specified, defaults to the root layout tree from the Zeugma context. */
  tree?: TreeNode | null
  /** Size/thickness of the split handle resizer bars in pixels (default 4). */
  resizerSize?: number
  /** Threshold distance in pixels to snap layout resizers to adjacent edges (default 8). */
  snapThreshold?: number
}

export const PaneTree: React.FC<PaneTreeProps> = ({
  renderPane,
  tree,
  resizerSize: propResizerSize,
  snapThreshold: propSnapThreshold,
}) => {
  useRegisterRenderPane(renderPane)
  const {
    renderingLayout,
    activeId,
    dismissIntentId,
    setContainerRef,
    fullscreenPaneId,
    snapThreshold: contextSnapThreshold,
    locked,
    classNames,
    resizerSize: contextResizerSize,
  } = useZeugmaState()

  const snapThreshold =
    propSnapThreshold !== undefined ? propSnapThreshold : (contextSnapThreshold ?? 8)

  const resizerSize = propResizerSize !== undefined ? propResizerSize : (contextResizerSize ?? 4)

  const currentNode = tree !== undefined ? tree : renderingLayout

  const containerRef = useRef<HTMLDivElement>(null)

  const { panes, splitters } = useMemo(() => {
    if (!currentNode) return { panes: [], splitters: [] }
    return computeLayout(currentNode)
  }, [currentNode])

  if (!currentNode && tree !== undefined) return null

  const renderContent = () => {
    return (
      <>
        {panes.map((pane) => {
          const isFullscreen = fullscreenPaneId === pane.paneId
          return (
            <div
              key={pane.paneId}
              style={{
                position: 'absolute',
                left: isFullscreen ? '0%' : `var(--pane-left-${pane.paneId}, ${pane.left}%)`,
                top: isFullscreen ? '0%' : `var(--pane-top-${pane.paneId}, ${pane.top}%)`,
                width: isFullscreen ? '100%' : `var(--pane-width-${pane.paneId}, ${pane.width}%)`,
                height: isFullscreen
                  ? '100%'
                  : `var(--pane-height-${pane.paneId}, ${pane.height}%)`,
                overflow: 'hidden',
                zIndex: isFullscreen ? 20 : 1,
                display: fullscreenPaneId && !isFullscreen ? 'none' : 'block',
                padding: isFullscreen ? '0px' : `${resizerSize / 2}px`,
                boxSizing: 'border-box',
              }}
            >
              <MemoizedPaneContent paneId={pane.paneId} renderPane={renderPane} />
            </div>
          )
        })}

        {!fullscreenPaneId &&
          splitters.map((splitter) => (
            <FlatSplitter
              key={splitter.id}
              splitter={splitter}
              resizerSize={resizerSize}
              snapThreshold={snapThreshold}
              containerRef={containerRef}
            />
          ))}
      </>
    )
  }

  // Only render RootDropZones at the top-level PaneTree (where tree is undefined)
  if (tree === undefined) {
    const isDismissActive = activeId !== null && activeId === dismissIntentId

    // Merge container refs
    const handleRef = (el: HTMLDivElement | null) => {
      setContainerRef(el)
      ;(containerRef as React.RefObject<HTMLDivElement | null>).current = el
    }

    const dashboardClass = `${classNames.dashboard || ''} ${
      isDismissActive ? classNames.dashboardDismissActive || '' : ''
    } ${locked ? classNames.dashboardLocked || '' : ''}`.trim()

    return (
      <div
        ref={handleRef}
        className={dashboardClass}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {renderContent()}
        {activeId !== null && !locked && (
          <RootDropZones activeClassName={classNames.rootDropPreview ?? classNames.dropPreview} />
        )}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {renderContent()}
    </div>
  )
}
