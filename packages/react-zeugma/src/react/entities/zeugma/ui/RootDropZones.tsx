import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { rootDropId, RootSplitEdge, RootSplitFraction } from '../../../shared'

interface RootDropZoneProps {
  id: string
  fraction: RootSplitFraction
  edge: RootSplitEdge
  activeClassName?: string
}

function getActivationStyle(edge: RootSplitEdge, fraction: RootSplitFraction): React.CSSProperties {
  const offset = fraction === '1/4' ? 0 : '24px'
  const isHorizontal = edge === 'top' || edge === 'bottom'

  return {
    position: 'absolute',
    [edge]: offset,
    left: isHorizontal ? 0 : edge === 'left' ? offset : undefined,
    right: edge === 'right' ? offset : undefined,
    top: isHorizontal ? offset : '48px',
    width: isHorizontal ? '100%' : '24px',
    height: isHorizontal ? '24px' : 'calc(100% - 96px)',
    zIndex: 100,
    pointerEvents: 'auto',
  }
}

function getPreviewStyle(edge: RootSplitEdge, fraction: RootSplitFraction): React.CSSProperties {
  const size = fraction === '1/4' ? '60px' : '96px'
  const isHorizontal = edge === 'top' || edge === 'bottom'

  const style: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    zIndex: 101,
    boxSizing: 'border-box',
    width: isHorizontal ? '100%' : size,
    height: isHorizontal ? size : '100%',
    top: edge === 'bottom' ? undefined : 0,
    bottom: edge === 'bottom' ? 0 : undefined,
    left: edge === 'right' ? undefined : 0,
    right: edge === 'right' ? 0 : undefined,
  }

  if (edge === 'top') {
    style.borderBottomLeftRadius = '12px'
    style.borderBottomRightRadius = '12px'
    style.borderTopLeftRadius = '0px'
    style.borderTopRightRadius = '0px'
  } else if (edge === 'bottom') {
    style.borderTopLeftRadius = '12px'
    style.borderTopRightRadius = '12px'
    style.borderBottomLeftRadius = '0px'
    style.borderBottomRightRadius = '0px'
  } else if (edge === 'left') {
    style.borderTopRightRadius = '12px'
    style.borderBottomRightRadius = '12px'
    style.borderTopLeftRadius = '0px'
    style.borderBottomLeftRadius = '0px'
  } else if (edge === 'right') {
    style.borderTopLeftRadius = '12px'
    style.borderBottomLeftRadius = '12px'
    style.borderTopRightRadius = '0px'
    style.borderBottomRightRadius = '0px'
  }

  return style
}

const ROOT_EDGES: RootSplitEdge[] = ['top', 'bottom', 'left', 'right']
const ROOT_FRACTIONS: RootSplitFraction[] = ['1/4', '1/3']

const ROOT_ZONES: Array<{
  id: string
  fraction: RootSplitFraction
  edge: RootSplitEdge
  activationStyle: React.CSSProperties
  previewStyle: React.CSSProperties
}> = ROOT_EDGES.flatMap((edge) =>
  ROOT_FRACTIONS.map((fraction) => ({
    id: rootDropId(fraction, edge),
    fraction,
    edge,
    activationStyle: getActivationStyle(edge, fraction),
    previewStyle: getPreviewStyle(edge, fraction),
  })),
)

const CONTAINER_STYLE: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 99,
  pointerEvents: 'none',
}

const RootDropZone: React.FC<
  RootDropZoneProps & {
    activationStyle: React.CSSProperties
    previewStyle: React.CSSProperties
  }
> = ({ id, activeClassName, activationStyle, previewStyle }) => {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <>
      <div ref={setNodeRef} style={activationStyle} />
      {isOver && <div className={activeClassName} style={previewStyle} />}
    </>
  )
}

interface RootDropZonesProps {
  activeClassName?: string
}

export const RootDropZones: React.FC<RootDropZonesProps> = ({ activeClassName }) => {
  return (
    <div style={CONTAINER_STYLE}>
      {ROOT_ZONES.map((zone) => (
        <RootDropZone
          key={zone.id}
          id={zone.id}
          fraction={zone.fraction}
          edge={zone.edge}
          activeClassName={activeClassName}
          activationStyle={zone.activationStyle}
          previewStyle={zone.previewStyle}
        />
      ))}
    </div>
  )
}
