import { describe, expect, it } from 'vitest'

import { createArticleSchema, createBreadcrumbSchema, serializeJsonLd } from '@/lib/structured-data'

describe('structured data', () => {
  it('uses ld-generator for an ordered breadcrumb list', () => {
    const schema = createBreadcrumbSchema('en', [
      { name: 'Askold Astakhov', path: '/' },
      { name: 'Writing', path: '/posts' },
    ])

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1 },
        { '@type': 'ListItem', position: 2 },
      ],
    })
  })

  it('escapes HTML-significant characters before embedding JSON-LD', () => {
    expect(serializeJsonLd({ title: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })

  it('includes dateModified in article schema when provided', () => {
    const schema = createArticleSchema({
      title: 'Test Article',
      description: 'Test Description',
      locale: 'ru',
      path: '/posts/test-article',
      publishedAt: '2026-10-01T08:00:00.000Z',
      dateModified: '2026-11-10T12:00:00.000Z',
    })

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: 'Test Article',
      datePublished: '2026-10-01T08:00:00.000Z',
      dateModified: '2026-11-10T12:00:00.000Z',
    })
  })

  it('falls back dateModified to publishedAt in article schema when dateModified is omitted', () => {
    const schema = createArticleSchema({
      title: 'Test Article',
      description: 'Test Description',
      locale: 'ru',
      path: '/posts/test-article',
      publishedAt: '2026-10-01T08:00:00.000Z',
    })

    expect(schema).toMatchObject({
      '@context': 'https://schema.org',
      '@type': 'Article',
      datePublished: '2026-10-01T08:00:00.000Z',
      dateModified: '2026-10-01T08:00:00.000Z',
    })
  })
})
