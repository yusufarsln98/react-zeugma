'use client'

import { Sun, Moon, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useEffect } from 'react'
import { BrandIcon } from './brand-icon'
import { useTheme } from './theme-provider'

const LOGO_URL = '/logo.png'

export const NAV_ITEMS: {
  label: string
  to: '/' | '/demo' | '/changelog'
  badge?: string
}[] = [
  { label: 'Overview', to: '/' },
  { label: 'Live Demo', to: '/demo', badge: 'Interactive' },
  { label: 'Changelog', to: '/changelog' },
]

export function Navbar() {
  const pathname = usePathname()
  const { theme, toggleTheme, mounted } = useTheme()
  const router = useRouter()
  const prefetched = useRef<Set<string>>(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Automatically close mobile menu when path changes
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const prefetch = useCallback(
    (href: string) => {
      if (prefetched.current.has(href)) return
      prefetched.current.add(href)
      router.prefetch(href)
    },
    [router],
  )

  const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || '7.1.2'

  return (
    <header className="sticky top-0 z-40 w-full" style={{ viewTransitionName: 'site-header' }}>
      <nav className="relative bg-bg-app/80 backdrop-blur-md border-b border-border-primary px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 transition-colors select-none">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <img
              src={LOGO_URL}
              alt="react-zeugma logo"
              className="w-5 h-5 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-bold text-sm tracking-tight text-text-primary">react-zeugma</span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-medium border border-border-primary bg-bg-sidebar text-text-muted">
              v{appVersion}
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-bg-sidebar/50 border border-border-primary/60 rounded-full p-1 text-xs font-medium">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.to
            return (
              <Link
                key={item.to}
                href={item.to}
                onMouseEnter={() => prefetch(item.to)}
                className={`relative px-3 py-1 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-bg-pane text-text-primary shadow-xs font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-semibold bg-accent/15 text-accent">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border border-border-primary bg-bg-pane text-text-secondary hover:text-text-primary hover:border-border-secondary transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label="Toggle theme"
          >
            {mounted && theme === 'light' ? (
              <Moon className="w-4 h-4 text-accent" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* External Links */}
          <div className="hidden sm:flex items-center gap-1.5 border-l border-border-primary/80 pl-2">
            <a
              href="https://www.npmjs.com/package/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-border-primary bg-bg-pane text-text-secondary hover:text-[#cb3837] hover:border-border-secondary transition-colors"
              title="View on NPM"
            >
              <BrandIcon name="npm" size={18} />
            </a>
            <a
              href="https://github.com/yusufarsln98/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg border border-border-primary bg-bg-pane text-text-secondary hover:text-text-primary hover:border-border-secondary transition-colors"
              title="GitHub repository"
            >
              <BrandIcon name="github" size={18} />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg border border-border-primary bg-bg-pane text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Popover Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-x-3 top-16 z-50 bg-bg-pane border border-border-primary rounded-2xl shadow-float p-4 flex flex-col gap-3 animate-in fade-in zoom-in-98 duration-150">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.to
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-accent/10 text-accent font-bold'
                      : 'text-text-secondary hover:bg-bg-sidebar hover:text-text-primary'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-accent/15 text-accent font-semibold">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-border-primary pt-3 grid grid-cols-2 gap-2 text-xs font-semibold">
            <a
              href="https://www.npmjs.com/package/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-bg-sidebar border border-border-primary text-text-primary hover:border-border-secondary"
            >
              <BrandIcon name="npm" size={18} /> NPM
            </a>
            <a
              href="https://github.com/yusufarsln98/react-zeugma"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-bg-sidebar border border-border-primary text-text-primary hover:border-border-secondary"
            >
              <BrandIcon name="github" size={18} /> GitHub
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
