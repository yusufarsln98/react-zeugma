import React from 'react'

export interface PaneControlsProps {
  /** Custom CSS class applied to the controls container. */
  className?: string
  /** Custom inline CSS style applied to the controls container. */
  style?: React.CSSProperties
  /** The children elements (e.g. close and fullscreen buttons) to render inside the controls container. */
  children?: React.ReactNode
}

export const PaneControls: React.FC<PaneControlsProps> = ({ className, style, children }) => {
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
