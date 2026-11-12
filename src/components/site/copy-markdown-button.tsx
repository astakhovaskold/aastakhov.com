'use client'

import React, { useState } from 'react'

type Props = {
  /** URL of the raw Markdown version, e.g. /ru/posts/slug.md */
  markdownUrl: string
  label: string
  copiedLabel: string
  errorLabel: string
}

function legacyCopy(text: string) {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(textarea)
  return ok
}

export function CopyMarkdownButton({ markdownUrl, label, copiedLabel, errorLabel }: Props) {
  const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle')

  const reset = () => setTimeout(() => setState('idle'), 2500)

  const handleCopy = async () => {
    try {
      const response = await fetch(markdownUrl)
      if (!response.ok) throw new Error(String(response.status))
      const text = await response.text()
      try {
        await navigator.clipboard.writeText(text)
      } catch {
        if (!legacyCopy(text)) throw new Error('copy failed')
      }
      setState('copied')
    } catch {
      setState('error')
    }
    reset()
  }

  return (
    <button
      className="copy-markdown-btn"
      data-state={state}
      onClick={handleCopy}
      type="button"
    >
      <span aria-live="polite">
        {state === 'copied' ? copiedLabel : state === 'error' ? errorLabel : label}
      </span>
    </button>
  )
}
