import Link from 'next/link'
import { ArrowRight, Check, Split, Layers, Zap } from 'lucide-react'
import { COMPARISON_FEATURES } from '@/config/seo'

export function ComparisonSection() {
  return (
    <section className="py-24 px-6 sm:px-8 border-b border-border-primary bg-bg-app relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="eyebrow mb-3 flex items-center justify-center gap-2">
            <span>Layout Engine Comparison &amp; Alternatives</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-text-primary tracking-tight">
            The Modern Successor to Legacy Layout Engines
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mt-4 leading-relaxed">
            Searching for a modern alternative to{' '}
            <strong className="text-text-primary">react-mosaic</strong>,{' '}
            <strong className="text-text-primary">react-grid-layout</strong>, or{' '}
            <strong className="text-text-primary">golden-layout</strong>? Here is how react-zeugma
            redefines spatial workspace engineering for React 18 &amp; 19.
          </p>
        </div>

        {/* 3-Way Editorial Comparison Bento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <div className="p-6 rounded-2xl bg-bg-pane border border-border-primary flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4">
                <Split className="w-4 h-4" />
              </div>
              <div className="eyebrow text-accent mb-1">react-mosaic Alternative</div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                Pioneering Tree Splits, Reborn
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                react-mosaic proved that binary tree partitioning is superior to flat grids.
                react-zeugma takes that proven mathematical model and strips away legacy CSS
                wrappers, adds native multi-tab docking, and brings full React 18 &amp; 19
                concurrent reactivity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-primary/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>Zero Blueprint CSS</span>
              <span className="text-accent font-semibold">100% Headless</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-pane border border-border-primary flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
                <Zap className="w-4 h-4" />
              </div>
              <div className="eyebrow text-amber-500 mb-1">react-grid-layout Alternative</div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                Arbitrary Splits vs. Rigid 12-Columns
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Flat 12-column grids break down when users need recursive side-by-side viewports,
                diff inspectors, or nested bento layouts. With Zeugma, splitting a pane is local to
                its parent divider — with zero cascading reflows across distant siblings.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-primary/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>No coordinate collisions</span>
              <span className="text-amber-500 font-semibold">Local splits</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-pane border border-border-primary flex flex-col justify-between shadow-2xs">
            <div>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-4">
                <Layers className="w-4 h-4" />
              </div>
              <div className="eyebrow text-emerald-500 mb-1">golden-layout Alternative</div>
              <h3 className="text-base font-bold text-text-primary mb-2">
                Native React vs. jQuery/DOM Roots
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                golden-layout and early window managers rely on imperative DOM manipulation that
                fights against React state synchronization. react-zeugma is built from the ground up
                as a pure React library weighing just ~4.8 kB gzipped.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border-primary/60 text-[11px] font-mono text-text-muted flex items-center justify-between">
              <span>~4.8 kB vs. ~60+ kB</span>
              <span className="text-emerald-500 font-semibold">Native State</span>
            </div>
          </div>
        </div>

        {/* Feature Comparison Matrix Table */}
        <div className="rounded-2xl border border-border-primary bg-bg-pane shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border-primary bg-bg-sidebar/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-text-primary">
                Detailed Feature Matrix: React Layout Engines
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Comparing architecture, developer experience, and runtime constraints.
              </p>
            </div>
            <a
              href="/SKILL.md"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-mono text-accent hover:underline flex items-center gap-1 font-semibold self-start sm:self-auto"
            >
              Architectural Deep-Dive <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border-primary bg-bg-sidebar/20 text-text-muted font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">Capability</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-accent bg-accent/5 border-x border-accent/20">
                    react-zeugma
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">react-mosaic</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">react-grid-layout</th>
                  <th className="py-3.5 px-4 sm:px-6 font-semibold">golden-layout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-primary/60 text-text-secondary">
                {COMPARISON_FEATURES.map((feat) => (
                  <tr key={feat.name} className="hover:bg-bg-sidebar/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-text-primary">
                      {feat.name}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-text-primary bg-accent/5 border-x border-accent/20">
                      <div className="flex items-center gap-1.5 text-accent">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        <span>{feat.zeugma}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">{feat.mosaic}</td>
                    <td className="py-3.5 px-4 sm:px-6">{feat.gridLayout}</td>
                    <td className="py-3.5 px-4 sm:px-6">{feat.goldenLayout}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Footer Callout */}
          <div className="p-4 sm:p-5 border-t border-border-primary bg-bg-sidebar/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-text-muted">
              Ready to replace your existing layout engine with a modern headless solution?
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/SKILL.md"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-fg font-semibold text-xs hover:bg-accent-strong transition-colors"
              >
                Specification
              </a>
              <Link
                href="/demo"
                className="px-3.5 py-1.5 rounded-lg bg-bg-pane border border-border-primary text-text-primary font-semibold text-xs hover:border-border-secondary transition-colors"
              >
                Test in Demo
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
