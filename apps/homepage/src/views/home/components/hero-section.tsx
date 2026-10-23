'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Copy, Check, Play, Terminal } from 'lucide-react'

const INSTALL_COMMANDS = {
  pnpm: 'pnpm add react-zeugma',
  npm: 'npm install react-zeugma',
  bun: 'bun add react-zeugma',
}

interface HeroSectionProps {
  appVersion: string
}

export function HeroSection({ appVersion }: HeroSectionProps) {
  const [copied, setCopied] = useState(false)
  const [activePkg, setActivePkg] = useState<'pnpm' | 'npm' | 'bun'>('pnpm')

  const command = INSTALL_COMMANDS[activePkg]

  const handleCopy = () => {
    navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 px-6 sm:px-8 border-b border-border-primary bg-grid overflow-hidden">
      {/* Soft radial glow mask */}
      <div className="absolute inset-0 mask-radial bg-gradient-to-b from-accent/6 to-transparent pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Release Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full border border-border-primary bg-bg-pane/80 backdrop-blur-md shadow-2xs mb-8 transition-transform hover:scale-102">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          <span className="text-xs font-mono font-medium text-text-secondary">
            v{appVersion} • React 18 &amp; 19 Ready
          </span>
          <span className="text-text-muted">•</span>
          <Link
            href="/changelog"
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1 font-semibold"
          >
            Release Notes <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Headline with Instrument Serif accent */}
        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-text-primary mb-6 leading-[1.04]">
          Spatial layouts for{' '}
          <span className="font-display italic font-normal text-accent tracking-normal px-1">
            demanding
          </span>{' '}
          dashboards.
        </h1>

        {/* Subtitle with high-intent SEO phrases */}
        <p className="text-base sm:text-xl text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          Headless, recursive, drag-and-drop workspace layout engine for React. A modern successor
          to <strong className="text-text-primary font-medium">react-mosaic</strong> and
          golden-layout. Build bento cockpits, multi-tab IDEs, and custom split views without grid
          constraints.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Link
            href="/demo"
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-accent hover:bg-accent-strong text-accent-fg font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Try Interactive Demo</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <a
            href="/SKILL.md"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-bg-pane border border-border-primary hover:border-border-secondary text-text-primary font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
          >
            <span>SKILL.md Spec</span>
          </a>

          {/* Terminal Copy Snippet */}
          <div className="w-full sm:w-auto flex items-center rounded-xl bg-bg-pane border border-border-primary overflow-hidden shadow-2xs font-mono text-xs">
            <div className="flex border-r border-border-primary bg-bg-sidebar/50">
              {(['pnpm', 'npm', 'bun'] as const).map((pkg) => (
                <button
                  key={pkg}
                  onClick={() => setActivePkg(pkg)}
                  className={`px-2.5 py-3 transition-colors uppercase text-[10px] font-bold ${
                    activePkg === pkg
                      ? 'bg-bg-pane text-accent'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {pkg}
                </button>
              ))}
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-3 flex items-center gap-2 text-text-primary hover:bg-bg-sidebar/50 transition-colors cursor-pointer group"
              title="Copy install command"
            >
              <Terminal className="w-3.5 h-3.5 text-text-muted group-hover:text-accent transition-colors" />
              <span className="truncate">{command}</span>
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-text-muted group-hover:text-text-primary shrink-0 ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left w-full max-w-3xl border-t border-border-primary/80 pt-8">
          <div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary">~4.8 kB</div>
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider mt-0.5">
              Bundle footprint
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary">
              0 reflows
            </div>
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider mt-0.5">
              Isolated metadata
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary">100%</div>
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider mt-0.5">
              Headless &amp; typed
            </div>
          </div>
          <div>
            <div className="font-mono text-xl sm:text-2xl font-bold text-text-primary">
              Binary Tree
            </div>
            <div className="text-[11px] text-text-muted font-mono uppercase tracking-wider mt-0.5">
              Split architecture
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
