// @vitest-environment node
import React from 'react'
import { renderToString } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/i18n/navigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { PostConsultationCta } from '@/components/site/post-consultation-cta'

describe('PostConsultationCta', () => {
  it('renders booking, Telegram and email links from site settings', () => {
    const html = renderToString(
      <PostConsultationCta
        settings={{ bookingUrl: 'https://cal.example/a', email: 'a@example.com', telegram: 'https://t.me/a' }}
        text="Tell me what it is."
        title="Working on something similar?"
      />,
    )

    expect(html).toContain('Working on something similar?')
    expect(html).toContain('https://cal.example/a')
    expect(html).toContain('https://t.me/a')
    expect(html).toContain('mailto:a@example.com')
  })

  it('renders nothing when no contact is configured', () => {
    expect(renderToString(<PostConsultationCta settings={{ email: '' }} text="x" title="y" />)).toBe('')
  })
})
