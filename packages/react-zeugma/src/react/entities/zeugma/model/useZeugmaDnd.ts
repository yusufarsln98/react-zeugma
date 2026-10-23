import { useState, useRef, Dispatch, SetStateAction } from 'react'
import { useSensor, useSensors, DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { SplitDirection, TreeNode } from '../../../shared'
import {
  DEFAULT_TOUCH_ACTIVATION_DELAY,
  DEFAULT_TOUCH_ACTIVATION_TOLERANCE,
} from '../../../../core/config'
import {
  parseActiveId,
  parseDropTarget,
  getPointerCoordinates,
  resolvePointer,
  getTabDropPosition,
  distanceOutsideRect,
  resolveDrop,
} from '../../../../core/dnd'
import {
  removePane as removePaneHelper,
  removeTab as removeTabHelper,
  selectTab,
  findPaneContainingTab,
} from '../../../../core/tree'
import { SmartPointerSensor, SmartTouchSensor } from '../lib/sensors'
import { useLatestPointer, useBodyCursorOverride } from './hooks'
import { customCollisionDetection } from '../lib/collisions'

interface UseZeugmaDndProps {
  layout: TreeNode | null
  _internalSetLayout: Dispatch<SetStateAction<TreeNode | null>>
  setLayout: (nextLayout: SetStateAction<TreeNode | null>) => void
  activeId: string | null
  setActiveId: Dispatch<SetStateAction<string | null>>
  activeType: 'pane' | 'tab' | null
  setActiveType: Dispatch<SetStateAction<'pane' | 'tab' | null>>
  dismissIntentId: string | null
  setDismissIntentId: Dispatch<SetStateAction<string | null>>
  setOverTabId: Dispatch<SetStateAction<string | null>>
  setOverTabPosition: Dispatch<SetStateAction<'before' | 'after' | null>>
  containerRef: React.RefObject<HTMLElement | null>

  // Config
  dragActivationDistance: number
  enableDragToDismiss: boolean
  dismissThreshold: number

  // Callbacks
  onRemove?: (paneId: string) => void
  onDragStart?: (activeId: string) => void
  onDragEnd?: (
    activeId: string,
    overId: string | null,
    dropAction: {
      type: 'split' | 'move'
      direction?: SplitDirection
      position?: 'top' | 'bottom' | 'left' | 'right' | 'center'
    } | null,
  ) => void
  onDismissIntentChange?: (paneId: string | null) => void

  // Actions
  removeTab: (tabId: string) => void
  removePane: (paneId: string) => void
}

export function useZeugmaDnd(props: UseZeugmaDndProps) {
  const {
    layout,
    _internalSetLayout,
    setLayout,
    activeId,
    setActiveId,
    activeType,
    setActiveType,
    dismissIntentId,
    setDismissIntentId,
    setOverTabId,
    setOverTabPosition,
    containerRef,

    // Config
    dragActivationDistance,
    enableDragToDismiss,
    dismissThreshold,

    // Callbacks
    onRemove,
    onDragStart,
    onDragEnd,
    onDismissIntentChange,

    // Actions
    removeTab,
    removePane,
  } = props

  const containerRectRef = useRef<DOMRect | null>(null)
  const latestPointerRef = useLatestPointer(activeId)
  const initialLayoutForDragRef = useRef<TreeNode | null>(null)

  const [isOverLocked, setIsOverLocked] = useState(false)
  useBodyCursorOverride(isOverLocked)

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
      activationConstraint: { distance: dragActivationDistance },
    }),
    useSensor(SmartTouchSensor, {
      activationConstraint: {
        delay: DEFAULT_TOUCH_ACTIVATION_DELAY,
        tolerance: DEFAULT_TOUCH_ACTIVATION_TOLERANCE,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    const rawId = event.active.id.toString()
    const parsed = parseActiveId(rawId)
    const isTabDrag = parsed.type === 'tab'
    const draggingId = parsed.id

    setActiveId(draggingId)
    setActiveType(parsed.type)
    setOverTabId(null)
    setOverTabPosition(null)

    const ae = event.activatorEvent
    latestPointerRef.current = getPointerCoordinates(ae)

    if (enableDragToDismiss && containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect()
    } else {
      containerRectRef.current = null
    }

    let layoutAfterSelect = layout
    if (isTabDrag) {
      const parentPane = findPaneContainingTab(layout, draggingId)
      if (parentPane) {
        layoutAfterSelect = selectTab(layout, parentPane.id, draggingId) || layout
      }
    }
    initialLayoutForDragRef.current = layoutAfterSelect

    const layoutAfterRemove = isTabDrag
      ? removeTabHelper(layoutAfterSelect, draggingId)
      : removePaneHelper(layoutAfterSelect, draggingId)
    _internalSetLayout(layoutAfterRemove)

    onDragStart?.(draggingId)
  }

  const handleDragMove = (event: DragMoveEvent) => {
    const { over } = event
    const overIdStr = over?.id.toString() || ''
    const target = parseDropTarget(overIdStr)

    const isOverLockedPane = target.type === 'locked'
    setIsOverLocked((prev) => (prev === isOverLockedPane ? prev : isOverLockedPane))

    const rawId = event.active.id.toString()
    const { type: currentActiveType, id: draggingId } = parseActiveId(rawId)
    const isTabDrag = currentActiveType === 'tab'

    // Handle tab drop hover location
    if (target.type === 'tab' && over && (isTabDrag || activeType === 'pane')) {
      const targetTabId = target.targetTabId

      if (draggingId !== targetTabId) {
        const pt = resolvePointer(event.activatorEvent, event.delta, latestPointerRef.current)
        const position = getTabDropPosition(over.rect, pt ? pt.x : null)

        setOverTabId((prev) => (prev === targetTabId ? prev : targetTabId))
        setOverTabPosition((prev) => (prev === position ? prev : position))
      } else {
        setOverTabId(null)
        setOverTabPosition(null)
      }
    } else {
      setOverTabId(null)
      setOverTabPosition(null)
    }

    if (!enableDragToDismiss) return

    const containerRect = containerRectRef.current
    if (!containerRect) {
      if (dismissIntentId !== null) {
        setDismissIntentId(null)
        onDismissIntentChange?.(null)
      }
      return
    }

    const pt = resolvePointer(event.activatorEvent, event.delta, latestPointerRef.current)
    let distance = 0

    if (pt) {
      distance = distanceOutsideRect(pt, containerRect)
    } else {
      const activeRect = event.active.rect.current.translated
      if (activeRect) {
        const cx = activeRect.left + activeRect.width / 2
        const cy = activeRect.top + activeRect.height / 2
        distance = distanceOutsideRect({ x: cx, y: cy }, containerRect)
      }
    }

    const isDismissIntent = distance > dismissThreshold
    if (isDismissIntent) {
      if (dismissIntentId !== draggingId) {
        setDismissIntentId(draggingId)
        onDismissIntentChange?.(draggingId)
      }
    } else {
      if (dismissIntentId !== null) {
        setDismissIntentId(null)
        onDismissIntentChange?.(null)
      }
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    setActiveType(null)
    setIsOverLocked(false)
    setOverTabId(null)
    setOverTabPosition(null)

    const { active, over } = event
    const rawId = active.id.toString()
    const { type: currentActiveType, id: draggingId } = parseActiveId(rawId)
    const isTabDrag = currentActiveType === 'tab'

    const wasDismissIntent = enableDragToDismiss && dismissIntentId === draggingId

    setDismissIntentId(null)
    onDismissIntentChange?.(null)
    containerRectRef.current = null

    // Capture the original layout before drag
    const originalLayout = initialLayoutForDragRef.current || layout
    initialLayoutForDragRef.current = null

    if (wasDismissIntent) {
      if (onRemove) {
        onRemove(draggingId)
      } else {
        if (isTabDrag) {
          removeTab(draggingId)
        } else {
          removePane(draggingId)
        }
      }
      onDragEnd?.(draggingId, null, null)
      return
    }

    const cancelDrop = () => {
      _internalSetLayout(originalLayout)
      onDragEnd?.(draggingId, null, null)
    }

    if (!over) {
      cancelDrop()
      return
    }

    const target = parseDropTarget(over.id.toString())
    if (target.type === 'locked' || target.type === 'unknown') {
      cancelDrop()
      return
    }

    const pt = resolvePointer(event.activatorEvent, event.delta, latestPointerRef.current)
    const dropPosition =
      target.type === 'tab' && over.rect
        ? getTabDropPosition(over.rect, pt ? pt.x : null)
        : 'before'

    const resolution = resolveDrop({
      layout: originalLayout,
      activeType: isTabDrag ? 'tab' : 'pane',
      draggingId,
      target,
      overTabPosition: dropPosition,
    })

    if (!resolution) {
      cancelDrop()
      return
    }

    setLayout(resolution.newLayout)
    onDragEnd?.(draggingId, resolution.overId, resolution.dropAction)
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setActiveType(null)
    setIsOverLocked(false)
    setOverTabId(null)
    setOverTabPosition(null)
    setDismissIntentId(null)
    onDismissIntentChange?.(null)
    containerRectRef.current = null

    const originalLayout = initialLayoutForDragRef.current || layout
    initialLayoutForDragRef.current = null
    _internalSetLayout(originalLayout)
    if (originalLayout !== layout) {
      setLayout(originalLayout)
    }
  }

  return {
    sensors,
    collisionDetection: customCollisionDetection,
    onDragStart: handleDragStart,
    onDragMove: handleDragMove,
    onDragEnd: handleDragEnd,
    onDragCancel: handleDragCancel,
  }
}
