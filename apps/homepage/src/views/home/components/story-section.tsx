import Link from 'next/link'

export function StorySection() {
  return (
    <section className="py-20 px-6 sm:px-8 border-b border-border-primary bg-bg-sidebar/40 text-center">
      <div className="max-w-3xl mx-auto">
        <div className="font-display italic text-3xl sm:text-4xl text-text-primary mb-4 leading-snug">
          &ldquo;From ancient tesserae to recursive digital workspaces.&rdquo;
        </div>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
          Zeugma was an ancient Greco-Roman bridge city on the Euphrates known for its breathtaking
          mosaics — individual stone tiles fitting together to form an unbreakable whole. We built
          react-zeugma on that same principle: independent pane tiles harmonizing in a fluid,
          unified layout.
        </p>
        <div className="mt-8 flex justify-center gap-3 text-xs font-semibold">
          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-lg bg-bg-pane border border-border-primary hover:border-border-secondary text-text-primary transition-colors"
          >
            Start Building
          </Link>
        </div>
      </div>
    </section>
  )
}
