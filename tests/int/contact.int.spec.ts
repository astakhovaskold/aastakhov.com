import { describe, expect, it } from 'vitest'

import { buildContactLinks, getPrimaryContact } from '@/lib/contact'

describe('getPrimaryContact', () => {
  it('prefers the booking link', () => {
    expect(getPrimaryContact({ bookingUrl: 'https://cal.example/askold', telegram: 'https://t.me/a' })).toEqual({
      href: 'https://cal.example/askold',
      kind: 'booking',
    })
  })

  it('falls back to Telegram', () => {
    expect(getPrimaryContact({ telegram: 'https://t.me/a' })).toEqual({ href: 'https://t.me/a', kind: 'telegram' })
  })

  it('returns null when nothing is configured', () => {
    expect(getPrimaryContact({})).toBeNull()
  })
})

describe('buildContactLinks', () => {
  const settings = {
    bookingUrl: 'https://cal.example/askold',
    email: 'a@example.com',
    github: 'https://github.com/a',
    linkedin: 'https://linkedin.com/in/a',
    telegram: 'https://t.me/a',
  }

  it('lists booking first, then Telegram and email, and omits unset links', () => {
    expect(buildContactLinks({ email: 'a@example.com', telegram: 'https://t.me/a' }).map((link) => link.label)).toEqual([
      'Telegram',
      'Email',
    ])
    expect(buildContactLinks(settings).map((link) => link.label)).toEqual([
      'Book a call',
      'Telegram',
      'Email',
      'LinkedIn',
      'GitHub',
    ])
  })

  it('adds the CV link only when asked', () => {
    expect(buildContactLinks(settings, { includeCv: true }).at(-1)).toEqual({ href: '/cv', label: 'CV' })
    expect(buildContactLinks(settings).some((link) => link.label === 'CV')).toBe(false)
  })
})
