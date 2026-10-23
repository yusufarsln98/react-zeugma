import { ArrowRight } from 'lucide-react'

export function CodePreviewSection() {
  return (
    <section className="py-20 px-6 sm:px-8 border-b border-border-primary bg-bg-app">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="eyebrow mb-2">Declarative Simplicity</div>
          <h2 className="text-3xl font-extrabold text-text-primary tracking-tight mb-4">
            Clean API. Pure React Primitives.
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed mb-6">
            Create recursive split views by passing your layout tree and render functions. No
            complex configuration files or CSS overrides.
          </p>

          <ul className="space-y-3 text-xs text-text-secondary mb-8">
            <li className="flex items-start gap-2.5">
              <span className="text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-text-primary">useZeugma() hook:</strong> Layout state, split
                controllers, and active tab management.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-text-primary">
                  &lt;Pane&gt; &amp; &lt;Pane.Content&gt;:
                </strong>{' '}
                Pure headless layout containers.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="text-accent font-bold mt-0.5">✓</span>
              <span>
                <strong className="text-text-primary">&lt;Pane.Tabs&gt;:</strong> Fully customizable
                tab bars with dock and detach capabilities.
              </span>
            </li>
          </ul>

          <a
            href="/SKILL.md"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-strong transition-colors"
          >
            <span>Explore SKILL.md Specification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Code Card */}
        <div className="rounded-2xl border border-border-primary bg-bg-sidebar/80 shadow-float overflow-hidden font-mono text-xs">
          <div className="px-4 py-2.5 border-b border-border-primary bg-bg-sidebar flex items-center justify-between text-[11px] text-text-muted">
            <span>WorkspaceLayout.tsx</span>
            <span className="text-[10px]">TypeScript</span>
          </div>
          <pre className="p-5 overflow-x-hidden text-text-primary leading-relaxed text-[11px] whitespace-pre-wrap break-words">
            <code>
              <span className="text-accent">import</span> {'{ useZeugma, Zeugma, Pane }'}{' '}
              <span className="text-accent">from</span>{' '}
              <span className="text-emerald-500 dark:text-emerald-400">
                &apos;react-zeugma&apos;
              </span>
              {'\n\n'}
              <span className="text-accent">export function</span> Workspace() {'{\n'}
              {'  '}
              <span className="text-accent">const</span> controller = useZeugma({'{'}
              {'\n'}
              {'    '}initialLayout: {'{\n'}
              {'      '}type:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;split&apos;</span>,
              direction:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;row&apos;</span>,
              splitPercentage: 50,{'\n'}
              {'      '}first: {'{'} type:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;pane&apos;</span>, id:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;editor&apos;</span>,
              tabIds: [
              <span className="text-emerald-500 dark:text-emerald-400">&apos;App.tsx&apos;</span>]{' '}
              {'}'},{'\n'}
              {'      '}second: {'{'} type:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;pane&apos;</span>, id:{' '}
              <span className="text-emerald-500 dark:text-emerald-400">&apos;terminal&apos;</span>,
              tabIds: [
              <span className="text-emerald-500 dark:text-emerald-400">&apos;Terminal&apos;</span>]{' '}
              {'}'},{'\n'}
              {'    }'},{'\n'}
              {'  }'}){'\n\n'}
              {'  '}
              <span className="text-accent">return</span> ({'\n'}
              {'    '}&lt;<span className="text-accent">Zeugma</span> controller={'{controller}'}{' '}
              renderPane={'{'}(paneId) =&gt; ({'\n'}
              {'      '}&lt;<span className="text-accent">Pane</span> id={'{paneId}'}&gt;{'\n'}
              {'        '}&lt;<span className="text-accent">Pane.DragHandle</span> /&gt;{'\n'}
              {'        '}&lt;<span className="text-accent">Pane.Tabs</span> /&gt;{'\n'}
              {'        '}&lt;<span className="text-accent">Pane.Content</span>&gt;
              {'{/* your view */}'}&lt;/<span className="text-accent">Pane.Content</span>&gt;{'\n'}
              {'      '}&lt;/<span className="text-accent">Pane</span>&gt;{'\n'}
              {'    }'} /&gt;{'\n'}
              {'  '}){'\n'}
              {'}'}
            </code>
          </pre>
        </div>
      </div>
    </section>
  )
}
