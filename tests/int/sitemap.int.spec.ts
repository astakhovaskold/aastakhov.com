import { afterEach, describe, expect, it } from 'vitest'

import { isProjectPublic } from '@/lib/projects'
import { buildPublicSitemapPaths, buildSitemapUrl } from '@/lib/sitemap'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  }
})

describe('public project visibility', () => {
  it('keeps legacy projects public when no publication field exists', () => {
    expect(isProjectPublic({ published: null })).toBe(true)
  })

  it('excludes explicitly unpublished projects', () => {
    expect(isProjectPublic({ published: false })).toBe(false)
    expect(isProjectPublic({ published: true })).toBe(true)
  })

  it('supports draft status and scheduled publication dates', () => {
    const now = new Date('2026-08-26T12:00:00.000Z')

    expect(isProjectPublic({ published: true, _status: 'draft' }, now)).toBe(false)
    expect(isProjectPublic({ published: true, publishedAt: '2026-08-26T11:59:00.000Z' }, now)).toBe(true)
    expect(isProjectPublic({ published: true, publishedAt: '2026-08-26T12:01:00.000Z' }, now)).toBe(false)
  })
})

describe('sitemap paths', () => {
  it('contains only the public route shapes', () => {
    expect(
      buildPublicSitemapPaths({
        categories: [{ slug: 'articles' }],
        posts: [{ slug: 'public-post' }],
        projects: [{ slug: 'public-project' }],
      }),
    ).toEqual([
      '/',
      '/projects',
      '/projects/public-project',
      '/posts',
      '/posts/category/articles',
      '/posts/public-post',
      '/cv',
    ])
  })

  it('builds absolute URLs from the configured site URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/'

    expect(buildSitemapUrl('/posts')).toBe('https://example.com/posts')
  })
})
