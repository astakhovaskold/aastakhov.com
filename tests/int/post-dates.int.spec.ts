import { describe, expect, it } from 'vitest'

import { getPostLastModifiedDate } from '@/lib/post-dates'

describe('getPostLastModifiedDate', () => {
  it('prefers explicit manual lastModified date', () => {
    const post = {
      lastModified: '2026-11-05T15:00:00.000Z',
      updatedAt: '2026-11-10T10:00:00.000Z',
      publishedAt: '2026-10-01T08:00:00.000Z',
    }

    const result = getPostLastModifiedDate(post)
    expect(result.toISOString()).toBe('2026-11-05T15:00:00.000Z')
  })

  it('falls back to updatedAt when lastModified is not specified', () => {
    const post = {
      lastModified: null,
      updatedAt: '2026-11-10T10:00:00.000Z',
      publishedAt: '2026-10-01T08:00:00.000Z',
    }

    const result = getPostLastModifiedDate(post)
    expect(result.toISOString()).toBe('2026-11-10T10:00:00.000Z')
  })

  it('falls back to publishedAt when updatedAt and lastModified are not specified', () => {
    const post = {
      lastModified: null,
      updatedAt: null,
      publishedAt: '2026-10-01T08:00:00.000Z',
    }

    const result = getPostLastModifiedDate(post)
    expect(result.toISOString()).toBe('2026-10-01T08:00:00.000Z')
  })

  it('falls back to current time when no dates are specified', () => {
    const before = Date.now()
    const result = getPostLastModifiedDate({
      lastModified: null,
      updatedAt: null,
      publishedAt: null,
    })
    const after = Date.now()

    expect(result.getTime()).toBeGreaterThanOrEqual(before)
    expect(result.getTime()).toBeLessThanOrEqual(after)
  })

  it('ignores invalid dates and falls back gracefully', () => {
    const post = {
      lastModified: 'not-a-valid-date',
      updatedAt: '2026-11-10T10:00:00.000Z',
      publishedAt: '2026-10-01T08:00:00.000Z',
    }

    const result = getPostLastModifiedDate(post)
    expect(result.toISOString()).toBe('2026-11-10T10:00:00.000Z')
  })
})
