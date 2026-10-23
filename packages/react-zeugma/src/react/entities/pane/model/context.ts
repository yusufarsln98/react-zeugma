import React, { createContext } from 'react'

export interface DragListenersCtxValue extends React.HTMLAttributes<HTMLDivElement> {
  disabled?: boolean
}

export const DragListenersCtx = createContext<DragListenersCtxValue | null>(null)
