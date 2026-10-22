'use client'

import { useState } from 'react'
import {
  AlignLeft,
  ArrowUp,
  Link as LinkIcon,
  Check,
  ExternalLink,
  MessageSquare,
} from 'lucide-react'
import { BrandIcon } from '../../../components/brand-icon'
import type { DocSection } from '../../../config/docs-data'

export interface TableOfContentsProps {
  currentChapter: DocSection
  inPageActiveSection: string
  scrollToSection: (id: string) => void
}

export function TableOfContents({
  currentChapter,
  inPageActiveSection,
  scrollToSection,
}: TableOfContentsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyPageUrl = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const hasSubsections = Boolean(
    currentChapter.subsections && currentChapter.subsections.length > 0,
  )

  return (
    <aside className="space-y-5 select-none">
      {/* TOC Header */}
      <div className="flex items-center justify-between text-text-primary font-semibold">
        <div className="flex items-center gap-1.5">
          <AlignLeft className="w-3.5 h-3.5 text-accent" />
          <span className="eyebrow text-text-primary text-[10px]">On this page</span>
        </div>
        <button
          onClick={handleCopyPageUrl}
          className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-sidebar transition-colors cursor-pointer"
          title="Copy page link"
          aria-label="Copy page link"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <LinkIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Heading Links with Active Scrollspy indicator */}
      <div className="space-y-1 relative pl-2 border-l border-border-primary/60">
        <button
          onClick={() => scrollToSection(currentChapter.id)}
          className={`text-left font-medium block truncate w-full transition-colors cursor-pointer text-xs py-1 ${
            inPageActiveSection === currentChapter.id
              ? 'text-accent font-semibold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {currentChapter.title}
        </button>

        {hasSubsections && (
          <div className="space-y-1 pl-2.5 mt-1 border-l border-border-primary/40">
            {currentChapter.subsections?.map((sub) => {
              const isSubActive = inPageActiveSection === sub.id
              return (
                <button
                  key={sub.id}
                  onClick={() => scrollToSection(sub.id)}
                  className={`text-left block text-[11px] truncate w-full transition-colors cursor-pointer py-1 ${
                    isSubActive
                      ? 'text-accent font-semibold'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {sub.title}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* GitHub & Community Links */}
      <div className="pt-4 border-t border-border-primary/60 space-y-2 text-[11px] text-text-muted">
        <a
          href="https://github.com/yusufarsln98/react-zeugma"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-accent transition-colors"
        >
          <BrandIcon name="github" size={13} />
          <span>Edit this page on GitHub</span>
          <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-60" />
        </a>

        <a
          href="https://github.com/yusufarsln98/react-zeugma/issues/new"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 hover:text-accent transition-colors"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Report an issue</span>
          <ExternalLink className="w-2.5 h-2.5 ml-auto opacity-60" />
        </a>
      </div>

      {/* Back to top button */}
      <div className="pt-2">
        <button
          onClick={() => scrollToSection(currentChapter.id)}
          className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors cursor-pointer text-[11px] py-1"
        >
          <ArrowUp className="w-3.5 h-3.5" />
          <span>Back to top</span>
        </button>
      </div>
    </aside>
  )
}
