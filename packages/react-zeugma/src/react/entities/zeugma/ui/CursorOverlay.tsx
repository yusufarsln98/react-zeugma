import React, { useEffect, useRef, ReactNode } from 'react'

export const CursorOverlay: React.FC<{
  activeId: string
  render: (id: string) => ReactNode
  className?: string
}> = ({ activeId, render, className }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMove = (e: PointerEvent) => {
      if (ref.current) {
        ref.current.style.transform = `translate(${e.clientX + 12}px, ${e.clientY + 12}px)`
      }
    }
    document.addEventListener('pointermove', handleMove)
    return () => document.removeEventListener('pointermove', handleMove)
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {render(activeId)}
    </div>
  )
}
