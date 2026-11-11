import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  breadcrumbName,
  createBlogPostingSchema,
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createCreativeWorkSchema,
  createProfilePageSchema,
  createSiteGraph,
  serializeJsonLd,
} from '@/lib/structured-data'

import { mockSettings } from './site-settings.fixture'

const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
const PERSON_ID = 'https://www.aastakhov.com/#person'

beforeEach(() => {
  process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
})

afterEach(() => {
  if (originalSiteUrl === undefined) {
    delete process.env.NEXT_PUBLIC_SITE_URL
  } else {
    process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  }
})

type Graph = { '@graph': Array<Record<string, unknown>> }

function graphOf(overrides: Partial<typeof mockSettings> = {}, locale: 'en' | 'ru' = 'ru') {
  return createSiteGraph({ ...mockSettings, ...overrides }, locale) as unknown as Graph
}

describe('site graph', () => {
  it('defines one Person with a stable @id and one WebSite referencing it', () => {
    const graph = graphOf()
    const people = graph['@graph'].filter((node) => node['@type'] === 'Person')
    const website = graph['@graph'].find((node) => node['@type'] === 'WebSite')

    expect(people).toHaveLength(1)
    expect(people[0]['@id']).toBe(PERSON_ID)
    expect(website).toMatchObject({
      '@id': 'https://www.aastakhov.com/#website',
      inLanguage: ['ru', 'en'],
      publisher: { '@id': PERSON_ID },
      url: 'https://www.aastakhov.com/',
    })
  })

  it('lists every configured profile in sameAs and omits unset fields', () => {
    const person = graphOf({ devto: 'https://dev.to/test' })['@graph'][0]

    expect(person.sameAs).toEqual([
      'https://linkedin.com/in/test',
      'https://github.com/test',
      'https://t.me/test',
      'https://dev.to/test',
    ])
    expect(person).not.toHaveProperty('image')
    expect(person).not.toHaveProperty('jobTitle')
    expect(person).not.toHaveProperty('knowsAbout')
  })

  it('includes the optional Person fields when configured', () => {
    const person = graphOf({
      alternateName: 'Аскольд Астахов',
      description: 'Bio',
      homeLocation: 'Madrid, Spain',
      imageUrl: '/api/media/file/portrait.jpg',
      jobTitle: 'Frontend Architect',
      knowsAbout: ['React', 'Next.js'],
    })['@graph'][0]

    expect(person).toMatchObject({
      alternateName: 'Аскольд Астахов',
      homeLocation: { '@type': 'Place', name: 'Madrid, Spain' },
      image: 'https://www.aastakhov.com/api/media/file/portrait.jpg',
      jobTitle: 'Frontend Architect',
      knowsAbout: ['React', 'Next.js'],
    })
  })

  it('never exposes the email address', () => {
    const serialized = JSON.stringify(graphOf())

    expect(serialized).not.toContain('mailto:')
    expect(serialized).not.toContain(mockSettings.email)
  })
})

describe('page schemas', () => {
  it('points the CV ProfilePage main entity at the Person', () => {
    const schema = createProfilePageSchema({
      description: 'CV',
      locale: 'en',
      path: '/cv',
      title: 'Askold Astakhov',
    })

    expect(schema.mainEntity).toEqual({ '@id': PERSON_ID })
  })

  it('builds a BlogPosting that references the Person and carries both dates', () => {
    const schema = createBlogPostingSchema({
      dateModified: '2026-11-10T12:00:00.000Z',
      description: 'Test Description',
      image: '/api/media/file/cover.jpg',
      locale: 'ru',
      path: '/posts/test-article',
      publishedAt: '2026-10-01T08:00:00.000Z',
      title: 'Test Article',
    })

    expect(schema).toMatchObject({
      '@type': 'BlogPosting',
      author: { '@id': PERSON_ID },
      dateModified: '2026-11-10T12:00:00.000Z',
      datePublished: '2026-10-01T08:00:00.000Z',
      headline: 'Test Article',
      image: 'https://www.aastakhov.com/api/media/file/cover.jpg',
      publisher: { '@id': PERSON_ID },
    })
  })

  it('falls back dateModified to publishedAt and omits image when unset', () => {
    const schema = createBlogPostingSchema({
      description: 'Test Description',
      locale: 'ru',
      path: '/posts/test-article',
      publishedAt: '2026-10-01T08:00:00.000Z',
      title: 'Test Article',
    })

    expect(schema.dateModified).toBe('2026-10-01T08:00:00.000Z')
    expect(schema).not.toHaveProperty('image')
  })

  it('links a CreativeWork author to the Person', () => {
    const schema = createCreativeWorkSchema({
      description: 'Project',
      locale: 'en',
      path: '/projects/p',
      title: 'P',
    })

    expect(schema.author).toEqual({ '@id': PERSON_ID })
  })

  it('builds a valid BreadcrumbList with string item URLs and descriptive names', () => {
    const schema = createBreadcrumbSchema('en', [
      { name: breadcrumbName('en', 'home'), path: '/' },
      { name: breadcrumbName('en', 'cv'), path: '/cv' },
    ]) as { itemListElement: Array<Record<string, unknown>> }

    expect(schema).toMatchObject({ '@context': 'https://schema.org', '@type': 'BreadcrumbList' })
    expect(schema.itemListElement).toEqual([
      { '@type': 'ListItem', item: 'https://www.aastakhov.com/en', name: 'Home', position: 1 },
      { '@type': 'ListItem', item: 'https://www.aastakhov.com/en/cv', name: 'CV', position: 2 },
    ])
    expect(JSON.stringify(schema.itemListElement)).not.toContain('@context')
  })

  it('builds a CollectionPage whose ItemList matches the items', () => {
    const schema = createCollectionPageSchema({
      description: 'Projects',
      items: [
        { name: 'One', path: '/projects/one' },
        { name: 'Two', path: '/projects/two' },
      ],
      locale: 'en',
      path: '/projects',
      title: 'Projects',
    }) as { mainEntity: { itemListElement: Array<Record<string, unknown>>; numberOfItems: number } }

    expect(schema.mainEntity.numberOfItems).toBe(2)
    expect(schema.mainEntity.itemListElement.map((item) => item.url)).toEqual([
      'https://www.aastakhov.com/en/projects/one',
      'https://www.aastakhov.com/en/projects/two',
    ])
  })
})

describe('serialization', () => {
  it('escapes HTML-significant characters before embedding JSON-LD', () => {
    expect(serializeJsonLd({ title: '</script><script>alert(1)</script>' })).not.toContain('</script>')
  })
})
