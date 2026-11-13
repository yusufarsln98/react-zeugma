'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ExternalLink, Pin, PinOff, RotateCcw, X } from 'lucide-react'
import { useTabMetadata, useZeugmaContext } from 'react-zeugma/react'

export type TabStatus = 'live' | 'alert' | 'paused'

export interface TabContextMenuState {
  tabId: string
  x: number
  y: number
  isPoppedOut: boolean
}

interface TabContextMenuProps {
  menu: TabContextMenuState | null
  defaultTitle: string
  onClose: () => void
}

const STATUS_OPTIONS: { value: TabStatus | undefined; label: string; dotClass?: string }[] = [
  { value: undefined, label: 'None' },
  { value: 'live', label: 'Live', dotClass: 'bg-emerald-400' },
  { value: 'alert', label: 'Alert', dotClass: 'bg-rose-400' },
  { value: 'paused', label: 'Paused', dotClass: 'bg-amber-400' },
]

export function TabContextMenu({ menu, defaultTitle, onClose }: TabContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null)
  const { updateTabMetadata, popoutTab, dockTab, removeTab } = useZeugmaContext()
  const metadata = useTabMetadata(menu?.tabId ?? '')
  const [draftTitle, setDraftTitle] = useState('')

  useEffect(() => {
    if (!menu) return
    setDraftTitle((metadata?.title as string) ?? defaultTitle)
    // Only initialize draftTitle when the menu opens or targets a different tab
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu?.tabId, menu?.x, menu?.y])

  useEffect(() => {
    if (!menu) return

    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menu, onClose])

  if (!menu || typeof document === 'undefined') return null

  const { tabId, x, y, isPoppedOut } = menu
  const isPinned = Boolean(metadata?.pinned)
  const activeStatus = metadata?.status as TabStatus | undefined

  const clampedX = Math.min(x, window.innerWidth - 236)
  const clampedY = Math.min(y, window.innerHeight - 280)

  const commitTitle = (nextTitle: string) => {
    const trimmed = nextTitle.trim()
    updateTabMetadata(tabId, (prev) => {
      if (!trimmed || trimmed === defaultTitle) {
        if (!prev) return undefined
        const rest = { ...prev }
        delete rest.title
        return Object.keys(rest).length > 0 ? rest : undefined
      }
      return { ...prev, title: trimmed }
    })
  }

  return createPortal(
    <div
      ref={menuRef}
      style={{ left: Math.max(8, clampedX), top: Math.max(8, clampedY) }}
      className="fixed z-50 w-56 rounded-md border border-[var(--demo-line)] bg-[#14171c] p-1.5 shadow-2xl text-xs text-[var(--demo-text)] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="px-1.5 py-1">
        <div className="text-[10px] uppercase tracking-wider text-[var(--demo-muted)] mb-1">
          Tab Title (metadata)
        </div>
        <input
          type="text"
          value={draftTitle}
          onChange={(e) => {
            setDraftTitle(e.target.value)
            commitTitle(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commitTitle(draftTitle)
              onClose()
            }
          }}
          placeholder={defaultTitle}
          className="w-full rounded border border-[var(--demo-line)] bg-[var(--demo-canvas)] px-2 py-1 text-xs text-[var(--demo-text)] outline-none focus:border-blue-400"
        />
      </div>

      <div className="my-1 border-t border-[var(--demo-line-soft)]" />

      <div className="px-1.5 py-1">
        <div className="text-[10px] uppercase tracking-wider text-[var(--demo-muted)] mb-1.5">
          Status Badge
        </div>
        <div className="grid grid-cols-4 gap-1">
          {STATUS_OPTIONS.map((opt) => {
            const selected = activeStatus === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() =>
                  updateTabMetadata(tabId, (prev) => {
                    if (!opt.value) {
                      if (!prev) return undefined
                      const rest = { ...prev }
                      delete rest.status
                      return Object.keys(rest).length > 0 ? rest : undefined
                    }
                    return { ...prev, status: opt.value }
                  })
                }
                className={`flex items-center justify-center gap-1 rounded px-1.5 py-1 text-[10px] border transition-colors cursor-pointer ${
                  selected
                    ? 'border-blue-400/70 bg-blue-500/15 text-white'
                    : 'border-[var(--demo-line-soft)] hover:bg-white/5 text-[var(--demo-muted)]'
                }`}
              >
                {opt.dotClass && <span className={`w-1.5 h-1.5 rounded-full ${opt.dotClass}`} />}
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="my-1 border-t border-[var(--demo-line-soft)]" />

      <button
        type="button"
        onClick={() => {
          updateTabMetadata(tabId, (prev) => {
            const nextPinned = !prev?.pinned
            if (!nextPinned) {
              if (!prev) return undefined
              const rest = { ...prev }
              delete rest.pinned
              return Object.keys(rest).length > 0 ? rest : undefined
            }
            return { ...prev, pinned: true }
          })
          onClose()
        }}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5 cursor-pointer"
      >
        {isPinned ? (
          <PinOff className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Pin className="w-3.5 h-3.5" />
        )}
        <span>{isPinned ? 'Unpin Tab' : 'Pin Tab'}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          if (isPoppedOut) {
            dockTab(tabId)
          } else {
            popoutTab(tabId)
          }
          onClose()
        }}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5 cursor-pointer"
      >
        <ExternalLink className={`w-3.5 h-3.5 ${isPoppedOut ? 'text-blue-400' : ''}`} />
        <span>{isPoppedOut ? 'Dock Back' : 'Popout to Window'}</span>
      </button>

      <button
        type="button"
        onClick={() => {
          updateTabMetadata(tabId, () => undefined)
          onClose()
        }}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-white/5 text-[var(--demo-muted)] hover:text-[var(--demo-text)] cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset Metadata</span>
      </button>

      <div className="my-1 border-t border-[var(--demo-line-soft)]" />

      <button
        type="button"
        onClick={() => {
          removeTab(tabId)
          onClose()
        }}
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-rose-400 hover:bg-rose-500/10 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
        <span>Close Tab</span>
      </button>
    </div>,
    document.body,
  )
}
