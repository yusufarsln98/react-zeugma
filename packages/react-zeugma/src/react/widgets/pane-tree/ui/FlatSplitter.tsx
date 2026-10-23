import React, { useState } from 'react'
import { useZeugmaState } from '../../../shared'
import { useResizer } from '../../../features/resize-pane'
import { ComputedSplitter } from '../../../../core/tree'

interface FlatSplitterProps {
  splitter: ComputedSplitter
  resizerSize: number
  snapThreshold: number
  containerRef: React.RefObject<HTMLDivElement | null>
}

export const FlatSplitter: React.FC<FlatSplitterProps> = ({
  splitter,
  resizerSize,
  snapThreshold,
  containerRef,
}) => {
  const {
    renderingLayout,
    setLayout,
    classNames,
    locked,
    minSplitPercentage = 5,
    maxSplitPercentage = 95,
  } = useZeugmaState()
  const [isResizing, setIsResizing] = useState(false)

  const {
    currentNode,
    direction,
    left,
    top,
    width,
    height,
    parentLeft,
    parentTop,
    parentWidth,
    parentHeight,
  } = splitter

  const isRow = direction === 'row'

  const handlePointerDown = useResizer({
    containerRef,
    isRow,
    direction,
    splitPercentage: currentNode.splitPercentage,
    resizerSize,
    snapThreshold,
    layout: renderingLayout,
    currentNode,
    onLayoutChange: setLayout,
    onResizeStart: () => setIsResizing(true),
    onResizeEnd: () => setIsResizing(false),
    parentLeft,
    parentTop,
    parentWidth,
    parentHeight,
  })

  const style: React.CSSProperties = isRow
    ? {
        position: 'absolute',
        left: `calc(var(--splitter-pos-${splitter.id}, ${left}%) - ${resizerSize / 2}px)`,
        top: `calc(${top}% + ${resizerSize / 2}px)`,
        width: `${resizerSize}px`,
        height: `calc(${height}% - ${resizerSize}px)`,
        cursor: locked ? 'default' : 'col-resize',
        pointerEvents: locked ? 'none' : 'auto',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: `calc(${left}% + ${resizerSize / 2}px)`,
        top: `calc(var(--splitter-pos-${splitter.id}, ${top}%) - ${resizerSize / 2}px)`,
        width: `calc(${width}% - ${resizerSize}px)`,
        height: `${resizerSize}px`,
        cursor: locked ? 'default' : 'row-resize',
        pointerEvents: locked ? 'none' : 'auto',
        zIndex: 10,
        userSelect: 'none',
        touchAction: 'none',
        boxSizing: 'border-box',
      }

  return (
    <div
      className={classNames.resizer || ''}
      data-direction={direction}
      data-resizing={isResizing || undefined}
      style={style}
      onPointerDown={handlePointerDown}
      role="separator"
      aria-orientation={isRow ? 'vertical' : 'horizontal'}
      aria-valuenow={currentNode.splitPercentage}
      aria-valuemin={minSplitPercentage}
      aria-valuemax={maxSplitPercentage}
    />
  )
}

export const MemoizedPaneContent = React.memo(
  ({ paneId, renderPane }: { paneId: string; renderPane: (paneId: string) => React.ReactNode }) => {
    return <>{renderPane(paneId)}</>
  },
  (prev, next) => prev.paneId === next.paneId && prev.renderPane === next.renderPane,
)
