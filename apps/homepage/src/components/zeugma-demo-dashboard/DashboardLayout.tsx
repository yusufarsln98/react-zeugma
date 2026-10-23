'use client'

import { ReactNode } from 'react'
import { GripVertical, Clock, RefreshCw, SlidersHorizontal } from 'lucide-react'

// ── Panel Chrome ─────────────────────────────────────────────────────────────

export function PanelChrome({
  children,
}: {
  title?: string
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return <>{children}</>
}

import { useZeugmaContext } from 'react-zeugma/react'
import { defaultDashboardLayout } from './constants'

export function DashboardToolbar({
  onRefresh,
  timeRange,
  onTimeRangeChange,
  drawerOpen,
  onToggleDrawer,
}: {
  onRefresh?: () => void
  timeRange: string
  onTimeRangeChange?: (range: string) => void
  drawerOpen?: boolean
  onToggleDrawer?: () => void
}) {
  const { setLayout } = useZeugmaContext()
  const ranges = ['5m', '15m', '30m', '1h', '6h', '24h']

  const handleRefresh = () => {
    setLayout(defaultDashboardLayout)
    if (onRefresh) {
      onRefresh()
    }
  }

  return (
    <div className="grafana-toolbar">
      {/* Left: Configure Button */}
      <div className="flex items-center">
        <button
          onClick={onToggleDrawer}
          className={`grafana-config-btn ${drawerOpen ? 'active' : ''}`}
          title="Configure Dashboard"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Configure</span>
        </button>
      </div>

      {/* Right: Time range + Refresh */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="grafana-time-picker">
          <Clock className="w-3 h-3 text-[var(--demo-muted)]" />
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange?.(r)}
              className={`grafana-time-pill ${timeRange === r ? 'active' : ''}`}
            >
              {r}
            </button>
          ))}
        </div>

        <button onClick={handleRefresh} className="grafana-refresh-btn" title="Refresh">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Dashboard Drag Handle ────────────────────────────────────────────────────

export function DashboardDragHandle({ className = '' }: { className?: string }) {
  return (
    <div className={`grafana-drag-handle ${className}`} title="Drag to rearrange">
      <GripVertical className="w-3 h-3" />
    </div>
  )
}

// ── Dashboard Container ──────────────────────────────────────────────────────

export function DashboardContainer({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`grafana-dashboard-container ${className}`}>{children}</div>
}
