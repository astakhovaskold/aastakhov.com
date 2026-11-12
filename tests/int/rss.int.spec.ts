import { describe, expect, it } from 'vitest'

import { escapeXml, generateRssFeed } from '@/lib/rss'

const base = {
  description: 'Writing & notes',
  language: 'en',
  link: 'https://www.aastakhov.com/en/posts',
  selfLink: 'https://www.aastakhov.com/en/feed.xml',
  title: 'Blog — Askold Astakhov',
}

describe('escapeXml', () => {
  it('escapes the five XML entities', () => {
    expect(escapeXml(`<a href="x">Tom & 'Jerry'</a>`)).toBe(
      '&lt;a href=&quot;x&quot;&gt;Tom &amp; &apos;Jerry&apos;&lt;/a&gt;',
    )
  })
})

describe('generateRssFeed', () => {
  it('builds an RSS 2.0 document with escaped items, dates and a self link', () => {
    const xml = generateRssFeed({
      ...base,
      items: [
        {
          description: 'A & B <summary>',
          link: 'https://www.aastakhov.com/en/posts/first',
          pubDate: '2026-10-01T08:00:00.000Z',
          title: 'First "post"',
        },
      ],
    })

    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true)
    expect(xml).toContain('<rss version="2.0"')
    expect(xml).toContain('<description>Writing &amp; notes</description>')
    expect(xml).toContain('<title>First &quot;post&quot;</title>')
    expect(xml).toContain('<description>A &amp; B &lt;summary&gt;</description>')
    expect(xml).toContain('<guid isPermaLink="true">https://www.aastakhov.com/en/posts/first</guid>')
    expect(xml).toContain('<pubDate>Thu, 01 Oct 2026 08:00:00 GMT</pubDate>')
    expect(xml).toContain('rel="self" type="application/rss+xml"')
  })

  it('skips an invalid date and stays well formed with no items', () => {
    const xml = generateRssFeed({
      ...base,
      items: [{ link: 'https://www.aastakhov.com/en/posts/x', pubDate: 'not a date', title: 'X' }],
    })

    expect(xml).not.toContain('<pubDate>')
    expect(generateRssFeed({ ...base, items: [] })).toContain('</channel>')
  })
})
