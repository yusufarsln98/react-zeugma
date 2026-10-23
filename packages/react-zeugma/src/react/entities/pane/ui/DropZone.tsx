import React from 'react'
import { useDroppable } from '@dnd-kit/core'

export interface DropZoneProps {
  id: string
  position: 'top' | 'bottom' | 'left' | 'right' | 'full' | 'top-header' | 'center'
  activeClassName?: string
}

const activationPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '100%',
    height: '25%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  left: {
    position: 'absolute',
    top: '25%',
    left: 0,
    width: '50%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  right: {
    position: 'absolute',
    top: '25%',
    right: 0,
    width: '50%',
    height: '50%',
    zIndex: 20,
    pointerEvents: 'auto',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    pointerEvents: 'auto',
    cursor: 'not-allowed',
  },
  center: {
    position: 'absolute',
    top: '25%',
    left: '25%',
    width: '50%',
    height: '50%',
    zIndex: 22,
    pointerEvents: 'auto',
  },
}

const previewPositions: Record<string, React.CSSProperties> = {
  top: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  left: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  right: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: '50%',
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  full: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 21,
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
}

export const DropZone: React.FC<DropZoneProps> = ({ id, position, activeClassName }) => {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <>
      <div ref={setNodeRef} style={activationPositions[position]} />
      {isOver && <div className={activeClassName} style={previewPositions[position]} />}
    </>
  )
}
