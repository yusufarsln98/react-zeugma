import { useState, useCallback } from 'react'

interface UseZeugmaDragMeasurementProps {
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: 'row' | 'column'
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
}

export function useZeugmaDragMeasurement(props: UseZeugmaDragMeasurementProps) {
  const { onDragStart, onDragEnd } = props

  const [overTabId, setOverTabId] = useState<string | null>(null)
  const [overTabPosition, setOverTabPosition] = useState<'before' | 'after' | null>(null)

  const handleDragStartInternal = useCallback(
    (draggingId: string) => {
      onDragStart?.(draggingId)
    },
    [onDragStart],
  )

  const handleDragEndInternal = useCallback(
    (
      actId: string,
      ovId: string | null,
      dropAction: {
        type: 'split' | 'move'
        direction?: 'row' | 'column'
        position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
      } | null,
    ) => {
      onDragEnd?.(actId, ovId, dropAction)
    },
    [onDragEnd],
  )

  return {
    overTabId,
    setOverTabId,
    overTabPosition,
    setOverTabPosition,
    handleDragStartInternal,
    handleDragEndInternal,
  }
}
