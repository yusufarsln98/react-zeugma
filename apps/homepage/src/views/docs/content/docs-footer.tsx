'use client'

import Link from 'next/link'
import { ArrowUp, FileText, Heart, HelpCircle, Play, Bot } from 'lucide-react'
import { BrandIcon } from '../../../components/brand-icon'

export function DocsFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="mt-16 pt-10 border-t border-border-primary/80 space-y-8 select-none">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-text-secondary">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-text-primary">react-zeugma docs</span>
          <span>•</span>
          <span className="font-mono text-text-muted">v7.1.2</span>
          <span>•</span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[10px] font-semibold border border-emerald-500/20">
            React 18 &amp; 19 Ready
          </span>
        </div>

        <button
          onClick={scrollToTop}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-primary hover:border-accent/40 bg-bg-pane text-text-secondary hover:text-text-primary transition-colors cursor-pointer text-xs font-medium"
        >
          <ArrowUp className="w-3.5 h-3.5 text-accent" />
          <span>Back to top</span>
        </button>
      </div>

      {/* Structured link grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-2 text-xs">
        <div className="space-y-2.5">
          <span className="eyebrow text-text-primary text-[10px]">Navigation</span>
          <ul className="space-y-2 text-text-muted">
            <li>
              <Link href="/" className="hover:text-text-primary transition-colors">
                Overview
              </Link>
            </li>
            <li>
              <Link
                href="/demo"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3 h-3 text-accent" />
                <span>Live Demo</span>
              </Link>
            </li>
            <li>
              <Link href="/changelog" className="hover:text-text-primary transition-colors">
                Changelog
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <span className="eyebrow text-text-primary text-[10px]">AI Integration</span>
          <ul className="space-y-2 text-text-muted">
            <li>
              <Link
                href="/docs#skill-md"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <Bot className="w-3 h-3 text-accent" />
                <span>SKILL.md Spec</span>
              </Link>
            </li>
            <li>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <FileText className="w-3 h-3 text-accent" />
                <span>/llms.txt Standard</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <span className="eyebrow text-text-primary text-[10px]">Package</span>
          <ul className="space-y-2 text-text-muted">
            <li>
              <a
                href="https://www.npmjs.com/package/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <BrandIcon name="npm" size={13} className="text-rose-500" />
                <span>npm Distribution</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors"
              >
                MIT License
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <span className="eyebrow text-text-primary text-[10px]">Community</span>
          <ul className="space-y-2 text-text-muted">
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <BrandIcon name="github" size={13} />
                <span>GitHub Repo</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/issues"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Issues &amp; RFCs</span>
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/CONTRIBUTING.md"
                target="_blank"
                rel="noreferrer"
                className="hover:text-text-primary transition-colors flex items-center gap-1.5"
              >
                <Heart className="w-3 h-3 text-accent" />
                <span>Contributing</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom copyright attribution */}
      <div className="pt-6 border-t border-border-primary/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-text-muted font-mono">
        <div>&copy; {new Date().getFullYear()} react-zeugma • Open source under MIT License.</div>
        <div className="flex items-center gap-1">
          <span>Named after the mosaic city of Zeugma in</span>
          <a
            href="https://en.wikipedia.org/wiki/Zeugma_(Commagene)"
            target="_blank"
            rel="noreferrer"
            className="text-text-secondary hover:text-text-primary underline underline-offset-2 decoration-border-secondary"
          >
            Gaziantep, Turkey
          </a>
        </div>
      </div>
    </footer>
  )
}
