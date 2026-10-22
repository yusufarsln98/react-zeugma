'use client'

import Link from 'next/link'
import { ArrowLeft, BookOpen, FileText } from 'lucide-react'
import { BrandIcon } from '../brand-icon'

const LOGO_URL = '/logo.png'

export function DemoNavbar() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '7.1.2'

  return (
    <nav className="h-12 px-4 border-b border-[var(--demo-line)] bg-[var(--demo-chrome)] flex items-center justify-between shrink-0 select-none text-xs">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[var(--demo-muted)] hover:text-[var(--demo-text)] transition-colors py-1 px-2 rounded-md hover:bg-[var(--demo-panel)]"
          title="Back to homepage"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium hidden sm:inline">Overview</span>
        </Link>

        <div className="w-px h-4 bg-[var(--demo-line-soft)]" />

        <Link href="/" className="flex items-center gap-2 group">
          <img src={LOGO_URL} alt="react-zeugma logo" className="w-4 h-4 object-contain" />
          <span className="font-bold text-xs tracking-tight text-[var(--demo-text-bright)]">
            react-zeugma
          </span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono border border-[var(--demo-line)] bg-[var(--demo-panel)] text-[var(--demo-muted)]">
            v{appVersion}
          </span>
        </Link>

        <div className="w-px h-4 bg-[var(--demo-line-soft)]" />

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[var(--demo-accent)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--demo-accent)] animate-pulse" />
          <span className="font-semibold">Interactive Cockpit</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/docs"
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--demo-muted)] hover:text-[var(--demo-text-bright)] hover:bg-[var(--demo-panel)] px-2.5 py-1 rounded-md transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Docs</span>
        </Link>
        <Link
          href="/changelog"
          className="flex items-center gap-1 text-[11px] font-medium text-[var(--demo-muted)] hover:text-[var(--demo-text-bright)] hover:bg-[var(--demo-panel)] px-2.5 py-1 rounded-md transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Changelog</span>
        </Link>

        <div className="w-px h-4 bg-[var(--demo-line-soft)] mx-1" />

        <a
          href="https://github.com/yusufarsln98/react-zeugma"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 bg-[var(--demo-text-bright)] hover:bg-[var(--demo-text-bright)]/90 text-[var(--demo-canvas)] px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors"
        >
          <BrandIcon name="github" size={14} />
          <span>GitHub</span>
        </a>
      </div>
    </nav>
  )
}
