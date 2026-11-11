import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buildLocalizedSitemapEntries } from '@/lib/sitemap'
import { orderMorePosts, selectTopicsWithPosts, splitTopicPosts } from '@/lib/topic-order'

const post = (id: number) => ({ id })

describe('orderMorePosts', () => {
  it('puts related posts first, then the same topic, then the latest', () => {
    const result = orderMorePosts({
      currentId: 1,
      latest: [post(9), post(8), post(7)],
      limit: 10,
      related: [post(5)],
      sameTopic: [post(1), post(2), post(3)],
    })

    expect(result.map((entry) => entry.id)).toEqual([5, 2, 3, 9, 8, 7])
  })

  it('excludes the current post, drops duplicates and respects the limit', () => {
    const result = orderMorePosts({
      currentId: 1,
      latest: [post(1), post(2), post(4)],
      limit: 3,
      related: [post(2)],
      sameTopic: [post(2), post(3)],
    })

    expect(result.map((entry) => entry.id)).toEqual([2, 3, 4])
  })

  it('places two same-topic posts before any unrelated latest post', () => {
    const result = orderMorePosts({
      currentId: 1,
      latest: [post(50)],
      limit: 4,
      related: [],
      sameTopic: [post(1), post(2), post(3)],
    })

    expect(result.slice(0, 2).map((entry) => entry.id)).toEqual([2, 3])
  })
})

describe('splitTopicPosts', () => {
  it('returns the pillar first and the rest without it', () => {
    const { pillar, rest } = splitTopicPosts([post(1), post(2), post(3)], 2)

    expect(pillar?.id).toBe(2)
    expect(rest.map((entry) => entry.id)).toEqual([1, 3])
  })

  it('treats a pillar that is not among the public posts as no pillar', () => {
    const { pillar, rest } = splitTopicPosts([post(1), post(3)], 99)

    expect(pillar).toBeNull()
    expect(rest.map((entry) => entry.id)).toEqual([1, 3])
  })

  it('keeps every post when the topic has no pillar', () => {
    const { pillar, rest } = splitTopicPosts([post(1), post(3)], null)

    expect(pillar).toBeNull()
    expect(rest).toHaveLength(2)
  })
})

describe('selectTopicsWithPosts', () => {
  it('keeps only topics with a title and at least one public post', () => {
    const result = selectTopicsWithPosts(
      [
        { id: 1, title: 'Architecture' },
        { id: 2, title: 'Empty topic' },
        { id: 3, title: '' },
      ],
      [1, 1, 3, null],
    )

    expect(result).toEqual([{ id: 1, postCount: 2, title: 'Architecture' }])
  })
})

describe('topic hubs in the sitemap', () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://www.aastakhov.com'
  })

  afterEach(() => {
    if (original === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = original
  })

  it('lists a topic hub only in the locale where it has public posts', () => {
    const sitemap = buildLocalizedSitemapEntries({
      en: { categories: [], posts: [], projects: [], topics: [] },
      ru: { categories: [], posts: [], projects: [], topics: [{ slug: 'frontend-architecture' }] },
    })
    const urls = sitemap.map((entry) => entry.url)

    expect(urls).toContain('https://www.aastakhov.com/ru/topics/frontend-architecture')
    expect(urls).not.toContain('https://www.aastakhov.com/en/topics/frontend-architecture')
  })

  it('does not list topics that were not passed in', () => {
    const sitemap = buildLocalizedSitemapEntries({
      en: { categories: [], posts: [], projects: [] },
      ru: { categories: [], posts: [], projects: [] },
    })

    expect(sitemap.some((entry) => entry.url.includes('/topics/'))).toBe(false)
  })
})
