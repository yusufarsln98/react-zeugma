'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Check, MessageSquare, ExternalLink } from 'lucide-react'
import type { FeedbackState } from '../types'

export interface PageFeedbackProps {
  pageTitle: string
}

export function PageFeedback({ pageTitle }: PageFeedbackProps) {
  const [feedback, setFeedback] = useState<FeedbackState>('idle')

  const handleFeedback = (type: 'helpful' | 'not-helpful') => {
    setFeedback(type)
  }

  return (
    <div className="border border-border-primary rounded-2xl p-5 bg-bg-pane/70 my-8 shadow-2xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {feedback === 'idle' ? (
          <>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-text-primary block">
                Was this documentation helpful?
              </span>
              <span className="text-[11px] text-text-muted">
                Your feedback helps us continuously improve the developer experience.
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback('helpful')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-primary bg-bg-pane-inner hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-500 text-text-secondary text-xs font-semibold transition-all cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes</span>
              </button>
              <button
                onClick={() => handleFeedback('not-helpful')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-primary bg-bg-pane-inner hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 text-text-secondary text-xs font-semibold transition-all cursor-pointer"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-xs text-text-primary">
              <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-medium">
                Thank you for your feedback on &quot;{pageTitle}&quot;!
              </span>
            </div>

            <a
              href="https://github.com/yusufarsln98/react-zeugma/issues/new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Leave a suggestion</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
