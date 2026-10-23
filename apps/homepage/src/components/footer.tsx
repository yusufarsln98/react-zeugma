import { HelpCircle, FileText, Heart, Terminal, Layers, Bot, FileCode } from 'lucide-react'
import Link from 'next/link'
import { BrandIcon } from './brand-icon'

const LOGO_URL = '/logo.png'

export function Footer() {
  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '7.1.2'

  return (
    <footer className="border-t border-border-primary bg-bg-sidebar/60 py-16 px-6 sm:px-8 mt-auto transition-colors select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-10">
        {/* Brand Column */}
        <div className="sm:col-span-2 md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <img src={LOGO_URL} alt="react-zeugma logo" className="w-6 h-6 object-contain" />
            <span className="font-bold text-base tracking-tight text-text-primary">
              react-zeugma
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono border border-border-primary bg-bg-pane text-text-muted">
              v{appVersion}
            </span>
          </Link>
          <p className="text-text-secondary text-xs leading-relaxed max-w-sm">
            Headless, recursive, drag-and-drop workspace layout engine for React. Built for complex
            bento grids, observability cockpits, and multi-tab code editors.
          </p>
          <div className="pt-2 flex items-center gap-2 text-[11px] text-text-muted font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>React 18 & 19 Ready • Fully Typed</span>
          </div>
        </div>

        {/* Product Navigation */}
        <div className="space-y-3">
          <h4 className="eyebrow">Product</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <Link
                href="/"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <Layers className="w-3.5 h-3.5 text-accent" /> Overview
              </Link>
            </li>
            <li>
              <Link
                href="/demo"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <Terminal className="w-3.5 h-3.5 text-accent" /> Interactive Demo
              </Link>
            </li>
            <li>
              <Link
                href="/changelog"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-text-muted" /> Release Notes
              </Link>
            </li>
          </ul>
        </div>

        {/* AI & Standards */}
        <div className="space-y-3">
          <h4 className="eyebrow">AI &amp; Standards</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <a
                href="/SKILL.md"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <Bot className="w-3.5 h-3.5 text-accent" /> SKILL.md Spec
              </a>
            </li>
            <li>
              <a
                href="/llms.txt"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FileCode className="w-3.5 h-3.5 text-accent" /> llms.txt Index
              </a>
            </li>
          </ul>
        </div>

        {/* References */}
        <div className="space-y-3">
          <h4 className="eyebrow">References</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
              >
                <BrandIcon
                  name="github"
                  size={14}
                  className="text-text-muted group-hover:text-text-primary"
                />
                GitHub Repository
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2 group"
              >
                <BrandIcon
                  name="npm"
                  size={14}
                  className="text-text-muted group-hover:text-text-primary"
                />
                NPM Package
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/LICENSE"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FileText className="w-3.5 h-3.5 text-text-muted" /> MIT License
              </a>
            </li>
          </ul>
        </div>

        {/* Community */}
        <div className="space-y-3">
          <h4 className="eyebrow">Community</h4>
          <ul className="space-y-2 text-xs font-medium">
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/blob/master/CONTRIBUTING.md"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <Heart className="w-3.5 h-3.5 text-accent" /> Contributing
              </a>
            </li>
            <li>
              <a
                href="https://github.com/yusufarsln98/react-zeugma/issues"
                target="_blank"
                rel="noreferrer"
                className="text-text-secondary hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <HelpCircle className="w-3.5 h-3.5 text-text-muted" /> Issues &amp; RFCs
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto border-t border-border-primary/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-text-muted gap-4">
        <div>&copy; {new Date().getFullYear()} react-zeugma • Open source software under MIT.</div>
        <div className="flex items-center gap-1.5 font-mono text-[10px]">
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
