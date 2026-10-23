import { PointerSensor, TouchSensor } from '@dnd-kit/core'

export class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: PointerEvent }) => {
        const element = event.target as HTMLElement | null
        if (element?.closest('.drag-cancel')) {
          return false
        }
        return true
      },
    },
  ]
}

export class SmartTouchSensor extends TouchSensor {
  static activators = [
    {
      eventName: 'onTouchStart' as const,
      handler: ({ nativeEvent: event }: { nativeEvent: TouchEvent }) => {
        const element = event.target as HTMLElement | null
        if (element?.closest('.drag-cancel')) {
          return false
        }
        return true
      },
    },
  ]
}
