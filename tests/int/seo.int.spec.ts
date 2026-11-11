import { afterEach, describe, expect, it } from 'vitest'

import { createNotFoundMetadata, createSeoMetadata, pageUrl } from '@/lib/seo'

import { mockSettings } from './site-settings.fixture'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  }
})

describe('pageUrl helper', () => {
  it('formats root path as bare locale with no trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    expect(pageUrl('ru', '/')).toBe('https://www.aastakhov.com/ru')
    expect(pageUrl('en', '')).toBe('https://www.aastakhov.com/en')
  })

  it('formats subpaths with no trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    expect(pageUrl('en', '/projects')).toBe('https://www.aastakhov.com/en/projects')
    expect(pageUrl('ru', '/projects/')).toBe('https://www.aastakhov.com/ru/projects')
    expect(pageUrl('ru', 'cv')).toBe('https://www.aastakhov.com/ru/cv')
  })

  it('uses pageUrl in createSeoMetadata for canonical and alternates', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
    const metadata = createSeoMetadata({
      canonicalPath: '/',
      locale: 'ru',
      settings: mockSettings,
    })

    expect(metadata.alternates?.canonical).toBe('https://www.aastakhov.com/ru')
    expect(metadata.alternates?.languages).toEqual({
      ru: 'https://www.aastakhov.com/ru',
      en: 'https://www.aastakhov.com/en',
      'x-default': 'https://www.aastakhov.com/ru',
    })
    expect(metadata.openGraph?.url).toBe('https://www.aastakhov.com/ru')
  })

  it('createNotFoundMetadata returns title and noindex with no alternates', () => {
    const metadata = createNotFoundMetadata({
      resource: 'Project',
    })

    expect(metadata.title).toBe('Project not found')
    expect(metadata.robots).toEqual({
      follow: false,
      index: false,
    })
    expect(metadata.alternates).toBeUndefined()
  })

  it('sets noindex based on item count flag in createSeoMetadata', () => {
    const emptyCount = 0
    const emptyMetadata = createSeoMetadata({
      canonicalPath: '/posts',
      locale: 'ru',
      noindex: emptyCount === 0,
      settings: mockSettings,
    })
    expect(emptyMetadata.robots).toEqual({
      follow: false,
      index: false,
    })

    const populatedCount: number = 1
    const populatedMetadata = createSeoMetadata({
      canonicalPath: '/posts',
      locale: 'ru',
      noindex: populatedCount === 0,
      settings: mockSettings,
    })
    expect(populatedMetadata.robots).toEqual({
      follow: true,
      index: true,
    })
  })

  it('uses locale-appropriate fallbacks without English text on Russian locale', () => {
    const emptySettings: typeof mockSettings = {
      ...mockSettings,
      name: 'Аскольд Астахов',
      seo: {
        defaultDescription: '',
        defaultTitle: '',
      },
    }

    const ruMetadata = createSeoMetadata({
      canonicalPath: '/',
      locale: 'ru',
      settings: emptySettings,
    })

    expect(ruMetadata.title).toBe('Аскольд Астахов')
    expect(ruMetadata.description).toBe('Личный сайт Аскольда Астахова.')
    expect(ruMetadata.description).not.toContain('Personal site')

    const enMetadata = createSeoMetadata({
      canonicalPath: '/',
      locale: 'en',
      settings: {
        ...mockSettings,
        seo: { defaultDescription: '', defaultTitle: '' },
      },
    })

    expect(enMetadata.title).toBe('Askold Astakhov')
    expect(enMetadata.description).toBe('Personal site for Askold Astakhov.')
  })
})
