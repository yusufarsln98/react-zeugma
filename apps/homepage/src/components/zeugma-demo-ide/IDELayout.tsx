import React from 'react'
import {
  Folder,
  Search,
  GitBranch,
  Blocks,
  Settings,
  Code,
  Lock,
  Unlock,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react'
import { LayoutPresetDropdown } from './LayoutPresetDropdown'
import { usePaneContext } from 'react-zeugma/react'

// ── IDE Container & Main Panels ──────────────────────────────────────────────

export function IDEContainer({
  children,
  className = '',
  hideChrome = false,
}: {
  children: React.ReactNode
  className?: string
  hideChrome?: boolean
}) {
  return (
    <div
      className={`w-full flex flex-col text-left ${
        hideChrome
          ? ''
          : 'rounded-2xl shadow-[0_30px_100px_-10px_rgba(0,0,0,0.85)] border border-[#3a3a3a] overflow-hidden'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function WindowChrome({ hideChrome = false }: { hideChrome?: boolean }) {
  if (hideChrome) return null
  return (
    <div className="w-full bg-[#1e1e1e] px-4 py-1.5 flex items-center gap-2 border-b border-b-[#121212] select-none">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border border-[#e0443e] cursor-pointer" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] border border-[#d4a017] cursor-pointer" />
        <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] border border-[#1aab29] cursor-pointer" />
      </div>
      <div className="flex-1 flex justify-center">
        <div className="bg-[#252526] border border-[#2d2d30] rounded px-3 py-0.5 flex items-center gap-2 text-[10px] font-mono text-[#858585] min-w-[200px] justify-center select-none">
          <Code className="w-3 h-3 text-indigo-400" />
          <span>my-zeugma-app — Zeugma Code</span>
        </div>
      </div>
      <div className="w-16" />
    </div>
  )
}

export function WorkspaceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="workspace-frame"
      className="w-full flex-1 min-h-0 bg-[#1e1e1e] flex flex-col overflow-hidden relative"
    >
      {children}
    </div>
  )
}

export function WorkspaceContent({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 flex overflow-hidden min-h-0">{children}</div>
}

export function WorkspaceZeugmaArea({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-w-0 relative p-1.5 bg-[#1e1e1e] h-full">{children}</div>
}

// ── Activity Bar ─────────────────────────────────────────────────────────────

export function ActivityBar() {
  return (
    <div className="w-12 bg-[#2d2d2d] border-r border-[#1e1e1e] flex flex-col items-center py-4 gap-6 select-none shrink-0 z-30">
      <div className="w-full flex items-center justify-center border-l-2 border-l-indigo-500 py-1 cursor-pointer">
        <Folder className="w-5 h-5 text-white" />
      </div>
      {[Search, GitBranch, Blocks].map((Icon, i) => (
        <div key={i} className="w-full flex items-center justify-center py-1 opacity-40">
          <Icon className="w-5 h-5 text-zinc-400" />
        </div>
      ))}
      <div className="w-full flex items-center justify-center mt-auto mb-2 opacity-40">
        <Settings className="w-5 h-5 text-zinc-400" />
      </div>
    </div>
  )
}

// ── Status Bar ───────────────────────────────────────────────────────────────

interface StatusBarProps {
  activePreset: string
  onSelectPreset: (preset: string) => void
  locked: boolean
  onToggleLock: () => void
  onReset: () => void
}

export function StatusBar({
  activePreset,
  onSelectPreset,
  locked,
  onToggleLock,
  onReset,
}: StatusBarProps) {
  return (
    <div className="h-5 bg-[#007acc] text-white flex items-center justify-between px-3 text-[10px] select-none font-mono shrink-0 z-30">
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/yusufarsln98/react-zeugma"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
        >
          <GitBranch className="w-3 h-3 text-white" />
          <span>master</span>
        </a>
      </div>

      <div className="flex items-center gap-2 drag-cancel">
        <LayoutPresetDropdown
          activePreset={activePreset}
          onSelectPreset={onSelectPreset}
          disabled={locked}
        />

        <span className="text-[#389ffd]">|</span>

        <button
          onClick={onToggleLock}
          className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          {locked ? (
            <Lock className="w-3 h-3 text-amber-300 animate-pulse" />
          ) : (
            <Unlock className="w-3 h-3 text-white/80" />
          )}
          <span>{locked ? 'Unlock Layout' : 'Lock Layout'}</span>
        </button>

        <span className="text-[#389ffd]">|</span>

        <button
          onClick={onReset}
          disabled={locked}
          className={`flex items-center gap-1 transition-colors ${
            locked
              ? 'opacity-30 cursor-not-allowed'
              : 'hover:text-white cursor-pointer text-white/80'
          }`}
          title={locked ? 'Unlock layout to reset' : 'Reset Layout'}
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Layout</span>
        </button>
      </div>
    </div>
  )
}

// ── Pane layout components ───────────────────────────────────────────────────

export function PaneContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full w-full flex flex-col bg-[#1e1e1e] border border-[#2d2d30] overflow-hidden shadow-2xl">
      {children}
    </div>
  )
}

export function PaneHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-[#252526] border-b border-[#1e1e1e] h-8 select-none">
      {children}
    </div>
  )
}

export function PaneContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e] relative h-full overflow-hidden">
      {children}
    </div>
  )
}

export function PaneControls() {
  const { isFullscreen, toggleFullscreen, remove } = usePaneContext()
  return (
    <div className="flex items-center gap-1.5 px-3 z-10 drag-cancel shrink-0">
      <button
        onClick={toggleFullscreen}
        className="w-5 h-5 flex items-center justify-center rounded text-[#858585] hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
      </button>
      <button
        onClick={remove}
        className="w-5 h-5 flex items-center justify-center rounded text-[#858585] hover:text-rose-450 hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Close Pane"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}
