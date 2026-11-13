import { afterEach, describe, expect, it } from 'vitest'

import { isProjectPublic, isProjectPubliclyVisible } from '@/lib/projects'
import {
  buildLocalizedSitemapEntries,
  buildPublicSitemapEntries,
  buildPublicSitemapPaths,
  buildSitemapUrl,
} from '@/lib/sitemap'

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

describe('isProjectPubliclyVisible', () => {
  it('excludes projects with _status published and null publishedAt', () => {
    expect(isProjectPubliclyVisible({ _status: 'published', publishedAt: null })).toBe(false)
  })

  it('excludes future publishedAt projects', () => {
    const now = new Date('2026-08-26T12:00:00.000Z')
    expect(isProjectPubliclyVisible({ _status: 'published', publishedAt: '2026-08-26T12:01:00.000Z' }, now)).toBe(false)
  })

  it('excludes published: false projects', () => {
    expect(isProjectPubliclyVisible({ published: false })).toBe(false)
  })

  it('includes legacy records with no publication fields', () => {
    expect(isProjectPubliclyVisible({})).toBe(true)
    expect(isProjectPubliclyVisible({ published: null })).toBe(true)
  })

  it('includes valid published projects', () => {
    const now = new Date('2026-08-26T12:00:00.000Z')
    expect(isProjectPubliclyVisible({ _status: 'published', publishedAt: '2026-08-26T11:59:00.000Z' }, now)).toBe(true)
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

  it('builds sitemap entries with lastModified date for posts', () => {
    const postDate = new Date('2026-11-10T12:00:00.000Z')
    const entries = buildPublicSitemapEntries({
      categories: [{ slug: 'articles' }],
      posts: [{ slug: 'public-post', lastModified: postDate }],
      projects: [{ slug: 'public-project' }],
    })

    expect(entries).toEqual([
      { path: '/' },
      { path: '/projects' },
      { path: '/projects/public-project' },
      { path: '/posts' },
      { path: '/posts/category/articles' },
      { path: '/posts/public-post', lastModified: postDate },
      { path: '/cv' },
    ])
  })
})

describe('buildLocalizedSitemapEntries', () => {
  it('lists both locales for bilingual items with reciprocal alternates', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    const postDate = new Date('2026-11-10T12:00:00.000Z')

    const sitemap = buildLocalizedSitemapEntries({
      ru: {
        categories: [],
        posts: [{ slug: 'bilingual-post', lastModified: postDate }],
        projects: [],
      },
      en: {
        categories: [],
        posts: [{ slug: 'bilingual-post', lastModified: postDate }],
        projects: [],
      },
    })

    const ruPostEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/ru/posts/bilingual-post')
    const enPostEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/en/posts/bilingual-post')

    expect(ruPostEntry).toBeDefined()
    expect(enPostEntry).toBeDefined()
    expect(ruPostEntry?.lastModified).toEqual(postDate)
    expect(enPostEntry?.lastModified).toEqual(postDate)

    const expectedAlternates = {
      ru: 'https://www.aastakhov.com/ru/posts/bilingual-post',
      en: 'https://www.aastakhov.com/en/posts/bilingual-post',
      'x-default': 'https://www.aastakhov.com/en/posts/bilingual-post',
    }
    expect(ruPostEntry?.alternates?.languages).toEqual(expectedAlternates)
    expect(enPostEntry?.alternates?.languages).toEqual(expectedAlternates)
  })

  it('lists only one URL with no en alternate when slug exists in one locale only', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    const postDate = new Date('2026-11-10T12:00:00.000Z')

    const sitemap = buildLocalizedSitemapEntries({
      ru: {
        categories: [],
        posts: [{ slug: 'russian-only-post', lastModified: postDate }],
        projects: [],
      },
      en: {
        categories: [],
        posts: [],
        projects: [],
      },
    })

    const ruPostEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/ru/posts/russian-only-post')
    const enPostEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/en/posts/russian-only-post')

    expect(ruPostEntry).toBeDefined()
    expect(enPostEntry).toBeUndefined()
    expect(ruPostEntry?.alternates?.languages).toEqual({
      ru: 'https://www.aastakhov.com/ru/posts/russian-only-post',
      'x-default': 'https://www.aastakhov.com/ru/posts/russian-only-post',
    })
    expect((ruPostEntry?.alternates?.languages as Record<string, string>)?.en).toBeUndefined()
  })

  it('omits empty posts index from the sitemap', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'

    const sitemap = buildLocalizedSitemapEntries({
      ru: {
        categories: [],
        posts: [],
        projects: [],
      },
      en: {
        categories: [],
        posts: [],
        projects: [],
      },
    })

    expect(sitemap.some((entry) => entry.url.includes('/posts'))).toBe(false)
  })

  it('includes lastmod for a post and omits lastmod for /cv', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    const postDate = new Date('2026-11-10T12:00:00.000Z')

    const sitemap = buildLocalizedSitemapEntries({
      ru: {
        categories: [],
        posts: [{ slug: 'sample-post', lastModified: postDate }],
        projects: [],
      },
      en: {
        categories: [],
        posts: [],
        projects: [],
      },
    })

    const postEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/ru/posts/sample-post')
    const cvRuEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/ru/cv')
    const cvEnEntry = sitemap.find((entry) => entry.url === 'https://www.aastakhov.com/en/cv')

    expect(postEntry?.lastModified).toEqual(postDate)
    expect(cvRuEntry?.lastModified).toBeUndefined()
    expect(cvEnEntry?.lastModified).toBeUndefined()
  })
})
