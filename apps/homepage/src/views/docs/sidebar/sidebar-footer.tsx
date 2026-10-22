'use client'

import { ExternalLink, Play, FileText } from 'lucide-react'
import Link from 'next/link'
import { BrandIcon } from '../../../components/brand-icon'

export function SidebarFooter() {
  return (
    <div className="pt-4 mt-6 border-t border-border-primary/80 space-y-2 select-none">
      <div className="eyebrow px-2 text-[10px] text-text-muted">Resources & Links</div>

      <div className="space-y-1 text-xs">
        <Link
          href="/demo"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sidebar transition-colors"
        >
          <div className="flex items-center gap-2">
            <Play className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium">Interactive Demo</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-accent/15 text-accent font-semibold">
            Live
          </span>
        </Link>

        <a
          href="/llms.txt"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sidebar transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-accent" />
            <span className="font-medium">LLM Context</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">/llms.txt</span>
        </a>

        <a
          href="https://github.com/yusufarsln98/react-zeugma"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sidebar transition-colors"
        >
          <div className="flex items-center gap-2">
            <BrandIcon name="github" size={14} />
            <span className="font-medium">GitHub Repository</span>
          </div>
          <ExternalLink className="w-3 h-3 text-text-muted" />
        </a>

        <a
          href="https://www.npmjs.com/package/react-zeugma"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-sidebar transition-colors"
        >
          <div className="flex items-center gap-2">
            <BrandIcon name="npm" size={14} className="text-rose-500" />
            <span className="font-medium">npm Package</span>
          </div>
          <span className="text-[10px] font-mono text-text-muted">v7.1.2</span>
        </a>
      </div>
    </div>
  )
}
