export interface Point {
  x: number
  y: number
}

export function getPointerCoordinates(event: Event): Point | null {
  if (event instanceof MouseEvent || event instanceof PointerEvent) {
    return { x: event.clientX, y: event.clientY }
  }
  if (typeof TouchEvent !== 'undefined' && event instanceof TouchEvent) {
    const touch = event.touches[0] || event.changedTouches[0]
    if (touch) {
      return { x: touch.clientX, y: touch.clientY }
    }
  }
  return null
}

export function resolvePointer(
  activatorEvent: Event | undefined,
  delta: Point | undefined,
  latestPointer: Point | null,
): Point | null {
  if (latestPointer) {
    return latestPointer
  }
  if (!activatorEvent) return null

  const coords = getPointerCoordinates(activatorEvent)
  if (coords) {
    return {
      x: coords.x + (delta?.x ?? 0),
      y: coords.y + (delta?.y ?? 0),
    }
  }
  return null
}

export function getTabDropPosition(
  overRect: { left: number; width: number },
  pointerX: number | null,
): 'before' | 'after' {
  if (pointerX !== null) {
    const center = overRect.left + overRect.width / 2
    if (pointerX > center) {
      return 'after'
    }
  }
  return 'before'
}

export function distanceOutsideRect(
  point: Point,
  rect: { left: number; right: number; top: number; bottom: number },
): number {
  let dx = 0
  let dy = 0

  if (point.x < rect.left) {
    dx = rect.left - point.x
  } else if (point.x > rect.right) {
    dx = point.x - rect.right
  }

  if (point.y < rect.top) {
    dy = rect.top - point.y
  } else if (point.y > rect.bottom) {
    dy = point.y - rect.bottom
  }

  return Math.sqrt(dx * dx + dy * dy)
}
