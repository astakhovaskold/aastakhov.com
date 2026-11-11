import React from 'react'

type CalloutProps = {
  text: string
  title?: string | null
  type?: 'note' | 'quote' | 'tip' | 'warning'
}

const CALLOUT_LABELS: Record<string, string> = {
  note: 'Note',
  quote: 'Key takeaway',
  tip: 'Tip',
  warning: 'Warning',
}

export function CalloutRenderer({ text, title, type = 'note' }: CalloutProps) {
  const label = CALLOUT_LABELS[type] || 'Note'

  return (
    <aside className={`callout callout-${type}`}>
      <div className="callout-header">
        <span className="callout-label">{label}</span>
        {title ? <strong className="callout-title">{title}</strong> : null}
      </div>
      <div className="callout-body">
        {text.split('\n\n').map((paragraph, idx) => (
          <p key={idx}>{paragraph}</p>
        ))}
      </div>
    </aside>
  )
}
