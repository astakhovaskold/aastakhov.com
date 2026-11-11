import { describe, expect, it } from 'vitest'

import { getPrimaryContact } from '@/lib/contact'

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
