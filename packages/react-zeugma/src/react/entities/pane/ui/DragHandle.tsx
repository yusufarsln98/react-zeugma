import React, { useContext } from 'react'
import { DragListenersCtx } from '../model/context'

export interface DragHandleProps {
  /** The children elements that will trigger dragging when held and dragged. */
  children?: React.ReactNode
  /** Custom CSS class applied to the drag handle element. */
  className?: string
  /** Optional inline CSS styles applied to the drag handle. */
  style?: React.CSSProperties
}

export const DragHandle: React.FC<DragHandleProps> = ({ children, className, style }) => {
  const dragProps = useContext(DragListenersCtx)
  if (!dragProps) {
    throw new Error('<DragHandle> must be used inside a <Pane>')
  }
  const { disabled, ...rest } = dragProps

  return (
    <div
      className={className}
      style={{
        cursor: disabled ? 'default' : 'grab',
        userSelect: disabled ? 'auto' : 'none',
        touchAction: disabled ? 'auto' : 'none',
        ...style,
      }}
      {...(disabled ? {} : rest)}
    >
      {children}
    </div>
  )
}
