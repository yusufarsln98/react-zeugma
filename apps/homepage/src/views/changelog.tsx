'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Search, X, Copy, Check, ExternalLink, GitCommit, ArrowUpRight, Filter } from 'lucide-react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { MdxRenderer } from '../components/mdx-renderer'
import { nodeText } from '../components/mdx-renderer/ast-utils'
import { Footer } from '../components/footer'
import type { RootContent } from '../lib/parse-mdx'

interface ChangelogProps {
  contentNodes: RootContent[]
}

interface ReleaseGroup {
  version: string
  slug: string
  major: number
  minor: number
  patch: number
  type: 'major' | 'minor' | 'patch'
  nodes: RootContent[]
  summary: string
  fullText: string
}

function parseReleaseGroups(nodes: RootContent[]): {
  introNodes: RootContent[]
  releases: ReleaseGroup[]
} {
  const introNodes: RootContent[] = []
  const releases: ReleaseGroup[] = []
  let currentGroup: ReleaseGroup | null = null

  for (const node of nodes) {
    if (node.type === 'heading' && (node as any).depth === 2) {
      if (currentGroup) {
        releases.push(currentGroup)
      }
      const rawTitle = nodeText(node).trim()
      const slug = rawTitle
        .toLowerCase()
        .replace(/[<>`]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      const cleanVersion = rawTitle.replace(/^v/, '')
      const parts = cleanVersion.split('.').map(Number)
      const major = Number.isFinite(parts[0]) ? parts[0] : 0
      const minor = Number.isFinite(parts[1]) ? parts[1] : 0
      const patch = Number.isFinite(parts[2]) ? parts[2] : 0

      currentGroup = {
        version: cleanVersion,
        slug,
        major,
        minor,
        patch,
        type: 'patch',
        nodes: [],
        summary: '',
        fullText: rawTitle,
      }
    } else if (currentGroup) {
      currentGroup.nodes.push(node)
      const text = nodeText(node)
      currentGroup.fullText += ' ' + text
      if (node.type === 'heading') {
        const hText = text.toLowerCase()
        if (hText.includes('major')) {
          currentGroup.type = 'major'
        } else if (hText.includes('minor') && currentGroup.type !== 'major') {
          currentGroup.type = 'minor'
        }
      }
      if (!currentGroup.summary && node.type === 'list') {
        currentGroup.summary = text.slice(0, 160)
      }
    } else {
      introNodes.push(node)
    }
  }

  if (currentGroup) {
    releases.push(currentGroup)
  }

  // Refine fallback type classification based on semver zeros
  for (const r of releases) {
    if (r.patch === 0 && r.minor === 0 && r.major > 0) {
      r.type = 'major'
    } else if (r.patch === 0 && r.minor > 0 && r.type !== 'major') {
      r.type = 'minor'
    }
  }

  return { introNodes, releases }
}

export function Changelog({ contentNodes }: ChangelogProps) {
  const { introNodes, releases } = useMemo(() => {
    return parseReleaseGroups(contentNodes)
  }, [contentNodes])

  // Identify latest major release version tag (e.g. 'v7' for v7.1.2)
  const latestRelease = releases[0]
  const latestMajor = latestRelease?.major ?? 7
  const defaultVersionTag = `v${latestMajor}`

  // Default selected version tag is the latest major version (e.g. 'v7')
  const [versionFilter, setVersionFilter] = useState<string>(defaultVersionTag)
  const [typeFilter, setTypeFilter] = useState<'all' | 'major' | 'minor' | 'patch'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const listRef = useRef<HTMLDivElement>(null)

  // Major version counts
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: releases.length,
      older: 0,
    }
    for (const r of releases) {
      const key = `v${r.major}`
      res[key] = (res[key] || 0) + 1
      if (r.major < 6) {
        res.older += 1
      }
    }
    return res
  }, [releases])

  // Dynamically constructed version tabs, placing latest major first
  const versionTabs = useMemo(() => {
    const tabs = [
      {
        id: defaultVersionTag,
        label: `${defaultVersionTag}.x`,
        count: counts[defaultVersionTag] || 0,
      },
      { id: 'all', label: 'All Releases', count: counts.all },
    ]
    if (counts.v6) {
      tabs.push({ id: 'v6', label: 'v6.x', count: counts.v6 })
    }
    if (counts.older) {
      tabs.push({ id: 'older', label: 'Legacy (< v6)', count: counts.older })
    }
    return tabs
  }, [defaultVersionTag, counts])

  // Filtered releases based on version, type, and search query
  const filteredReleases = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return releases.filter((r) => {
      // Version filter (e.g. 'v7', 'v6', 'older', 'all')
      if (versionFilter !== 'all') {
        if (versionFilter === 'older') {
          if (r.major >= 6) return false
        } else if (versionFilter.startsWith('v')) {
          const majorNum = parseInt(versionFilter.slice(1), 10)
          if (!isNaN(majorNum) && r.major !== majorNum) return false
        }
      }

      // Type filter
      if (typeFilter !== 'all' && r.type !== typeFilter) return false

      // Search query filter
      if (q && !r.fullText.toLowerCase().includes(q) && !r.version.includes(q)) {
        return false
      }

      return true
    })
  }, [releases, versionFilter, typeFilter, searchQuery])

  // Window-level TanStack Virtualizer
  const virtualizer = useWindowVirtualizer({
    count: filteredReleases.length,
    estimateSize: () => 240,
    overscan: 6,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  // Synchronize scrollMargin dynamically when layout mounts
  useEffect(() => {
    if (listRef.current) {
      virtualizer.options.scrollMargin = listRef.current.offsetTop
    }
  }, [virtualizer, filteredReleases])

  const scrollToRelease = (slug: string) => {
    const index = filteredReleases.findIndex((r) => r.slug === slug || r.version === slug)
    if (index !== -1) {
      virtualizer.scrollToIndex(index, { align: 'start', behavior: 'smooth' })
    }
  }

  // Handle URL hash on initial mount or hash change
  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (!hash) return

    const matched = releases.find((r) => r.slug === hash || r.version === hash)
    if (matched) {
      const targetTag = `v${matched.major}`
      if (versionFilter !== targetTag && versionFilter !== 'all') {
        setVersionFilter(targetTag)
      }
      setTimeout(() => {
        scrollToRelease(matched.slug)
      }, 100)
    }
  }, [releases])

  const handleCopyLink = (slug: string) => {
    const url = `${window.location.origin}${window.location.pathname}#${slug}`
    navigator.clipboard.writeText(url)
    setCopiedSlug(slug)
    setTimeout(() => {
      setCopiedSlug(null)
    }, 2000)
  }

  const virtualItems = virtualizer.getVirtualItems()

  return (
    <div className="flex flex-col min-h-screen bg-bg-app transition-colors duration-200">
      {/* ─── HERO HEADER ────────────────────────────────────────────────── */}
      <section className="relative border-b border-border-primary bg-bg-app bg-grid overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent/8 blur-[120px] rounded-full pointer-events-none mask-radial" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 eyebrow px-3 py-1 rounded-full border border-border-primary bg-bg-sidebar/80 select-none">
                <GitCommit className="w-3.5 h-3.5 text-accent" />
                <span>Historical Semver Timeline</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary">
                Changelog{' '}
                <span className="font-display italic font-normal text-accent">&amp; Releases</span>
              </h1>
              <p className="text-text-secondary text-sm sm:text-base max-w-2xl leading-relaxed">
                Detailed record of every architectural milestone, isolated reactivity upgrade, and
                bug fix across react-zeugma.
              </p>
            </div>

            {/* Quick action badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              {latestRelease && (
                <button
                  onClick={() => {
                    setVersionFilter(defaultVersionTag)
                    scrollToRelease(latestRelease.slug)
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10 hover:bg-accent/15 text-xs font-mono font-semibold text-text-primary transition-colors cursor-pointer"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span>v{latestRelease.version}</span>
                  <span className="text-[10px] text-text-muted font-sans font-normal uppercase tracking-wider">
                    Latest
                  </span>
                </button>
              )}
              <a
                href="https://github.com/yusufarsln98/react-zeugma/releases"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-primary bg-bg-sidebar/80 hover:bg-bg-sidebar hover:text-text-primary text-xs text-text-secondary transition-colors"
              >
                <span>GitHub Releases</span>
                <ArrowUpRight className="w-3 h-3 text-text-muted" />
              </a>
              <a
                href="https://www.npmjs.com/package/react-zeugma"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-primary bg-bg-sidebar/80 hover:bg-bg-sidebar hover:text-text-primary text-xs text-text-secondary transition-colors"
              >
                <span>npm Registry</span>
                <ExternalLink className="w-3 h-3 text-text-muted" />
              </a>
            </div>
          </div>

          {/* Optional Intro Markdown Content */}
          {introNodes.length > 0 && (
            <div className="mt-8 pt-6 border-t border-border-primary/60 text-sm text-text-secondary leading-relaxed">
              <MdxRenderer
                sectionId="changelog-intro"
                scrollToSection={scrollToRelease}
                children={introNodes}
              />
            </div>
          )}
        </div>
      </section>

      {/* ─── STICKY FILTER & SEARCH TOOLBAR ─────────────────────────────── */}
      <div className="sticky top-14 z-20 backdrop-blur-md bg-bg-app/90 border-b border-border-primary transition-colors">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Version major segment pills (latest major selected by default) */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-0.5">
              {versionTabs.map((tab) => {
                const active = versionFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setVersionFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-accent text-accent-fg shadow-2xs'
                        : 'bg-bg-pane text-text-secondary hover:text-text-primary border border-border-primary/60 hover:bg-bg-sidebar'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        active ? 'bg-black/20 text-accent-fg' : 'bg-bg-sidebar text-text-muted'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Right side: Type filter + Search bar */}
            <div className="flex items-center gap-2">
              {/* Type selector */}
              <div className="hidden lg:flex items-center border border-border-primary rounded-lg bg-bg-pane p-0.5 text-xs">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'major', label: 'Major' },
                    { id: 'minor', label: 'Minor' },
                    { id: 'patch', label: 'Patch' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTypeFilter(t.id)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      typeFilter === t.id
                        ? 'bg-bg-sidebar text-text-primary font-semibold shadow-3xs'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Live search input */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter versions or changes..."
                  className="w-full pl-8 pr-7 py-1 bg-bg-pane border border-border-primary rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-hidden focus:border-accent/80 focus:ring-2 focus:ring-accent/15 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary cursor-pointer"
                    aria-label="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── VIRTUALIZED TIMELINE BODY (@tanstack/react-virtual) ─────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredReleases.length === 0 ? (
          <div className="text-center py-24 space-y-4 border border-dashed border-border-primary rounded-2xl bg-bg-pane p-8">
            <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto text-accent">
              <Filter className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No releases found</h3>
            <p className="text-text-muted text-xs max-w-sm mx-auto">
              No changelog entries matched the active filters &apos;{searchQuery || versionFilter}
              &apos;.
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setVersionFilter(defaultVersionTag)
                setTypeFilter('all')
              }}
              className="px-4 py-1.5 rounded-lg bg-text-primary text-bg-app text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer inline-flex items-center gap-1.5"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            ref={listRef}
            className="relative w-full"
            style={{
              height: `${virtualizer.getTotalSize()}px`,
            }}
          >
            {/* Continuous Timeline Rail running through center of all nodes */}
            {filteredReleases.length > 1 && (
              <div
                className="absolute left-3 sm:left-4 -translate-x-1/2 w-0.5 bg-linear-to-b from-accent/50 via-border-primary to-border-primary/40 pointer-events-none"
                style={{
                  top: 24,
                  height: Math.max(0, virtualizer.getTotalSize() - 48),
                }}
              />
            )}

            {virtualItems.map((virtualItem) => {
              const release = filteredReleases[virtualItem.index]
              const idx = virtualItem.index
              const isFirst = idx === 0 && versionFilter === defaultVersionTag && !searchQuery
              const isMajor = release.type === 'major'
              const isMinor = release.type === 'minor'

              return (
                <div
                  key={release.slug}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    transform: `translateY(${virtualItem.start - virtualizer.options.scrollMargin}px)`,
                  }}
                  className="pb-6"
                >
                  <article
                    id={release.slug}
                    className="flex gap-3 sm:gap-6 items-stretch group scroll-mt-28"
                  >
                    {/* Timeline Node Point Column — mathematically centered */}
                    <div className="relative flex flex-col items-center shrink-0 w-6 sm:w-8">
                      <div
                        className={`relative z-10 w-4 h-4 rounded-full mt-6 shrink-0 flex items-center justify-center transition-transform group-hover:scale-125 ${
                          isMajor
                            ? 'bg-accent ring-4 ring-accent/20'
                            : isMinor
                              ? 'bg-sky-500 ring-4 ring-sky-500/20'
                              : 'bg-bg-pane border-2 border-border-primary ring-2 ring-bg-app'
                        }`}
                      >
                        {isMajor && <div className="w-1.5 h-1.5 bg-accent-fg rounded-full" />}
                      </div>
                    </div>

                    {/* Bento Release Card */}
                    <div className="flex-1 min-w-0 border border-border-primary bg-bg-pane rounded-2xl p-6 sm:p-7 shadow-2xs hover:border-border-primary/80 transition-all">
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-primary/60 pb-4 mb-5">
                        <div className="flex items-center gap-3 flex-wrap">
                          <a
                            href={`#${release.slug}`}
                            onClick={(e) => {
                              e.preventDefault()
                              scrollToRelease(release.slug)
                            }}
                            className="font-mono text-xl sm:text-2xl font-extrabold text-text-primary hover:text-accent transition-colors flex items-center gap-1.5"
                          >
                            <span>v{release.version}</span>
                          </a>

                          {/* Badges */}
                          <div className="flex items-center gap-1.5">
                            {isFirst && (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                <span>LATEST</span>
                              </span>
                            )}
                            {isMajor ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-accent/15 text-accent border border-accent/30 uppercase tracking-wider">
                                Major Release
                              </span>
                            ) : isMinor ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 uppercase tracking-wider">
                                Minor Release
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono text-text-muted border border-border-primary/60 bg-bg-sidebar/60 uppercase tracking-wider">
                                Patch
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Header Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(release.slug)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-text-secondary hover:text-text-primary bg-bg-sidebar/60 hover:bg-bg-sidebar border border-border-primary/60 transition-colors cursor-pointer"
                            title="Copy direct permalink"
                            aria-label={`Copy permalink for v${release.version}`}
                          >
                            {copiedSlug === release.slug ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-sans font-medium">
                                  Copied!
                                </span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3 text-text-muted" />
                                <span className="font-sans">Copy link</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Markdown Body of Release */}
                      <div className="prose prose-zinc max-w-none text-sm text-text-secondary leading-relaxed space-y-4">
                        <MdxRenderer
                          sectionId={release.slug}
                          scrollToSection={scrollToRelease}
                          children={release.nodes}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
